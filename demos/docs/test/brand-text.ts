// Browser check of "Brand colours that take white text" on the built Palette
// page (issue #8, PORT-PLAN.md Phase 19). Local only, after
// `pnpm --filter docs build`.
//
//   node demos/docs/test/brand-text.ts                  # chromium
//   node demos/docs/test/brand-text.ts chromium firefox webkit
//
// The page renders examples/palette/contrast-preference.html with the theme of
// contrast-preference.scss (#e65151, prefer-white). Every figure the page
// states about it is measured here on what the browser paints: the fill, the
// text colour on it, and their WCAG contrast.
import { chromium, firefox, webkit, type BrowserType } from 'playwright';
import { cssColor, painted, wcagContrast } from '../../../packages/theme-core/test/lib/color.ts';
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

const WHITE = '#ffffff';
const BLACK = '#000000';
/** What the page says, per mode: the element, its fill, its text, the ratio. */
const EXPECT = {
  light: [
    { tone: null, fill: '#e65151', text: WHITE, ratio: 3.71 },
    { tone: 'high', fill: '#bb252e', text: WHITE, ratio: 6.13 },
    { tone: 'low', fill: null, text: BLACK, ratio: null },
  ],
  dark: [
    { tone: null, fill: '#e65151', text: WHITE, ratio: 3.71 },
    { tone: 'high', fill: null, text: BLACK, ratio: null },
    { tone: 'low', fill: '#bb252e', text: WHITE, ratio: 6.13 },
  ],
} as const;

/** A computed colour (rgb() or oklch(), by engine) as the six-digit hex it paints. */
const hex = (computed: string) =>
  '#' +
  painted(cssColor(computed))
    .coords.map((v) =>
      Math.round((v ?? 0) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('');

for (const engine of chosen) {
  const browser = await engines[engine].launch();
  for (const mode of ['light', 'dark'] as const) {
    const page = await browser.newPage();
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto(`${origin}${BASE}packages/core/palette`, { waitUntil: 'networkidle' });
    await page.evaluate(`document.documentElement.setAttribute('themeMode', '${mode}')`);
    const section = page.locator('[id="brand-text"]');
    ok((await section.count()) === 1, `${engine}: the Palette page has #brand-text`);
    const read = (await section.evaluate((el) =>
      [...el.querySelectorAll('[theme="red-brand"] [palette="brand"]')].map((span) => {
        // filled() paints its fill on ::before, behind the text.
        return {
          tone: span.getAttribute('tone'),
          fill: getComputedStyle(span, '::before').backgroundColor,
          text: getComputedStyle(span).color,
        };
      }),
    )) as { tone: string | null; fill: string; text: string }[];
    ok(read.length === 3, `${engine} ${mode}: three brand elements are rendered (${read.length})`);
    for (const expected of EXPECT[mode]) {
      const got = read.find((r) => r.tone === expected.tone);
      const where = `${engine} ${mode} brand${expected.tone ? ` tone=${expected.tone}` : ''}`;
      if (!got) {
        ok(false, `${where}: rendered`);
        continue;
      }
      ok(hex(got.text) === expected.text, `${where}: text ${got.text}, expected ${expected.text}`);
      const ratio = wcagContrast(cssColor(got.text), cssColor(got.fill));
      ok(ratio >= 3, `${where}: ${ratio.toFixed(2)}:1 is 3:1 or more`);
      if (expected.fill)
        ok(
          hex(got.fill) === expected.fill,
          `${where}: fill ${hex(got.fill)}, expected ${expected.fill}`,
        );
      if (expected.ratio)
        ok(
          Math.abs(ratio - expected.ratio) < 0.01,
          `${where}: ${ratio.toFixed(2)}:1, the page says ${expected.ratio}:1`,
        );
    }
    await page.close();
  }
  await browser.close();
}
server.close();
console.log(`${checks - failed} of ${checks} checks pass (${chosen.join(', ')})`);
process.exit(failed ? 1 : 0);
