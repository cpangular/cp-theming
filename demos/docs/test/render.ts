// Painted contrast over the built docs (PORT-PLAN.md, "Phase 7 (resumed)" and
// Phase 15). Local only, not in CI.
//
//   pnpm --filter docs build               # the production build this serves
//   node demos/docs/test/render.ts         # chromium, everything
//   node demos/docs/test/render.ts chromium firefox
//   node demos/docs/test/render.ts --only=gallery --preset=rose-red --mode=dark --section=tabs
//   node demos/docs/test/render.ts --only=showcase --theme=acme   # the showcase under another site theme
//   node demos/docs/test/render.ts --only=gallery --preset=acme   # the gallery under the example theme package
//   node demos/docs/test/render.ts --fonts # let the web fonts load, for looking at the screenshots
//
// What it measures is what is on screen, not what the stylesheet says. A fill in
// cp-theming is a ::before pseudo-element, Material draws state layers over its
// buttons and the docs dim many labels with `opacity`, so no reading of computed
// styles gives the colour a label really has. The method, everywhere:
//   1. Takes one screenshot as painted, and one with every glyph made
//      transparent (`-webkit-text-fill-color`, which leaves `currentColor`
//      borders and icons alone). The pixels that differ are the text.
//   2. For each text node: the text colour is the screenshot pixel where the
//      glyph is fully covered, the background is the same pixel without the
//      glyph, and the label's contrast is the highest WCAG ratio among its
//      pixels (an anti-aliased edge pixel is a blend, so it can only be lower).
//
// Two runs, per browser:
//
// The showcase (`/packages/ng-material/showcase`), in light and dark. A report:
// it prints every label below 4.5:1 and fails nothing. `--theme=name` runs it
// with that theme on `<html>` in place of the site's default, as picking it in
// the theme switcher does: `acme` is the example theme package (Phase 18).
//
// The component gallery (`/packages/ng-material/components`), per preset in
// light and dark. For every section it measures the page as it loads, then each
// kind of control hovered and focused, then every overlay the section can open
// (select, autocomplete, datepicker, menu and submenu, tooltip, dialog, bottom
// sheet, snackbar), open. Here a failure is an error, and the exit code is 1:
//   - a label of a component (inside a `.gallery-demo` or an overlay) below
//     4.5:1. Labels of disabled controls are listed but exempt, as WCAG 1.4.3
//     exempts them; the docs' own captions are a report, as on the showcase.
//   - an overlay that does not resolve the theme and the mode of the element
//     that opened it, or, in the nested scopes, resolves the page's.
//   - an overlay that did not open, or a section that could not be measured.
//
// Reports and screenshots go to dist/docs-render/.
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium, firefox, webkit, type Browser, type BrowserType, type Page } from 'playwright';
import { decodePng, type Image } from './lib/png.ts';
import { BASE, blockFonts, repo, requireBuild, serve } from './lib/site.ts';

const outDir = path.join(repo, 'dist/docs-render');
const SCALE = 2;
const MODES = ['light', 'dark'] as const;
const PRESETS = ['azure-blue', 'rose-red', 'cyan-orange', 'magenta-violet'];
const AA = 4.5;

// ── Arguments ────────────────────────────────────────────────────────────────

const ENGINES: Record<string, BrowserType> = { chromium, firefox, webkit };
const argv = process.argv.slice(2);
const option = (name: string): string[] | null => {
  const found = argv.find((a) => a.startsWith(`--${name}=`));
  return found ? found.slice(name.length + 3).split(',') : null;
};
const engines = argv.filter((a) => a in ENGINES);
const only = option('only');
const presets = option('preset') ?? PRESETS;
/** The site theme the showcase runs under; the site's default without it. */
const siteTheme = option('theme')?.[0] ?? null;
const showcaseName = (engine: string) => (siteTheme ? `${engine}-${siteTheme}` : engine);
const modes = MODES.filter((m) => (option('mode') ?? MODES).includes(m));
const sections = option('section');
const withFonts = argv.includes('--fonts');
const jobs = Number(option('jobs')?.[0] ?? 4);

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

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Label {
  /** Where the label is: a theme column, a gallery section, an overlay. */
  scope: string;
  /** What kind of element the text belongs to. */
  kind: string;
  text: string;
  fontSize: number;
  fontWeight: number;
  /** The text node's line boxes, in CSS pixels of the viewport. */
  rects: Rect[];
}

interface Measured extends Omit<Label, 'rects'> {
  mode: string;
  ratio: number;
  text_color: string;
  background: string;
  /** WCAG "large text": 24px, or 18.66px bold. */
  large: boolean;
}

/** `origin` is the viewport position of the screenshots' top left corner. */
function measure<L extends Label>(
  label: L,
  mode: string,
  painted: Image,
  blank: Image,
  origin: { x: number; y: number } = { x: 0, y: 0 },
): (Omit<L, 'rects'> & Measured) | null {
  let best = 0;
  let fg: Rgb = [0, 0, 0];
  let bg: Rgb = [0, 0, 0];
  for (const rect of label.rects) {
    const x0 = Math.max(0, Math.floor((rect.x - origin.x) * SCALE));
    const y0 = Math.max(0, Math.floor((rect.y - origin.y) * SCALE));
    const x1 = Math.min(painted.width, Math.ceil((rect.x - origin.x + rect.width) * SCALE));
    const y1 = Math.min(painted.height, Math.ceil((rect.y - origin.y + rect.height) * SCALE));
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
// For the gallery: an overlay that is open holds the last frame of the
// animation that opened it, so its animations are stopped where they are.
const HOLD =
  '*, *::before, *::after { transition: none !important; animation-play-state: paused !important; caret-color: transparent !important; }';
const HIDE_TEXT =
  '*, *::before, *::after { -webkit-text-fill-color: transparent !important; text-shadow: none !important; }';

async function settle(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done()))),
  );
}

// ── The showcase ─────────────────────────────────────────────────────────────

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

async function showcase(
  name: string,
  browser: Browser,
  origin: string,
): Promise<{ measured: Measured[]; unpainted: number }> {
  const measured: Measured[] = [];
  let unpainted = 0;
  for (const mode of modes) {
    const context = await browser.newContext({
      colorScheme: mode,
      deviceScaleFactor: SCALE,
      viewport: { width: 1500, height: 900 },
    });
    const page = await context.newPage();
    if (!withFonts) await blockFonts(page);
    await page.goto(`${origin}${BASE}packages/ng-material/showcase`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.showcase-page .preset-col');
    await page.addStyleTag({ content: FREEZE });
    await page.evaluate(
      ([m, t]) => {
        document.documentElement.setAttribute('themeMode', m!);
        if (t) document.documentElement.setAttribute('theme', t);
      },
      [mode, siteTheme],
    );
    // The page scrolls inside its layout; grow the viewport until nothing is cut off.
    const overflow = await page.evaluate(() => {
      const scroller = document.querySelector('.page-scroll');
      return scroller ? scroller.scrollHeight - scroller.clientHeight : 0;
    });
    await page.setViewportSize({ width: 1500, height: 900 + Math.ceil(overflow) + 16 });
    await settle(page);

    const labels = await page.evaluate(collectLabels);
    const painted = decodePng(
      await page.screenshot({ path: path.join(outDir, `${showcaseName(name)}-${mode}.png`) }),
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
  return { measured, unpainted };
}

function line(m: Measured): string {
  return (
    `${m.ratio.toFixed(2).padStart(5)}:1  ${m.mode.padEnd(5)} ${m.scope.padEnd(15)} ` +
    `${m.kind.padEnd(28)} ${JSON.stringify(m.text).padEnd(50)} ` +
    `${m.text_color} on ${m.background}  ${m.fontSize}px/${m.fontWeight}${m.large ? '  (large text: needs 3:1)' : ''}`
  );
}

// ── The gallery: what runs in the page ───────────────────────────────────────

interface GalleryLabel extends Label {
  /** In a `.gallery-demo` or an overlay; otherwise a caption of the docs. */
  component: boolean;
  /** The control is disabled: WCAG 1.4.3 exempts its label. */
  disabled: boolean;
  /** selected, checked, invalid, focused, …: read off the component's classes. */
  state: string;
}

interface Trigger {
  n: number;
  type: OverlayType;
  section: string;
  palette: string | null;
  scope: string | null;
}

type OverlayType =
  | 'select'
  | 'autocomplete'
  | 'datepicker'
  | 'menu'
  | 'tooltip'
  | 'dialog'
  | 'bottom sheet'
  | 'snackbar';

interface Control {
  n: number;
  key: string;
}

interface PageApi {
  labels(root: Element, scope: string, overlay: boolean): GalleryLabel[];
  triggers(): Trigger[];
  controls(demo: Element): Control[];
  owner(el: Element): Element;
}

// Installed once per page as `window.__gallery`.
function installGallery(): void {
  const NAMED_ATTRIBUTES = [
    'matButton',
    'matIconButton',
    'matFab',
    'matMiniFab',
    'mat-list-item',
    'mat-menu-item',
    'mat-sort-header',
    'mat-header-cell',
    'mat-cell',
    'matInput',
    'mat-dialog-title',
  ];
  const NAMED_CLASSES = [
    'mat-mdc-tooltip',
    'mat-mdc-menu-panel',
    'mat-mdc-select-panel',
    'mat-mdc-autocomplete-panel',
    'mat-datepicker-content',
    'mat-mdc-tab',
    'mat-calendar-body-cell',
    'mat-calendar-table-header',
    'mat-calendar-body-label',
    'mat-badge-content',
    'mat-mdc-form-field-hint',
    'mat-mdc-form-field-error',
    'mat-mdc-paginator-range-label',
    'mat-mdc-paginator-page-size-label',
  ];
  const STATE =
    /(?:^|-)(selected|checked|active|activated|invalid|error|today|indeterminate|expanded|focused|disabled)$/;
  const BOUNDARY = '.gallery-demo, .cdk-overlay-container, .cdk-overlay-popover, .doc-page';

  function nameOf(el: Element): string | null {
    const tag = el.tagName.toLowerCase();
    if (tag === 'mat-form-field')
      return `mat-form-field (${el.classList.contains('mat-form-field-appearance-outline') ? 'outline' : 'fill'})`;
    if (tag === 'mat-card') {
      const appearance = ['outlined', 'filled'].find((a) =>
        el.classList.contains(`mat-mdc-card-${a}`),
      );
      return `mat-card (${appearance ?? 'raised'})`;
    }
    if (tag.startsWith('mat-')) return tag;
    for (const name of NAMED_ATTRIBUTES)
      if (el.hasAttribute(name)) {
        const value = el.getAttribute(name);
        return value ? `${name}=${value}` : name;
      }
    for (const name of NAMED_CLASSES) if (el.classList.contains(name)) return `.${name}`;
    return null;
  }

  /** The element and its ancestors, up to the demo or the overlay it is in. */
  function chain(el: Element): Element[] {
    const out: Element[] = [];
    for (let at: Element | null = el; at && at !== document.body; at = at.parentElement) {
      out.push(at);
      if (at.matches(BOUNDARY)) break;
    }
    return out;
  }

  function describe(el: Element): { kind: string; state: string; disabled: boolean } {
    const elements = chain(el);
    const names = elements.map(nameOf).filter((n): n is string => n !== null);
    const kind = !names.length
      ? el.tagName.toLowerCase()
      : names.length === 1
        ? names[0]
        : `${names[names.length - 1]} › ${names[0]}`;
    const states = new Set<string>();
    let disabled = false;
    for (const at of elements) {
      if (at.matches(BOUNDARY)) break;
      for (const token of at.classList) {
        const word = STATE.exec(token)?.[1];
        if (word === 'disabled') disabled = true;
        else if (word) states.add(word);
      }
      if (at.matches(':disabled') || at.getAttribute('aria-disabled') === 'true') disabled = true;
      if (at.getAttribute('aria-selected') === 'true') states.add('selected');
      if (at.getAttribute('aria-checked') === 'true') states.add('checked');
    }
    return { kind, state: [...states].sort().join(' '), disabled };
  }

  const visibleRect = (r: DOMRect) => ({ x: r.x, y: r.y, width: r.width, height: r.height });
  const short = (text: string) => (text.length > 48 ? `${text.slice(0, 45)}…` : text);

  function labels(root: Element, scope: string, overlay: boolean): GalleryLabel[] {
    const out: GalleryLabel[] = [];
    const push = (el: Element, text: string, rects: DOMRect[], suffix = '') => {
      const style = getComputedStyle(el);
      if (style.visibility !== 'visible' || style.display === 'none') return;
      const visible = rects.filter((r) => r.width > 0 && r.height > 0).map(visibleRect);
      if (!visible.length) return;
      const { kind, state, disabled } = describe(el);
      out.push({
        scope,
        kind: kind + suffix,
        state,
        disabled,
        component: overlay || !!el.closest('.gallery-demo'),
        text: short(text),
        fontSize: parseFloat(style.fontSize),
        fontWeight: Number(style.fontWeight) || 400,
        rects: visible,
      });
    };
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = (node.textContent ?? '').replace(/\s+/g, ' ').trim();
      const el = node.parentElement;
      // An icon is a ligature of an icon font, and hidden text is for a screen
      // reader: neither is a label on screen.
      if (!text || !el || el.closest('mat-icon, .cdk-visually-hidden, script, style')) continue;
      // A panel that focus opened next to its field is on its way in; the
      // overlay pass measures it once it has stopped moving.
      if (!overlay && el.closest('.cdk-overlay-pane, .cdk-overlay-popover')) continue;
      // The source under a closed <details> is not on screen; its summary is.
      if (el.closest('details:not([open])') && !el.closest('summary')) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      push(el, text, [...range.getClientRects()]);
    }
    // What a field holds is not a text node.
    for (const field of root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      'input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=hidden]), textarea',
    )) {
      const text = field.value || field.placeholder;
      if (text)
        push(field, text, [field.getBoundingClientRect()], field.value ? ' value' : ' placeholder');
    }
    return out;
  }

  function triggers(): Trigger[] {
    const out: Trigger[] = [];
    document.querySelectorAll('.gallery-demo').forEach((demo) => {
      const section = demo.closest('section')?.id ?? '';
      const palette = demo.getAttribute('palette');
      const scope = demo.getAttribute('data-scope');
      const add = (selector: string, type: OverlayType, text?: string) =>
        demo.querySelectorAll(selector).forEach((el) => {
          if (text && el.textContent?.trim() !== text) return;
          el.setAttribute('data-render-trigger', String(out.length));
          out.push({ n: out.length, type, section, palette, scope });
        });
      // These two open next to the field, inside the demo: a palette reaches them.
      add('mat-select:not(.mat-mdc-select-disabled)', 'select');
      add('input.mat-mdc-autocomplete-trigger:not(:disabled)', 'autocomplete');
      // The rest open in an overlay container, the same from every palette.
      if (palette) return;
      add('mat-datepicker-toggle button:not(:disabled)', 'datepicker');
      add('.mat-mdc-menu-trigger', 'menu');
      add('[mattooltip]', 'tooltip');
      add('button', 'dialog', 'Open dialog');
      add('button', 'bottom sheet', 'Open bottom sheet');
      add('button', 'snackbar', 'Show snackbar');
    });
    return out;
  }

  const OWNERS =
    'mat-form-field, mat-checkbox, mat-radio-button, mat-slide-toggle, mat-chip, mat-chip-option, ' +
    'mat-chip-row, mat-list-option, .mat-mdc-list-item, mat-expansion-panel-header, mat-step-header, ' +
    '.mat-mdc-tab, th, mat-button-toggle, mat-slider, .mat-calendar-body-cell-container';

  /** The element whose labels a control's state can change. */
  const owner = (el: Element): Element => el.closest(OWNERS) ?? el;

  /** One of each kind of control in a demo that can be hovered and focused. */
  function controls(demo: Element): Control[] {
    const seen = new Set<string>();
    const out: Control[] = [];
    demo
      .querySelectorAll(
        'button, a[href], input, textarea, mat-select, [role=tab], [role=option], ' +
          'mat-expansion-panel-header, mat-step-header, .mat-sort-header-container',
      )
      .forEach((el) => {
        const { kind, state, disabled } = describe(el);
        if (disabled || !el.getClientRects().length) return;
        const key = `${kind} [${state}]`;
        if (seen.has(key)) return;
        seen.add(key);
        const n = document.querySelectorAll('[data-render-control]').length;
        el.setAttribute('data-render-control', String(n));
        out.push({ n, key });
      });
    return out;
  }

  (window as unknown as { __gallery: PageApi }).__gallery = { labels, triggers, controls, owner };
}

// ── The gallery: the run ─────────────────────────────────────────────────────

interface GalleryMeasured extends Measured {
  preset: string;
  /** static, hover, focus, or the overlay that is open. */
  where: string;
  component: boolean;
  disabled: boolean;
  state: string;
}

const PANELS: Record<OverlayType, string> = {
  select: '.mat-mdc-select-panel',
  autocomplete: '.mat-mdc-autocomplete-panel',
  datepicker: '.mat-datepicker-content',
  menu: '.mat-mdc-menu-panel',
  tooltip: '.mat-mdc-tooltip',
  dialog: 'mat-dialog-container',
  'bottom sheet': 'mat-bottom-sheet-container',
  snackbar: 'mat-snack-bar-container',
};

interface GalleryResult {
  measured: GalleryMeasured[];
  unpainted: number;
  errors: string[];
  /** `overlay in scope` → how many opened and resolved the right theme and mode. */
  overlays: Map<string, number>;
}

/** The part of `rect` that is in the viewport, on whole CSS pixels. */
function clipOf(rect: Rect, viewport: { width: number; height: number }, pad = 0): Rect | null {
  const x = Math.max(0, Math.floor(rect.x - pad));
  const y = Math.max(0, Math.floor(rect.y - pad));
  const right = Math.min(viewport.width, Math.ceil(rect.x + rect.width + pad));
  const bottom = Math.min(viewport.height, Math.ceil(rect.y + rect.height + pad));
  return right > x && bottom > y ? { x, y, width: right - x, height: bottom - y } : null;
}

async function galleryPage(
  browser: Browser,
  origin: string,
  preset: string,
  mode: (typeof MODES)[number],
  shots: string,
): Promise<GalleryResult> {
  const result: GalleryResult = { measured: [], unpainted: 0, errors: [], overlays: new Map() };
  const tag = `${preset} ${mode}`;
  const context = await browser.newContext({
    colorScheme: mode,
    reducedMotion: 'reduce',
    deviceScaleFactor: SCALE,
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  page.on('pageerror', (error) => result.errors.push(`${tag}: page error: ${error.message}`));
  if (!withFonts) await blockFonts(page);
  await page.goto(`${origin}${BASE}packages/ng-material/components`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.gallery-section .gallery-demo');
  await page.evaluate(
    ([t, m]) => {
      document.documentElement.setAttribute('theme', t);
      document.documentElement.setAttribute('themeMode', m);
    },
    [preset, mode],
  );
  await page.evaluate(installGallery);
  await settle(page);

  /** Painted and glyph-free screenshots of `clip`, and what the labels measure. */
  async function shoot(labels: GalleryLabel[], clip: Rect, where: string, file?: string) {
    const hold = await page.addStyleTag({ content: HOLD });
    await settle(page);
    const painted = decodePng(
      await page.screenshot({ clip, path: file ? path.join(shots, `${file}.png`) : undefined }),
    );
    const hide = await page.addStyleTag({ content: HIDE_TEXT });
    await settle(page);
    const blank = decodePng(await page.screenshot({ clip }));
    await hide.evaluate((el) => el.parentNode?.removeChild(el));
    await hold.evaluate((el) => el.parentNode?.removeChild(el));
    for (const label of labels) {
      const m = measure(label, mode, painted, blank, clip);
      if (m) result.measured.push({ ...m, preset, where });
      else result.unpainted++;
    }
  }

  const ids = (
    await page.evaluate(() => [...document.querySelectorAll('section[id]')].map((s) => s.id))
  ).filter((id) => !sections || sections.includes(id));

  // ── As loaded: every section, whole. The viewport is made tall enough for
  //    the tallest one, since a section is measured from one screenshot.
  const tallest = await page.evaluate(
    (wanted) =>
      Math.max(...wanted.map((id) => document.getElementById(id)!.getBoundingClientRect().height)),
    ids,
  );
  const tall = { width: 1440, height: Math.max(1000, Math.ceil(tallest) + 240) };
  await page.setViewportSize(tall);
  await settle(page);
  for (const id of ids) {
    const section = page.locator(`section[id="${id}"]`);
    const rect = await section.evaluate((el) => {
      el.scrollIntoView({ block: 'start' });
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    });
    const clip = clipOf(rect, tall);
    if (!clip || clip.height < Math.floor(rect.height)) {
      result.errors.push(`${tag}: section ${id} does not fit the viewport`);
      continue;
    }
    const labels = await section.evaluate(
      (el, scope) =>
        (window as unknown as { __gallery: PageApi }).__gallery.labels(el, scope, false),
      id,
    );
    await shoot(labels, clip, 'static', id);
  }

  // ── Hovered and focused: one of each kind of control in every demo of each
  //    section. A repeat under a palette has the same controls in other colours.
  await page.setViewportSize({ width: 1440, height: 1000 });
  await settle(page);
  const viewport = { width: 1440, height: 1000 };
  for (const id of ids) {
    const demos = page.locator(`section[id="${id}"] .gallery-demo`);
    for (let d = 0; d < (await demos.count()); d++) {
      const { controls, within } = await demos.nth(d).evaluate((el) => ({
        controls: (window as unknown as { __gallery: PageApi }).__gallery.controls(el),
        within: el.getAttribute('palette') ?? el.getAttribute('data-scope'),
      }));
      for (const control of controls) {
        const target = page.locator(`[data-render-control="${control.n}"]`);
        for (const state of ['hover', 'focus'] as const) {
          try {
            await target.evaluate((el) => el.scrollIntoView({ block: 'center' }));
            if (state === 'hover') await target.hover({ force: true });
            else await target.focus();
            await settle(page);
            const found = await target.evaluate((el, scope) => {
              const g = (window as unknown as { __gallery: PageApi }).__gallery;
              const owner = g.owner(el);
              const r = owner.getBoundingClientRect();
              return {
                rect: { x: r.x, y: r.y, width: r.width, height: r.height },
                labels: g.labels(owner, scope, false),
              };
            }, id);
            const clip = clipOf(found.rect, viewport, 4);
            if (clip && found.labels.length)
              await shoot(found.labels, clip, within ? `${state} in ${within}` : state);
          } catch (error) {
            result.errors.push(`${tag}: ${id}: ${state} on ${control.key}: ${firstLine(error)}`);
          }
          // Leave nothing hovered, focused or open behind. Escape goes to the
          // page once nothing has focus: with focus inside it, a sidenav closes.
          await page.mouse.move(0, 0);
          await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
          await page.keyboard.press('Escape');
        }
      }
    }
  }

  // ── Overlays, open.
  const htmlScope = await page.evaluate(readScope, null);
  const triggers = (
    await page.evaluate(() => (window as unknown as { __gallery: PageApi }).__gallery.triggers())
  ).filter((t) => ids.includes(t.section));
  const seen = new Map<string, number>();
  for (const trigger of triggers) {
    const selector = PANELS[trigger.type];
    const where =
      `${trigger.type}` +
      (trigger.scope ? ` in ${trigger.scope}` : '') +
      (trigger.palette ? ` in ${trigger.palette}` : '');
    const scope = `${trigger.section}`;
    const count = (seen.get(`${scope} ${where}`) ?? 0) + 1;
    seen.set(`${scope} ${where}`, count);
    const file = `${trigger.section}--${where.replace(/\s+/g, '-')}${count > 1 ? `-${count}` : ''}`;
    const target = page.locator(`[data-render-trigger="${trigger.n}"]`);
    try {
      await target.evaluate((el) => el.scrollIntoView({ block: 'center' }));
      // Forced: a floating label or a touch target lies over some of these, and
      // the click is meant for whatever is at that point, as a user's is.
      if (trigger.type === 'tooltip') await target.hover({ force: true });
      else await target.click({ force: true });
      await waitOpen(page, selector, 1);
      if (trigger.type === 'menu') {
        // …and its submenu, if it has one.
        const sub = page.locator(`${selector} .mat-mdc-menu-item-submenu-trigger`).first();
        if (await sub.count()) {
          await sub.hover();
          await waitOpen(page, selector, 2);
        }
      }
      const open = await page.evaluate(
        ([sel, scopeName]) => {
          const g = (window as unknown as { __gallery: PageApi }).__gallery;
          const panels = [...document.querySelectorAll(sel)].filter(
            (p) => p.getClientRects().length,
          );
          const boxes = panels.map((p) => p.getBoundingClientRect());
          const x = Math.min(...boxes.map((b) => b.left));
          const y = Math.min(...boxes.map((b) => b.top));
          return {
            rect: {
              x,
              y,
              width: Math.max(...boxes.map((b) => b.right)) - x,
              height: Math.max(...boxes.map((b) => b.bottom)) - y,
            },
            labels: panels.flatMap((p) => g.labels(p, scopeName, true)),
          };
        },
        [selector, scope],
      );
      const clip = clipOf(open.rect, viewport, 16);
      if (!clip) throw new Error('the overlay is outside the viewport');
      if (!open.labels.length) throw new Error('the overlay has no text');
      await shoot(open.labels, clip, where, file);

      // The overlay resolves what the element that opened it resolves.
      const panel = await page.evaluate(readScope, selector);
      const from = await page.evaluate(readScope, `[data-render-trigger="${trigger.n}"]`);
      const wrong = Object.keys(from).filter(
        (name) =>
          // A palette is a scope of the element; only an overlay inside it has it.
          (name !== '--mat-sys-primary' || !trigger.palette || panel.inside) &&
          name !== 'inside' &&
          panel[name] !== from[name],
      );
      if (trigger.palette && !panel.inside) wrong.push('the panel is not inside the palette scope');
      if (wrong.length)
        result.errors.push(
          `${tag}: ${trigger.section}: ${where} does not resolve its opener's ${wrong.join(', ')}` +
            ` (${wrong.map((n) => `${panel[n]} ≠ ${from[n]}`).join('; ')})`,
        );
      // …and in a nested scope, that is not what the page resolves.
      const nested =
        trigger.scope === 'theme' || trigger.scope === 'panel'
          ? panel['--color--brand--mode-light'] !== htmlScope['--color--brand--mode-light']
          : trigger.scope === 'mode'
            ? panel['color-scheme'] !== htmlScope['color-scheme']
            : true;
      if (!nested)
        result.errors.push(
          `${tag}: ${trigger.section}: ${where} resolves the page's ${trigger.scope}`,
        );
      if (!wrong.length && nested) {
        const key = `${trigger.type} in ${trigger.scope ?? (trigger.palette ? 'a palette' : 'its section')}`;
        result.overlays.set(key, (result.overlays.get(key) ?? 0) + 1);
      }
    } catch (error) {
      result.errors.push(`${tag}: ${trigger.section}: ${where}: ${firstLine(error)}`);
    }
    // Close it, whatever happened.
    try {
      await page.mouse.move(0, 0);
      if (trigger.type === 'snackbar') {
        const action = page.locator(`${selector} button`).first();
        if (await action.count()) await action.click();
      } else
        for (let i = 0; i < 3 && (await page.locator(selector).count()); i++) {
          await page.keyboard.press('Escape');
          await settle(page);
        }
      await page.waitForFunction((sel) => !document.querySelector(sel), selector);
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    } catch (error) {
      result.errors.push(`${tag}: ${trigger.section}: ${where} did not close: ${firstLine(error)}`);
    }
  }
  await context.close();
  return result;
}

const firstLine = (error: unknown) => String((error as Error).message ?? error).split('\n')[0];

/** Waits for `count` panels to be on screen and to have stopped moving. */
async function waitOpen(page: Page, selector: string, count: number): Promise<void> {
  await page.waitForFunction(
    ([sel, n]) => {
      const panels = [...document.querySelectorAll(sel as string)].filter(
        (p) => p.getClientRects().length && getComputedStyle(p).visibility === 'visible',
      );
      if (panels.length < (n as number)) return false;
      const state = panels
        .map((p) => {
          const r = p.getBoundingClientRect();
          return [r.x, r.y, r.width, r.height, getComputedStyle(p).opacity].join(',');
        })
        .join(';');
      const w = window as unknown as { __last?: string; __same?: number };
      w.__same = w.__last === state ? (w.__same ?? 0) + 1 : 0;
      w.__last = state;
      return w.__same >= 3;
    },
    [selector, count] as const,
    { polling: 'raf' },
  );
}

// Runs in the page: what an element resolves, for the last match of `selector`
// (`null`: the root element). The colour pairs are registered, so these are
// computed colours; the two Material roles are the token strings the adapter
// declares, which the colour scheme then resolves.
function readScope(selector: string | null): Record<string, string | boolean> {
  const el = selector ? [...document.querySelectorAll(selector)].at(-1)! : document.documentElement;
  const style = getComputedStyle(el);
  const out: Record<string, string | boolean> = {
    'color-scheme': style.colorScheme,
    inside: !!el.closest('.gallery-demo'),
  };
  for (const name of [
    '--color--primary--mode-light',
    '--color--primary--mode-dark',
    '--color--surface--mode-light',
    '--color--surface--mode-dark',
    '--color--brand--mode-light',
    '--mat-sys-surface',
    '--mat-sys-on-surface',
    '--mat-sys-primary',
  ])
    out[name] = style.getPropertyValue(name).trim();
  return out;
}

async function gallery(name: string, browser: Browser, origin: string): Promise<GalleryResult> {
  const total: GalleryResult = { measured: [], unpainted: 0, errors: [], overlays: new Map() };
  const tasks = presets.flatMap((preset) => modes.map((mode) => ({ preset, mode })));
  let next = 0;
  const worker = async () => {
    while (next < tasks.length) {
      const { preset, mode } = tasks[next++];
      const shots = path.join(outDir, 'gallery', name, `${preset}-${mode}`);
      mkdirSync(shots, { recursive: true });
      const started = Date.now();
      let result: GalleryResult;
      try {
        result = await galleryPage(browser, origin, preset, mode, shots);
      } catch (error) {
        result = { measured: [], unpainted: 0, overlays: new Map(), errors: [] };
        result.errors.push(`${preset} ${mode}: ${firstLine(error)}`);
      }
      total.measured.push(...result.measured);
      total.unpainted += result.unpainted;
      total.errors.push(...result.errors);
      for (const [key, n] of result.overlays)
        total.overlays.set(key, (total.overlays.get(key) ?? 0) + n);
      console.log(
        `  ${name} ${preset} ${mode}: ${result.measured.length} labels, ` +
          `${result.errors.length} errors, ${Math.round((Date.now() - started) / 1000)}s`,
      );
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, jobs) }, worker));
  return total;
}

function galleryLine(m: GalleryMeasured): string {
  return (
    `${m.ratio.toFixed(2).padStart(5)}:1  ${m.preset.padEnd(14)} ${m.mode.padEnd(5)} ` +
    `${m.scope.padEnd(13)} ${m.where.padEnd(24)} ` +
    `${(m.kind + (m.state ? ` [${m.state}]` : '')).padEnd(52)} ${JSON.stringify(m.text).padEnd(34)} ` +
    `${m.text_color} on ${m.background}  ${m.fontSize}px/${m.fontWeight}`
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

requireBuild();
mkdirSync(outDir, { recursive: true });
const { server, origin } = await serve();
let failed = false;
for (const name of engines.length ? engines : ['chromium']) {
  const browser = await ENGINES[name].launch();

  if (!only || only.includes('showcase')) {
    const { measured, unpainted } = await showcase(name, browser, origin);
    measured.sort((a, b) => a.ratio - b.ratio);
    const below = measured.filter((m) => m.ratio < AA);
    const report =
      `${showcaseName(name)}: ${measured.length} labels measured on the showcase ` +
      `(${modes.join(' + ')}${siteTheme ? `, theme="${siteTheme}"` : ''}), ` +
      `${below.length} below ${AA}:1` +
      (unpainted ? `, ${unpainted} text nodes with no painted glyph (clipped or covered)` : '') +
      '\n';
    writeFileSync(
      path.join(outDir, `${showcaseName(name)}.txt`),
      `${report}\n${measured.map(line).join('\n')}\n`,
    );
    writeFileSync(
      path.join(outDir, `${showcaseName(name)}.json`),
      JSON.stringify(measured, null, 2),
    );
    console.log(`\n${report}`);
    if (below.length) console.log(`Below ${AA}:1\n${below.map(line).join('\n')}`);
    if (!measured.length) {
      console.error(`${name}: nothing measured — did the showcase render?`);
      failed = true;
    }
  }

  if (!only || only.includes('gallery')) {
    console.log(`\n${name}: the component gallery`);
    const { measured, unpainted, errors, overlays } = await gallery(name, browser, origin);
    measured.sort((a, b) => a.ratio - b.ratio);
    const components = measured.filter((m) => m.component);
    const live = components.filter((m) => !m.disabled);
    const failing = live.filter((m) => m.ratio < AA);
    const exempt = components.filter((m) => m.disabled && m.ratio < AA);
    const captions = measured.filter((m) => !m.component && m.ratio < AA);
    const lowest = (preset: string, mode: string) => {
      const set = live.filter((m) => m.preset === preset && m.mode === mode);
      const min = set[0];
      return (
        `  ${preset.padEnd(14)} ${mode.padEnd(5)} ${String(set.length).padStart(5)} component labels, ` +
        `${set.filter((m) => m.ratio < AA).length} below ${AA}:1` +
        (min ? `, lowest ${min.ratio.toFixed(2)}:1 (${min.kind}, ${min.where})` : '')
      );
    };
    const summary = [
      `${name}: ${measured.length} labels measured on the component gallery ` +
        `(${presets.length} presets × ${modes.join(' + ')}; as loaded, hovered, focused, overlays open)`,
      ...presets.flatMap((p) => modes.map((m) => lowest(p, m))),
      `  component labels below ${AA}:1: ${failing.length} (an error)`,
      `  labels of disabled controls below ${AA}:1: ${exempt.length} (exempt, WCAG 1.4.3)`,
      `  docs captions below ${AA}:1: ${captions.length} (a report)`,
      ...(unpainted
        ? [
            `  text nodes with no painted glyph (clipped, covered or behind an overlay): ${unpainted}`,
          ]
        : []),
      `  overlays that opened and resolved their opener's theme and mode:`,
      ...[...overlays].sort().map(([key, n]) => `    ${key}: ${n}`),
      `  errors: ${errors.length}`,
      ...errors.map((e) => `    ${e}`),
    ].join('\n');
    const block = (title: string, list: GalleryMeasured[]) =>
      list.length ? `\n${title}\n${list.map(galleryLine).join('\n')}\n` : '';
    writeFileSync(
      path.join(outDir, `gallery-${name}.txt`),
      `${summary}\n` +
        block(`Component labels below ${AA}:1`, failing) +
        block(`Disabled, below ${AA}:1 (exempt)`, exempt) +
        block(`Docs captions below ${AA}:1`, captions) +
        block('Every label', measured),
    );
    writeFileSync(path.join(outDir, `gallery-${name}.json`), JSON.stringify(measured, null, 2));
    console.log(`\n${summary}`);
    // The same control fails the same way in every repeat: print each once.
    const once = new Map<string, GalleryMeasured>();
    for (const m of failing) {
      const key = `${m.preset} ${m.mode} ${m.scope} ${m.where} ${m.kind} ${m.state} ${m.text_color} ${m.background}`;
      if (!once.has(key)) once.set(key, m);
    }
    if (failing.length)
      console.log(
        `\nComponent labels below ${AA}:1\n${[...once.values()].map(galleryLine).join('\n')}`,
      );
    if (failing.length || errors.length || !measured.length) failed = true;
  }

  await browser.close();
}
server.close();
console.log(`\nFull lists and screenshots: ${path.relative(repo, outDir)}/`);
process.exit(failed ? 1 : 0);
