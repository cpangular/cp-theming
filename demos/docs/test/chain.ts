// Browser check of the palette chain on the built docs (PORT-PLAN.md Phase 14).
// Local only, not in CI.
//
//   pnpm --filter docs build
//   node demos/docs/test/chain.ts            # chromium
//   node demos/docs/test/chain.ts firefox webkit
//
// It reads pixels from screenshots, in light and in dark mode:
//   1. Getting Started. The page shows a theme that passes only the brand
//      colour (examples/getting-started/custom-theme.scss) and renders it. The
//      element in the `brand` palette is painted in exactly that colour in both
//      modes; the primary generated from it is a different colour, and so are
//      the secondary and the tertiary. The primary is painted in the brand's
//      hue, within 6° (Phase 14c: before the gamut correction the orange
//      brand's light primary was clipped to #a60000, a red 15° away).
//   2. The ng-material showcase, with each of the four presets selected. In
//      every preset column the Primary, Secondary and Tertiary buttons are
//      three different colours: a preset passes no tertiary, so the one shown
//      is generated from its primary.
// Screenshots go to dist/docs-render/chain/. Exits 1 when an assertion fails.
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { chromium, firefox, webkit, type BrowserType, type Locator, type Page } from 'playwright';
import { decodePng } from './lib/png.ts';
import { BASE, blockFonts, repo, requireBuild, serve } from './lib/site.ts';

const outDir = path.join(repo, 'dist/docs-render/chain');
const MODES = ['light', 'dark'] as const;
const PRESETS = ['azure-blue', 'rose-red', 'cyan-orange', 'magenta-violet'];
const ENGINES: Record<string, BrowserType> = { chromium, firefox, webkit };

type Rgb = [number, number, number];
const hex = (c: Rgb) => `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
const distance = (a: Rgb, b: Rgb) => Math.max(...a.map((v, i) => Math.abs(v - b[i])));
/** The oklch hue of an sRGB pixel, in degrees. */
function hue(c: Rgb): number {
  const [r, g, b] = c.map((v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
}
const hueDiff = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

/** The brand colour the Getting Started example passes, read from the example itself. */
function exampleBrand(): Rgb {
  const file = path.join(repo, 'demos/docs/src/examples/getting-started/custom-theme.scss');
  const m = /\$brand:\s*#([0-9a-f]{6})\b/i.exec(readFileSync(file, 'utf8'));
  if (!m) throw new Error(`${file} passes no hex $brand`);
  return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)) as Rgb;
}

/** The fill of an element: the pixel 5px in from its left edge, half way down. */
async function fill(page: Page, target: Locator): Promise<Rgb> {
  await target.scrollIntoViewIfNeeded();
  const box = await target.boundingBox();
  if (!box) throw new Error('element is not rendered');
  const png = decodePng(
    await page.screenshot({
      clip: {
        x: Math.round(box.x) + 5,
        y: Math.round(box.y + box.height / 2),
        width: 1,
        height: 1,
      },
    }),
  );
  return [png.data[0], png.data[1], png.data[2]];
}

async function open(
  type: BrowserType,
  origin: string,
  route: string,
  theme: string,
  mode: (typeof MODES)[number],
) {
  const browser = await type.launch();
  const page = await browser.newPage({
    viewport: { width: 1500, height: 1000 },
    colorScheme: mode,
  });
  await blockFonts(page);
  // The saved theme and mode, applied by the head snippet before first paint.
  await page.addInitScript(
    ([t, m]) => {
      localStorage.setItem('cp-theming--persist', 'local');
      localStorage.setItem('cp-theming--theme', t);
      localStorage.setItem('cp-theming--mode', m);
    },
    [theme, mode],
  );
  await page.goto(`${origin}${BASE}${route}`, { waitUntil: 'networkidle' });
  // No transition may be half way when a pixel is read.
  await page.addStyleTag({
    content: '*, *::before, *::after { transition: none !important; animation: none !important; }',
  });
  return { browser, page };
}

const failures: string[] = [];
function check(ok: boolean, what: string): void {
  console.log(`${ok ? '✔' : '✘'} ${what}`);
  if (!ok) failures.push(what);
}

requireBuild();
mkdirSync(outDir, { recursive: true });
const brand = exampleBrand();
const wanted = process.argv.slice(2).filter((a) => a in ENGINES);
const { server, origin } = await serve();

for (const name of wanted.length ? wanted : ['chromium']) {
  for (const mode of MODES) {
    // ── Getting Started ──
    {
      const { browser, page } = await open(
        ENGINES[name],
        origin,
        'packages/core/getting-started',
        'azure-blue',
        mode,
      );
      const example = page.locator('.tex-preview [theme="my-brand"]');
      await example.waitFor();
      const colours = new Map<string, Rgb>();
      for (const palette of ['brand', 'primary', 'secondary', 'tertiary'])
        colours.set(palette, await fill(page, example.locator(`[palette="${palette}"]`)));
      const shown = [...colours].map(([n, c]) => `${n} ${hex(c)}`).join(', ');
      check(
        distance(colours.get('brand')!, brand) <= 1,
        `${name} ${mode} Getting Started: palette="brand" is painted ${hex(colours.get('brand')!)}, the example's $brand ${hex(brand)}`,
      );
      const names = [...colours.keys()];
      const distinct = names.every((a, i) =>
        names.slice(i + 1).every((b) => distance(colours.get(a)!, colours.get(b)!) > 12),
      );
      check(distinct, `${name} ${mode} Getting Started: four different colours (${shown})`);
      const primary = colours.get('primary')!;
      const off = hueDiff(hue(primary), hue(brand));
      check(
        off < 6,
        `${name} ${mode} Getting Started: the primary ${hex(primary)} is painted at hue ${hue(primary).toFixed(1)}°, ${off.toFixed(1)}° from the brand's ${hue(brand).toFixed(1)}°`,
      );
      await page
        .locator('.tex-wrap', { has: example })
        .screenshot({ path: path.join(outDir, `${name}-getting-started-${mode}.png`) });
      await browser.close();
    }
    // ── Showcase, under each preset ──
    for (const preset of PRESETS) {
      const { browser, page } = await open(
        ENGINES[name],
        origin,
        'packages/ng-material/showcase',
        preset,
        mode,
      );
      await page.waitForSelector('.preset-col button[palette="tertiary"]');
      const applied = await page.evaluate(
        () =>
          `${document.documentElement.getAttribute('theme')} ${document.documentElement.getAttribute('themeMode')}`,
      );
      check(
        applied === `${preset} ${mode}`,
        `${name} showcase opened as ${preset} ${mode} (${applied})`,
      );
      for (const column of PRESETS) {
        const col = page.locator(`.preset-col[theme="${column}"]`);
        const [p, s, t] = await Promise.all(
          ['primary', 'secondary', 'tertiary'].map((a) => col.locator(`button[palette="${a}"]`)),
        );
        const colours: Rgb[] = [await fill(page, p), await fill(page, s), await fill(page, t)];
        const distinct =
          distance(colours[0], colours[1]) > 12 &&
          distance(colours[0], colours[2]) > 12 &&
          distance(colours[1], colours[2]) > 12;
        check(
          distinct,
          `${name} ${mode} page ${preset}, column ${column}: primary ${hex(colours[0])}, secondary ${hex(colours[1])}, tertiary ${hex(colours[2])}`,
        );
      }
      await page.locator('.preset-grid').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(outDir, `${name}-showcase-${preset}-${mode}.png`) });
      await browser.close();
    }
  }
}
server.close();
console.log(`\nScreenshots: ${path.relative(repo, outDir)}/`);
if (failures.length) console.error(`\n${failures.length} failed:\n${failures.join('\n')}`);
process.exit(failures.length ? 1 : 0);
