// Browser check of the cascade. Static fixture pages built from the compiled CSS,
// computed values asserted in Chromium and Firefox. Local only, not in CI.
//
//   node test/render.ts                 # both browsers
//   node test/render.ts firefox         # one browser
//   node test/render.ts --grep mode     # rows whose id contains "mode"
//
// Every row asserts the intended behaviour. Rows that hold today lock today's
// values so Phase 9 cannot change them unnoticed; the rest are the "Behaviour
// today" defects PORT-PLAN.md lists, which Phase 9 fixes. Stylesheets load in
// the order core, themes, adapter, user CSS.
import path from 'node:path';
import { chromium, firefox, type BrowserType } from 'playwright';
import { compileFile, compileSource, coreDir, materialDir } from './lib/sass.ts';
import { declarationsFor } from './lib/css.ts';
import { contextFor, cssColor, evaluateColor, maxChannelDiff, type Mode } from './lib/color.ts';

// ─── Fixture themes ──────────────────────────────────────────────────────────
// Distinct hues per theme and distinct lightness per mode, so every computed
// value identifies which theme and which mode produced it.
const COLOR = {
  alphaLight: 'oklch(0.4 0.1 250)',
  alphaDark: 'oklch(0.8 0.1 250)',
  betaLight: 'oklch(0.4 0.1 20)',
  betaDark: 'oklch(0.8 0.1 20)',
  outerBgLight: 'oklch(0.7 0.2 250)',
  outerBgDark: 'oklch(0.3 0.2 250)',
  user: 'oklch(0.5 0.2 120)',
  brand: 'oklch(0.44 0.22 253)',
};

interface ThemeSpec {
  name: string;
  light: string;
  dark: string;
  bg?: [light: string, dark: string];
  default?: boolean;
  fromBrand?: boolean;
}

function themeScss(spec: ThemeSpec): string {
  const pal = (c: string, bg?: string) => `t.palette(${c}${bg ? `, $bg: ${bg}` : ''})`;
  const primary = spec.fromBrand
    ? 't.palette-from-brand()'
    : `t.light-dark(${pal(spec.light, spec.bg?.[0])}, ${pal(spec.dark, spec.bg?.[1])})`;
  const variable = `$${spec.name.replace(/[^\w]/g, '-')}`;
  return `
@use "../../scss/theme" as t;
@use "../../scss/presets/palettes" as p;
${variable}: t.theme(
  ${spec.fromBrand ? `$brand: ${COLOR.brand},` : ''}
  $palettes: (
    background: p.$default-background,
    surface: p.$default-surface,
    primary: ${primary},
    secondary: t.light-dark(t.palette(oklch(0.4 0.1 100)), t.palette(oklch(0.8 0.1 100))),
    error: p.$default-error,
    pass: p.$default-pass,
    caution: p.$default-caution,
    warn: p.$default-warn,
  ),
  $weights: t.light-dark(t.weights($text-blend: 82%), t.weights($text-blend: 78%)),
);
@include t.define-theme("${spec.name}", ${variable}${spec.default ? ', $default: true' : ''});
`;
}

const THEMES: Record<string, ThemeSpec> = {
  alpha: { name: 'alpha', light: COLOR.alphaLight, dark: COLOR.alphaDark },
  alphaDefault: {
    name: 'alpha-default',
    light: COLOR.alphaLight,
    dark: COLOR.alphaDark,
    default: true,
  },
  beta: { name: 'beta', light: COLOR.betaLight, dark: COLOR.betaDark },
  outer: {
    name: 'outer',
    light: COLOR.alphaLight,
    dark: COLOR.alphaDark,
    bg: [COLOR.outerBgLight, COLOR.outerBgDark],
  },
  inner: { name: 'inner', light: COLOR.betaLight, dark: COLOR.betaDark },
  brandfx: { name: 'brandfx', light: '', dark: '', fromBrand: true },
};

const sheets: Record<string, string> = {
  core: compileFile(path.join(coreDir, 'scss/core.scss')).css,
  azure: compileFile(path.join(coreDir, 'scss/presets/azure-blue.scss')).css,
  rose: compileFile(path.join(coreDir, 'scss/presets/rose-red.scss')).css,
  material: compileFile(path.join(materialDir, 'scss/material-core.scss')).css,
  userRoot: `:root { --color--primary: ${COLOR.user}; }`,
};
for (const [key, spec] of Object.entries(THEMES)) {
  sheets[key] = compileSource(
    themeScss(spec),
    path.join(coreDir, 'test/fixtures', `__render-${key}.scss`),
  ).css;
}

/** Evaluates a token the way the browser should, from a theme's compiled rule. */
function expectFrom(
  sheet: string,
  theme: string,
  token: string,
  mode: Mode,
  overrides?: Record<string, string>,
): string {
  const decls = declarationsFor(sheets[sheet], `[theme="${theme}"]`);
  const ctx = contextFor(decls, mode, overrides ? new Map(Object.entries(overrides)) : undefined);
  return evaluateColor(`var(${token})`, ctx).toString();
}

// ─── Rows ────────────────────────────────────────────────────────────────────
interface Row {
  id: string;
  sheets: string[];
  /** Attributes on <html>. */
  html: string;
  /** Body inner HTML. */
  body: string;
  /** Emulated OS colour scheme (default light). */
  scheme?: 'light' | 'dark';
  probe: string;
  token: string;
  /** paint: read through `color: var(token)` on a probe child. raw: getPropertyValue. */
  read?: 'paint' | 'raw';
  /** A colour / raw string, or the two endpoints a paused crossfade must sit between. */
  expect: string | { between: [string, string] };
  /** JavaScript run in the page before reading (crossfade rows). */
  act?: string;
}

const P = '<div id="p">probe</div>';
const rows: Row[] = [
  // ── Behaviour today ─────────────────────────────────────────────────────
  {
    id: 'html-theme-mode/html-element',
    sheets: ['core', 'alphaDefault'],
    html: 'theme="alpha-default" themeMode="dark"',
    body: P,
    probe: 'html',
    token: '--color--primary',
    expect: COLOR.alphaDark,
  },
  {
    id: 'html-theme-mode/body',
    sheets: ['core', 'alphaDefault'],
    html: 'theme="alpha-default" themeMode="dark"',
    body: P,
    probe: 'body',
    token: '--color--primary',
    expect: COLOR.alphaDark,
  },
  {
    id: 'html-theme-mode/non-default-theme',
    sheets: ['core', 'alpha'],
    html: 'theme="alpha" themeMode="dark"',
    body: P,
    probe: 'body',
    token: '--color--primary',
    expect: COLOR.alphaDark,
  },
  {
    id: 'mode-on-plain-element/colour',
    sheets: ['core', 'alpha'],
    html: 'theme="alpha"',
    body: '<div id="p" themeMode="dark">x</div>',
    probe: '#p',
    token: '--color--primary',
    expect: COLOR.alphaDark,
  },
  {
    id: 'mode-on-plain-element/weight',
    sheets: ['core', 'alpha'],
    html: 'theme="alpha"',
    body: '<div id="p" themeMode="dark">x</div>',
    probe: '#p',
    token: '--weight--text-blend',
    read: 'raw',
    expect: '78%',
  },
  {
    id: 'two-presets/azure-after-rose',
    sheets: ['core', 'azure', 'rose'],
    html: 'theme="azure-blue"',
    body: P,
    probe: 'body',
    token: '--color--primary',
    expect: expectFrom('azure', 'azure-blue', '--color--primary', 'light'),
  },
  {
    id: 'two-presets/rose-after-azure',
    sheets: ['core', 'rose', 'azure'],
    html: 'theme="rose-red"',
    body: P,
    probe: 'body',
    token: '--color--primary',
    expect: expectFrom('rose', 'rose-red', '--color--primary', 'light'),
  },
  {
    id: 'user-root-override/before-library',
    sheets: ['userRoot', 'core', 'alphaDefault'],
    html: '',
    body: P,
    probe: 'body',
    token: '--color--primary',
    expect: COLOR.user,
  },
  {
    id: 'user-root-override/after-library',
    sheets: ['core', 'alphaDefault', 'userRoot'],
    html: '',
    body: P,
    probe: 'body',
    token: '--color--primary',
    expect: COLOR.user,
  },
  {
    id: 'inline-base-rederives/plain-element',
    sheets: ['core', 'alpha'],
    html: 'theme="alpha"',
    body: `<div id="p" style="--color--primary: ${COLOR.user}">x</div>`,
    probe: '#p',
    token: '--color--primary--dark',
    expect: expectFrom('alpha', 'alpha', '--color--primary--dark', 'light', {
      '--color--primary': COLOR.user,
    }),
  },
  {
    id: 'inline-base-rederives/brand',
    sheets: ['core', 'brandfx'],
    html: 'theme="brandfx"',
    body: `<div id="p" style="--color--brand: ${COLOR.user}">x</div>`,
    probe: '#p',
    token: '--color--primary',
    expect: expectFrom('brandfx', 'brandfx', '--color--primary', 'light', {
      '--color--brand': COLOR.user,
    }),
  },
  {
    id: 'parent-shape/nested-theme-keeps-it',
    sheets: ['core', 'alpha', 'beta'],
    html: 'theme="alpha"',
    body: '<div style="--shape--md: 99px"><div id="p" theme="beta">x</div></div>',
    probe: '#p',
    token: '--shape--md',
    read: 'raw',
    expect: '99px',
  },
  {
    id: 'mat-sys/nested-theme',
    sheets: ['core', 'alpha', 'beta', 'material'],
    html: 'theme="alpha"',
    body: '<div id="p" theme="beta">x</div>',
    probe: '#p',
    token: '--mat-sys-primary',
    expect: COLOR.betaLight,
  },
  {
    id: 'mat-sys/nested-mode',
    sheets: ['core', 'alpha', 'material'],
    html: 'theme="alpha"',
    body: '<div id="p" themeMode="dark">x</div>',
    probe: '#p',
    token: '--mat-sys-primary',
    expect: COLOR.alphaDark,
  },
  {
    id: 'crossfade/theme-switch',
    sheets: ['core', 'alpha', 'beta'],
    html: 'theme="alpha" style="transition: --color--primary 1s linear"',
    body: P,
    probe: 'html',
    token: '--color--primary',
    act: "document.documentElement.setAttribute('theme', 'beta')",
    expect: { between: [COLOR.alphaLight, COLOR.betaLight] },
  },
  {
    id: 'crossfade/mode-flip',
    sheets: ['core', 'alphaDefault'],
    html: 'theme="alpha-default"',
    body: '<div id="p">x</div><style>body { transition: --color--primary 1s linear }</style>',
    probe: 'body',
    token: '--color--primary',
    act: "document.documentElement.setAttribute('themeMode', 'dark')",
    expect: { between: [COLOR.alphaLight, COLOR.alphaDark] },
  },
  // ── Mode combinations ───────────────────────────────────────────────────
  {
    id: 'mode-auto/os-light',
    sheets: ['core', 'alphaDefault'],
    html: 'theme="alpha-default" themeMode="auto"',
    body: P,
    scheme: 'light',
    probe: 'body',
    token: '--color--primary',
    expect: COLOR.alphaLight,
  },
  {
    id: 'mode-auto/os-dark',
    sheets: ['core', 'alphaDefault'],
    html: 'theme="alpha-default" themeMode="auto"',
    body: P,
    scheme: 'dark',
    probe: 'body',
    token: '--color--primary',
    expect: COLOR.alphaDark,
  },
  {
    id: 'mode-auto/os-dark-weight',
    sheets: ['core', 'alphaDefault'],
    html: 'theme="alpha-default" themeMode="auto"',
    body: P,
    scheme: 'dark',
    probe: 'body',
    token: '--weight--text-blend',
    read: 'raw',
    expect: '78%',
  },
  {
    id: 'mode-invert/os-light-nested-theme',
    sheets: ['core', 'alphaDefault', 'beta'],
    html: 'theme="alpha-default"',
    body: '<div themeMode="invert"><div id="p" theme="beta">x</div></div>',
    scheme: 'light',
    probe: '#p',
    token: '--color--primary',
    expect: COLOR.betaDark,
  },
  {
    id: 'mode-invert/os-dark-nested-theme',
    sheets: ['core', 'alphaDefault', 'beta'],
    html: 'theme="alpha-default"',
    body: '<div themeMode="invert"><div id="p" theme="beta">x</div></div>',
    scheme: 'dark',
    probe: '#p',
    token: '--color--primary',
    expect: COLOR.betaLight,
  },
  {
    id: 'mode-invert/inside-dark-nested-theme',
    sheets: ['core', 'alphaDefault', 'beta'],
    html: 'theme="alpha-default" themeMode="dark"',
    body: '<div themeMode="invert"><div id="p" theme="beta">x</div></div>',
    probe: '#p',
    token: '--color--primary',
    expect: COLOR.betaLight,
  },
  {
    id: 'mode-invert/plain-element-os-light',
    sheets: ['core', 'alphaDefault'],
    html: 'theme="alpha-default"',
    body: '<div id="p" themeMode="invert">x</div>',
    scheme: 'light',
    probe: '#p',
    token: '--color--primary',
    expect: COLOR.alphaDark,
  },
  {
    id: 'light-inside-dark/plain-element',
    sheets: ['core', 'alphaDefault'],
    html: 'theme="alpha-default" themeMode="dark"',
    body: '<div id="p" themeMode="light">x</div>',
    probe: '#p',
    token: '--color--primary',
    expect: COLOR.alphaLight,
  },
  {
    id: 'light-inside-dark/nested-theme',
    sheets: ['core', 'alphaDefault', 'beta'],
    html: 'theme="alpha-default" themeMode="dark"',
    body: '<div themeMode="light"><div id="p" theme="beta">x</div></div>',
    probe: '#p',
    token: '--color--primary',
    expect: COLOR.betaLight,
  },
  {
    id: 'mode-in-palette-scope',
    sheets: ['core', 'alphaDefault'],
    html: 'theme="alpha-default"',
    body: '<div palette="primary"><div id="p" themeMode="dark">x</div></div>',
    probe: '#p',
    token: '--palette-color',
    expect: COLOR.alphaDark,
  },
  {
    id: 'mode-in-nested-theme',
    sheets: ['core', 'alphaDefault', 'beta'],
    html: 'theme="alpha-default"',
    body: '<div theme="beta"><div id="p" themeMode="dark">x</div></div>',
    probe: '#p',
    token: '--color--primary',
    expect: COLOR.betaDark,
  },
  {
    id: 'theme-inside-mode',
    sheets: ['core', 'alphaDefault', 'beta'],
    html: 'theme="alpha-default"',
    body: '<div themeMode="dark"><div id="p" theme="beta">x</div></div>',
    probe: '#p',
    token: '--color--primary',
    expect: COLOR.betaDark,
  },
  // ── Nesting ─────────────────────────────────────────────────────────────
  {
    id: 'outer-explicit-bg/outer-itself',
    sheets: ['core', 'outer', 'inner'],
    html: 'theme="outer"',
    body: P,
    probe: 'body',
    token: '--color--primary--bg',
    expect: COLOR.outerBgLight,
  },
  {
    id: 'outer-explicit-bg/nested-sets-none',
    sheets: ['core', 'outer', 'inner'],
    html: 'theme="outer"',
    body: '<div id="p" theme="inner">x</div>',
    probe: '#p',
    token: '--color--primary--bg',
    expect: expectFrom('inner', 'inner', '--color--primary--bg', 'light'),
  },
  {
    id: 'palette-tone/inside-nested-theme',
    sheets: ['core', 'alphaDefault', 'beta'],
    html: 'theme="alpha-default"',
    body: '<div theme="beta"><div id="p" palette="primary" tone="high">x</div></div>',
    probe: '#p',
    token: '--palette-color',
    expect: expectFrom('beta', 'beta', '--color--primary--dark', 'light'),
  },
];

// ─── Runner ──────────────────────────────────────────────────────────────────
function pageHtml(row: Row): string {
  const styles = row.sheets.map((k) => `<style data-sheet="${k}">${sheets[k]}</style>`).join('\n');
  return `<!doctype html><html ${row.html}><head><meta charset="utf-8">${styles}</head><body>${row.body}</body></html>`;
}

interface Outcome {
  ok: boolean;
  detail: string;
}

function judge(row: Row, value: string, animations: number | undefined): Outcome {
  if (typeof row.expect !== 'string') {
    const [start, end] = row.expect.between;
    if (!animations) return { ok: false, detail: `no transition ran; value ${value}` };
    let got;
    try {
      got = cssColor(value);
    } catch {
      return { ok: false, detail: `unparseable ${value}` };
    }
    const fromStart = maxChannelDiff(got, cssColor(start));
    const fromEnd = maxChannelDiff(got, cssColor(end));
    const ok = fromStart > 0.03 && fromEnd > 0.03;
    return { ok, detail: `${value} (Δstart ${fromStart.toFixed(2)}, Δend ${fromEnd.toFixed(2)})` };
  }
  if (row.read === 'raw')
    return { ok: value === row.expect, detail: `${value} expected ${row.expect}` };
  try {
    const diff = maxChannelDiff(cssColor(value), cssColor(row.expect));
    return { ok: diff < 0.02, detail: `${value} expected ${row.expect}` };
  } catch (e) {
    return { ok: false, detail: `${value} not a colour (${(e as Error).message})` };
  }
}

async function runBrowser(type: BrowserType, selected: Row[]): Promise<Map<string, Outcome>> {
  const results = new Map<string, Outcome>();
  let browser;
  try {
    browser = await type.launch();
  } catch (e) {
    for (const row of selected)
      results.set(row.id, {
        ok: false,
        detail: `launch failed: ${(e as Error).message.split('\n')[0]}`,
      });
    return results;
  }
  const page = await browser.newPage();
  for (const row of selected) {
    await page.emulateMedia({ colorScheme: row.scheme ?? 'light' });
    await page.setContent(pageHtml(row));
    const r = await page.evaluate(
      ({ probe, token, read, act }) => {
        const el = document.querySelector(probe) as HTMLElement | null;
        if (!el) return { error: `no element matches ${probe}` };
        const readValue = (): string => {
          if (read === 'raw') return getComputedStyle(el).getPropertyValue(token).trim();
          const span = document.createElement('span');
          span.style.color = `var(${token})`;
          el.appendChild(span);
          const v = getComputedStyle(span).color;
          span.remove();
          return v;
        };
        if (!act) return { value: readValue() };
        getComputedStyle(el).getPropertyValue(token); // flush the start state
        new Function(act)();
        getComputedStyle(el).getPropertyValue(token); // flush the change so the transition starts
        const animations = el.getAnimations();
        for (const a of animations) {
          a.pause();
          a.currentTime = 500;
        }
        return {
          value: getComputedStyle(el).getPropertyValue(token).trim(),
          animations: animations.length,
        };
      },
      { probe: row.probe, token: row.token, read: row.read ?? 'paint', act: row.act ?? '' },
    );
    results.set(
      row.id,
      'error' in r ? { ok: false, detail: r.error! } : judge(row, r.value!, r.animations),
    );
  }
  await browser.close();
  return results;
}

const args = process.argv.slice(2);
const grepIndex = args.indexOf('--grep');
const grep = grepIndex >= 0 ? args[grepIndex + 1] : null;
const wanted = args.filter((a, i) => !a.startsWith('--') && i !== grepIndex + 1);
const browsers: [string, BrowserType][] = (
  [
    ['chromium', chromium],
    ['firefox', firefox],
  ] as [string, BrowserType][]
).filter(([name]) => wanted.length === 0 || wanted.includes(name));
const selected = grep ? rows.filter((r) => r.id.includes(grep)) : rows;

const outcomes = new Map<string, Map<string, Outcome>>();
for (const [name, type] of browsers) outcomes.set(name, await runBrowser(type, selected));

const width = Math.max(...selected.map((r) => r.id.length));
let failed = 0;
for (const row of selected) {
  const cells = browsers.map(([name]) => {
    const o = outcomes.get(name)!.get(row.id)!;
    if (!o.ok) failed++;
    return `${o.ok ? '✔' : '✘'} ${name}${o.ok ? '' : `: ${o.detail}`}`;
  });
  console.log(`${row.id.padEnd(width)}  ${cells.join('   ')}`);
}
console.log('');
for (const [name] of browsers) {
  const pass = selected.filter((r) => outcomes.get(name)!.get(r.id)!.ok).length;
  console.log(`${name}: ${pass} of ${selected.length} rows pass`);
}
process.exit(failed ? 1 : 0);
