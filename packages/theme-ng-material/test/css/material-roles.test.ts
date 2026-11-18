// Check 6 (adapter) — the --mat-sys-* tokens against the installed Angular
// Material: every name its component styles read is declared; every role of
// its own tables is declared; the surface roles keep M3's lightness order in
// both modes; and the declarations sit on the selectors the cascade needs.
//
// Nothing about Material is restated here: the names read come from the
// component styles compiled into node_modules/@angular/material/fesm2022, and
// the roles and their tone numbers from Material's own Sass tables.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import {
  declarationsFor,
  normalizeSelector,
  rules,
  themeSelector,
} from '../../../theme-core/test/lib/css.ts';
import { compileSource, materialDir, repoRoot } from '../../../theme-core/test/lib/sass.ts';
import {
  contextFor,
  cssColor,
  evaluateColor,
  maxChannelDiff,
  wcagContrast,
  type Mode,
} from '../../../theme-core/test/lib/color.ts';
import {
  coreFixtureSheets,
  coreSheets,
  materialFixtureSheets,
  materialSheets,
  themeDeclarations,
  themeName,
} from '../../../theme-core/test/lib/sets.ts';

const MODES: Mode[] = ['light', 'dark'];
const ROOT_AND_THEME = ':root, :where([theme])';
/** Where the accent component tokens are: no specificity (issue #9). */
const ACCENT_TOKENS = ':where(:root, [theme])';
/** A component token, as opposed to a --mat-sys-* role. */
const isComponentToken = (name: string) =>
  name.startsWith('--mat-') && !name.startsWith('--mat-sys-');

const { core, presets } = coreSheets();
const adapterCore = materialSheets().find((s) => s.label.endsWith('material-core.scss'))!;
const adapterRules = rules(adapterCore.css);
/** What the adapter declares on :root (both of its root rules). */
const rootDecls = declarationsFor(adapterCore.css, ':root');

// ─── What the installed Material reads and defines ───────────────────────────

const matDir = path.join(repoRoot, 'node_modules/@angular/material');
const matVersion: string = JSON.parse(
  readFileSync(path.join(matDir, 'package.json'), 'utf8'),
).version;

/** Every --mat-sys-* name a component style reads, with the bundles that read it. */
function componentReads(): Map<string, Set<string>> {
  const reads = new Map<string, Set<string>>();
  const dir = path.join(matDir, 'fesm2022');
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.mjs'))) {
    const text = readFileSync(path.join(dir, file), 'utf8');
    for (const m of text.matchAll(/var\(\s*(--mat-sys-[\w-]+)/g)) {
      if (!reads.has(m[1])) reads.set(m[1], new Set());
      reads.get(m[1])!.add(file);
    }
  }
  return reads;
}

/**
 * Material's role tables with every palette tone replaced by its own number,
 * so each role reads back as the tone the table gives it: mode → role → tone.
 */
function tableTones(): Record<Mode, Map<string, number>> {
  const { css } = compileSource(
    `@use "sass:map";
@use "@angular/material/core/tokens/m3/md-sys-color" as md;
$tones: ();
@for $t from 0 through 100 { $tones: map.set($tones, $t, $t); }
$palettes: (primary: $tones, secondary: $tones, tertiary: $tones, error: $tones, neutral: $tones, neutral-variant: $tones);
light { @each $role, $tone in md.md-sys-color-values-light($palettes) { #{$role}: $tone; } }
dark { @each $role, $tone in md.md-sys-color-values-dark($palettes) { #{$role}: $tone; } }`,
    path.join(materialDir, 'test/fixtures/__role-tables.scss'),
  );
  const read = (mode: Mode) =>
    new Map(
      rules(css)
        .find((r) => r.selector === mode)!
        .declarations.map(([role, tone]) => [role, Number(tone)]),
    );
  return { light: read('light'), dark: read('dark') };
}

const reads = componentReads();
const tones = tableTones();

// ─── Declared names ──────────────────────────────────────────────────────────

test(`every --mat-sys-* name read by the Angular Material ${matVersion} component styles is declared on :root`, (t) => {
  // A moved bundle directory or a renamed prefix must not make this vacuous.
  assert.ok(reads.size >= 50, `only ${reads.size} names found in fesm2022`);
  for (const name of ['--mat-sys-primary', '--mat-sys-on-surface', '--mat-sys-body-large'])
    assert.ok(reads.has(name), `${name} is read by a component style`);
  t.diagnostic(`${reads.size} names read, ${rootDecls.size} declared`);
  const missing = [...reads.keys()]
    .filter((n) => !rootDecls.has(n))
    .sort()
    .map((n) => `${n} (${[...reads.get(n)!].join(', ')})`);
  assert.deepEqual(missing, []);
});

test(`every colour role of Angular Material ${matVersion}'s role tables is declared, and the two palette tones outside them`, () => {
  assert.ok(tones.light.size >= 40, `only ${tones.light.size} roles in the light table`);
  assert.deepEqual([...tones.dark.keys()].sort(), [...tones.light.keys()].sort());
  const expected = [...tones.light.keys(), 'neutral10', 'neutral-variant20'];
  assert.deepEqual(
    expected.filter((role) => !rootDecls.has(`--mat-sys-${role}`)),
    [],
  );
});

// Roles cp-theming already has a token for point at it; nothing is derived twice.
// The container is the bg role, one ladder step lighter in dark mode.
const accent = (role: string, name: string): [string, string][] => [
  [role, `var(--color--${name})`],
  [`on-${role}`, `var(--color--${name}--contrast)`],
  [`${role}-container`, `light-dark(var(--color--${name}--bg), var(--color--${name}--bg--light))`],
  [
    `on-${role}-container`,
    `light-dark(var(--color--${name}--bg--contrast), var(--color--${name}--bg--light--contrast))`,
  ],
];
const DIRECT: [string, string][] = [
  ...accent('primary', 'primary'),
  ...accent('secondary', 'secondary'),
  ...accent('tertiary', 'tertiary'),
  ...accent('error', 'error'),
  ['surface', 'var(--color--surface)'],
  ['on-surface', 'var(--color--surface--contrast)'],
  // Muted text (issue #13): core's de-emphasis mix, against the surface.
  [
    'on-surface-variant',
    'light-dark(' +
      ['light', 'dark']
        .map(
          (mode) =>
            `color-mix(in oklch, var(--color--surface--contrast) var(--weight--text-deemphasis-blend--mode-${mode}), var(--color--surface))`,
        )
        .join(', ') +
      ')',
  ],
  // One scale (issue #12): the five containers are core's.
  ['surface-container-lowest', 'var(--color--surface--container-lowest)'],
  ['surface-container-low', 'var(--color--surface--container-low)'],
  ['surface-container', 'var(--color--surface--container)'],
  ['surface-container-high', 'var(--color--surface--container-high)'],
  ['surface-container-highest', 'var(--color--surface--container-highest)'],
  ['background', 'var(--color--background)'],
  ['on-background', 'var(--color--background--contrast)'],
  ['outline', 'var(--color--surface--stroke)'],
  ['outline-variant', 'var(--color--surface--stroke--low)'],
  ['scrim', 'var(--overlay--scrim)'],
  ['shadow', 'var(--overlay--shadow)'],
];

test('the roles cp-theming has a token for map straight to it; every other role is derived', () => {
  const direct = new Map(DIRECT);
  for (const role of tones.light.keys()) {
    const value = rootDecls.get(`--mat-sys-${role}`)!;
    if (direct.has(role)) assert.equal(value, direct.get(role), role);
    else assert.match(value, /oklch\(from var\(--color--/, `${role} is derived in the browser`);
  }
});

// ─── Values Material can use ─────────────────────────────────────────────────

test('the state-layer opacities are numbers: each weight divided by 100%', () => {
  // Material builds `calc(var(--mat-sys-…-state-layer-opacity) * 100%)` for
  // color-mix(); a bare cp-theming weight (a percentage) makes that invalid.
  const expected: [string, string][] = [
    ['hover', 'hover'],
    ['focus', 'focus'],
    ['pressed', 'press'],
    ['dragged', 'drag'],
  ];
  const rulesWithLayers = adapterRules.filter((r) =>
    r.declarations.some(([n]) => n.endsWith('-state-layer-opacity')),
  );
  assert.deepEqual(rulesWithLayers.map((r) => normalizeSelector(r.selector)).sort(), [
    ':root, :where([theme])',
    ':where([themeMode])',
  ]);
  for (const rule of rulesWithLayers) {
    const decls = new Map(rule.declarations);
    for (const [state, weight] of expected)
      assert.equal(
        decls.get(`--mat-sys-${state}-state-layer-opacity`),
        `calc(var(--weight--state-${weight}) / 100%)`,
        `${rule.selector} ${state}`,
      );
  }
  // …and Material does read them that way, or the division would be the bug.
  const usage = readFileSync(path.join(matDir, 'fesm2022/_option-chunk.mjs'), 'utf8');
  assert.match(usage, /calc\(var\(--mat-sys-hover-state-layer-opacity\) \* 100%\)/);
});

test(`every component token the adapter sets is one Angular Material ${matVersion} reads`, () => {
  // A patch for a token Material never reads does nothing and hides that it does nothing.
  const bundles = readdirSync(path.join(matDir, 'fesm2022'))
    .filter((f) => f.endsWith('.mjs'))
    .map((f) => readFileSync(path.join(matDir, 'fesm2022', f), 'utf8'))
    .join('\n');
  const set = new Set(
    materialSheets()
      .flatMap((s) => rules(s.css))
      .flatMap((r) => r.declarations.map(([n]) => n))
      .filter((n) => n.startsWith('--mat-') && !n.startsWith('--mat-sys-')),
  );
  assert.ok(set.size > 10, `only ${set.size} component tokens found`);
  assert.deepEqual(
    [...set].filter((n) => !bundles.includes(`var(${n},`) && !bundles.includes(`var(${n})`)),
    [],
  );
});

// ─── Selectors ───────────────────────────────────────────────────────────────

test('tokens that read a cp-theming variable are on `:root, :where([theme])`; literal constants on :root only', () => {
  const shared = adapterRules.filter((r) => normalizeSelector(r.selector) === ROOT_AND_THEME);
  const rootOnly = adapterRules.filter((r) => normalizeSelector(r.selector) === ':root');
  assert.equal(shared.length, 1, 'one shared rule');
  assert.equal(rootOnly.length, 1, 'one :root rule');
  assert.deepEqual(
    shared[0].declarations.filter(([, v]) => !v.includes('var(--')).map(([n]) => n),
    [],
    'a literal constant does not need re-declaring on [theme]',
  );
  assert.deepEqual(
    rootOnly[0].declarations.filter(([, v]) => v.includes('var(')).map(([n]) => n),
    [],
    'a var() on :root alone would not follow a nested theme',
  );
  // No selector other than these, the accent tokens' rule, [themeMode] and
  // [palette="name"] declares a token.
  const others = adapterRules
    .map((r) => normalizeSelector(r.selector))
    .filter(
      (s) =>
        s !== ROOT_AND_THEME &&
        s !== ACCENT_TOKENS &&
        s !== ':root' &&
        s !== ':where([themeMode])' &&
        !/^\[palette=[\w-]+\]$/.test(s),
    );
  assert.deepEqual(others, []);
});

// ─── Accents as text and as lines (issues #15 and #9) ────────────────────────

// Material paints these in `primary` or `error`. A label takes the palette's
// text role, a line its stroke. Written out here, not read from the Sass: a
// token that moves from one list to the other, or leaves, has to be moved here.
const PRIMARY_LABELS = [
  '--mat-button-text-label-text-color',
  '--mat-button-outlined-label-text-color',
  '--mat-button-protected-label-text-color',
  '--mat-form-field-filled-focus-label-text-color',
  '--mat-form-field-outlined-focus-label-text-color',
];
const PRIMARY_LINES = [
  '--mat-form-field-filled-caret-color',
  '--mat-form-field-filled-focus-active-indicator-color',
  '--mat-form-field-outlined-caret-color',
  '--mat-form-field-outlined-focus-outline-color',
  '--mat-form-field-focus-select-arrow-color',
  '--mat-select-focused-arrow-color',
];
const ERROR_LABELS = [
  '--mat-stepper-header-error-state-label-text-color',
  '--mat-stepper-header-error-state-icon-foreground-color',
  '--mat-form-field-error-text-color',
  '--mat-form-field-error-trailing-icon-color',
  '--mat-form-field-error-focus-trailing-icon-color',
  '--mat-form-field-filled-error-label-text-color',
  '--mat-form-field-filled-error-focus-label-text-color',
  '--mat-form-field-outlined-error-label-text-color',
  '--mat-form-field-outlined-error-focus-label-text-color',
];
const ERROR_LINES = [
  '--mat-form-field-filled-error-caret-color',
  '--mat-form-field-filled-error-active-indicator-color',
  '--mat-form-field-filled-error-focus-active-indicator-color',
  '--mat-form-field-outlined-error-caret-color',
  '--mat-form-field-outlined-error-outline-color',
  '--mat-form-field-outlined-error-focus-outline-color',
  '--mat-select-invalid-arrow-color',
];
/** The accent tokens a scope declares for palette `name`. */
const accentTokens = (name: string): [string, string][] => [
  ...PRIMARY_LABELS.map((t): [string, string] => [t, `var(--color--${name}--text)`]),
  ...PRIMARY_LINES.map((t): [string, string] => [t, `var(--color--${name}--stroke)`]),
];
const byName = (a: [string, string], b: [string, string]) => a[0].localeCompare(b[0]);

test('labels in primary and in error read the palette’s text role, lines its stroke, on the theme elements', () => {
  const found = adapterRules.filter((r) => normalizeSelector(r.selector) === ACCENT_TOKENS);
  assert.equal(found.length, 1, 'one rule');
  assert.deepEqual(
    [...found[0].declarations].sort(byName),
    [
      ...accentTokens('primary'),
      ...ERROR_LABELS.map((t): [string, string] => [t, 'var(--color--error--text)']),
      ...ERROR_LINES.map((t): [string, string] => [t, 'var(--color--error--stroke)']),
    ].sort(byName),
  );
});

test('no accent token is declared on a component: a value set on an ancestor reaches it (issue #9)', () => {
  // Every rule of both sheets that declares one of these tokens matches a
  // theme element or a [palette] scope, never a Material class or element.
  const all = [...PRIMARY_LABELS, ...PRIMARY_LINES, ...ERROR_LABELS, ...ERROR_LINES];
  const where = materialSheets()
    .flatMap((s) => rules(s.css))
    .filter((r) => r.declarations.some(([n]) => all.includes(n)))
    .map((r) => normalizeSelector(r.selector))
    .filter((s) => s !== ACCENT_TOKENS && !/^\[palette=[\w-]+\]$/.test(s));
  assert.deepEqual(where, []);
  // …and the adapter no longer works a lightness out itself: it reads core's role.
  for (const s of materialSheets())
    assert.doesNotMatch(s.css, /min\(l, 0\.4\)|max\(l, 0\.82\)/, s.label);
});

// ─── [palette] scopes ────────────────────────────────────────────────────────

test('a [palette] scope re-declares exactly the roles the tables derive from the primary palette', () => {
  // The tables again, with a tone only where the role reads the primary palette.
  const { css } = compileSource(
    `@use "sass:map";
@use "@angular/material/core/tokens/m3/md-sys-color" as md;
$tones: ();
@for $t from 0 through 100 { $tones: map.set($tones, $t, $t); }
primary { @each $role, $tone in md.md-sys-color-values-light((primary: $tones)) { @if $tone { #{$role}: $tone; } } }`,
    path.join(materialDir, 'test/fixtures/__primary-roles.scss'),
  );
  const primaryRoles = rules(css)[0]
    .declarations.map(([role]) => `--mat-sys-${role}`)
    .sort();
  assert.ok(primaryRoles.length >= 8, `only ${primaryRoles.length} primary roles`);

  const scopes = adapterRules.filter((r) => /^\[palette=/.test(normalizeSelector(r.selector)));
  assert.ok(scopes.length > 0, 'the adapter emits [palette] rules');
  for (const scope of scopes) {
    const name = /^\[palette=([\w-]+)\]$/.exec(normalizeSelector(scope.selector))![1];
    const roles = scope.declarations.filter(([n]) => !isComponentToken(n));
    assert.deepEqual(roles.map(([n]) => n).sort(), primaryRoles, name);
    // …and each is the root's expression with this palette as the origin.
    for (const [token, value] of roles)
      assert.equal(
        value,
        rootDecls.get(token)!.replaceAll('var(--color--primary', `var(--color--${name}`),
        `${name} ${token}`,
      );
    // With the roles, the labels and lines Material paints in primary: this
    // palette's text and stroke. The error ones are left to the theme element,
    // as --mat-sys-error is.
    assert.deepEqual(
      scope.declarations.filter(([n]) => isComponentToken(n)).sort(byName),
      accentTokens(name).sort(byName),
      name,
    );
  }
});

test('mat.adaptor() gives a custom palette name the same scope: roles, labels and lines', () => {
  const fixture = materialFixtureSheets().find((s) => s.label.endsWith('adaptor-theme.scss'))!;
  const scope = rules(fixture.css).find(
    (r) =>
      normalizeSelector(r.selector) === '[palette=accent]' &&
      r.declarations.some(([n]) => n === '--mat-sys-primary'),
  )!;
  assert.deepEqual(
    scope.declarations.filter(([n]) => isComponentToken(n)).sort(byName),
    accentTokens('accent').sort(byName),
  );
});

// ─── Surface order ───────────────────────────────────────────────────────────

/** surface, -dim, -bright and the five containers: the roles read from the neutral palette as a surface. */
const SURFACE_ROLES = [...tones.light.keys()].filter(
  (r) => /^surface(-|$)/.test(r) && r !== 'surface-tint' && r !== 'surface-variant',
);

const themes = [...presets, ...coreFixtureSheets(), ...materialFixtureSheets()].map((s) => {
  const decls = themeDeclarations(core, s, themeName(s));
  for (const [n, v] of rootDecls) decls.set(n, v);
  return { label: s.label, decls };
});

test('the surface roles are the eight M3 names', () => {
  assert.deepEqual(
    [...SURFACE_ROLES].sort(),
    [
      'surface',
      'surface-bright',
      'surface-container',
      'surface-container-high',
      'surface-container-highest',
      'surface-container-low',
      'surface-container-lowest',
      'surface-dim',
    ].sort(),
  );
});

for (const theme of themes) {
  test(`core + ${theme.label} + adapter: the surface roles keep M3's lightness order in both modes`, (t) => {
    for (const mode of MODES) {
      const ctx = contextFor(theme.decls, mode);
      const lightness = new Map(
        SURFACE_ROLES.map((role) => [
          role,
          evaluateColor(`var(--mat-sys-${role})`, ctx).to('oklch').coords[0] ?? 0,
        ]),
      );
      const ordered = [...SURFACE_ROLES].sort((a, b) => tones[mode].get(a)! - tones[mode].get(b)!);
      t.diagnostic(
        `${mode}: ` +
          ordered
            .map((r) => `${r.replace('surface', 's')} ${lightness.get(r)!.toFixed(3)}`)
            .join(' < '),
      );
      for (const a of SURFACE_ROLES)
        for (const b of SURFACE_ROLES) {
          const [ta, tb] = [tones[mode].get(a)!, tones[mode].get(b)!];
          const [la, lb] = [lightness.get(a)!, lightness.get(b)!];
          if (ta === tb) {
            assert.ok(Math.abs(la - lb) < 1e-6, `${mode}: ${a} and ${b} share tone ${ta}`);
          } else if (ta < tb) {
            // Strictly darker, unless both ran into black or white.
            const clamped = la === lb && (la <= 0 || la >= 1);
            assert.ok(
              la < lb || clamped,
              `${mode}: ${a} (tone ${ta}, L ${la.toFixed(4)}) is darker than ${b} (tone ${tb}, L ${lb.toFixed(4)})`,
            );
          }
        }
      // The anchor: --mat-sys-surface is --color--surface itself.
      assert.equal(
        maxChannelDiff(
          evaluateColor('var(--mat-sys-surface)', ctx),
          evaluateColor('var(--color--surface)', ctx),
        ),
        0,
        `${mode}: --mat-sys-surface is --color--surface`,
      );
    }
  });
}

// ─── Surface containers (issue #12) ──────────────────────────────────────────
// Material's five surface containers are core's --color--surface--container-*.
// Core writes their distances from the surface as numbers; here they are held
// to the tones the installed Material's tables name: the lightness of each
// container's tone less that of the surface's own tone, per mode.

const CONTAINERS = ['lowest', 'low', '', 'high', 'highest'].map((step) =>
  step ? `container-${step}` : 'container',
);
/** The oklch lightness of an M3 tone (a grey of that L*), as _m3-tone.scss has it. */
const toneLightness = (tone: number) => (tone > 8 ? (tone + 16) / 116 : Math.cbrt(tone / 903.3));

test('core’s five container colours are M3’s surface containers: the distances Material’s tables give, from the surface', (t) => {
  const { decls } = themes[0];
  for (const mode of MODES) {
    const ctx = contextFor(decls, mode);
    const surface = evaluateColor('var(--color--surface)', ctx).to('oklch').coords;
    const out: string[] = [];
    for (const name of CONTAINERS) {
      const tone = tones[mode].get(`surface-${name}`);
      assert.ok(tone !== undefined, `Material's ${mode} table has surface-${name}`);
      const distance = toneLightness(tone) - toneLightness(tones[mode].get('surface')!);
      const [l, c, h] = evaluateColor(`var(--color--surface--${name})`, ctx).to('oklch').coords;
      out.push(`${name} ${distance >= 0 ? '+' : '−'}${Math.abs(distance).toFixed(4)}`);
      assert.ok(
        Math.abs(l! - (surface[0]! + distance)) < 1e-4,
        `${mode} ${name}: lightness ${l!.toFixed(4)}, the surface's ${surface[0]!.toFixed(4)} moved by ${distance.toFixed(4)}`,
      );
      assert.ok(Math.abs(c! - surface[1]!) < 1e-6, `${mode} ${name}: the surface's chroma`);
      if (surface[1]! > 1e-4)
        assert.ok(Math.abs(h! - surface[2]!) < 1e-3, `${mode} ${name}: the surface's hue`);
    }
    t.diagnostic(`${mode}: ${out.join(', ')}`);
  }
});

for (const theme of themes) {
  test(`core + ${theme.label} + adapter: every --mat-sys-surface-container-* is core's container colour, and its contrast reads on it`, (t) => {
    let lowest = Infinity;
    for (const mode of MODES) {
      const ctx = contextFor(theme.decls, mode);
      for (const name of CONTAINERS) {
        const core = evaluateColor(`var(--color--surface--${name})`, ctx);
        assert.equal(
          maxChannelDiff(evaluateColor(`var(--mat-sys-surface-${name})`, ctx), core),
          0,
          `${mode}: --mat-sys-surface-${name} is --color--surface--${name}`,
        );
        assert.equal(core.alpha ?? 1, 1, `${mode} ${name} is opaque`);
        const ratio = wcagContrast(
          evaluateColor(`var(--color--surface--${name}--contrast)`, ctx),
          core,
        );
        lowest = Math.min(lowest, ratio);
        assert.ok(ratio >= 4.5, `${mode} ${name}: its contrast is ${ratio.toFixed(2)}:1 on it`);
      }
    }
    t.diagnostic(`lowest contrast on a container: ${lowest.toFixed(2)}:1`);
  });
}

// ─── Elevation (issue #11) ───────────────────────────────────────────────────
// Core's default shadows are the ones Angular Material draws for its own
// levels: the same three layers, offsets, blurs and spreads, and in light mode
// the same three opacities. Material's are compiled here from its own Sass.

/** level → Material's box-shadow for it, in black. */
function materialShadows(): Map<string, string> {
  const { css } = compileSource(
    `@use "@angular/material/core/style/elevation" as e;
@use "@angular/material/core/tokens/m3/md-sys-elevation" as levels;
levels { @each $name, $z in levels.md-sys-elevation-values() { #{$name}: e.get-box-shadow($z, black); } }`,
    path.join(materialDir, 'test/fixtures/__elevation-levels.scss'),
  );
  return new Map(rules(css).find((r) => r.selector === 'levels')!.declarations);
}

/** A box-shadow as layers of [geometry, alpha], lengths without `px` on a zero. */
function shadowLayers(value: string, mode: Mode): [string, number][] {
  const out: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of value) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      out.push(current.trim());
      current = '';
    } else current += ch;
  }
  out.push(current.trim());
  return out.map((layer) => {
    const m = /^((?:-?[\d.]+(?:px)? ){4})(.+)$/.exec(layer)!;
    const geometry = m[1].trim().replace(/\b0px\b/g, '0');
    return [geometry, evaluateColor(m[2], contextFor(new Map(), mode)).alpha ?? 1];
  });
}

test(`--mat-sys-level1 to level5 are core's shadows, and core's are the ones Angular Material ${matVersion} draws`, (t) => {
  const material = materialShadows();
  const coreRoot = declarationsFor(core.css, ':where(:root)');
  assert.deepEqual(
    [...material.keys()],
    [0, 1, 2, 3, 4, 5].map((n) => `level${n}`),
  );
  for (let level = 1; level <= 5; level++) {
    assert.equal(rootDecls.get(`--mat-sys-level${level}`), `var(--elevation-${level}--shadow)`);
    const ours = shadowLayers(coreRoot.get(`--elevation-${level}--shadow`)!, 'light');
    const theirs = shadowLayers(material.get(`level${level}`)!, 'light');
    assert.deepEqual(
      ours.map(([geometry]) => geometry),
      theirs.map(([geometry]) => geometry),
      `level ${level}: offsets, blur and spread`,
    );
    for (const [i, [, alpha]] of ours.entries())
      assert.ok(Math.abs(alpha - theirs[i][1]) < 0.0005, `level ${level} layer ${i + 1}: ${alpha}`);
    // Dark mode is stronger than Material's, as core's shadows always were.
    for (const [i, [, alpha]] of shadowLayers(
      coreRoot.get(`--elevation-${level}--shadow`)!,
      'dark',
    ).entries())
      assert.ok(alpha > theirs[i][1], `level ${level} layer ${i + 1} dark: ${alpha}`);
    if (level === 1) t.diagnostic(`level 1: ${ours.map(([g, a]) => `${g} @ ${a}`).join(', ')}`);
  }
  assert.equal(coreRoot.get('--elevation-0--shadow'), 'none');
});

// ─── Muted text (issue #13) ──────────────────────────────────────────────────
// on-surface-variant is the mix core uses for muted text, at core's weight,
// against the surface: --container--text-deemphasis as it would be on the
// surface. With core's default weight it is where M3's table has the role.

const oklchOf = (c: ReturnType<typeof evaluateColor>) =>
  c.to('oklch').coords.map((v) => (Number.isNaN(v ?? NaN) ? 0 : (v ?? 0)));

for (const theme of themes) {
  test(`core + ${theme.label} + adapter: on-surface-variant is the surface's contrast mixed with the surface at the de-emphasis weight, 4.5:1 or more on every surface container`, (t) => {
    const out: string[] = [];
    for (const mode of MODES) {
      const ctx = contextFor(theme.decls, mode);
      const read = (name: string) => evaluateColor(`var(${name})`, ctx);
      const role = read('--mat-sys-on-surface-variant');
      const weight =
        Number.parseFloat(theme.decls.get(`--weight--text-deemphasis-blend--mode-${mode}`)!) / 100;
      const [sl] = oklchOf(read('--color--surface'));
      const [cl] = oklchOf(read('--color--surface--contrast'));
      const [l] = oklchOf(role);
      assert.ok(
        Math.abs(l - (weight * cl + (1 - weight) * sl)) < 1e-6,
        `${mode}: lightness ${l.toFixed(4)} at ${weight * 100}%`,
      );
      assert.equal(role.alpha ?? 1, 1, `${mode}: opaque`);
      let lowest = Infinity;
      for (const on of ['surface', ...CONTAINERS.map((c) => `surface-${c}`)]) {
        const ratio = wcagContrast(role, read(`--mat-sys-${on}`));
        lowest = Math.min(lowest, ratio);
        assert.ok(ratio >= 4.5, `${mode} on ${on}: ${ratio.toFixed(2)}:1`);
      }
      out.push(`${mode} L ${l.toFixed(3)}, lowest ${lowest.toFixed(2)}:1`);
    }
    t.diagnostic(out.join('; '));
  });
}

test('with core’s default weight, on-surface-variant is within 0.02 of the lightness the installed Material’s tables give it, in every preset', (t) => {
  const out: string[] = [];
  for (const theme of themes.filter((x) => x.label.includes('/presets/')))
    for (const mode of MODES) {
      const ctx = contextFor(theme.decls, mode);
      const [sl] = oklchOf(evaluateColor('var(--color--surface)', ctx));
      const [l] = oklchOf(evaluateColor('var(--mat-sys-on-surface-variant)', ctx));
      const m3 =
        sl +
        toneLightness(tones[mode].get('on-surface-variant')!) -
        toneLightness(tones[mode].get('surface')!);
      out.push(`${(l - m3 >= 0 ? '+' : '−') + Math.abs(l - m3).toFixed(3)}`);
      assert.ok(
        Math.abs(l - m3) < 0.02,
        `${theme.label} ${mode}: ${l.toFixed(3)}, M3 ${m3.toFixed(3)}`,
      );
    }
  t.diagnostic(
    `difference from the table's lightness, preset by preset, light then dark: ${out.join(' ')}`,
  );
});

// ─── Outline ─────────────────────────────────────────────────────────────────
// Every Material outline is the surface's stroke: `outline` is the stroke,
// `outline-variant` its --low step. A theme sets it by passing its surface a
// $stroke; a theme that passes none gets core's derived one.

const outlineSheet = materialFixtureSheets().find((s) => s.label.endsWith('outline-theme.scss'))!;

/** A theme's declarations with the adapter's :root ones, as on its element. */
function withAdapter(decls: Map<string, string>): Map<string, string> {
  for (const [n, v] of rootDecls) decls.set(n, v);
  return decls;
}

/**
 * The declarations on a [theme="inner"] element inside a theme `outer`: what
 * the outer element has, then every rule that matches the inner element again
 * (core's shared and [theme] rules, which re-derive there), then its own rule.
 */
function nested(outer: string, inner: string): Map<string, string> {
  const decls = themeDeclarations(core, outlineSheet, outer);
  for (const css of [core.css, outlineSheet.css])
    for (const rule of rules(css)) {
      if (rule.context.length || !/\[theme\]/.test(rule.selector)) continue;
      for (const [n, v] of rule.declarations) decls.set(n, v);
    }
  for (const [n, v] of declarationsFor(outlineSheet.css, themeSelector(inner))) decls.set(n, v);
  return withAdapter(decls);
}

const outline = (decls: Map<string, string>, mode: Mode, role = 'outline') =>
  evaluateColor(`var(--mat-sys-${role})`, contextFor(decls, mode));

const PASSED: [where: string, decls: () => Map<string, string>, stroke: string][] = [
  [
    'a theme that passes its surface a $stroke',
    () => withAdapter(themeDeclarations(core, outlineSheet, 'fixture-outline')),
    'oklch(0.68 0.18 286)',
  ],
  [
    'a nested theme that passes its surface a $stroke of its own',
    () => nested('fixture-outline', 'fixture-outline-nested'),
    'oklch(0.7 0.16 150)',
  ],
];

for (const [where, decls, stroke] of PASSED) {
  test(`--mat-sys-outline is the stroke passed, in ${where}`, () => {
    const d = decls();
    for (const mode of MODES) {
      assert.ok(maxChannelDiff(outline(d, mode), cssColor(stroke)) < 1e-9, `${mode} outline`);
      // …and outline-variant is that stroke's --low step.
      assert.ok(
        maxChannelDiff(
          outline(d, mode, 'outline-variant'),
          evaluateColor('var(--color--surface--stroke--low)', contextFor(d, mode)),
        ) < 1e-9,
        `${mode} outline-variant`,
      );
    }
  });
}

test('in a nested theme that passes no surface, the outline is derived from the surface it inherits', () => {
  // An explicit role is not inherited into a nested theme (core re-derives it
  // on every [theme] element), so this is the default stroke of the outer
  // theme's surface, not the outer theme's $stroke.
  const d = nested('fixture-outline', 'fixture-outline-primary');
  for (const mode of MODES) {
    const surface = evaluateColor('var(--mat-sys-surface)', contextFor(d, mode));
    assert.ok(
      maxChannelDiff(surface, cssColor('oklch(0.195 0.06 286)')) < 1e-9,
      `${mode}: the surface is the outer theme's`,
    );
    const ratio = wcagContrast(outline(d, mode), surface);
    assert.ok(ratio >= 4.5, `${mode}: ${ratio.toFixed(2)}:1`);
  }
});

for (const theme of themes) {
  if (theme.label.endsWith('outline-theme.scss')) continue;
  test(`core + ${theme.label} + adapter: a theme that passes no $stroke gets core's stroke as its outline, 4.5:1 or more on the surface`, (t) => {
    const out: string[] = [];
    for (const mode of MODES) {
      const ctx = contextFor(theme.decls, mode);
      const value = evaluateColor('var(--mat-sys-outline)', ctx);
      assert.ok(
        maxChannelDiff(value, evaluateColor('var(--color--surface--stroke)', ctx)) < 1e-9,
        `${mode}: outline is --color--surface--stroke`,
      );
      const ratio = wcagContrast(value, evaluateColor('var(--mat-sys-surface)', ctx));
      out.push(`${mode} ${ratio.toFixed(2)}:1`);
      assert.ok(ratio >= 4.5, `${mode}: outline ${ratio.toFixed(2)}:1 on the surface`);
    }
    t.diagnostic(`outline on the surface: ${out.join(', ')}`);
  });
}
