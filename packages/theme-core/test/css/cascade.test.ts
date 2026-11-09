// Check 5 — cascade shape (Phase 9). Variable-only rules are :where() so an
// author's own rule wins; a theme rule holds only what was passed; nothing
// selects `body`; the registered list is exactly the role colour pairs,
// --color--brand and the 29 scalars, and nothing derived; core derives every
// core palette once and picks every mode-varying percentage once.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { compileSource, coreDir } from '../lib/sass.ts';
import { declarationsFor, normalizeSelector, registeredProperties, rules } from '../lib/css.ts';
import {
  CORE_PALETTE_NAMES,
  coreFixtureSheets,
  coreSheets,
  materialFixtureSheets,
  materialSheets,
  themeName,
} from '../lib/sets.ts';
import { expectedRegistrations, paletteRegistrations } from './registry.test.ts';

const { core, presets } = coreSheets();
const fixtures = coreFixtureSheets();
const themeSheets = [...presets, ...fixtures];

const DERIVED =
  /^--color--[\w-]+--(contrast|dark|darker|darkest|light|lighter|lightest|high|higher|highest|low|lower|lowest|tint-\d)(--contrast)?$/;

/** Splits a selector list on top-level commas only (`:where(a, b)` stays whole). */
function selectorParts(selector: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of selector) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else current += ch;
  }
  parts.push(current);
  return parts.map((p) => normalizeSelector(p));
}

// Per-element attribute scopes keep attribute specificity on purpose.
const ATTRIBUTE_SCOPE = /^\[(theme|themeDensity|palette)\b/;

function isVariableOnly(decls: [string, string][]): boolean {
  return decls.every(([n]) => n.startsWith('--') || n === 'color-scheme');
}

// material-overrides.css is excluded: its component patches must out-rank
// Material's own component CSS, so they keep class specificity on purpose.
const whereSheets = [
  core,
  ...themeSheets,
  ...materialSheets().filter((s) => !s.label.includes('overrides')),
  ...materialFixtureSheets(),
];
for (const sheet of whereSheets) {
  test(`${sheet.label}: every variable-only rule is :where() or a per-element attribute scope`, () => {
    const offenders: string[] = [];
    for (const rule of rules(sheet.css)) {
      if (!isVariableOnly(rule.declarations)) continue;
      for (const part of selectorParts(rule.selector)) {
        // The adapter's own :root rule keeps :root specificity on purpose (PORT-PLAN.md Phase 11).
        if (part.startsWith(':where(') || ATTRIBUTE_SCOPE.test(part) || part === ':root') continue;
        offenders.push(part);
      }
    }
    assert.deepEqual(offenders, []);
  });

  test(`${sheet.label}: nothing selects body`, () => {
    const body = rules(sheet.css)
      .map((r) => r.selector)
      .filter((s) => /(^|[\s,>+~(])body\b/.test(s));
    assert.deepEqual(body, []);
  });
}

test('core.css :where() rules declare only custom properties and color-scheme', () => {
  const real = rules(core.css)
    .filter((r) => r.selector.startsWith(':where('))
    .flatMap((r) => r.declarations.filter(([n]) => !n.startsWith('--') && n !== 'color-scheme'))
    .map(([n]) => n);
  assert.deepEqual(real, []);
});

test('nothing derived is registered, in core or in any theme stylesheet', () => {
  for (const sheet of [core, ...themeSheets]) {
    const derived = registeredProperties(sheet.css).filter(
      (n) =>
        DERIVED.test(n) ||
        !/^--color--[\w-]+--mode-(light|dark)$|^--color--brand$|^--(weight|space|shape)--|^--density-scale$/.test(
          n,
        ),
    );
    assert.deepEqual(derived, [], sheet.label);
  }
  assert.deepEqual([...registeredProperties(core.css)].sort(), [...expectedRegistrations].sort());
});

test('core derives every core palette once, on :where(:root, [theme])', () => {
  const shared = rules(core.css).filter(
    (r) => normalizeSelector(r.selector) === ':where(:root, [theme])' && !r.context.length,
  );
  assert.equal(shared.length, 1, 'one shared derivation rule');
  const names = new Set(shared[0].declarations.map(([n]) => n));
  for (const name of CORE_PALETTE_NAMES) {
    for (const role of ['', '--bg', '--stroke']) {
      assert.ok(names.has(`--color--${name}${role}--contrast`), `${name}${role} contrast`);
      assert.ok(names.has(`--color--${name}${role}--high`), `${name}${role} high`);
    }
    assert.ok(names.has(`--color--${name}--focus`), `${name} focus`);
    assert.ok(names.has(`--color--${name}--tint-5`), `${name} tint`);
    assert.equal(
      shared[0].declarations.find(([n]) => n === `--color--${name}`)?.[1],
      `light-dark(var(--color--${name}--mode-light), var(--color--${name}--mode-dark))`,
    );
  }
  // Each derivation is declared exactly once in core.
  const all = rules(core.css).flatMap((r) => r.declarations.map(([n]) => n));
  const counts = new Map<string, number>();
  for (const n of all)
    if (DERIVED.test(n) && n.startsWith('--color--')) counts.set(n, (counts.get(n) ?? 0) + 1);
  assert.deepEqual(
    [...counts].filter(([, c]) => c !== 1),
    [],
  );
});

test('core picks every mode-varying percentage once, on :where(:root, [theme], [themeMode])', () => {
  const pick = rules(core.css).filter(
    (r) => normalizeSelector(r.selector) === ':where(:root, [theme], [themeMode])',
  );
  assert.equal(pick.length, 1);
  const picked = pick[0].declarations.map(([n]) => n);
  const weights = expectedRegistrations.filter((n) => n.startsWith('--weight--'));
  for (const w of weights) assert.ok(picked.includes(w), w);
  for (let i = 0; i <= 5; i++) assert.ok(picked.includes(`--elevation-${i}--tint`));
  for (const [, v] of pick[0].declarations) {
    assert.match(
      v,
      /^calc\(var\((--[\w-]+)--mode-light\) \+ \(var\(\1--mode-dark\) - var\(\1--mode-light\)\) \* var\(--theme--_dark\)\)$/,
    );
    assert.doesNotMatch(v, /light-dark/, 'CSS light-dark() is never used for a percentage');
  }
  // The mode rules set the flag for every themeMode value.
  const flags = rules(core.css)
    .filter((r) => r.declarations.some(([n]) => n === '--theme--_dark'))
    .map((r) => normalizeSelector(r.selector));
  for (const v of ['light', 'dark', 'auto', 'invert'])
    assert.ok(
      flags.some((s) => s.includes(`[themeMode=${v}]`)),
      `themeMode=${v}`,
    );
  // Core declares a default pair for every picked percentage.
  const root = declarationsFor(core.css, ':where(:root)');
  for (const n of picked) {
    assert.ok(root.has(`${n}--mode-light`), `${n}--mode-light default`);
    assert.ok(root.has(`${n}--mode-dark`), `${n}--mode-dark default`);
  }
});

test('a theme that passes one palette emits one rule with that palette and nothing else', () => {
  const { css } = compileSource(
    `@use "../../scss/theme" as t;
@include t.define-theme("minimal", t.theme($palettes: (
  primary: t.light-dark(t.palette(oklch(0.4 0.1 250)), t.palette(oklch(0.8 0.1 250))),
)));`,
    path.join(coreDir, 'test/fixtures/__minimal.scss'),
  );
  const all = rules(css);
  assert.equal(all.length, 1);
  assert.equal(normalizeSelector(all[0].selector), '[theme=minimal]');
  assert.deepEqual(all[0].declarations, [
    ['--color--primary--mode-light', 'oklch(40% 0.1 250deg)'],
    ['--color--primary--mode-dark', 'oklch(80% 0.1 250deg)'],
    [
      '--color--primary',
      'light-dark(var(--color--primary--mode-light), var(--color--primary--mode-dark))',
    ],
  ]);
  assert.deepEqual(registeredProperties(css), []);
});

test('a default theme adds :where(:root) to its rule, never body', () => {
  for (const preset of presets) {
    const sel = rules(preset.css).map((r) => normalizeSelector(r.selector));
    assert.ok(sel.includes(`[theme=${themeName(preset)}], :where(:root)`), preset.label);
  }
});

for (const sheet of themeSheets) {
  test(`${sheet.label}: the theme rule holds only what was passed — no derivation, default or mode variant`, () => {
    const decls = declarationsFor(sheet.css, `[theme="${themeName(sheet)}"]`);
    const names = [...decls.keys()];
    assert.deepEqual(
      names.filter((n) => DERIVED.test(n)),
      [],
      'no derivation',
    );
    assert.ok(!decls.has('color-scheme'), 'no color-scheme');
    assert.deepEqual(
      names.filter((n) => /^--text--[\w-]+--(size|line-height|weight|tracking|font)$/.test(n)),
      [],
      'no type scale',
    );
    assert.deepEqual(
      names.filter((n) => /^--motion--/.test(n)),
      [],
      'no motion defaults',
    );
    assert.deepEqual(
      names.filter((n) => n.startsWith('--weight--') && !/--mode-(light|dark)$/.test(n)),
      [],
      'weights only as pairs',
    );
    assert.deepEqual(
      names.filter((n) => /^--elevation-\d--tint$/.test(n)),
      [],
      'tints only as pairs',
    );
    // Every colour role present is a complete pair + join.
    for (const n of names.filter((n) => /^--color--[\w-]+--mode-light$/.test(n))) {
      const token = n.replace(/--mode-light$/, '');
      assert.ok(decls.has(`${token}--mode-dark`), `${token} dark`);
      assert.equal(
        decls.get(token),
        `light-dark(var(${token}--mode-light), var(${token}--mode-dark))`,
      );
    }
    // No mode variant rules remain in the stylesheet.
    for (const r of rules(sheet.css)) assert.doesNotMatch(r.selector, /\[themeMode/, r.selector);
  });
}

test('fixtures/explicit-roles: explicit $bg/$stroke/$focus, weights, overlay, elevation, shape and focus land as passed', () => {
  const sheet = fixtures.find((f) => f.label.endsWith('explicit-roles.scss'))!;
  const decls = declarationsFor(sheet.css, `[theme="${themeName(sheet)}"]`);
  for (const role of ['--bg', '--stroke', '--focus'])
    assert.ok(decls.has(`--color--primary${role}--mode-light`), `primary${role}`);
  assert.ok(!decls.has('--color--secondary--bg--mode-light'), 'secondary bg not passed');
  assert.equal(
    decls.get('--color--secondary--mode-light'),
    'oklch(45% 0.14 300deg)',
    '$color override',
  );
  assert.equal(decls.get('--weight--text-blend--mode-light'), '85%');
  assert.equal(decls.get('--weight--text-blend--mode-dark'), '75%');
  assert.ok(!decls.has('--weight--text-emphasis-blend--mode-light'), 'unpassed weight absent');
  assert.match(decls.get('--overlay--scrim')!, /^light-dark\(/);
  assert.ok(!decls.has('--overlay--shadow'), 'unpassed overlay key absent');
  assert.match(decls.get('--elevation-1--shadow')!, /^light-dark\(.*0\.6\)\)$/);
  assert.ok(!decls.has('--elevation-0--shadow'), 'level 0 untouched by $shadow-color');
  assert.equal(decls.get('--shape--md'), '10px');
  assert.ok(!decls.has('--shape--xs'), 'unpassed shape absent');
  assert.equal(decls.get('--focus--width'), '2px');
  assert.ok(!decls.has('--focus--offset'), 'unpassed focus key absent');
});

test('fixtures/brand: a custom palette gets its registrations, derivations and [palette] rule once at root level', () => {
  const sheet = fixtures.find((f) => f.label.endsWith('brand.scss'))!;
  assert.deepEqual(
    [...registeredProperties(sheet.css)].sort(),
    paletteRegistrations('accent').sort(),
  );
  const derive = rules(sheet.css).filter(
    (r) => normalizeSelector(r.selector) === ':where(:root, [theme])',
  );
  assert.equal(derive.length, 1);
  assert.ok(derive[0].declarations.some(([n]) => n === '--color--accent--contrast'));
  const palette = rules(sheet.css).filter(
    (r) => normalizeSelector(r.selector) === '[palette=accent]',
  );
  assert.equal(palette.length, 1);
  assert.ok(
    palette[0].declarations.some(([n, v]) => n === '--palette-src' && v === 'var(--color--accent)'),
  );
  // *-from-brand palettes land as relative colours of --color--brand in the pair.
  const decls = declarationsFor(sheet.css, `[theme="${themeName(sheet)}"]`);
  assert.match(decls.get('--color--primary--mode-light')!, /^oklch\(from var\(--color--brand\)/);
  assert.match(decls.get('--color--background--mode-dark')!, /^oklch\(from var\(--color--brand\)/);
});
