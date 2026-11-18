// Browser check of the Material adapter's accent tokens on the built site
// (issues #9 and #15, PORT-PLAN.md Phase 19). Local only, after
// `pnpm --filter docs build`.
//
//   node demos/docs/test/material-tokens.ts                  # chromium
//   node demos/docs/test/material-tokens.ts chromium firefox webkit
//
// On the component gallery, in light and in dark mode:
//   1. As shipped: the label of a text, outlined and elevated button and the
//      focused label of a field are the palette's text role; the focused
//      outline, the active indicator, the caret and the select arrow are its
//      stroke. In the section's own demo that palette is primary, under
//      palette="error" it is error.
//   2. A token set on a wrapper reaches the components inside it: the three
//      button labels, a field's focused label and its focused outline.
//      (Issue #9: the adapter used to declare them on the component, where no
//      ancestor's value could reach.)
//   3. A [palette] scope between the wrapper and the component declares the
//      token again, as it does every --mat-sys-* colour.
//   4. A rule on `html` wins over the adapter's, which has no specificity.
//
// Colours are compared as painted: each value goes through a canvas, so two
// spellings of one colour are equal and an engine that computes `oklch(…)`
// compares like one that computes `rgb(…)`.
import { chromium, firefox, webkit, type BrowserType, type Page } from 'playwright';
import { BASE, blockFonts, requireBuild, serve } from './lib/site.ts';

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

const STILL = '*, *::before, *::after { transition: none !important; animation: none !important; }';

// Installed once per page as `window.__tokens`.
function install(): void {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const context = canvas.getContext('2d', { willReadFrequently: true })!;
  /** A CSS colour as the three bytes a canvas paints for it. */
  const rgb = (value: string): string => {
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = '#000';
    context.fillStyle = value;
    context.fillRect(0, 0, 1, 1);
    return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).join(' ');
  };
  /** What a custom property paints as, read on `el`. */
  const token = (el: Element, name: string): string => {
    const probe = document.createElement('span');
    probe.style.color = `var(${name})`;
    el.appendChild(probe);
    const value = rgb(getComputedStyle(probe).color);
    probe.remove();
    return value;
  };
  const style = (el: Element, property: string, pseudo?: string): string =>
    rgb(getComputedStyle(el, pseudo).getPropertyValue(property));
  (window as unknown as { __tokens: unknown }).__tokens = { rgb, token, style };
}

interface Api {
  rgb(value: string): string;
  token(el: Element, name: string): string;
  style(el: Element, property: string, pseudo?: string): string;
}

/** The demo of a gallery section: its own (`palette` null) or the one under a palette. */
const demoOf = (section: string, palette: string | null) =>
  `section[id="${section}"] .gallery-demo${palette ? `[palette="${palette}"]` : ':not([palette])'}`;

/** The three button labels of a demo and that scope's text role. */
async function buttons(page: Page, demo: string, palette: string) {
  return page.evaluate(
    ([selector, name]) => {
      const t = (window as unknown as { __tokens: Api }).__tokens;
      const el = document.querySelector(selector)!;
      const colour = (cls: string) => t.style(el.querySelector(`.${cls}:not(:disabled)`)!, 'color');
      return {
        text: colour('mat-mdc-button'),
        outlined: colour('mat-mdc-outlined-button'),
        elevated: colour('mat-mdc-raised-button'),
        role: t.token(el, `--color--${name}--text`),
        colour: t.token(el, `--color--${name}`),
      };
    },
    [demo, palette],
  );
}

/** Focuses the first enabled field of an appearance in a demo and reads it. */
async function field(
  page: Page,
  demo: string,
  appearance: 'outline' | 'fill',
  palette: string,
  control = 'input',
) {
  const selector = `${demo} mat-form-field.mat-form-field-appearance-${appearance}:not(.mat-form-field-disabled):not(.mat-form-field-invalid)`;
  const target = page
    .locator(selector)
    .filter({ has: page.locator(control) })
    .first();
  await target.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await target.locator(control).first().focus();
  // The docs app is zoneless: the class arrives a frame after the focus.
  await target.evaluate(
    (el) =>
      new Promise<void>((done) => {
        const wait = () =>
          el.classList.contains('mat-focused') ? done() : requestAnimationFrame(wait);
        wait();
      }),
  );
  const read = await target.evaluate(
    (el, [name, isOutline]) => {
      const t = (window as unknown as { __tokens: Api }).__tokens;
      const input = el.querySelector('input, textarea');
      const arrow = el.querySelector('.mat-mdc-select-arrow');
      return {
        label: t.style(el.querySelector('.mdc-floating-label')!, 'color'),
        line: isOutline
          ? t.style(el.querySelector('.mdc-notched-outline__leading')!, 'border-left-color')
          : t.style(el.querySelector('.mdc-line-ripple')!, 'border-bottom-color', '::after'),
        caret: input ? t.style(input, 'caret-color') : null,
        arrow: arrow ? t.style(arrow, 'color') : null,
        text: t.token(el, `--color--${name}--text`),
        stroke: t.token(el, `--color--${name}--stroke`),
      };
    },
    [palette, appearance === 'outline'] as const,
  );
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  return read;
}

const set = (page: Page, selector: string, values: Record<string, string>) =>
  page.evaluate(
    ([sel, entries]) => {
      const el = document.querySelector<HTMLElement>(sel as string)!;
      for (const [name, value] of entries as [string, string][])
        if (value) el.style.setProperty(name, value);
        else el.style.removeProperty(name);
    },
    [selector, Object.entries(values)] as const,
  );

const MARK = { a: 'rgb(1, 2, 3)', b: 'rgb(4, 5, 6)', c: 'rgb(7, 8, 9)' };
const painted = (value: string) => value.match(/\d+/g)!.join(' ');

for (const engine of chosen) {
  const browser = await engines[engine].launch();
  for (const mode of ['light', 'dark'] as const) {
    const where = `${engine} ${mode}`;
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.emulateMedia({ colorScheme: mode, reducedMotion: 'reduce' });
    await blockFonts(page);
    await page.goto(`${origin}${BASE}packages/ng-material/components`, {
      waitUntil: 'networkidle',
    });
    await page.waitForSelector('.gallery-section .gallery-demo');
    await page.evaluate(`document.documentElement.setAttribute('themeMode', '${mode}')`);
    await page.addStyleTag({ content: STILL });
    await page.evaluate(install);

    // ── 1. As shipped ───────────────────────────────────────────────────────
    for (const palette of ['primary', 'error', 'secondary']) {
      const scope = palette === 'primary' ? null : palette;
      const b = await buttons(page, demoOf('buttons', scope), palette);
      for (const kind of ['text', 'outlined', 'elevated'] as const)
        ok(
          b[kind] === b.role,
          `${where} ${palette}: the ${kind} button's label is --color--${palette}--text (${b[kind]} / ${b.role})`,
        );
      for (const appearance of ['outline', 'fill'] as const) {
        const f = await field(page, demoOf('form-field', scope), appearance, palette);
        const what = `${where} ${palette} ${appearance} field`;
        ok(
          f.label === f.text,
          `${what}: the focused label is the text role (${f.label} / ${f.text})`,
        );
        ok(
          f.line === f.stroke,
          `${what}: the focused ${appearance === 'outline' ? 'outline' : 'indicator'} is the stroke (${f.line} / ${f.stroke})`,
        );
        ok(f.caret === f.stroke, `${what}: the caret is the stroke (${f.caret} / ${f.stroke})`);
      }
      const s = await field(page, demoOf('select', scope), 'outline', palette, 'mat-select');
      ok(
        s.arrow === s.stroke,
        `${where} ${palette}: a focused select's arrow is the stroke (${s.arrow} / ${s.stroke})`,
      );
    }
    // The two roles are not one colour everywhere, or (1) would prove little:
    // in one mode or the other a preset's error is moved to become its text.
    const error = await buttons(page, demoOf('buttons', 'error'), 'error');
    const primary = await buttons(page, demoOf('buttons', null), 'primary');
    ok(error.role !== primary.role, `${where}: error text is not primary text`);
    if (mode === 'light')
      ok(error.role !== error.colour, `${where}: the error text role is not the error colour`);

    // ── 2. A token set on a wrapper reaches the components inside it ────────
    const plain = demoOf('buttons', null);
    await set(page, plain, {
      '--mat-button-text-label-text-color': MARK.a,
      '--mat-button-outlined-label-text-color': MARK.b,
      '--mat-button-protected-label-text-color': MARK.c,
    });
    const wrapped = await buttons(page, plain, 'primary');
    ok(
      wrapped.text === painted(MARK.a),
      `${where}: a wrapper's text label colour reaches the button (${wrapped.text})`,
    );
    ok(
      wrapped.outlined === painted(MARK.b),
      `${where}: a wrapper's outlined label colour reaches the button (${wrapped.outlined})`,
    );
    ok(
      wrapped.elevated === painted(MARK.c),
      `${where}: a wrapper's elevated label colour reaches the button (${wrapped.elevated})`,
    );
    await set(page, plain, {
      '--mat-button-text-label-text-color': '',
      '--mat-button-outlined-label-text-color': '',
      '--mat-button-protected-label-text-color': '',
    });

    const fields = demoOf('form-field', null);
    await set(page, fields, {
      '--mat-form-field-outlined-focus-label-text-color': MARK.a,
      '--mat-form-field-outlined-focus-outline-color': MARK.b,
      '--mat-form-field-filled-focus-label-text-color': MARK.c,
    });
    const outlined = await field(page, fields, 'outline', 'primary');
    const filled = await field(page, fields, 'fill', 'primary');
    ok(
      outlined.label === painted(MARK.a),
      `${where}: a wrapper's focus label colour reaches an outlined field (${outlined.label})`,
    );
    ok(
      outlined.line === painted(MARK.b),
      `${where}: a wrapper's focus outline colour reaches an outlined field (${outlined.line})`,
    );
    ok(
      filled.label === painted(MARK.c),
      `${where}: a wrapper's focus label colour reaches a filled field (${filled.label})`,
    );
    await set(page, fields, {
      '--mat-form-field-outlined-focus-label-text-color': '',
      '--mat-form-field-outlined-focus-outline-color': '',
      '--mat-form-field-filled-focus-label-text-color': '',
    });

    // ── 3. A [palette] scope in between declares the token again ────────────
    await set(page, 'section[id="buttons"]', { '--mat-button-text-label-text-color': MARK.a });
    const outside = await buttons(page, plain, 'primary');
    const inside = await buttons(page, demoOf('buttons', 'error'), 'error');
    ok(
      outside.text === painted(MARK.a),
      `${where}: the section's value reaches its own demo (${outside.text})`,
    );
    ok(
      inside.text === inside.role,
      `${where}: under palette="error" the label is the error text role again (${inside.text} / ${inside.role})`,
    );
    await set(page, 'section[id="buttons"]', { '--mat-button-text-label-text-color': '' });

    // ── 4. A rule on html wins: the adapter's has no specificity ────────────
    const rule = await page.addStyleTag({
      content: `html { --mat-button-text-label-text-color: ${MARK.c}; }`,
    });
    const fromHtml = await buttons(page, plain, 'primary');
    ok(
      fromHtml.text === painted(MARK.c),
      `${where}: a rule on html sets the label colour (${fromHtml.text})`,
    );
    await rule.evaluate((el) => el.remove());
    const back = await buttons(page, plain, 'primary');
    ok(
      back.text === back.role,
      `${where}: without it the label is the text role again (${back.text} / ${back.role})`,
    );

    await page.close();
  }
  await browser.close();
}
server.close();
console.log(`${checks - failed} of ${checks} checks pass (${chosen.join(', ')})`);
process.exit(failed ? 1 : 0);
