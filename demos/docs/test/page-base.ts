// Browser check of the opt-in page rule on the built site (issue #10,
// PORT-PLAN.md Phase 19). Local only, after `pnpm --filter docs build`.
//
//   node demos/docs/test/page-base.ts                  # chromium
//   node demos/docs/test/page-base.ts chromium firefox webkit
//
// The docs app takes the rule from Sass (`t.apply-document-base()` in
// styles.scss) and keeps its own font on top; demo-core takes it as compiled
// CSS (`@cpangular/cp-theming-core/css/base`). In both, <body> paints the
// theme's background and its contrast colour, in light and in dark mode.
import { chromium, firefox, webkit, type BrowserType } from 'playwright';
import { BASE, requireBuild, serve } from './lib/site.ts';

requireBuild();
const engines: Record<string, BrowserType> = { chromium, firefox, webkit };
const chosen = process.argv.slice(2).filter((a) => a in engines);
if (!chosen.length) chosen.push('chromium');

const { server, origin } = await serve();
let failed = 0;
let checks = 0;
const ok = (pass: boolean, what: string) => {
  checks++;
  if (!pass) {
    failed++;
    console.error(`✘ ${what}`);
  }
};

/** <body>'s painted colours and font, and the theme's tokens painted on a probe. */
const read = `(() => {
  const body = getComputedStyle(document.body);
  const probe = document.createElement('span');
  document.body.appendChild(probe);
  const paint = (token, property) => {
    probe.style[property] = 'var(' + token + ')';
    return getComputedStyle(probe)[property];
  };
  const out = {
    background: body.backgroundColor,
    color: body.color,
    font: body.fontFamily,
    tokenBackground: paint('--color--background', 'backgroundColor'),
    tokenText: paint('--color--background--contrast', 'color'),
    plainFamily: body.getPropertyValue('--text--plain-family').trim(),
  };
  probe.remove();
  return out;
})()`;

interface Read {
  background: string;
  color: string;
  font: string;
  tokenBackground: string;
  tokenText: string;
  plainFamily: string;
}

for (const engine of chosen) {
  const browser = await engines[engine].launch();
  for (const mode of ['light', 'dark'] as const) {
    const page = await browser.newPage();
    await page.emulateMedia({ colorScheme: 'light' });

    // The docs app: the mixin, with the app's own font on top.
    await page.goto(`${origin}${BASE}packages/core/getting-started`, { waitUntil: 'networkidle' });
    await page.evaluate(`document.documentElement.setAttribute('themeMode', '${mode}')`);
    const docs = (await page.evaluate(read)) as Read;
    ok(
      docs.background === docs.tokenBackground,
      `${engine} ${mode} docs: body background is --color--background (${docs.background} / ${docs.tokenBackground})`,
    );
    ok(
      docs.color === docs.tokenText,
      `${engine} ${mode} docs: body text is the background's contrast (${docs.color} / ${docs.tokenText})`,
    );
    ok(docs.background !== 'rgba(0, 0, 0, 0)', `${engine} ${mode} docs: body has a background`);
    ok(/Roboto/.test(docs.font), `${engine} ${mode} docs: the app's own font wins (${docs.font})`);
    for (const id of ['page-base', 'from-ng-material-theme'])
      ok(
        (await page.locator(`[id="${id}"]`).count()) === 1,
        `${engine} docs: Getting Started has #${id}`,
      );

    // demo-core: the compiled rule. Its font family is the theme's.
    await page.goto(`${origin}${BASE}demos/demo-core/index.html`, { waitUntil: 'networkidle' });
    await page.evaluate(`document.documentElement.setAttribute('themeMode', '${mode}')`);
    const demo = (await page.evaluate(read)) as Read;
    ok(demo.plainFamily !== '', `${engine} ${mode} demo-core: --text--plain-family is set`);
    ok(
      demo.font === demo.plainFamily,
      `${engine} ${mode} demo-core: body font is --text--plain-family (${demo.font} / ${demo.plainFamily})`,
    );
    ok(
      demo.color === demo.tokenText,
      `${engine} ${mode} demo-core: body text is the background's contrast (${demo.color} / ${demo.tokenText})`,
    );
    const sheets = (await page.evaluate(
      `[...document.styleSheets].some((s) => { try { return [...s.cssRules].some((r) => r.selectorText === ':where(body)'); } catch { return false; } })`,
    )) as boolean;
    ok(sheets, `${engine} demo-core: the :where(body) rule of css/base is loaded`);
    await page.close();
  }
  await browser.close();
}
server.close();
console.log(`${checks - failed} of ${checks} checks pass (${chosen.join(', ')})`);
process.exit(failed ? 1 : 0);
