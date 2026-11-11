// Browser check of startup (PORT-PLAN.md Phase 12): the docs app, reloaded with a
// saved dark non-default theme, paints that theme on the first frame, before its
// bundle runs. Local only, not in CI.
//
//   pnpm build && npx ng build docs        # the production build this serves
//   node demos/docs/test/startup.ts        # chromium, firefox, webkit
//   node demos/docs/test/startup.ts firefox
//
// What it does, per browser:
//   1. Loads the app normally and lets it start, so provideTheme() writes its own
//      persistence config. Saves theme "rose-red" and mode "dark" through the page.
//   2. Reloads once more normally: the reference. Records what the running app paints.
//   3. Reloads with every script request held open, so the bundle cannot run and
//      only the inline head snippet has; stylesheets that do not block rendering
//      are held too. Waits for a painted frame, takes a screenshot, and compares
//      attributes and painted colours with the reference.
//   4. Control: the same held reload with the snippet stripped from the HTML must
//      paint the HTML's own theme, which proves step 3 passes because of the snippet.
//
// Screenshots go to dist/docs-startup/{browser}-{step}.png.
import { createServer, type Server } from 'node:http';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { chromium, firefox, webkit, type BrowserType, type Page } from 'playwright';

// A screenshot waits for document.fonts, which WebKit never settles for a load
// that was abandoned. Web fonts are blocked here anyway (see blockFonts).
process.env['PW_TEST_SCREENSHOT_NO_FONTS_READY'] = '1';

const repo = path.resolve(import.meta.dirname, '../../..');
const siteDir = path.join(repo, 'dist/docs/browser');
const outDir = path.join(repo, 'dist/docs-startup');
const BASE = '/cp-theming/';
const SAVED = { theme: 'rose-red', mode: 'dark' };
// The storage keys as literals: this file runs under Node's type stripping, which cannot
// import theme-core's src. persistence.spec.ts pins the package's exports to the same strings.
const KEYS = {
  persist: 'cp-theming--persist',
  theme: 'cp-theming--theme',
  mode: 'cp-theming--mode',
};

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function serve(): Promise<{ server: Server; origin: string }> {
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const rel = url.pathname.startsWith(BASE) ? url.pathname.slice(BASE.length) : '';
    let file = path.join(siteDir, rel);
    if (!file.startsWith(siteDir) || !existsSync(file) || !path.extname(file)) {
      file = path.join(siteDir, 'index.html'); // SPA fallback
    }
    res.writeHead(200, {
      'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream',
      'cache-control': 'no-store',
    });
    res.end(readFileSync(file));
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (address === null || typeof address === 'string') throw new Error('no port');
      resolve({ server, origin: `http://127.0.0.1:${address.port}` });
    });
  });
}

interface Painted {
  theme: string | null;
  mode: string | null;
  colorScheme: string;
  background: string;
  text: string;
  primary: string;
  appStarted: boolean;
  scriptsRun: number;
  sheets: number;
}

// Runs in the page. Colours are read as painted values through a probe element,
// because custom properties compute to their token text.
function readPainted(): Painted {
  const root = document.documentElement;
  const probe = document.createElement('i');
  probe.style.cssText =
    'position:fixed;color:var(--color--primary);background:var(--color--surface)';
  document.body.appendChild(probe);
  const probed = getComputedStyle(probe);
  const result = {
    theme: root.getAttribute('theme'),
    mode: root.getAttribute('themeMode'),
    colorScheme: getComputedStyle(root).colorScheme,
    background: probed.backgroundColor,
    text: getComputedStyle(document.body).color,
    primary: probed.color,
    appStarted: (document.querySelector('cpa-root')?.childElementCount ?? 0) > 0,
    scriptsRun: performance.getEntriesByType('resource').filter((e) => e.name.endsWith('.js'))
      .length,
    sheets: document.styleSheets.length,
  };
  probe.remove();
  return result;
}

// Stylesheets the built index.html loads without blocking rendering (Angular's
// critical-CSS inlining swaps them in with media="print" + onload). A first frame
// can be painted before they arrive, so the held reload holds them too.
function nonBlockingStylesheets(): string[] {
  const html = readFileSync(path.join(siteDir, 'index.html'), 'utf8');
  return [...html.matchAll(/<link\b[^>]*>/g)]
    .map((m) => m[0])
    .filter((tag) => /rel="stylesheet"/.test(tag) && /media="print"/.test(tag))
    .map((tag) => /href="([^"]+)"/.exec(tag)?.[1] ?? '')
    .filter(Boolean);
}

const SNIPPET_TAG = /<script>\(function\(\)\{try\{.*?<\/script>/s;
const hold = () => new Promise<void>(() => {});

/**
 * Reloads with everything that does not block rendering held open (every script,
 * every non-blocking stylesheet), so what is on screen is what the browser can
 * paint before the bundle runs. Resolves once a frame is painted.
 */
async function heldReload(
  page: Page,
  url: string,
  stripSnippet: boolean,
): Promise<Painted & { paintedWhileHeld: boolean }> {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await blockFonts(page);
  const lateCss = nonBlockingStylesheets();
  // Hold, never answer: the bundle is "still downloading" for as long as we look.
  await page.route(
    (u) => u.pathname.endsWith('.js') || lateCss.some((href) => u.pathname.endsWith(href)),
    hold,
  );
  if (stripSnippet) {
    await page.route(
      (u) => u.pathname === new URL(url).pathname,
      async (route) => {
        const response = await route.fetch();
        const html = await response.text();
        if (!SNIPPET_TAG.test(html)) throw new Error('control: no head snippet found to strip');
        await route.fulfill({ response, body: html.replace(SNIPPET_TAG, '') });
      },
    );
  }
  await page.goto(url, { waitUntil: 'commit' });
  await page.waitForFunction(() => document.querySelector('cpa-root') !== null);
  // Two animation frames produced: the first paint has happened. WebKit produces
  // no frame for this page while its module script is pending, so there the
  // first frame is the one after the load is abandoned.
  const frame = () =>
    page.evaluate(
      () =>
        new Promise<boolean>((done) => {
          requestAnimationFrame(() => requestAnimationFrame(() => done(true)));
          setTimeout(() => done(false), 2000);
        }),
    );
  const paintedWhileHeld = await frame();
  const painted = paintedWhileHeld ? await page.evaluate(readPainted) : null;
  // Abandon the held requests so the document finishes loading: Firefox does not
  // settle document.fonts (which a screenshot waits for) while it is still loading.
  // The bundle is never delivered, so the page stays as the first frame painted it.
  await page.evaluate(() => window.stop());
  if (painted) return { ...painted, paintedWhileHeld };
  if (!(await frame())) throw new Error('no frame painted, even after abandoning the load');
  return { ...(await page.evaluate(readPainted)), paintedWhileHeld };
}

/** True when Angular has rendered into <cpa-root>. */
const appStarted = (page: Page) =>
  page.evaluate(() => (document.querySelector('cpa-root')?.childElementCount ?? 0) > 0);

// Web fonts are not part of the check and need the network; colours do not depend on them.
async function blockFonts(page: Page): Promise<void> {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
}

const ENGINES: Record<string, BrowserType> = { chromium, firefox, webkit };

async function run(name: string, origin: string): Promise<string[]> {
  const failures: string[] = [];
  const fail = (message: string) => failures.push(`${name}: ${message}`);
  const browser = await ENGINES[name].launch();
  // Light OS scheme, so "dark" on screen can only come from the saved mode.
  const context = await browser.newContext({
    colorScheme: 'light',
    viewport: { width: 1100, height: 700 },
  });
  const page = await context.newPage();
  const url = `${origin}${BASE}packages/core/getting-started`;
  const shot = (step: string) =>
    page.screenshot({ path: path.join(outDir, `${name}-${step}.png`) });

  await blockFonts(page);

  // 1. First visit: the app starts and configures persistence itself.
  await page.goto(url, { waitUntil: 'networkidle' });
  const htmlDefault = await page.evaluate(readPainted);
  const persist = await page.evaluate((k) => localStorage.getItem(k), KEYS.persist);
  if (persist !== 'local') fail(`provideTheme() did not configure persistence (${persist})`);
  await page.evaluate(
    ([keys, saved]) => {
      localStorage.setItem(keys.theme, saved.theme);
      localStorage.setItem(keys.mode, saved.mode);
    },
    [KEYS, SAVED] as const,
  );

  // 2. Reference: a normal reload, bundle running.
  await page.goto(url, { waitUntil: 'networkidle' });
  const reference = await page.evaluate(readPainted);
  await shot('2-reference-app-running');
  if (!reference.appStarted) fail('reference: the app did not start');
  if (reference.theme !== SAVED.theme || reference.mode !== SAVED.mode) {
    fail(
      `reference: expected ${SAVED.theme}/${SAVED.mode}, got ${reference.theme}/${reference.mode}`,
    );
  }
  if (reference.background === htmlDefault.background) {
    fail(
      'reference: saved theme paints the same background as the HTML default; cannot tell them apart',
    );
  }

  // 3. The check: bundle held, only the head snippet has run.
  const first = await heldReload(page, url, false);
  await shot('3-first-frame-bundle-held');
  if (first.appStarted || (await appStarted(page))) {
    fail('first frame: the app had started; the bundle was not held');
  }
  for (const key of ['theme', 'mode', 'colorScheme', 'background', 'text', 'primary'] as const) {
    if (first[key] !== reference[key]) {
      fail(`first frame: ${key} is ${first[key]}, the running app paints ${reference[key]}`);
    }
  }

  // 4. Control: without the snippet the same frame shows the HTML's own theme.
  const control = await heldReload(page, url, true);
  await shot('4-control-no-snippet');
  if (control.appStarted || (await appStarted(page))) {
    fail('control: the app had started; the bundle was not held');
  }
  if (control.theme === SAVED.theme || control.background === reference.background) {
    fail('control: the saved theme painted without the snippet; step 3 proves nothing');
  }

  console.log(
    `${name}\n` +
      `  html default      ${fmt(htmlDefault)}\n` +
      `  app running       ${fmt(reference)}\n` +
      `  first frame       ${fmt(first)} paintedWhileBundlePending=${first.paintedWhileHeld}\n` +
      `  control, no snippet ${fmt(control)}`,
  );
  await browser.close();
  return failures;
}

function fmt(p: Painted): string {
  return `theme=${p.theme} mode=${p.mode} scheme=${p.colorScheme} bg=${p.background} text=${p.text} primary=${p.primary} appStarted=${p.appStarted} sheets=${p.sheets}`;
}

if (!existsSync(path.join(siteDir, 'index.html'))) {
  console.error(`No build at ${siteDir}. Run: pnpm build && npx ng build docs`);
  process.exit(2);
}
mkdirSync(outDir, { recursive: true });
const wanted = process.argv.slice(2).filter((a) => a in ENGINES);
const { server, origin } = await serve();
const failures: string[] = [];
for (const name of wanted.length ? wanted : Object.keys(ENGINES)) {
  failures.push(...(await run(name, origin)));
}
server.close();
if (failures.length) {
  console.error(`\nFAIL\n${failures.map((f) => `  ${f}`).join('\n')}`);
  process.exit(1);
}
console.log(`\nPASS — screenshots in ${path.relative(repo, outDir)}/`);
