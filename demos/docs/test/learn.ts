// Browser check of the Learn track on the built docs (PORT-PLAN.md Phase 17).
// Local only, not in CI.
//
//   pnpm --filter docs build
//   node demos/docs/test/learn.ts            # chromium
//   node demos/docs/test/learn.ts firefox webkit
//
// For every written chapter, with the site in light and in dark:
//   1. the page has the chapter's title and question, and its five parts in
//      order;
//   2. every live example is rendered: the frame loaded, each of its
//      stylesheets has rules, its <body> has the example's markup, the frame
//      shows all of its content and is in the site's mode;
//   3. the source beside it is the text of the frame's own files;
//   4. every tab of a "Try it" loads its frame and marks the files it swapped;
//   5. every Reference link of the prose leads to a section that exists.
// Chapter 1 also moves its picker and expects the colours worked out from the
// primary to change with it. Chapters 6 to 11 each have their own part:
//   6   what a nested theme passes, generates and inherits is what is painted;
//   7   across the lightness slider the text on a fill never reads below
//       4.5:1, the text flips once, and the two cases outside the guarantee
//       do go below;
//   8   every slider changes what it says it changes;
//   9   a picked theme and mode are on the frame's <html>, the buttons follow
//       (watchMode), a reload brings them back, nothing of the site's own
//       saved theme is touched, and the "not saved" variation forgets;
//   10  the gallery's buttons are rendered three times in three different
//       colours, and pointing at one names its Material variable and the
//       cp-theming variable behind it.
//   11  the app with Sass and the app without paint the same colours, the
//       brand and the tertiary are the package's, the page around the app has
//       the theme too (it is the default); with one palette changed by the app
//       only that palette differs, and with the theme not the default the page
//       around the app has no theme.
// Screenshots go to dist/docs-render/learn/. Exits 1 when an assertion fails.
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { chromium, firefox, webkit, type BrowserType, type Frame, type Page } from 'playwright';
import { CHAPTERS, REFS, frameFiles, shownName } from '../src/app/learn/chapters.ts';
import { exampleFiles, exampleFolder } from '../scripts/lib/order.ts';
import { BASE, blockFonts, repo, requireBuild, serve } from './lib/site.ts';

const outDir = path.join(repo, 'dist/docs-render/learn');
const MODES = ['light', 'dark'] as const;
const ENGINES: Record<string, BrowserType> = { chromium, firefox, webkit };
const PARTS = ['example', 'idea', 'code', 'try-it'];

const failures: string[] = [];
let checks = 0;
function expect(ok: boolean, message: string): void {
  checks++;
  if (!ok) failures.push(message);
}

const squash = (text: string) => text.replace(/\s+/g, ' ').trim();

/** The frame document of the nth live example on the page, once it has loaded. */
async function frameOf(page: Page, index: number, name: string): Promise<Frame> {
  const iframe = page.locator('iframe.live-frame').nth(index);
  await page.waitForFunction(
    ([i, n]) => {
      const el = document.querySelectorAll<HTMLIFrameElement>('iframe.live-frame')[i as number];
      const doc = el?.contentDocument;
      return (
        !!doc &&
        doc.readyState === 'complete' &&
        doc.location.pathname.endsWith(`/${n}.html`) &&
        el.style.height !== ''
      );
    },
    [index, name] as const,
  );
  const handle = await iframe.elementHandle();
  const frame = await handle?.contentFrame();
  if (!frame) throw new Error(`no frame ${name}`);
  return frame;
}

interface FrameState {
  sheets: number[];
  links: number;
  elements: number;
  bodyHeight: number;
  mode: string | null;
  scheme: string;
}

function stateOf(frame: Frame): Promise<FrameState> {
  return frame.evaluate(() => ({
    sheets: [...document.styleSheets].map((s) => s.cssRules.length),
    links: document.querySelectorAll('link[rel=stylesheet]').length,
    elements: document.body.querySelectorAll('*').length,
    bodyHeight: document.body.offsetHeight,
    mode: document.documentElement.getAttribute('themeMode'),
    scheme: getComputedStyle(document.documentElement).colorScheme,
  }));
}

async function checkFrame(
  page: Page,
  index: number,
  folder: string,
  name: string,
  mode: string,
  label: string,
  ownMode = false,
): Promise<Frame> {
  const frame = await frameOf(page, index, name);
  const state = await stateOf(frame);
  expect(state.links >= 3, `${label}: the frame links frame.css, core and its theme`);
  expect(
    state.sheets.length === state.links && state.sheets.every((n) => n > 0),
    `${label}: every stylesheet of the frame loaded with rules (${state.sheets.join(', ')})`,
  );
  expect(state.elements > 3, `${label}: the frame's <body> has the example's markup`);
  // An example that chooses its own mode (chapter 9) is left alone by the page.
  if (!ownMode) {
    expect(state.mode === mode, `${label}: the frame is in the site's mode (${state.mode})`);
    expect(
      state.scheme === mode,
      `${label}: the frame's color-scheme is ${mode} (${state.scheme})`,
    );
  }

  const height = await page
    .locator('iframe.live-frame')
    .nth(index)
    .evaluate((el) => el.getBoundingClientRect().height);
  expect(
    height >= state.bodyHeight - 1 && height > 60,
    `${label}: the frame is at least as tall as its content (${height} / ${state.bodyHeight})`,
  );

  // The source beside it: one panel per file of the frame, with the file's text.
  const files = exampleFiles(CHAPTERS.find((c) => c.folder === folder)!);
  const use = frameFiles(name, files);
  const block = page.locator(FRAMED).nth(index);
  const tabs = (await block.locator('.live-file').allTextContents()).map((t) =>
    squash(t).replace(/ changed$/, ''),
  );
  const wanted = [use.html, use.script, use.styles, use.head, use.theme].filter(
    (file): file is string => !!file,
  );
  expect(
    tabs.join() === wanted.map(shownName).join(),
    `${label}: the source tabs are the frame's files (${tabs.join(', ')})`,
  );
  for (const [i, file] of wanted.entries()) {
    await block.locator('.live-file').nth(i).click();
    await block.locator('.live-file--active', { hasText: shownName(file) }).waitFor();
    const shown = squash(await block.locator('.live-pre:not(.live-pre--hidden)').innerText());
    const onDisk = squash(
      readFileSync(path.join(exampleFolder({ folder } as never), file), 'utf8'),
    );
    expect(shown === onDisk, `${label}: ${file} is shown as it is on disk`);
  }
  await block.locator('.live-file').first().click();
  return frame;
}

/** A live example shown in a frame; chapter 10's is rendered by Angular in the page. */
const FRAMED = 'figure.live:not(.live--template)';
const RENDERED = 'figure.live.live--template';

/** Sets a slider of a live example, as dragging it would. */
async function slide(page: Page, block: number, control: number, value: number): Promise<void> {
  await page
    .locator(FRAMED)
    .nth(block)
    .locator('input[type=range]')
    .nth(control)
    .evaluate((el: HTMLInputElement, v) => {
      el.value = String(v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, value);
}

/** The contrast readouts of a live example, as numbers, in order. */
async function readings(page: Page, block: number): Promise<number[]> {
  const texts = await page
    .locator(FRAMED)
    .nth(block)
    .locator('.live-measure strong')
    .allTextContents();
  return texts.map((t) => parseFloat(t));
}

/** The fill a cp-theming attribute paints: the element's ::before. */
const fillOf = (frame: Frame, selector: string) =>
  frame.evaluate(
    (s) => getComputedStyle(document.querySelector(s)!, '::before').backgroundColor,
    selector,
  );

// ── Chapter 6: passed, generated, inherited ──────────────────────────────────
async function checkNested(frame: Frame, label: string): Promise<void> {
  const of = (theme: string, palette: string) =>
    fillOf(frame, `[theme="${theme}"] > .chain [palette="${palette}"]`);
  const harbour = {
    primary: await fillOf(frame, '.page > .chain [palette="primary"]'),
    secondary: await fillOf(frame, '.page > .chain [palette="secondary"]'),
    surface: await fillOf(frame, '.page > .chain [palette="surface"]'),
  };
  expect(
    (await of('ember', 'primary')) !== harbour.primary &&
      (await of('ember', 'surface')) !== harbour.surface,
    `${label}: a nested brand regenerates everything, the surface too`,
  );
  expect(
    (await of('moss', 'primary')) !== harbour.primary &&
      (await of('moss', 'secondary')) !== harbour.secondary,
    `${label}: a nested primary regenerates the accents`,
  );
  expect(
    (await of('moss', 'surface')) === harbour.surface,
    `${label}: a nested primary inherits the surface`,
  );
  expect(
    (await of('moss', 'brand')) === (await of('moss', 'primary')),
    `${label}: its brand palette is its primary`,
  );
  expect(
    (await of('plum', 'secondary')) !== harbour.secondary &&
      (await of('plum', 'primary')) === harbour.primary &&
      (await of('plum', 'surface')) === harbour.surface,
    `${label}: a nested secondary changes that palette and inherits the rest`,
  );
}

// ── Chapter 11: one theme, two ways in ───────────────────────────────────────
/** What an app of chapter 11 paints: its fills, and the page around it. */
function paintedBy(frame: Frame): Promise<Record<string, string>> {
  return frame.evaluate(() => {
    const fill = (s: string) =>
      getComputedStyle(document.querySelector(s)!, '::before').backgroundColor;
    return {
      brand: fill('.bar'),
      primary: fill('.action[filled]'),
      tertiary: fill('.label'),
      surface: fill('.order'),
      background: fill('.app'),
      corner: getComputedStyle(document.querySelector('.order')!).borderTopLeftRadius,
      around: getComputedStyle(document.body).backgroundColor,
    };
  });
}

/** The package's own colours (demos/demo-brand-core/scss/_index.scss). */
const ACME = {
  brand: 'rgb(0, 168, 120)',
  tertiary: { light: 'rgb(123, 45, 142)', dark: 'rgb(219, 166, 234)' },
  corner: '10px',
};
/** try-override.theme.scss: the tertiary the app sets. */
const OVERRIDE = { light: 'rgb(179, 38, 30)', dark: 'rgb(255, 180, 171)' };

async function checkPackage(page: Page, mode: 'light' | 'dark', label: string): Promise<void> {
  const sass = await paintedBy(await frameOf(page, 0, 'example'));
  const css = await paintedBy(await frameOf(page, 1, 'css'));
  expect(
    JSON.stringify(sass) === JSON.stringify(css),
    `${label}: with Sass and without paint the same (${JSON.stringify(sass)} / ${JSON.stringify(css)})`,
  );
  expect(sass.brand === ACME.brand, `${label}: the brand fill is the package's (${sass.brand})`);
  expect(
    sass.tertiary === ACME.tertiary[mode],
    `${label}: the tertiary is the package's for ${mode} (${sass.tertiary})`,
  );
  expect(sass.corner === ACME.corner, `${label}: the medium corner is the package's`);
  expect(
    new Set([sass.brand, sass.primary, sass.tertiary, sass.surface]).size === 4,
    `${label}: brand, primary, tertiary and surface are four colours`,
  );
  expect(
    sass.around === sass.background,
    `${label}: the theme is the default: the page around the app has its background`,
  );
}

async function checkPackageTry(
  page: Page,
  frame: Frame,
  name: string,
  mode: 'light' | 'dark',
  label: string,
): Promise<void> {
  // The example it is compared with is still on the page, in the first block.
  const base = await paintedBy(await frameOf(page, 0, 'example'));
  const tried = await paintedBy(frame);
  if (name === 'try-override') {
    expect(
      tried.tertiary === OVERRIDE[mode],
      `${label}: the tertiary is the app's (${tried.tertiary})`,
    );
    expect(
      JSON.stringify({ ...tried, tertiary: '' }) === JSON.stringify({ ...base, tertiary: '' }),
      `${label}: nothing but the tertiary changed`,
    );
  }
  if (name === 'try-named') {
    expect(
      JSON.stringify({ ...tried, around: '' }) === JSON.stringify({ ...base, around: '' }),
      `${label}: the app itself is unchanged`,
    );
    expect(
      tried.around !== base.around,
      `${label}: the page around the app has no theme (${tried.around})`,
    );
  }
}

// ── Chapter 7: the guarantee and its edge ────────────────────────────────────
async function checkContrast(page: Page, frame: Frame, block: number, label: string) {
  let lowest = Infinity;
  let outside = Infinity;
  let flips = 0;
  let last = '';
  for (let lightness = 5; lightness <= 95; lightness += 3) {
    await slide(page, block, 0, lightness);
    const [fill, steps, tint, words] = await readings(page, block);
    lowest = Math.min(lowest, fill, steps);
    outside = Math.min(outside, tint, words);
    const text = await colourOf(frame, '.fill', 'color');
    if (last && text !== last) flips++;
    last = text;
  }
  expect(lowest >= 4.5, `${label}: text on a fill never reads below 4.5:1 (${lowest})`);
  expect(lowest < 5, `${label}: the lowest ratio is near the switch (${lowest})`);
  expect(flips === 1, `${label}: the text flips once across the slider (${flips})`);
  expect(outside < 4.5, `${label}: a tint or the colour as text does go below (${outside})`);
  const marked = await page.locator(FRAMED).nth(block).locator('.live-measure--low').count();
  expect(marked > 0, `${label}: a ratio below 4.5 is marked`);
}

// ── Chapter 8: each slider and what it changes ───────────────────────────────
async function checkSliders(page: Page, frame: Frame, label: string): Promise<void> {
  const read = () =>
    frame.evaluate(() => {
      const card = document.querySelector('article')!;
      const style = getComputedStyle(card);
      return {
        density: style.paddingTop,
        corners: style.borderTopLeftRadius,
        shadow: style.boxShadow,
        pulse: getComputedStyle(card.querySelector('.status')!, '::before').animationDuration,
        quiet: getComputedStyle(card.querySelector('.quiet')!).color,
        title: getComputedStyle(card.querySelector('h4')!).fontSize,
      };
    });
  const before = await read();
  // In the order of the sliders: density, corners, shadow, pulse, quiet text, title size.
  const moves: [keyof typeof before, number, string?][] = [
    ['density', -3, '12px'],
    ['corners', 28, '28px'],
    ['shadow', 5],
    ['pulse', 1500, '1.5s'],
    ['quiet', 90],
    ['title', 28, '28px'],
  ];
  for (const [i, [, value]] of moves.entries()) await slide(page, 0, i, value);
  const after = await read();
  for (const [what, , wanted] of moves) {
    expect(
      before[what] !== after[what],
      `${label}: the ${what} slider changes it (${after[what]})`,
    );
    if (wanted) expect(after[what] === wanted, `${label}: ${what} is ${wanted} (${after[what]})`);
  }
}

// ── Chapter 9: pick, save, reload ────────────────────────────────────────────
async function checkRuntime(page: Page, label: string): Promise<void> {
  const state = (frame: Frame) =>
    frame.evaluate(() => ({
      theme: document.documentElement.getAttribute('theme'),
      mode: document.documentElement.getAttribute('themeMode'),
      pressed: [...document.querySelectorAll('[aria-pressed=true]')].map((b) => b.textContent),
      page: getComputedStyle(document.body).backgroundColor,
    }));
  const site = () =>
    page.evaluate(() => ({
      theme: document.documentElement.getAttribute('theme'),
      saved: localStorage.getItem('cp-theming--theme'),
      keys: Object.keys(localStorage).filter((k) => k.startsWith('learn-frame:')).length,
    }));
  const siteBefore = await site();

  let frame = await frameOf(page, 0, 'example');
  const start = await state(frame);
  await frame.locator('button[data-theme=forest]').click();
  await frame.locator('button[data-mode=dark]').click();
  await frame.locator('button[data-mode=dark][aria-pressed=true]').waitFor();
  const picked = await state(frame);
  expect(
    picked.theme === 'forest' && picked.mode === 'dark',
    `${label}: a click sets theme and themeMode on <html> (${picked.theme}, ${picked.mode})`,
  );
  expect(
    picked.pressed.join() === 'forest,dark',
    `${label}: the buttons follow the attributes (${picked.pressed.join()})`,
  );
  expect(picked.page !== start.page, `${label}: the page is repainted (${picked.page})`);

  await frame.locator('#reload').click();
  await page.waitForFunction(
    () =>
      document
        .querySelector<HTMLIFrameElement>('iframe.live-frame')
        ?.contentDocument?.querySelector('[data-mode=dark][aria-pressed=true]') != null,
  );
  frame = await frameOf(page, 0, 'example');
  const back = await state(frame);
  expect(
    back.theme === 'forest' && back.mode === 'dark' && back.page === picked.page,
    `${label}: a reload brings the saved theme and mode back (${back.theme}, ${back.mode})`,
  );

  const siteAfter = await site();
  expect(
    siteAfter.theme === siteBefore.theme && siteAfter.saved === siteBefore.saved,
    `${label}: the site's own theme and saved theme are untouched (${siteAfter.theme}, ${siteAfter.saved})`,
  );
  expect(siteAfter.keys > 0, `${label}: the example's choice is saved under its own keys`);

  // "Not saved": the second tab of the Try it.
  await page.locator(FRAMED).nth(1).locator('.live-tab').nth(1).click();
  let unsaved = await frameOf(page, 1, 'try-unsaved');
  await unsaved.locator('button[data-theme=sunset]').click();
  await unsaved.locator('button[data-theme=sunset][aria-pressed=true]').waitFor();
  await unsaved.locator('#reload').click();
  await page.waitForFunction(
    () =>
      document
        .querySelectorAll<HTMLIFrameElement>('iframe.live-frame')[1]
        ?.contentDocument?.querySelector('[data-theme=ocean][aria-pressed=true]') != null,
  );
  unsaved = await frameOf(page, 1, 'try-unsaved');
  expect(
    (await state(unsaved)).theme === null,
    `${label}: with saving off a reload goes back to the default`,
  );

  // "One toggle": the first tab.
  await page.locator(FRAMED).nth(1).locator('.live-tab').nth(0).click();
  const toggle = await frameOf(page, 1, 'try-toggle');
  const was = await toggle.locator('#toggle').textContent();
  await toggle.locator('#toggle').click();
  await toggle.locator('#toggle', { hasNotText: was ?? '' }).waitFor();
  const now = await state(toggle);
  expect(
    now.mode === (was === 'Switch to dark' ? 'dark' : 'light'),
    `${label}: the toggle sets the other mode (${was} → ${now.mode})`,
  );
}

// ── Chapter 10: Angular Material, rendered in the page ───────────────────────
async function checkMaterial(page: Page, folder: string, label: string): Promise<void> {
  const block = page.locator(RENDERED).first();
  const groups = block.locator('cpa-g-buttons');
  expect((await groups.count()) === 3, `${label}: the gallery's buttons are rendered three times`);

  const filled = (group: number) =>
    groups
      .nth(group)
      .locator('button', { hasText: /^\s*Filled\s*$/ })
      .first();
  const fills: string[] = [];
  const wanted = [
    ['theme="harbour"', '--color--primary'],
    ['theme="ember"', '--color--primary'],
    ['palette="tertiary"', '--color--tertiary'],
  ];
  for (const [g, [scope, token]] of wanted.entries()) {
    fills.push(await filled(g).evaluate((el) => getComputedStyle(el).backgroundColor));
    await filled(g).hover();
    await block.locator('.live-roles-name', { hasText: scope }).waitFor();
    // The parts of a line are separate elements; the build drops the spaces between them.
    const tight = (text: string) => text.replace(/\s+/g, '');
    const lines = (await block.locator('.live-role').allTextContents()).map(tight);
    expect(
      lines.length === 2 &&
        lines[0] === tight(`Fill --mat-sys-primary from ${token} in ${scope}`) &&
        lines[1] === tight(`Text --mat-sys-on-primary from ${token}--contrast in ${scope}`),
      `${label}: under ${scope} a filled button is ${token} (${lines.join(' / ')})`,
    );
  }
  expect(
    new Set(fills).size === 3 && fills.every((f) => !/rgba\(0, 0, 0, 0\)|transparent/.test(f)),
    `${label}: the three scopes paint three colours (${fills.join(', ')})`,
  );

  // The source under it is the text of the files.
  const files = await block.locator('.live-file').allTextContents();
  expect(
    files.map(squash).join() === 'example.ng.html,buttons.ng.html,theme.scss',
    `${label}: the source tabs (${files.map(squash).join(', ')})`,
  );
  const onDisk: Record<string, string> = {
    'example.ng.html': path.join(exampleFolder({ folder } as never), 'example.ng.html'),
    'buttons.ng.html': path.join(repo, 'demos/docs/src/examples/components/buttons.ng.html'),
    'theme.scss': path.join(exampleFolder({ folder } as never), 'theme.scss'),
  };
  for (const [i, name] of Object.keys(onDisk).entries()) {
    await block.locator('.live-file').nth(i).click();
    await block.locator('.live-file--active', { hasText: name }).waitFor();
    const shown = squash(await block.locator('.live-pre:not(.live-pre--hidden)').innerText());
    expect(shown === squash(readFileSync(onDisk[name], 'utf8')), `${label}: ${name} as on disk`);
  }
  await block.locator('.live-file').first().click();

  // Try it: two examples of the gallery, one per tab.
  const tryIt = page.locator(RENDERED).nth(1);
  expect((await tryIt.locator('.live-tab').count()) === 2, `${label}: the Try it has two tabs`);
  expect(
    (await tryIt.locator('.live-render [palette="tertiary"] button').count()) > 0,
    `${label}: the first tab renders the palette example`,
  );
  await tryIt.locator('.live-tab').nth(1).click();
  await tryIt.locator('.live-render cpa-g-overlays').waitFor();
  expect(
    (await tryIt
      .locator('.live-render [cpaoverlayscope], .live-render [cpaOverlayScope]')
      .count()) > 0,
    `${label}: the second tab renders the overlay example`,
  );
  await tryIt.locator('.live-tab').nth(0).click();
}

const colourOf = (frame: Frame, selector: string, property: string) =>
  frame.evaluate(([s, p]) => getComputedStyle(document.querySelector(s)!).getPropertyValue(p), [
    selector,
    property,
  ] as const);

async function run(engine: string): Promise<void> {
  const { server, origin } = await serve();
  const browser = await ENGINES[engine].launch();
  const page = await browser.newPage({ viewport: { width: 1500, height: 5200 } });
  await blockFonts(page);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('requestfailed', (r) => {
    if (!/fonts\.(googleapis|gstatic)\.com/.test(r.url())) errors.push(`failed: ${r.url()}`);
  });

  // The home page leads with Learn.
  await page.goto(`${origin}${BASE}`, { waitUntil: 'networkidle' });
  const nav = (await page.locator('.main-nav .nav-link').allTextContents()).map(squash);
  expect(nav.join() === 'Learn,Reference,Explore', `home: the navigation is ${nav.join(', ')}`);
  const firstTrack = squash((await page.locator('.track-title').first().textContent()) ?? '');
  expect(firstTrack === 'Learn', `home: the first section is ${firstTrack}`);
  const cta = await page.locator('.hero-actions a').first().getAttribute('href');
  expect(
    cta === `${BASE}learn/${CHAPTERS[0].slug}`,
    `home: the first button opens chapter 1 (${cta})`,
  );
  await page.screenshot({
    path: path.join(outDir, `${engine}-home.png`),
    clip: { x: 0, y: 0, width: 1500, height: 2300 },
  });

  // The Learn index lists every chapter and links the written ones.
  await page.goto(`${origin}${BASE}learn`, { waitUntil: 'networkidle' });
  const listed = await page.locator('.learn-list li').count();
  const linked = await page.locator('.learn-list a.learn-item').count();
  expect(listed === CHAPTERS.length, `learn: lists ${listed} chapters`);
  expect(linked === CHAPTERS.filter((c) => c.written).length, `learn: links ${linked} chapters`);
  await page.screenshot({
    path: path.join(outDir, `${engine}-learn.png`),
    clip: { x: 0, y: 0, width: 1500, height: 1500 },
  });

  for (const chapter of CHAPTERS.filter((c) => c.written)) {
    for (const mode of MODES) {
      const label = `${engine} ${chapter.folder} ${mode}`;
      await page.goto(`${origin}${BASE}learn/${chapter.slug}`, { waitUntil: 'networkidle' });
      await page.evaluate((m) => document.documentElement.setAttribute('themeMode', m), mode);

      expect(
        squash((await page.locator('.learn h1').textContent()) ?? '') === chapter.title,
        `${label}: the title`,
      );
      expect(
        squash((await page.locator('.learn-question').textContent()) ?? '') === chapter.question,
        `${label}: the question under the title`,
      );
      const parts = await page
        .locator('.learn section.learn-part')
        .evaluateAll((els) => els.map((el) => el.id));
      expect(parts.join() === PARTS.join(), `${label}: the parts are ${parts.join(', ')}`);
      expect(
        (await page.locator('.learn-now').count()) === 1 &&
          squash((await page.locator('.learn-now').innerText()) ?? '').startsWith('You can now'),
        `${label}: the last line is "You can now …"`,
      );

      // Every live example on the page, with the frame each one starts on.
      const all = await page.locator('figure.live').count();
      expect(all >= 2, `${label}: an example and a Try it (${all} live examples)`);
      const blocks = page.locator(FRAMED);
      const count = await blocks.count();
      // Chapter 9's examples choose their own mode.
      const ownMode = chapter.n === 9;
      for (let i = 0; i < count; i++) {
        const src = (await blocks.nth(i).locator('iframe').getAttribute('src')) ?? '';
        const name = path.basename(src, '.html');
        await checkFrame(page, i, chapter.folder, name, mode, `${label} #${i} ${name}`, ownMode);
      }

      await page
        .locator('.page-main')
        .screenshot({ path: path.join(outDir, `${engine}-${chapter.folder}-${mode}.png`) });

      if (chapter.n === 1) {
        const frame = await frameOf(page, 0, 'example');
        const before = {
          given: await colourOf(frame, '.given', 'background-color'),
          text: await colourOf(frame, '.given', 'color'),
          dark: await colourOf(frame, '.dark', 'background-color'),
          soft: await colourOf(frame, '.soft', 'background-color'),
          border: await colourOf(frame, '.border', 'border-top-color'),
          ring: await colourOf(frame, '.ring', 'outline-color'),
        };
        await page.locator('.live-control input').evaluate((el: HTMLInputElement) => {
          el.value = '#ffe14d';
          el.dispatchEvent(new Event('input', { bubbles: true }));
        });
        const after = {
          given: await colourOf(frame, '.given', 'background-color'),
          text: await colourOf(frame, '.given', 'color'),
          dark: await colourOf(frame, '.dark', 'background-color'),
          soft: await colourOf(frame, '.soft', 'background-color'),
          border: await colourOf(frame, '.border', 'border-top-color'),
          ring: await colourOf(frame, '.ring', 'outline-color'),
        };
        expect(
          after.given === 'rgb(255, 225, 77)',
          `${label}: the picker sets the primary (${after.given})`,
        );
        for (const key of Object.keys(before) as (keyof typeof before)[])
          expect(before[key] !== after[key], `${label}: the picker moves ${key} (${after[key]})`);
        await blocks.first().screenshot({
          path: path.join(outDir, `${engine}-${chapter.folder}-${mode}-picked.png`),
        });
      }

      if (chapter.n === 6) await checkNested(await frameOf(page, 0, 'example'), label);
      if (chapter.n === 7) {
        await checkContrast(page, await frameOf(page, 0, 'example'), 0, `${label} example`);
        await blocks.first().screenshot({
          path: path.join(outDir, `${engine}-${chapter.folder}-${mode}-slid.png`),
        });
      }
      if (chapter.n === 8) {
        await checkSliders(page, await frameOf(page, 0, 'example'), label);
        await blocks.first().screenshot({
          path: path.join(outDir, `${engine}-${chapter.folder}-${mode}-slid.png`),
        });
      }
      if (chapter.n === 11) await checkPackage(page, mode, label);
      if (chapter.n === 10) {
        await checkMaterial(page, chapter.folder, label);
        await page
          .locator(RENDERED)
          .first()
          .screenshot({
            path: path.join(outDir, `${engine}-${chapter.folder}-${mode}-hover.png`),
          });
      }

      // Each tab of every block with tabs.
      for (let i = 0; i < count; i++) {
        const tabs = blocks.nth(i).locator('.live-tab');
        for (let t = 1; t < (await tabs.count()); t++) {
          const was = await blocks.nth(i).locator('iframe').getAttribute('src');
          await tabs.nth(t).click();
          await page.waitForFunction(
            ([n, old]) =>
              document
                .querySelectorAll('figure.live:not(.live--template) iframe')
                [n as number].getAttribute('src') !== old,
            [i, was] as const,
          );
          const src = (await blocks.nth(i).locator('iframe').getAttribute('src')) ?? '';
          const name = path.basename(src, '.html');
          const tried = await checkFrame(
            page,
            i,
            chapter.folder,
            name,
            mode,
            `${label} #${i} ${name}`,
            ownMode,
          );
          if (chapter.n === 11)
            await checkPackageTry(page, tried, name, mode, `${label} #${i} ${name}`);
          const marked = await blocks.nth(i).locator('.live-file .live-changed').count();
          expect(marked > 0, `${label} #${i} ${name}: the swapped files are marked`);
          await blocks.nth(i).screenshot({
            path: path.join(outDir, `${engine}-${chapter.folder}-${mode}-${name}.png`),
          });
        }
      }
    }

    // Chapter 9 last, and once: what it saves stays saved for this browser.
    if (chapter.n === 9) await checkRuntime(page, `${engine} ${chapter.folder}`);

    // The Reference links of the prose.
    const links = await page
      .locator('.learn a.learn-ref')
      .evaluateAll((els) =>
        els.map((a) => [a.textContent?.trim() ?? '', a.getAttribute('href') ?? '']),
      );
    expect(links.length > 0, `${engine} ${chapter.folder}: the prose links to the Reference`);
    for (const [name, href] of links) {
      // An attribute may be shown with a value: theme="ocean".
      const ref = REFS.find((r) => r.name === name.replace(/="[^"]*"$/, ''));
      expect(
        !!ref && href === `${BASE}packages/${ref.page}#${ref.anchor}`,
        `${engine} ${chapter.folder}: ${name} links to its Reference entry (${href})`,
      );
    }
  }

  // One Reference link followed all the way: the section is on the page.
  for (const ref of [
    REFS[0],
    REFS.find((r) => r.chapter === 5)!,
    REFS.find((r) => r.name === '--space--{size}')!,
    REFS.find((r) => r.chapter === 10)!,
    REFS.find((r) => r.chapter === 11)!,
  ]) {
    await page.goto(`${origin}${BASE}packages/${ref.page}#${ref.anchor}`, {
      waitUntil: 'networkidle',
    });
    expect(
      (await page.locator(`[id="${ref.anchor}"]`).count()) === 1,
      `${engine}: ${ref.page}#${ref.anchor} exists (${ref.name})`,
    );
  }

  // Explore holds the gallery and the showcase.
  await page.goto(`${origin}${BASE}explore`, { waitUntil: 'networkidle' });
  expect(
    page.url().endsWith('/explore/components'),
    `${engine}: Explore opens the gallery (${page.url()})`,
  );
  const explore = (await page.locator('.sidenav a[mat-list-item]').allTextContents()).map(squash);
  expect(
    explore.join() === 'Components,Showcase',
    `${engine}: Explore lists ${explore.join(', ')}`,
  );

  expect(errors.length === 0, `${engine}: page errors: ${errors.join('; ')}`);
  await browser.close();
  server.close();
}

requireBuild();
mkdirSync(outDir, { recursive: true });
const engines = process.argv.slice(2).filter((a) => a in ENGINES);
for (const engine of engines.length ? engines : ['chromium']) await run(engine);

console.log(
  `learn: ${checks - failures.length}/${checks} checks passed; screenshots in ${path.relative(repo, outDir)}`,
);
if (failures.length) {
  for (const f of failures) console.error(`  FAIL ${f}`);
  process.exit(1);
}
