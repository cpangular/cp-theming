// Check 5 — cascade shape (Phase 9). Variable-only rules are :where() so an
// author's own rule wins; a theme rule holds only what was passed; nothing
// selects `body`; the registered list is exactly the role colour pairs and the
// 29 scalars, and nothing derived; core derives every core palette once and
// picks every mode-varying percentage once. The chain of Phase 14 (what core
// generates for a palette a theme did not pass) is chain.test.ts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { compileSource, coreDir } from '../lib/sass.ts';
import {
  declarationsFor,
  normalizeSelector,
  registeredProperties,
  rules,
  themeSelector,
} from '../lib/css.ts';
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
        !/^--color--[\w-]+--mode-(light|dark)$|^--(weight|space|shape)--|^--density-scale$/.test(n),
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

test('a theme that passes one palette emits one rule with that palette, what follows from it and nothing else', () => {
  const { css } = compileSource(
    `@use "../../scss/theme" as t;
@include t.define-theme("minimal", t.theme($palettes: (
  primary: t.light-dark(t.palette(oklch(0.4 0.1 250)), t.palette(oklch(0.8 0.1 250))),
)));`,
    path.join(coreDir, 'test/fixtures/__minimal.scss'),
  );
  const all = rules(css);
  assert.equal(all.length, 1);
  // (0,0,1): above every :where() rule, below an author's :root wherever it is placed.
  assert.equal(normalizeSelector(all[0].selector), normalizeSelector(themeSelector('minimal')));
  assert.equal(normalizeSelector(all[0].selector), ':where([theme=minimal]):not(cp-theming-none)');
  assert.deepEqual(all[0].declarations, [
    ['--color--primary--mode-light', 'oklch(40% 0.1 250deg)'],
    ['--color--primary--mode-dark', 'oklch(80% 0.1 250deg)'],
    [
      '--color--primary',
      'light-dark(var(--color--primary--mode-light), var(--color--primary--mode-dark))',
    ],
    // No brand passed: the brand palette is this primary (Phase 14d).
    ['--color--brand--mode-light', 'var(--color--primary--mode-light)'],
    ['--color--brand--mode-dark', 'var(--color--primary--mode-dark)'],
    [
      '--color--brand',
      'light-dark(var(--color--brand--mode-light), var(--color--brand--mode-dark))',
    ],
    // The accents follow from primary: the theme takes the ones core generates.
    ['--color--secondary--mode-light', 'var(--theme--_generated--secondary--light)'],
    ['--color--secondary--mode-dark', 'var(--theme--_generated--secondary--dark)'],
    [
      '--color--secondary',
      'light-dark(var(--color--secondary--mode-light), var(--color--secondary--mode-dark))',
    ],
    ['--color--tertiary--mode-light', 'var(--theme--_generated--tertiary--light)'],
    ['--color--tertiary--mode-dark', 'var(--theme--_generated--tertiary--dark)'],
    [
      '--color--tertiary',
      'light-dark(var(--color--tertiary--mode-light), var(--color--tertiary--mode-dark))',
    ],
  ]);
  assert.deepEqual(registeredProperties(css), []);
});

test('a default theme adds :where(:root) to its rule, never body', () => {
  for (const preset of presets) {
    const sel = rules(preset.css).map((r) => normalizeSelector(r.selector));
    assert.ok(
      sel.includes(`${normalizeSelector(themeSelector(themeName(preset)))}, :where(:root)`),
      preset.label,
    );
  }
});

for (const sheet of themeSheets) {
  test(`${sheet.label}: the theme rule holds only what was passed — no derivation, default or mode variant`, () => {
    const decls = declarationsFor(sheet.css, themeSelector(themeName(sheet)));
    const names = [...decls.keys()];
    assert.ok(names.length > 0, 'the theme rule was found');
    // A default theme derives its custom palette names inside its own rule
    // (the shared derivation rule does not match :root); nothing else derived.
    const isDefault = rules(sheet.css).some((r) =>
      normalizeSelector(r.selector).endsWith(', :where(:root)'),
    );
    const custom = new Set(
      [...sheet.css.matchAll(/\[palette=["']?([\w-]+)["']?\]/g)]
        .map((m) => m[1])
        .filter((n) => !CORE_PALETTE_NAMES.includes(n)),
    );
    const derivedOf = (n: string) => /^--color--([\w]+(?:-[\w]+)*?)--/.exec(n)?.[1] ?? '';
    assert.deepEqual(
      names.filter((n) => DERIVED.test(n) && !(isDefault && custom.has(derivedOf(n)))),
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
  const decls = declarationsFor(sheet.css, themeSelector(themeName(sheet)));
  for (const role of ['--bg', '--stroke', '--focus'])
    assert.ok(decls.has(`--color--primary${role}--mode-light`), `primary${role}`);
  assert.ok(!decls.has('--color--secondary--bg--mode-light'), 'secondary bg not passed');
  // background/surface always carry their bg pair: their base.
  assert.equal(
    decls.get('--color--background--bg--mode-light'),
    decls.get('--color--background--mode-light'),
  );
  assert.equal(
    decls.get('--color--surface--bg--mode-dark'),
    decls.get('--color--surface--mode-dark'),
  );
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
  assert.match(decls.get('--elevation-1--shadow')!, /^0 1px 2px light-dark\(.*0\.6\)\)$/);
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
  // On :where([theme]), not :root: a second, separately compiled stylesheet
  // that uses the name repeats this rule later in the cascade, and on :root it
  // would beat a default theme's explicit roles.
  const derive = rules(sheet.css).filter(
    (r) => normalizeSelector(r.selector) === ':where([theme])',
  );
  assert.equal(derive.length, 1);
  assert.ok(derive[0].declarations.some(([n]) => n === '--color--accent--contrast'));
  assert.deepEqual(
    rules(sheet.css).filter((r) => /:root/.test(r.selector)),
    [],
    'a non-default theme stylesheet never matches :root',
  );
  const palette = rules(sheet.css).filter(
    (r) => normalizeSelector(r.selector) === '[palette=accent]',
  );
  assert.equal(palette.length, 1);
  assert.ok(
    palette[0].declarations.some(([n, v]) => n === '--palette-src' && v === 'var(--color--accent)'),
  );
  // *-from-brand palettes land as relative colours of --color--brand in the pair.
  const decls = declarationsFor(sheet.css, themeSelector(themeName(sheet)));
  // The accent is wrapped by the gamut correction (Phase 14c), which names its origin once.
  const primary = decls.get('--color--primary--mode-light')!;
  assert.match(primary, /^oklch\(from color\(from oklch\(/);
  assert.deepEqual(primary.match(/var\([\w-]+\)/g), ['var(--color--brand)']);
  assert.match(primary, /oklch\(from var\(--color--brand\) clamp\(/);
  assert.match(decls.get('--color--background--mode-dark')!, /^oklch\(from var\(--color--brand\)/);
});

test('a default theme with a custom palette derives it inside its own rule, ahead of its explicit roles', () => {
  const { css } = compileSource(
    `@use "../../scss/theme" as t;
@include t.define-theme("info-a", t.theme($palettes: (
  info: t.light-dark(
    t.palette(oklch(0.5 0.15 200), $bg: oklch(0.85 0.1 120)),
    t.palette(oklch(0.75 0.12 200), $bg: oklch(0.35 0.1 120))),
)), $default: true);`,
    path.join(coreDir, 'test/fixtures/__info-a.scss'),
  );
  const rule = rules(css).find((r) => normalizeSelector(r.selector).endsWith(', :where(:root)'))!;
  const names = rule.declarations.map(([n]) => n);
  const derivedBg = names.indexOf('--color--info--bg--mode-light');
  const explicitBg = names.lastIndexOf('--color--info--bg--mode-light');
  assert.ok(derivedBg >= 0 && explicitBg > derivedBg, 'derived first, explicit last');
  assert.equal(rule.declarations[explicitBg][1], 'oklch(85% 0.1 120deg)');
  assert.ok(names.includes('--color--info--contrast'));
  const shared = rules(css).filter((r) => normalizeSelector(r.selector) === ':where([theme])');
  assert.equal(shared.length, 1);
});

test('core derives the auto bg, stroke and focus into their registered pairs, from the colour pair', () => {
  const sharedRule = rules(core.css).find(
    (r) => normalizeSelector(r.selector) === ':where(:root, [theme])' && !r.context.length,
  )!;
  const shared = new Map(sharedRule.declarations);
  for (const name of CORE_PALETTE_NAMES) {
    for (const role of ['--bg', '--stroke', '--focus']) {
      const token = `--color--${name}${role}`;
      assert.equal(
        shared.get(token),
        `light-dark(var(${token}--mode-light), var(${token}--mode-dark))`,
        `${token} is the join of its pair`,
      );
    }
    // background/surface: the pair is the theme's base (emit-palette), or the
    // generated colour when the theme left the palette out (chain.test.ts),
    // and only joined here. Never the tint the other palettes get.
    if (name === 'background' || name === 'surface') {
      assert.ok(!shared.has(`--color--${name}--bg--mode-light`), `${name} bg pair not derived`);
    } else {
      assert.match(
        shared.get(`--color--${name}--bg--mode-light`)!,
        new RegExp(`^oklch\\(from var\\(--color--${name}--mode-light\\) 0\\.92 `),
      );
      assert.match(
        shared.get(`--color--${name}--bg--mode-dark`)!,
        new RegExp(`^oklch\\(from var\\(--color--${name}--mode-dark\\) 0\\.24 `),
      );
    }
    for (const mode of ['light', 'dark']) {
      assert.match(
        shared.get(`--color--${name}--stroke--mode-${mode}`)!,
        new RegExp(
          `^oklch\\(from var\\(--color--${name}--mode-${mode}\\) clamp\\(0\\.42, l, 0\\.6\\)`,
        ),
      );
      assert.match(
        shared.get(`--color--${name}--focus--mode-${mode}`)!,
        new RegExp(
          // Sass simplifies calc(1 - l) inside clamp() to a bare calc-sum.
          `^oklch\\(from var\\(--color--${name}--mode-${mode}\\) clamp\\(0\\.1, (calc\\()?1 - l\\)?, 0\\.9\\)`,
        ),
      );
    }
    // Tints read each mode's weight inside light-dark(), never the picked weight.
    for (let i = 1; i <= 5; i++) {
      const tint = shared.get(`--color--${name}--tint-${i}`)!;
      assert.match(
        tint,
        /^light-dark\(oklch\(from var\(--color--[\w-]+\) l c h\s*\/\s*var\(--weight--tint-\d--mode-light, \d+%\)\), oklch\(.*--mode-dark, \d+%\)\)\)$/,
      );
      assert.doesNotMatch(tint, /var\(--weight--tint-\d[,)]/, 'no picked weight');
    }
  }
  // The [filled] layer mixes its de-emphasis text with each mode's weight.
  const filled = rules(core.css).find((r) =>
    r.declarations.some(([n]) => n === '--container--text-deemphasis'),
  )!;
  const deemphasis = filled.declarations
    .find(([n]) => n === '--container--text-deemphasis')![1]
    .replace(/\s+/g, ' ');
  assert.match(
    deemphasis,
    /^light-dark\( ?color-mix\(.*--mode-light.*\), color-mix\(.*--mode-dark.*\) ?\)$/,
  );
  assert.doesNotMatch(deemphasis, /var\(--weight--text-deemphasis-blend[,)]/);
});

// Phase 14b: the bg layer keeps the palette's own colour as text, and for
// background and surface that colour is the fill. bg() offers the bg role's
// contrast in a private variable; only those two palette rules read it, and
// they clear it first so an outer bg() does not reach a palette scope inside.
test('bg() gives background and surface the contrast of their bg role as text; every other palette keeps its colour', () => {
  const rule = (selector: string) => {
    const found = rules(core.css).filter((r) => normalizeSelector(r.selector) === selector);
    assert.equal(found.length, 1, selector);
    return found[0].declarations;
  };
  const BG_TEXT = '--container--_bg-text';
  // Last declaration wins inside one rule.
  const last = (decls: [string, string][], name: string) =>
    decls.filter(([n]) => n === name).at(-1)?.[1];
  assert.equal(last(rule('[palette][bg]'), BG_TEXT), 'var(--palette-color--bg--contrast)');
  assert.ok(!rule('[palette][bg]').some(([n]) => n === 'color'), 'bg() itself sets no colour');
  for (const name of CORE_PALETTE_NAMES) {
    const decls = rule(`[palette=${name}]`);
    if (name === 'background' || name === 'surface') {
      assert.equal(last(decls, BG_TEXT), 'initial', name);
      assert.equal(last(decls, 'color'), `var(${BG_TEXT}, var(--palette-color))`, name);
    } else {
      assert.equal(last(decls, BG_TEXT), undefined, name);
      assert.equal(last(decls, 'color'), 'var(--palette-color)', name);
    }
  }
  // bg(high) offers the high step's contrast.
  const { css } = compileSource(
    `@use "../../scss/theme" as t;
.x { @include t.apply-palette(surface); @include t.bg(high); }`,
    path.join(coreDir, 'test/fixtures/__bg-text.scss'),
  );
  assert.equal(
    last(rules(css).find((r) => r.selector === '.x')!.declarations, BG_TEXT),
    'var(--palette-color--bg--high--contrast)',
  );
});
