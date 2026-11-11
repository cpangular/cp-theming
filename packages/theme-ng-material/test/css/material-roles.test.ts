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
import { declarationsFor, normalizeSelector, rules } from '../../../theme-core/test/lib/css.ts';
import { compileSource, materialDir, repoRoot } from '../../../theme-core/test/lib/sass.ts';
import {
  contextFor,
  evaluateColor,
  maxChannelDiff,
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
  ...accent('tertiary', 'secondary'),
  ...accent('error', 'error'),
  ['surface', 'var(--color--surface)'],
  ['on-surface', 'var(--color--surface--contrast)'],
  ['background', 'var(--color--background)'],
  ['on-background', 'var(--color--background--contrast)'],
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
  // No selector other than these, [themeMode] and [palette="name"] declares a token.
  const others = adapterRules
    .map((r) => normalizeSelector(r.selector))
    .filter(
      (s) =>
        s !== ROOT_AND_THEME &&
        s !== ':root' &&
        s !== ':where([themeMode])' &&
        !/^\[palette=[\w-]+\]$/.test(s),
    );
  assert.deepEqual(others, []);
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
    assert.deepEqual(scope.declarations.map(([n]) => n).sort(), primaryRoles, name);
    // …and each is the root's expression with this palette as the origin.
    for (const [token, value] of scope.declarations)
      assert.equal(
        value,
        rootDecls.get(token)!.replaceAll('var(--color--primary', `var(--color--${name}`),
        `${name} ${token}`,
      );
  }
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
