// Painted-contrast report over the built showcase (PORT-PLAN.md, "Phase 7
// (resumed)"). Local only, not in CI.
//
//   pnpm build && npx ng build docs        # the production build this serves
//   node demos/docs/test/render.ts         # chromium
//   node demos/docs/test/render.ts firefox webkit
//
// What it measures is what is on screen, not what the stylesheet says. A fill in
// cp-theming is a ::before pseudo-element, Material draws state layers over its
// buttons and the docs dim many labels with `opacity`, so no reading of computed
// styles gives the colour a label really has. Per browser and per mode:
//   1. Opens the ng-material showcase with the mode forced, at 2 device pixels
//      per CSS pixel, and makes the viewport tall enough to show the whole page.
//   2. Takes one screenshot as painted, and one with every glyph made
//      transparent (`-webkit-text-fill-color`, which leaves `currentColor`
//      borders and icons alone). The pixels that differ are the text.
//   3. For each text node: the text colour is the screenshot pixel where the
//      glyph is fully covered, the background is the same pixel without the
//      glyph, and the label's contrast is the highest WCAG ratio among its
//      pixels (an anti-aliased edge pixel is a blend, so it can only be lower).
//
// It prints every label below 4.5:1 and writes the full list to
// dist/docs-render/. It is a report: it exits 0 whatever it finds, 1 only when
// it could not measure.
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { inflateSync } from 'node:zlib';
import { chromium, firefox, webkit, type BrowserType, type Page } from 'playwright';
import { BASE, blockFonts, repo, requireBuild, serve } from './lib/site.ts';

const outDir = path.join(repo, 'dist/docs-render');
const SCALE = 2;
const MODES = ['light', 'dark'] as const;
const AA = 4.5;

// ── PNG → RGBA ───────────────────────────────────────────────────────────────

interface Image {
  width: number;
  height: number;
  /** RGBA, 8 bits per channel. */
  data: Uint8Array;
}

/** Decodes the PNGs a browser screenshot produces: 8-bit RGB or RGBA, not interlaced. */
function decodePng(png: Buffer): Image {
  let offset = 8;
  let width = 0;
  let height = 0;
  let channels = 0;
  const idat: Buffer[] = [];
  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.toString('latin1', offset + 4, offset + 8);
    const body = png.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      const [depth, colorType, , , interlace] = body.subarray(8);
      if (depth !== 8 || (colorType !== 2 && colorType !== 6) || interlace !== 0)
        throw new Error(`unsupported PNG (depth ${depth}, colour type ${colorType})`);
      channels = colorType === 6 ? 4 : 3;
    } else if (type === 'IDAT') idat.push(body);
    offset += 12 + length;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const data = new Uint8Array(width * height * 4);
  const line = new Uint8Array(stride);
  let previous = new Uint8Array(stride);
  for (let y = 0; y < height; y++) {
    const start = y * (stride + 1);
    const filter = raw[start];
    for (let x = 0; x < stride; x++) {
      const value = raw[start + 1 + x];
      const left = x >= channels ? line[x - channels] : 0;
      const up = previous[x];
      const upLeft = x >= channels ? previous[x - channels] : 0;
      let predicted = 0;
      if (filter === 1) predicted = left;
      else if (filter === 2) predicted = up;
      else if (filter === 3) predicted = (left + up) >> 1;
      else if (filter === 4) {
        const p = left + up - upLeft;
        const [a, b, c] = [Math.abs(p - left), Math.abs(p - up), Math.abs(p - upLeft)];
        predicted = a <= b && a <= c ? left : b <= c ? up : upLeft;
      }
      line[x] = (value + predicted) & 0xff;
    }
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      data[o] = line[x * channels];
      data[o + 1] = line[x * channels + 1];
      data[o + 2] = line[x * channels + 2];
      data[o + 3] = channels === 4 ? line[x * channels + 3] : 255;
    }
    previous = line.slice();
  }
  return { width, height, data };
}

// ── Contrast ─────────────────────────────────────────────────────────────────

type Rgb = [number, number, number];

function luminance([r, g, b]: Rgb): number {
  const linear = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const hex = (c: Rgb) => `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;

// ── The page ─────────────────────────────────────────────────────────────────

interface Label {
  /** The theme column, the density scope, or "page". */
  scope: string;
  /** What kind of element the text belongs to. */
  kind: string;
  text: string;
  fontSize: number;
  fontWeight: number;
  /** The text node's line boxes, in CSS pixels of the viewport. */
  rects: { x: number; y: number; width: number; height: number }[];
}

// Runs in the page: every text node of the showcase with where it is painted.
function collectLabels(): Label[] {
  const KINDS: [string, string][] = [
    ['[mat-flat-button]', 'filled button'],
    ['[mat-stroked-button]', 'outlined button'],
    ['[mat-button]', 'text button'],
    ['.mat-form-field-appearance-fill mat-label', 'form field label (fill)'],
    ['.mat-form-field-appearance-outline mat-label', 'form field label (outline)'],
    ['mat-chip', 'chip'],
    ['mat-slide-toggle', 'slide toggle label'],
    ['.preset-header', 'theme name'],
    ['.density-label code', 'density label (code)'],
    ['.density-label', 'density label'],
    ['.swatch-label', 'swatch label'],
    ['.section-title', 'section title'],
    ['.subsection-title', 'subsection title'],
    ['.section-desc code', 'section text (code)'],
    ['.section-desc', 'section text'],
    ['.subtitle', 'page subtitle'],
    ['h1', 'page title'],
  ];
  const root = document.querySelector('.showcase-page');
  if (!root) return [];
  const labels: Label[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = (node.textContent ?? '').replace(/\s+/g, ' ').trim();
    const el = node.parentElement;
    // An icon is a ligature of an icon font, not a label.
    if (!text || !el || el.closest('mat-icon')) continue;
    const style = getComputedStyle(el);
    if (style.visibility !== 'visible' || style.display === 'none') continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    const rects = [...range.getClientRects()]
      .filter((r) => r.width > 0 && r.height > 0)
      .map((r) => ({ x: r.x, y: r.y, width: r.width, height: r.height }));
    if (!rects.length) continue;
    const theme = el.closest('[theme]:not(html)')?.getAttribute('theme');
    const density = el.closest('[themeDensity]')?.getAttribute('themeDensity');
    labels.push({
      scope: theme ?? (density != null ? `density ${density}` : 'page'),
      kind: KINDS.find(([selector]) => el.closest(selector))?.[1] ?? el.tagName.toLowerCase(),
      text: text.length > 48 ? `${text.slice(0, 45)}…` : text,
      fontSize: parseFloat(style.fontSize),
      fontWeight: Number(style.fontWeight) || 400,
      rects,
    });
  }
  return labels;
}

interface Measured extends Omit<Label, 'rects'> {
  mode: string;
  ratio: number;
  text_color: string;
  background: string;
  /** WCAG "large text": 24px, or 18.66px bold. It needs 3:1, not 4.5:1. */
  large: boolean;
}

function measure(label: Label, mode: string, painted: Image, blank: Image): Measured | null {
  let best = 0;
  let fg: Rgb = [0, 0, 0];
  let bg: Rgb = [0, 0, 0];
  for (const rect of label.rects) {
    const x0 = Math.max(0, Math.floor(rect.x * SCALE));
    const y0 = Math.max(0, Math.floor(rect.y * SCALE));
    const x1 = Math.min(painted.width, Math.ceil((rect.x + rect.width) * SCALE));
    const y1 = Math.min(painted.height, Math.ceil((rect.y + rect.height) * SCALE));
    for (let y = y0; y < y1; y++)
      for (let x = x0; x < x1; x++) {
        const o = (y * painted.width + x) * 4;
        const a: Rgb = [painted.data[o], painted.data[o + 1], painted.data[o + 2]];
        const b: Rgb = [blank.data[o], blank.data[o + 1], blank.data[o + 2]];
        if (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) < 6) continue;
        const ratio = contrast(a, b);
        if (ratio > best) [best, fg, bg] = [ratio, a, b];
      }
  }
  if (best === 0) return null; // no glyph pixel: clipped, covered or off screen
  const { rects: _rects, ...rest } = label;
  return {
    ...rest,
    mode,
    ratio: best,
    text_color: hex(fg),
    background: hex(bg),
    large: label.fontSize >= 24 || (label.fontSize >= 18.66 && label.fontWeight >= 700),
  };
}

const FREEZE =
  '*, *::before, *::after { transition: none !important; animation: none !important; caret-color: transparent !important; }';
const HIDE_TEXT =
  '*, *::before, *::after { -webkit-text-fill-color: transparent !important; text-shadow: none !important; }';

async function settle(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done()))),
  );
}

const ENGINES: Record<string, BrowserType> = { chromium, firefox, webkit };

async function run(
  name: string,
  origin: string,
): Promise<{ measured: Measured[]; unpainted: number }> {
  const measured: Measured[] = [];
  let unpainted = 0;
  const browser = await ENGINES[name].launch();
  for (const mode of MODES) {
    const context = await browser.newContext({
      colorScheme: mode,
      deviceScaleFactor: SCALE,
      viewport: { width: 1500, height: 900 },
    });
    const page = await context.newPage();
    await blockFonts(page);
    await page.goto(`${origin}${BASE}packages/ng-material/showcase`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.showcase-page .preset-col');
    await page.addStyleTag({ content: FREEZE });
    await page.evaluate((m) => document.documentElement.setAttribute('themeMode', m), mode);
    // The page scrolls inside its layout; grow the viewport until nothing is cut off.
    const overflow = await page.evaluate(() => {
      const scroller = document.querySelector('.page-scroll');
      return scroller ? scroller.scrollHeight - scroller.clientHeight : 0;
    });
    await page.setViewportSize({ width: 1500, height: 900 + Math.ceil(overflow) + 16 });
    await settle(page);

    const labels = await page.evaluate(collectLabels);
    const painted = decodePng(
      await page.screenshot({ path: path.join(outDir, `${name}-${mode}.png`) }),
    );
    const hide = await page.addStyleTag({ content: HIDE_TEXT });
    await settle(page);
    const blank = decodePng(await page.screenshot());
    await hide.evaluate((el) => el.parentNode?.removeChild(el));

    for (const label of labels) {
      const result = measure(label, mode, painted, blank);
      if (result) measured.push(result);
      else unpainted++;
    }
    await context.close();
  }
  await browser.close();
  return { measured, unpainted };
}

function line(m: Measured): string {
  return (
    `${m.ratio.toFixed(2).padStart(5)}:1  ${m.mode.padEnd(5)} ${m.scope.padEnd(15)} ` +
    `${m.kind.padEnd(28)} ${JSON.stringify(m.text).padEnd(50)} ` +
    `${m.text_color} on ${m.background}  ${m.fontSize}px/${m.fontWeight}${m.large ? '  (large text: needs 3:1)' : ''}`
  );
}

requireBuild();
mkdirSync(outDir, { recursive: true });
const wanted = process.argv.slice(2).filter((a) => a in ENGINES);
const { server, origin } = await serve();
let failed = false;
for (const name of wanted.length ? wanted : ['chromium']) {
  const { measured, unpainted } = await run(name, origin);
  measured.sort((a, b) => a.ratio - b.ratio);
  const below = measured.filter((m) => m.ratio < AA);
  const report =
    `${name}: ${measured.length} labels measured on the showcase (light + dark), ` +
    `${below.length} below ${AA}:1` +
    (unpainted ? `, ${unpainted} text nodes with no painted glyph (clipped or covered)` : '') +
    '\n';
  writeFileSync(path.join(outDir, `${name}.txt`), `${report}\n${measured.map(line).join('\n')}\n`);
  writeFileSync(path.join(outDir, `${name}.json`), JSON.stringify(measured, null, 2));
  console.log(`\n${report}`);
  if (below.length) console.log(`Below ${AA}:1\n${below.map(line).join('\n')}`);
  if (!measured.length) {
    console.error(`${name}: nothing measured — did the showcase render?`);
    failed = true;
  }
}
server.close();
console.log(`\nFull list and screenshots: ${path.relative(repo, outDir)}/`);
process.exit(failed ? 1 : 0);
