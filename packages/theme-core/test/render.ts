// Browser check of the cascade. Static fixture pages built from the compiled CSS,
// computed values asserted in Chromium and Firefox (WebKit when installed).
// Local only, not in CI.
//
//   node test/render.ts                 # chromium + firefox
//   node test/render.ts firefox         # one browser
//   node test/render.ts webkit          # Playwright's WebKit build (the Safari engine), when installed
//   node test/render.ts --grep mode     # rows whose id contains "mode"
//   node test/render.ts --html out.html # also write a self-contained page that runs
//                                       # every row in whatever browser opens it (Safari)
//
// Every row asserts the behaviour PORT-PLAN.md Phase 9 specifies, and the
// contrast/ and alpha/ rows that of Phase 10: the browser's --contrast is the
// one the contrast sweep (test/css/contrast.test.ts) predicts. Stylesheets load
// in the order core, themes, adapter, user CSS.
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium, firefox, webkit, type BrowserType } from 'playwright';
import { compileFile, compileSource, coreDir, materialDir } from './lib/sass.ts';
import { declarationsFor, registeredInitialValues, rules, themeSelector } from './lib/css.ts';
import {
  Color,
  contextFor,
  cssColor,
  evaluateColor,
  maxChannelDiff,
  type Mode,
} from './lib/color.ts';

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
  outerBaseBgLight: 'oklch(0.96 0.02 80)',
  accentBLight: 'oklch(0.45 0.18 300)',
  infoBgLight: 'oklch(0.85 0.1 120)',
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
  $weights: t.light-dark(
    t.weights($text-blend: 82%, $text-deemphasis-blend: 55%, $state-hover: 8%, $tints: (10%, 20%, 38%, 60%, 80%)),
    t.weights($text-blend: 78%, $text-deemphasis-blend: 30%, $state-hover: 20%, $tints: (30%, 45%, 55%, 75%, 95%))
  ),
);
@include t.define-theme("${spec.name}", ${variable}${spec.default ? ', $default: true' : ''});
`;
}
// Every weight a derivative embeds differs by mode above, so a derivative that
// froze its weight at the declaring element would show.

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

// The transition list an author puts on the element whose `theme` changes.
const CROSSFADE =
  'transition: --color--primary--mode-light 1s linear, --color--primary--mode-dark 1s linear';
// The same for every registered primary pair, so explicit $bg/$stroke/$focus crossfade too.
const CROSSFADE_ROLES =
  'transition: ' +
  ['', '--bg', '--stroke', '--focus']
    .flatMap((r) => [
      `--color--primary${r}--mode-light 1s linear`,
      `--color--primary${r}--mode-dark 1s linear`,
    ])
    .join(', ');

/**
 * Evaluates a token the way the browser should: core's root rules (defaults,
 * derivations) under the theme's rule, with optional overriding declarations.
 */
function expectFrom(
  sheet: string,
  theme: string,
  token: string,
  mode: Mode,
  overrides?: Record<string, string>,
): string {
  const decls = new Map<string, string>();
  for (const [n, v] of registeredInitialValues(sheets.core)) decls.set(n, v);
  for (const rule of rules(sheets.core))
    if (!rule.context.length && rule.selector.includes(':root'))
      for (const [n, v] of rule.declarations) decls.set(n, v);
  for (const [n, v] of declarationsFor(sheets[sheet], themeSelector(theme))) decls.set(n, v);
  const ctx = contextFor(decls, mode, overrides ? new Map(Object.entries(overrides)) : undefined);
  return evaluateColor(`var(${token})`, ctx).toString();
}

/**
 * What a linear transition between two registered colours shows at half time.
 * Chromium interpolates <color> custom properties in oklab, Firefox in gamma
 * sRGB; both are mid-way, so a crossfade row accepts either. `derive` maps the
 * midpoint to the token under test (a ladder step derived from it).
 */
function midway(
  a: string,
  b: string,
  derive: (mid: string) => string = (m) => m,
): Record<string, string> {
  const mid = (space: string) => Color.mix(cssColor(a), cssColor(b), 0.5, { space }).toString();
  return { 'oklab midpoint': derive(mid('oklab')), 'sRGB midpoint': derive(mid('srgb')) };
}

// ─── Contrast samples (Phase 10) ─────────────────────────────────────────────
// The sweep proves, with colorjs.io, that the --contrast expression in the
// compiled CSS reaches 4.5:1. These rows prove the browsers evaluate that
// expression to the same black or white: `expectFrom` is the sweep's evaluator.
// Each sample is set as the primary pair on a [theme] element, so core
// re-derives every role, ladder step and contrast from it.
const CONTRAST_SAMPLES: [label: string, colour: string][] = [
  // Either side of the step: relative luminance 0.178 and 0.181.
  ['grey-below-step', '#757575'],
  ['grey-above-step', '#767676'],
  // Outside sRGB: the choice follows the clipped colour that is painted. Read
  // unclamped, these three have a luminance below the step and would get white.
  ['outside-srgb-red', 'oklch(0.55 0.32 30)'],
  ['outside-srgb-pink', 'oklch(0.6 0.32 0)'],
  ['outside-srgb-teal', 'oklch(0.55 0.32 190)'],
  ['outside-srgb-p3-green', 'color(display-p3 0 1 0)'],
  // Why no lightness threshold works: the lighter of these two needs white
  // text and the darker needs black.
  ['violet-l-0.59', 'oklch(0.59 0.28 310)'],
  ['green-l-0.56', 'oklch(0.56 0.17 138)'],
  // Any CSS colour format.
  ['hsl-amber', 'hsl(30 100% 40%)'],
  ['rgb-rust', 'rgb(200 60 20)'],
  ['hex-blue', '#0000ff'],
];
const TRANSLUCENT = 'oklch(0.6 0.2 30 / 0.4)';

/** A [theme] element whose primary pair is `colour` in both modes. */
const primaryPair = (colour: string) =>
  `<div id="p" theme="custom" style="--color--primary--mode-light: ${colour}; --color--primary--mode-dark: ${colour}">x</div>`;
const pairOverrides = (colour: string) => ({
  '--color--primary--mode-light': colour,
  '--color--primary--mode-dark': colour,
});

/** `white` or `black`, for a row id that says what the sweep predicts. */
function textName(value: string): string {
  const l = cssColor(value).to('oklch').coords[0] ?? 0;
  return l > 0.99 ? 'white' : l < 0.01 ? 'black' : `neither black nor white, ${value}`;
}

function contrastRows(): Row[] {
  const out: Row[] = [];
  const sample = (label: string, colour: string, token: string) => {
    const expect = expectFrom('alpha', 'alpha', token, 'light', pairOverrides(colour));
    out.push({
      id: `contrast/${label}${token.replace('--color--primary', '')}=${textName(expect)}`,
      sheets: ['core', 'alpha'],
      html: 'theme="alpha"',
      body: primaryPair(colour),
      probe: '#p',
      token,
      expect,
    });
  };
  for (const [label, colour] of CONTRAST_SAMPLES)
    sample(label, colour, '--color--primary--contrast');
  // The contrast of a ladder step and of the auto bg and stroke roles.
  for (const suffix of ['--dark', '--lightest', '--bg', '--bg--darkest', '--stroke'])
    sample('outside-srgb-red', 'oklch(0.55 0.32 30)', `--color--primary${suffix}--contrast`);
  // A shipped preset: every palette's text in both modes (white on warn and
  // caution in light mode is the automatic choice, accepted 2026-11-09).
  for (const mode of ['light', 'dark'] as const)
    for (const name of CORE_PALETTES) {
      const token = `--color--${name}--contrast`;
      const expect = expectFrom('azure', 'azure-blue', token, mode);
      out.push({
        id: `contrast/azure-blue-${mode}-${name}=${textName(expect)}`,
        sheets: ['core', 'azure'],
        html: `theme="azure-blue" themeMode="${mode}"`,
        body: P,
        probe: '#p',
        token,
        expect,
      });
    }
  return out;
}

// Alpha is pinned to 1 in every derivation, so a translucent input gives opaque
// ladder steps, auto roles and text; only the tints carry an alpha (their weight).
function alphaRows(): Row[] {
  // The prediction itself must be opaque (the tint: its 10% weight), so a row
  // cannot pass by browser and evaluator agreeing on a translucent value.
  const predicted = (expect: string, alpha: number): string => {
    const got = cssColor(expect).alpha ?? 1;
    if (Math.abs(got - alpha) > 1e-6)
      throw new Error(`alpha rows: expected alpha ${alpha}, the CSS gives ${expect}`);
    return expect;
  };
  const out: Row[] = ['--dark', '--bg', '--stroke', '--focus', '--contrast', '--tint-1'].map(
    (suffix) => ({
      id: `alpha/translucent-input${suffix}`,
      sheets: ['core', 'alpha'],
      html: 'theme="alpha"',
      body: primaryPair(TRANSLUCENT),
      probe: '#p',
      token: `--color--primary${suffix}`,
      expect: predicted(
        expectFrom(
          'alpha',
          'alpha',
          `--color--primary${suffix}`,
          'light',
          pairOverrides(TRANSLUCENT),
        ),
        suffix === '--tint-1' ? 0.1 : 1,
      ),
    }),
  );
  const brand = 'oklch(0.44 0.22 253 / 0.4)';
  out.push({
    id: 'alpha/translucent-brand-from-brand',
    sheets: ['core', 'brandfx'],
    html: 'theme="brandfx"',
    body: `<div id="p" theme="brandfx" style="--color--brand: ${brand}">x</div>`,
    probe: '#p',
    token: '--color--primary',
    expect: predicted(
      expectFrom('brandfx', 'brandfx', '--color--primary', 'light', { '--color--brand': brand }),
      1,
    ),
  });
  return out;
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
  /** The value, or labelled candidates of which one must match (crossfade rows). */
  expect: string | Record<string, string>;
  /** Tolerance for a colour comparison (sRGB channel, 0–1). */
  tolerance?: number;
  /** JavaScript run in the page before reading (crossfade rows). */
  act?: string;
  /** Element whose transitions are paused at half time (default: the probe). */
  transitioned?: string;
  /** Whether the act must start a transition (crossfade rows) or must not (instant rows). */
  animates?: boolean;
}

const P = '<div id="p">probe</div>';
const CORE_PALETTES = [
  'background',
  'surface',
  'primary',
  'secondary',
  'error',
  'warn',
  'caution',
  'pass',
];
const rows: Row[] = [
  // ── Behaviour today (PORT-PLAN.md) ──────────────────────────────────────
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
    id: 'user-root-override/derivations-follow',
    sheets: ['userRoot', 'core', 'alphaDefault'],
    html: '',
    body: P,
    probe: 'body',
    token: '--color--primary--dark',
    expect: expectFrom('alphaDefault', 'alpha-default', '--color--primary--dark', 'light', {
      '--color--primary': COLOR.user,
    }),
  },
  // Derivations live on :root and every [theme] element, so a base set inline
  // on an element with a theme attribute (any value, even one with no rule)
  // re-derives there.
  {
    id: 'inline-base-rederives/theme-element-without-rule',
    sheets: ['core', 'alpha'],
    html: 'theme="alpha"',
    body: `<div id="p" theme="custom" style="--color--primary: ${COLOR.user}">x</div>`,
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
    body: `<div id="p" theme="brandfx" style="--color--brand: ${COLOR.user}">x</div>`,
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
  // ── Crossfade: a theme switch with a transition on the registered colours
  //    is mid-way at half time; a mode flip is instant at the variable level ──
  {
    id: 'crossfade/theme-switch/base',
    sheets: ['core', 'alpha', 'beta'],
    html: `theme="alpha" style="${CROSSFADE}"`,
    body: P,
    probe: 'html',
    token: '--color--primary',
    act: "document.documentElement.setAttribute('theme', 'beta')",
    animates: true,
    tolerance: 0.04,
    expect: midway(COLOR.alphaLight, COLOR.betaLight),
  },
  {
    id: 'crossfade/theme-switch/ladder-step',
    sheets: ['core', 'alpha', 'beta'],
    html: `theme="alpha" style="${CROSSFADE}"`,
    body: P,
    probe: 'html',
    token: '--color--primary--dark',
    act: "document.documentElement.setAttribute('theme', 'beta')",
    animates: true,
    tolerance: 0.04,
    expect: midway(COLOR.alphaLight, COLOR.betaLight, (mid) =>
      expectFrom('alpha', 'alpha', '--color--primary--dark', 'light', {
        '--color--primary--mode-light': mid,
      }),
    ),
  },
  {
    id: 'crossfade/theme-switch/nested-theme',
    sheets: ['core', 'alpha', 'beta'],
    html: 'theme="alpha"',
    body: `<div id="p" theme="beta" style="${CROSSFADE}">x</div>`,
    probe: '#p',
    token: '--color--primary',
    act: "document.getElementById('p').setAttribute('theme', 'alpha')",
    animates: true,
    tolerance: 0.04,
    expect: midway(COLOR.betaLight, COLOR.alphaLight),
  },
  {
    id: 'crossfade/theme-switch/dark-subtree',
    sheets: ['core', 'alpha', 'beta'],
    html: `theme="alpha" style="${CROSSFADE}"`,
    body: '<div id="p" themeMode="dark">x</div>',
    probe: '#p',
    transitioned: 'html',
    token: '--color--primary',
    act: "document.documentElement.setAttribute('theme', 'beta')",
    animates: true,
    tolerance: 0.04,
    expect: midway(COLOR.alphaDark, COLOR.betaDark),
  },
  {
    id: 'crossfade/mode-flip-is-instant',
    sheets: ['core', 'alphaDefault'],
    html: `theme="alpha-default" style="${CROSSFADE}"`,
    body: P,
    probe: 'body',
    transitioned: 'html',
    token: '--color--primary',
    act: "document.documentElement.setAttribute('themeMode', 'dark')",
    animates: false,
    expect: COLOR.alphaDark,
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
    id: 'mode-absent/os-dark',
    sheets: ['core', 'alphaDefault'],
    html: 'theme="alpha-default"',
    body: P,
    scheme: 'dark',
    probe: 'body',
    token: '--color--primary',
    expect: COLOR.alphaDark,
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
    id: 'mode-invert/plain-element-weight',
    sheets: ['core', 'alphaDefault'],
    html: 'theme="alpha-default" themeMode="dark"',
    body: '<div id="p" themeMode="invert">x</div>',
    probe: '#p',
    token: '--weight--text-blend',
    read: 'raw',
    expect: '82%',
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
    id: 'nested-theme/inherits-unpassed-weight',
    sheets: ['core', 'alphaDefault', 'minimal'],
    html: 'theme="alpha-default"',
    body: '<div id="p" theme="minimal">x</div>',
    probe: '#p',
    token: '--weight--text-blend',
    read: 'raw',
    expect: '82%',
  },
  {
    id: 'nested-theme/inherits-unpassed-palette',
    sheets: ['core', 'alphaDefault', 'minimal'],
    html: 'theme="alpha-default"',
    body: '<div id="p" theme="minimal">x</div>',
    probe: '#p',
    token: '--color--secondary',
    expect: 'oklch(0.4 0.1 100)',
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
  {
    id: 'no-theme/greyscale-fallback',
    sheets: ['core'],
    html: '',
    body: P,
    probe: 'body',
    token: '--color--primary',
    expect: 'oklch(0.2 0 0)',
  },
  {
    id: 'no-theme/background-bg-is-base',
    sheets: ['core'],
    html: '',
    body: P,
    probe: 'body',
    token: '--color--background--bg',
    expect: 'oklch(0.97 0 0)',
  },
  // ── Phase 9 critique (2026-11-10): one row per confirmed defect ─────────
  // A derivative that embeds a mode-varying weight must resolve the weight
  // where it is used, like its colour, or a themeMode subtree mixes flipped
  // colours at the outer weight.
  {
    id: 'mode-on-plain-element/tint',
    sheets: ['core', 'alphaDefault'],
    html: 'theme="alpha-default"',
    body: '<div id="p" themeMode="dark">x</div>',
    probe: '#p',
    token: '--color--primary--tint-1',
    expect: `${COLOR.alphaDark.slice(0, -1)} / 0.3)`,
  },
  {
    id: 'mode-in-palette-scope/tint',
    sheets: ['core', 'alphaDefault'],
    html: 'theme="alpha-default"',
    body: '<div palette="primary"><div id="p" themeMode="dark">x</div></div>',
    probe: '#p',
    token: '--palette-color--tint-1',
    expect: `${COLOR.alphaDark.slice(0, -1)} / 0.3)`,
  },
  {
    id: 'mode-in-filled-scope/deemphasis-weight',
    sheets: ['core', 'alphaDefault'],
    html: 'theme="alpha-default"',
    body: '<div palette="primary" filled><div id="p" themeMode="dark">x</div></div>',
    probe: '#p',
    token: '--container--text-deemphasis',
    // black (the contrast of the dark primary) mixed into the dark primary at
    // the dark 30% weight, what the same page gives with themeMode on <html>.
    expect: 'oklch(0.56 0.07 283)',
  },
  {
    id: 'mat-sys/nested-mode-state-opacity',
    sheets: ['core', 'alphaDefault', 'material'],
    html: 'theme="alpha-default"',
    body: '<div id="p" themeMode="dark">x</div>',
    probe: '#p',
    token: '--mat-sys-hover-state-layer-opacity',
    read: 'raw',
    expect: '20%',
  },
  // background/surface keep their base as the bg role; a nested theme that
  // does not pass them inherits that base, not the outer's $color override.
  {
    id: 'nested-theme/inherits-background-base-as-bg',
    sheets: ['core', 'outerBase', 'minimal'],
    html: 'theme="outer-base"',
    body: '<div id="p" theme="minimal">x</div>',
    probe: '#p',
    token: '--color--background--bg',
    expect: COLOR.outerBaseBgLight,
  },
  // An author's :root rule wins wherever it is placed, also on the element
  // that carries the theme attribute (the theme rule is (0,0,1), not (0,1,0)).
  {
    id: 'user-root-override/before-library-html-theme',
    sheets: ['userRoot', 'core', 'alphaDefault'],
    html: 'theme="alpha-default"',
    body: P,
    probe: 'body',
    token: '--color--primary',
    expect: COLOR.user,
  },
  {
    id: 'user-root-override/before-presets-html-theme',
    sheets: ['userRoot', 'core', 'azure', 'rose'],
    html: 'theme="azure-blue"',
    body: P,
    probe: 'body',
    token: '--color--primary',
    expect: COLOR.user,
  },
  // The adaptor's [palette] remap beats the adapter's [theme] re-declaration
  // on an element that carries both attributes.
  {
    id: 'mat-sys/palette-on-theme-element',
    sheets: ['core', 'adaptorPair', 'material'],
    html: '',
    body: '<div id="p" theme="adaptor-b" palette="accent">x</div>',
    probe: '#p',
    token: '--mat-sys-primary',
    expect: COLOR.accentBLight,
  },
  // Two separately compiled theme stylesheets share a custom palette name: the
  // second one's derivations must not beat the default theme's explicit roles.
  {
    id: 'custom-palette/separate-stylesheets-keep-default-explicit-bg',
    sheets: ['core', 'infoA', 'infoB'],
    html: '',
    body: P,
    probe: 'body',
    token: '--color--info--bg',
    expect: COLOR.infoBgLight,
  },
  // Auto-derived bg/stroke/focus live in their registered pairs, so a switch
  // between a theme that leaves them to core and one that passes them
  // explicitly crossfades in both directions when the pairs are transitioned.
  {
    id: 'crossfade/theme-switch/auto-to-explicit-bg',
    sheets: ['core', 'alpha', 'outer'],
    html: `theme="alpha" style="${CROSSFADE_ROLES}"`,
    body: '<div id="p" themeMode="dark">x</div>',
    probe: '#p',
    transitioned: 'html',
    token: '--color--primary--bg',
    act: "document.documentElement.setAttribute('theme', 'outer')",
    animates: true,
    tolerance: 0.04,
    expect: midway(expectFrom('alpha', 'alpha', '--color--primary--bg', 'dark'), COLOR.outerBgDark),
  },
  {
    id: 'crossfade/theme-switch/explicit-to-auto-bg',
    sheets: ['core', 'alpha', 'outer'],
    html: `theme="outer" style="${CROSSFADE_ROLES}"`,
    body: '<div id="p" themeMode="dark">x</div>',
    probe: '#p',
    transitioned: 'html',
    token: '--color--primary--bg',
    act: "document.documentElement.setAttribute('theme', 'alpha')",
    animates: true,
    tolerance: 0.04,
    expect: midway(COLOR.outerBgDark, expectFrom('alpha', 'alpha', '--color--primary--bg', 'dark')),
  },
  // A hand-written override of the registered pair re-derives every role.
  {
    id: 'inline-pair-rederives/bg',
    sheets: ['core', 'alpha'],
    html: 'theme="alpha"',
    body: `<div id="p" theme="custom" style="--color--primary--mode-light: ${COLOR.user}; --color--primary--mode-dark: ${COLOR.user}">x</div>`,
    probe: '#p',
    token: '--color--primary--bg',
    expect: expectFrom('alpha', 'alpha', '--color--primary--bg', 'light', {
      '--color--primary--mode-light': COLOR.user,
    }),
  },
  // ── Phase 10: contrast and alpha ────────────────────────────────────────
  ...contrastRows(),
  ...alphaRows(),
];

// A theme that passes one palette and nothing else, for the inheritance rows.
sheets.minimal = compileSource(
  `@use "../../scss/theme" as t;
@include t.define-theme("minimal", t.theme($palettes: (
  primary: t.light-dark(t.palette(${COLOR.betaLight}), t.palette(${COLOR.betaDark})),
)));`,
  path.join(coreDir, 'test/fixtures/__render-minimal.scss'),
).css;

// An outer theme whose background palette has a $color override: its bg role
// stays the base, and a nested theme must inherit that base.
sheets.outerBase = compileSource(
  `@use "../../scss/theme" as t;
@include t.define-theme("outer-base", t.theme($palettes: (
  background: t.light-dark(
    t.palette(${COLOR.outerBaseBgLight}, $color: oklch(0.88 0.06 80)),
    t.palette(oklch(0.2 0.02 80), $color: oklch(0.32 0.06 80))),
)));`,
  path.join(coreDir, 'test/fixtures/__render-outer-base.scss'),
).css;

// Two separately compiled stylesheets that both use the custom palette "info";
// the first is the default theme and passes an explicit $bg.
sheets.infoA = compileSource(
  `@use "../../scss/theme" as t;
@include t.define-theme("info-a", t.theme($palettes: (
  info: t.light-dark(
    t.palette(oklch(0.5 0.15 200), $bg: ${COLOR.infoBgLight}),
    t.palette(oklch(0.75 0.12 200), $bg: oklch(0.35 0.1 120))),
)), $default: true);`,
  path.join(coreDir, 'test/fixtures/__render-info-a.scss'),
).css;
sheets.infoB = compileSource(
  `@use "../../scss/theme" as t;
@include t.define-theme("info-b", t.theme($palettes: (
  info: t.light-dark(t.palette(oklch(0.45 0.1 60)), t.palette(oklch(0.8 0.1 60))),
)));`,
  path.join(coreDir, 'test/fixtures/__render-info-b.scss'),
).css;

// Two themes defined with the Material adaptor, sharing the custom palette "accent".
sheets.adaptorPair = compileSource(
  `@use "../../../theme-core/scss/theme" as t;
@use "../../scss/material" as mat;
$a: t.theme($palettes: (
  primary: t.light-dark(t.palette(${COLOR.alphaLight}), t.palette(${COLOR.alphaDark})),
  accent: t.light-dark(t.palette(oklch(0.5 0.2 150)), t.palette(oklch(0.75 0.15 150))),
));
$b: t.theme($palettes: (
  primary: t.light-dark(t.palette(${COLOR.betaLight}), t.palette(${COLOR.betaDark})),
  accent: t.light-dark(t.palette(${COLOR.accentBLight}), t.palette(oklch(0.78 0.12 300))),
));
@include t.define-theme("adaptor-a", $a, $default: true, $adaptor: mat.adaptor());
@include t.define-theme("adaptor-b", $b, $adaptor: mat.adaptor());`,
  path.join(materialDir, 'test/fixtures/__render-adaptor-pair.scss'),
).css;

// ─── Runner ──────────────────────────────────────────────────────────────────
function pageHtml(row: Row, scheme?: 'light' | 'dark'): string {
  const styles = row.sheets
    .map((k) => {
      let css = sheets[k];
      // The self-contained page cannot emulate the OS scheme; pin the media query.
      if (scheme)
        css = css.replaceAll(
          '@media (prefers-color-scheme: dark)',
          scheme === 'dark' ? '@media all' : '@media not all',
        );
      return `<style data-sheet="${k}">${css}</style>`;
    })
    .join('\n');
  return `<!doctype html><html ${row.html}><head><meta charset="utf-8">${styles}</head><body>${row.body}</body></html>`;
}

interface Outcome {
  ok: boolean;
  detail: string;
}

// Runs inside the page: reads the token on the probe, after the act when there is one.
const probeScript = `(({ probe, token, read, act, transitioned, animates }) => {
  const el = document.querySelector(probe);
  if (!el) return { error: 'no element matches ' + probe };
  const readValue = () => {
    if (read === 'raw') return getComputedStyle(el).getPropertyValue(token).trim();
    const span = document.createElement('span');
    span.style.color = 'var(' + token + ')';
    el.appendChild(span);
    const v = getComputedStyle(span).color;
    span.remove();
    return v;
  };
  if (!act) return { value: readValue() };
  const tEl = transitioned ? document.querySelector(transitioned) : el;
  readValue(); // flush the start state
  new Function(act)();
  getComputedStyle(tEl).color; // flush the change so the transition starts
  const animations = tEl.getAnimations();
  for (const a of animations) { a.pause(); a.currentTime = 500; }
  return { value: readValue(), animations: animations.length };
})`;

function candidates(row: Row): [label: string, value: string][] {
  return typeof row.expect === 'string' ? [['', row.expect]] : Object.entries(row.expect);
}

function judge(row: Row, value: string, animations: number | undefined): Outcome {
  if (row.animates === true && !animations)
    return { ok: false, detail: `no transition ran; value ${value}` };
  if (row.animates === false && animations)
    return { ok: false, detail: `${animations} transition(s) ran; value ${value}` };
  const expected = candidates(row);
  if (row.read === 'raw')
    return {
      ok: expected.some(([, v]) => v === value),
      detail: `${value} expected ${expected[0][1]}`,
    };
  try {
    const got = cssColor(value);
    // Channels and alpha: a tint whose colour flipped but whose alpha did not must fail.
    const diff = (a: Color, b: Color) =>
      Math.max(maxChannelDiff(a, b), Math.abs((a.alpha ?? 1) - (b.alpha ?? 1)));
    const scored = expected
      .map(([label, v]) => ({ label, v, diff: diff(got, cssColor(v)) }))
      .sort((a, b) => a.diff - b.diff);
    const best = scored[0];
    const ok = best.diff < (row.tolerance ?? 0.02);
    const detail =
      ok && best.label
        ? `${best.label}`
        : `${value} expected ${scored.map((s) => s.v).join(' or ')}`;
    return { ok, detail };
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
  // WebKit under Playwright's emulated dark scheme resolves light-dark() to dark
  // whatever color-scheme says (even on html), which real Safari does not do. So
  // WebKit gets the OS scheme pinned into the CSS instead, like the --html page.
  const pinScheme = type.name() === 'webkit';
  for (const row of selected) {
    if (!pinScheme) await page.emulateMedia({ colorScheme: row.scheme ?? 'light' });
    await page.setContent(pageHtml(row, pinScheme ? (row.scheme ?? 'light') : undefined));
    const input = {
      probe: row.probe,
      token: row.token,
      read: row.read ?? 'paint',
      act: row.act ?? '',
      transitioned: row.transitioned ?? '',
      animates: row.animates ?? null,
    };
    const r = (await page.evaluate(`(${probeScript})(${JSON.stringify(input)})`)) as {
      value?: string;
      animations?: number;
      error?: string;
    };
    results.set(
      row.id,
      'error' in r && r.error ? { ok: false, detail: r.error } : judge(row, r.value!, r.animations),
    );
  }
  await browser.close();
  return results;
}

// ─── Self-contained page (Safari by hand) ────────────────────────────────────
// Every row's page goes into an iframe; a script runs the same probe in the
// host browser and compares colours by painting the expected value in the same
// frame, so no colour maths is needed in the page.
function selfContainedPage(selected: Row[]): string {
  const data = selected.map((row) => ({
    id: row.id,
    srcdoc: pageHtml(row, row.scheme ?? 'light'),
    probe: row.probe,
    token: row.token,
    read: row.read ?? 'paint',
    act: row.act ?? '',
    transitioned: row.transitioned ?? '',
    animates: row.animates ?? null,
    expect: candidates(row).map(([, v]) => v),
    tolerance: row.tolerance ?? 0.02,
  }));
  return `<!doctype html><html><head><meta charset="utf-8"><title>cp-theming render check</title>
<style>
body{font:14px/1.5 system-ui;margin:24px;max-width:1100px}
table{border-collapse:collapse;width:100%}td,th{padding:4px 8px;border-bottom:1px solid #ccc;text-align:left;vertical-align:top}
.ok{color:#1b7f2a}.fail{color:#b3261e}code{font-size:12px}iframe{position:absolute;left:-9999px;width:300px;height:100px}
</style></head><body>
<h1>cp-theming — render.ts rows in this browser</h1>
<p id="summary">running…</p>
<p><small>Generated by <code>node test/render.ts --html</code>. Each row runs in an iframe with the compiled CSS; the OS colour scheme is pinned per row. Colours are compared after this browser paints both values.</small></p>
<table><thead><tr><th>row</th><th>result</th><th>got</th><th>expected</th></tr></thead><tbody id="rows"></tbody></table>
<script>
const ROWS = ${JSON.stringify(data)};
const probe = ${probeScript};
function parseColor(s){const m=s.match(/[-\\d.e]+/g);return m?m.map(Number):null}
function painted(doc, value){const d=doc.createElement('div');d.style.color=value;doc.body.appendChild(d);const c=doc.defaultView.getComputedStyle(d).color;d.remove();return c}
function canvasRgb(value){const c=document.createElement('canvas');c.width=c.height=1;const x=c.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,1,1);x.fillStyle=value;x.fillRect(0,0,1,1);return [...x.getImageData(0,0,1,1).data].slice(0,3).map(v=>v/255)}
async function run(){
  const tbody=document.getElementById('rows');let pass=0;
  for(const row of ROWS){
    const f=document.createElement('iframe');f.srcdoc=row.srcdoc;document.body.appendChild(f);
    await new Promise(r=>f.onload=r);
    const win=f.contentWindow;let r;
    try{ r=win.eval('('+probe.toString()+')')(row);}catch(e){r={error:String(e)}}
    let ok=false,got=r.error||r.value,exp=row.expect;
    if(!r.error){
      if(row.animates===true&&!r.animations){got+=' (no transition ran)'}
      else if(row.animates===false&&r.animations){got+=' ('+r.animations+' transition ran)'}
      else if(row.read==='raw'){ok=row.expect.includes(r.value)}
      else{const a=canvasRgb(r.value);ok=row.expect.some(e=>{const b=canvasRgb(e);return Math.max(...a.map((v,i)=>Math.abs(v-b[i])))<row.tolerance});}
    }
    if(ok)pass++;
    const tr=document.createElement('tr');tr.innerHTML='<td><code>'+row.id+'</code></td><td class="'+(ok?'ok':'fail')+'">'+(ok?'✔':'✘')+'</td><td><code>'+got+'</code></td><td><code>'+exp.join('<br>or ')+'</code></td>';
    tbody.appendChild(tr);f.remove();
  }
  document.getElementById('summary').textContent=navigator.userAgent+' — '+pass+' of '+ROWS.length+' rows pass';
}
run();
</script></body></html>`;
}

// ─── Main ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const option = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? (args[i + 1] ?? '') : null;
};
const grep = option('--grep');
const htmlOut = option('--html');
const wanted = args.filter(
  (a, i) => !a.startsWith('--') && args[i - 1] !== '--grep' && args[i - 1] !== '--html',
);
const ALL: [string, BrowserType][] = [
  ['chromium', chromium],
  ['firefox', firefox],
  ['webkit', webkit],
];
const browsers = ALL.filter(([name]) =>
  wanted.length === 0 ? name !== 'webkit' : wanted.includes(name),
);
const selected = grep ? rows.filter((r) => r.id.includes(grep)) : rows;

if (htmlOut !== null) {
  const file = path.resolve(htmlOut || path.join(coreDir, 'dist/render.html'));
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, selfContainedPage(selected));
  console.log(`wrote ${file}`);
}

const outcomes = new Map<string, Map<string, Outcome>>();
for (const [name, type] of browsers) outcomes.set(name, await runBrowser(type, selected));

const width = Math.max(...selected.map((r) => r.id.length));
let failed = 0;
for (const row of selected) {
  const cells = browsers.map(([name]) => {
    const o = outcomes.get(name)!.get(row.id)!;
    if (!o.ok) failed++;
    const note = o.ok ? (typeof row.expect === 'string' ? '' : ` (${o.detail})`) : `: ${o.detail}`;
    return `${o.ok ? '✔' : '✘'} ${name}${note}`;
  });
  console.log(`${row.id.padEnd(width)}  ${cells.join('   ')}`);
}
console.log('');
for (const [name] of browsers) {
  const pass = selected.filter((r) => outcomes.get(name)!.get(r.id)!.ok).length;
  console.log(`${name}: ${pass} of ${selected.length} rows pass`);
}
process.exit(failed ? 1 : 0);
