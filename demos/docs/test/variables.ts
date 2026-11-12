// Browser check of the Reference's generated CSS Variables page on the built
// docs (PORT-PLAN.md Phase 17). Local only, not in CI.
//
//   pnpm --filter docs build
//   node demos/docs/test/variables.ts            # chromium
//   node demos/docs/test/variables.ts firefox webkit
//
//   1. the page shows one swatch for every colour token the generator found in
//      core.css, each painted with its own token (no swatch is unpainted, and
//      a fill and its contrast chip differ);
//   2. the theme switch and the mode switch change what the swatches show, and
//      leave the site's own theme and mode alone;
//   3. clicking a swatch names its token;
//   4. every table has the rows the generator gave it, with core's values.
// Screenshots go to dist/docs-render/variables/. Exits 1 when an assertion fails.
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { chromium, firefox, webkit, type BrowserType, type Page } from 'playwright';
import { variablesData } from '../scripts/lib/variables.ts';
import { BASE, blockFonts, repo, requireBuild, serve } from './lib/site.ts';

const outDir = path.join(repo, 'dist/docs-render/variables');
const ENGINES: Record<string, BrowserType> = { chromium, firefox, webkit };
const data = variablesData();

const failures: string[] = [];
let checks = 0;
function expect(ok: boolean, message: string): void {
  checks++;
  if (!ok) failures.push(message);
}

const fillOf = (page: Page, token: string) =>
  page
    .locator(`.var-tile[title="${token}"] .var-swatch`)
    .evaluate((el) => getComputedStyle(el).backgroundColor);

async function run(engine: string): Promise<void> {
  const { server, origin } = await serve();
  const browser = await ENGINES[engine].launch();
  const page = await browser.newPage({ viewport: { width: 1500, height: 1400 } });
  await blockFonts(page);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.goto(`${origin}${BASE}packages/core/variables`, { waitUntil: 'networkidle' });
  await page.locator('.var-tile').first().waitFor();

  // 1. One swatch per colour token.
  const tiles = await page.locator('.var-tile').count();
  const chips = await page.locator('.var-on').count();
  expect(
    tiles + chips === data.colourTokens,
    `${engine}: ${tiles} swatches and ${chips} contrast chips for ${data.colourTokens} colour tokens`,
  );
  const palettes = await page.locator('.var-palette').evaluateAll((els) => els.map((el) => el.id));
  expect(
    palettes.join() === data.palettes.map((p) => `color-${p.name}`).join(),
    `${engine}: one group per palette (${palettes.join(', ')})`,
  );
  const painted = await page.locator('.var-tile').evaluateAll((els) =>
    els.map((el) => {
      const swatch = el.querySelector('.var-swatch')!;
      const chip = el.querySelector('.var-on');
      return {
        token: el.getAttribute('title'),
        fill: getComputedStyle(swatch).backgroundColor,
        chip: chip ? getComputedStyle(chip).backgroundColor : null,
        from: (swatch as HTMLElement).style.background,
      };
    }),
  );
  const clear = /^(?:transparent|rgba\(0, 0, 0, 0\))$/;
  expect(
    painted.every((p) => !clear.test(p.fill)),
    `${engine}: every swatch is painted (${painted.filter((p) => clear.test(p.fill)).length} are not)`,
  );
  expect(
    painted.every((p) => p.from === `var(${p.token})`),
    `${engine}: every swatch is painted with its own token`,
  );
  expect(
    painted.every((p) => p.chip === null || p.chip !== p.fill),
    `${engine}: a contrast chip differs from its fill`,
  );

  // 2. Theme and mode.
  const options = await page.locator('.var-switch option').allTextContents();
  expect(
    ['azure-blue', 'rose-red', 'my-brand'].every((name) => options.includes(name)),
    `${engine}: the switch lists the site's themes (${options.join(', ')})`,
  );
  const site = () =>
    page.evaluate(() => [
      document.documentElement.getAttribute('theme'),
      document.documentElement.getAttribute('themeMode'),
    ]);
  const siteBefore = await site();
  const own = await fillOf(page, '--color--primary');
  await page.screenshot({ path: path.join(outDir, `${engine}-site.png`) });

  await page.locator('.var-switch select').selectOption('rose-red');
  await page.locator('.var-stage[theme="rose-red"]').waitFor();
  const rose = await fillOf(page, '--color--primary');
  expect(rose !== own, `${engine}: another theme changes the primary (${own} → ${rose})`);

  const lightBackground = await fillOf(page, '--color--background');
  await page.locator('.var-modes button', { hasText: 'Dark' }).click();
  await page.locator('.var-stage[thememode="dark"]').waitFor();
  const dark = await fillOf(page, '--color--primary');
  const darkBackground = await fillOf(page, '--color--background');
  expect(dark !== rose, `${engine}: dark changes the primary (${rose} → ${dark})`);
  expect(
    darkBackground !== lightBackground,
    `${engine}: dark changes the background (${lightBackground} → ${darkBackground})`,
  );
  // The light and the dark value a theme set do not depend on the mode shown.
  expect(
    (await fillOf(page, '--color--primary--mode-light')) === rose &&
      (await fillOf(page, '--color--primary--mode-dark')) === dark,
    `${engine}: the light and dark value are the primary of each mode`,
  );
  expect(
    (await site()).join() === siteBefore.join(),
    `${engine}: the site's own theme and mode are untouched`,
  );
  await page.screenshot({ path: path.join(outDir, `${engine}-rose-red-dark.png`) });

  // 3. A click names the token.
  await page.locator('.var-tile[title="--color--primary--bg--high"]').click();
  await page.locator('.var-picked code').first().waitFor();
  const picked = (await page.locator('.var-picked').innerText()).replace(/\s+/g, ' ');
  expect(
    picked.includes('--color--primary--bg--high') &&
      picked.includes('--color--primary--bg--high--contrast'),
    `${engine}: a clicked swatch is named with its contrast (${picked})`,
  );

  // 4. The tables.
  for (const table of data.tables) {
    const section = table.id === 'palette-source-vars' ? 'palette-scope-vars' : table.id;
    const names = await page
      .locator(`#${section} tbody tr td:first-child code`)
      .evaluateAll((els) => els.map((el) => el.textContent?.trim() ?? ''));
    const missing = table.rows.filter((r) => !names.includes(r.name)).map((r) => r.name);
    expect(missing.length === 0, `${engine}: ${table.id} lists its rows (missing ${missing})`);
  }
  const cell = async (name: string) =>
    (
      await page
        .locator('tbody tr', { has: page.locator('td:first-child code', { hasText: name }) })
        .first()
        .locator('td')
        .nth(1)
        .innerText()
    ).trim();
  for (const name of ['--shape--xxl', '--motion--duration-medium', '--focus--width']) {
    const value = data.tables.flatMap((t) => t.rows).find((r) => r.name === name)!.value;
    expect((await cell(name)) === value, `${engine}: ${name} shows ${value}`);
  }
  const scale = await page.locator('.var-scale tbody tr').count();
  expect(
    scale === data.typeScale.styles.length,
    `${engine}: the type scale has ${scale} rows for ${data.typeScale.styles.length} styles`,
  );
  await page.locator('#motion-vars').evaluate((el) => el.scrollIntoView());
  await page.screenshot({ path: path.join(outDir, `${engine}-tables.png`) });

  expect(errors.length === 0, `${engine}: page errors: ${errors.join('; ')}`);
  await browser.close();
  server.close();
}

requireBuild();
mkdirSync(outDir, { recursive: true });
const engines = process.argv.slice(2).filter((a) => a in ENGINES);
for (const engine of engines.length ? engines : ['chromium']) await run(engine);

console.log(
  `variables: ${checks - failures.length}/${checks} checks passed; screenshots in ${path.relative(repo, outDir)}`,
);
if (failures.length) {
  for (const f of failures) console.error(`  FAIL ${f}`);
  process.exit(1);
}
