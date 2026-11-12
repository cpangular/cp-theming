// Check 7 — the palette chain (Phase 14): brand → primary → secondary,
// tertiary → background, surface. A theme passes whichever of these it has and
// the others are generated from the nearest thing it passed. Checked here on
// the compiled CSS:
//   • the generated colours core declares on the shared derivation selector;
//   • that the root takes every one of them, and a theme rule exactly the ones
//     downstream of what the theme passed;
//   • the relation each generated palette has to its origin, for every preset
//     and fixture, as numbers (the expressions are evaluated, not compared);
//   • that the brand colour is never adjusted and the primary made from it is
//     readable on the generated background, over a grid of brand colours;
//   • that a theme without a brand has its primary as its brand palette
//     (Phase 14d), a theme with both keeps both, and the root never points
//     the brand at the primary;
//   • that the semantic palettes default to the colours the presets pass;
//   • that every generated accent is inside sRGB, or close enough that the
//     painted hue is the hue asked for (Phase 14c), for every preset, every
//     fixture and a sweep of the hue wheel.
// test/render.ts asserts the same in the browsers, including what a nested
// theme inherits, which needs an element tree.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { compileSource, coreDir } from '../lib/sass.ts';
import {
  declarationsFor,
  normalizeSelector,
  registeredInitialValues,
  rules,
  themeSelector,
} from '../lib/css.ts';
import {
  contextFor,
  cssColor,
  evaluateColor,
  maxChannelDiff,
  painted,
  wcagContrast,
  Color,
  type Mode,
} from '../lib/color.ts';
import {
  GENERATED_PALETTE_NAMES,
  SEMANTIC_PALETTE_NAMES,
  coreFixtureSheets,
  coreSheets,
  themeDeclarations,
  themeName,
} from '../lib/sets.ts';

const MODES: Mode[] = ['light', 'dark'];
/** The private variable that holds a generated colour. */
const generated = (name: string, mode: Mode) => `--theme--_generated--${name}--${mode}`;
/**
 * The pairs of one chain palette that take its generated colour, with the
 * reference. A theme rule follows each pair with its joined token, as it does
 * for a pair it passes; on the root the shared rule has the join.
 */
const references = (name: string, join = false): [string, string][] =>
  // background and surface are backgrounds: the bg pair is the base too.
  (name === 'background' || name === 'surface' ? ['', '--bg'] : ['']).flatMap((role) => {
    const token = `--color--${name}${role}`;
    const pairs: [string, string][] = MODES.map((mode) => [
      `${token}--mode-${mode}`,
      `var(${generated(name, mode)})`,
    ]);
    if (join)
      pairs.push([token, `light-dark(var(${token}--mode-light), var(${token}--mode-dark))`]);
    return pairs;
  });
const inTheme = (name: string) => references(name, true);
/** The chain palettes downstream of what a theme passed, that it did not pass. */
function downstream(passed: Set<string>): string[] {
  const brand = passed.has('brand');
  const primary = passed.has('primary');
  return GENERATED_PALETTE_NAMES.filter((name) => {
    const upstream = name === 'secondary' || name === 'tertiary' ? brand || primary : brand;
    return upstream && !passed.has(name);
  });
}

const { core, presets } = coreSheets();
const fixtures = coreFixtureSheets();
const themeSheets = [...presets, ...fixtures];

const coreRules = rules(core.css).filter((r) => !r.context.length);
const shared = new Map(
  coreRules.find((r) => normalizeSelector(r.selector) === ':where(:root, [theme])')!.declarations,
);
const root = declarationsFor(core.css, ':where(:root)');

const oklch = (c: ReturnType<typeof evaluateColor>) => {
  const [l, ch, h] = c.to('oklch').coords.map((v) => (Number.isNaN(v ?? NaN) ? 0 : (v ?? 0)));
  return { l, c: ch, h };
};
const close = (a: number, b: number, eps = 1e-6) => Math.abs(a - b) < eps;
/** Hue difference in degrees, the short way round. */
const hueDiff = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

// ─── Gamut correction (Phase 14c) ────────────────────────────────────────────
// The three accents give up chroma until sRGB can show them. One pass is two
// relative colours: the inner one carries a factor in its alpha, the outer one
// multiplies the chroma by it. Four passes, nested.
const GAMUT_FACTOR =
  'calc(1 - 2 * clamp(0, max(r - 1, g - 1, b - 1, -1 * r, -1 * g, -1 * b), 0.25))';
/** The CSS the Sass must emit around a colour expression. */
function inGamutCss(expr: string): string {
  for (let pass = 0; pass < 4; pass++)
    expr = `oklch(from color(from ${expr} srgb r g b / ${GAMUT_FACTOR}) l calc(c * alpha) h / 1)`;
  return expr;
}
/** How far the worst sRGB channel of an oklch colour lies outside 0–1. */
function overshoot(l: number, c: number, h: number): number {
  const rgb = new Color('oklch', [l, c, h]).to('srgb').coords;
  return Math.max(0, ...rgb.map((v) => Math.max((v ?? 0) - 1, -(v ?? 0))));
}
/**
 * The same four passes as plain arithmetic, apart from the CSS: the chroma
 * that is left. Each pass multiplies it by 1 − 2 × overshoot, the overshoot
 * counted up to 0.25.
 */
function fitChroma(l: number, c: number, h: number): number {
  for (let pass = 0; pass < 4; pass++) c *= 1 - 2 * Math.min(overshoot(l, c, h), 0.25);
  return c;
}
/** The most chroma sRGB holds at this lightness and hue, up to `cap`. */
function gamutChroma(l: number, h: number, cap: number): number {
  if (overshoot(l, cap, h) === 0) return cap;
  let [inside, outside] = [0, cap];
  for (let k = 0; k < 30; k++) {
    const mid = (inside + outside) / 2;
    if (overshoot(l, mid, h) > 0) outside = mid;
    else inside = mid;
  }
  return inside;
}
/** Hue of a colour as painted: clipped into sRGB channel by channel. */
const paintedHue = (c: Color) => oklch(painted(c)).h;

// ─── What core declares ──────────────────────────────────────────────────────

test('core declares every generated colour once, on :where(:root, [theme])', () => {
  const light = (name: string) => `var(--color--${name}--mode-light)`;
  const expected: [string, string][] = [
    // primary: the brand, moved into the readable band of each mode.
    // Then, like the other two accents, brought inside sRGB.
    [
      generated('primary', 'light'),
      inGamutCss(`oklch(from ${light('brand')} clamp(0.35,l,0.45) clamp(0,c,0.22) h / 1)`),
    ],
    [
      generated('primary', 'dark'),
      inGamutCss(
        'oklch(from var(--color--brand--mode-dark) clamp(0.65,l,0.82) clamp(0,calc(c*0.9),0.22) h / 1)',
      ),
    ],
    // secondary: primary's hue, a third of its chroma, 0.04 at least. tertiary:
    // +60°, half, 0.08 at least. Never more than the primary's own chroma.
    [
      generated('secondary', 'light'),
      inGamutCss(`oklch(from ${light('primary')} l min(c, max(c / 3, 0.04)) h / 1)`),
    ],
    [
      generated('tertiary', 'light'),
      inGamutCss(`oklch(from ${light('primary')} l min(c, max(c / 2, 0.08)) calc(h + 60) / 1)`),
    ],
    // background and surface are not corrected: L 0.97 / 0.17 and 0.93 / 0.22
    // hold their 0.006 / 0.01 of chroma at every hue.
    // …tinted neutrals of the brand hue.
    [generated('background', 'light'), `oklch(from ${light('brand')} 0.97 min(c, 0.006) h / 1)`],
    [
      generated('background', 'dark'),
      'oklch(from var(--color--brand--mode-dark) 0.17 min(c, 0.006) h / 1)',
    ],
    [generated('surface', 'light'), `oklch(from ${light('brand')} 0.93 min(c, 0.01) h / 1)`],
    [
      generated('surface', 'dark'),
      'oklch(from var(--color--brand--mode-dark) 0.22 min(c, 0.01) h / 1)',
    ],
  ];
  for (const [name, value] of expected) assert.equal(shared.get(name), value, name);
  // The dark twin of each accent is the light one with the dark pair as origin.
  for (const name of ['secondary', 'tertiary'])
    assert.equal(
      shared.get(generated(name, 'dark')),
      shared.get(generated(name, 'light'))!.replace('--mode-light', '--mode-dark'),
      name,
    );
  // The colour expression is written once however many passes wrap it.
  for (const name of ['primary', 'secondary', 'tertiary'])
    for (const mode of MODES)
      assert.equal(shared.get(generated(name, mode))!.split('var(').length - 1, 1, name);
  // Exactly these ten, declared nowhere else; nothing generates the brand or a
  // semantic palette.
  const all = rules(core.css).flatMap((r) => r.declarations.map(([n]) => n));
  assert.deepEqual(
    all.filter((n) => n.startsWith('--theme--_generated--')).sort(),
    GENERATED_PALETTE_NAMES.flatMap((n) => MODES.map((m) => generated(n, m))).sort(),
  );
  // The shared rule itself leaves the pairs alone: a pair is only ever set by
  // reference, on the root or in a theme rule, so everywhere else it inherits.
  for (const name of [...GENERATED_PALETTE_NAMES, ...SEMANTIC_PALETTE_NAMES, 'brand'])
    for (const mode of MODES)
      assert.ok(!shared.has(`--color--${name}--mode-${mode}`), `${name} ${mode} pair`);
});

test('the root takes every generated colour: :where(:root) points each pair of the chain at it', () => {
  for (const name of GENERATED_PALETTE_NAMES)
    for (const [pair, value] of references(name)) assert.equal(root.get(pair), value, pair);
  // Only the chain: the brand and the semantic palettes are their initial values.
  const pairs = [...root.keys()].filter((n) => /^--color--[\w-]+--mode-(light|dark)$/.test(n));
  assert.deepEqual(
    pairs.sort(),
    GENERATED_PALETTE_NAMES.flatMap((n) => references(n))
      .map(([n]) => n)
      .sort(),
  );
});

// ─── What a theme rule adds ──────────────────────────────────────────────────

interface Theme {
  label: string;
  /** In force on the theme's root element (core's root rules + the theme rule). */
  decls: Map<string, string>;
  /** The theme rule's own declarations. */
  own: Map<string, string>;
  /** Palettes the theme passed: the colour-role pairs it sets to a colour of its own. */
  passed: Set<string>;
}
const themes: Theme[] = themeSheets.map((s) => {
  const own = declarationsFor(s.css, themeSelector(themeName(s)));
  return {
    label: s.label,
    decls: themeDeclarations(core, s, themeName(s)),
    own,
    passed: new Set(
      [...own]
        // Not a reference: to a generated colour, or the brand to the primary.
        .filter(([, v]) => !v.includes('--theme--_generated--') && !v.startsWith('var('))
        .map(([k]) => /^--color--([\w-]+)--mode-light$/.exec(k)?.[1] ?? '')
        // A role pair has a second `--` (primary--bg).
        .filter((n) => n && !n.includes('--')),
    ),
  };
});

test('the fixtures cover a theme with only brand and a theme with only primary', () => {
  const only = (name: string) => themes.some((t) => t.passed.size === 1 && t.passed.has(name));
  assert.ok(only('brand'), 'only brand');
  assert.ok(only('primary'), 'only primary');
  // No preset passes tertiary or brand, so every preset shows a generated tertiary.
  for (const t of themes.filter((t) => t.label.includes('/presets/')))
    assert.ok(!t.passed.has('tertiary') && !t.passed.has('brand'), t.label);
});

for (const theme of themes) {
  test(`${theme.label}: the theme rule takes the generated colour of exactly the palettes downstream of what it passes`, (t) => {
    const expected = downstream(theme.passed);
    t.diagnostic(
      `passed: ${[...theme.passed].join(', ')}; generated here: ${expected.join(', ') || 'none'}`,
    );
    const taken = [...theme.own].filter(([, v]) => v.includes('--theme--_generated--'));
    assert.deepEqual(
      taken.sort(),
      expected
        .flatMap(inTheme)
        .filter(([, v]) => v.includes('--theme--_generated--'))
        .sort(),
    );
    // Nothing else private, and never the generated colours themselves.
    assert.deepEqual(
      [...theme.own.keys()].filter((n) => n.startsWith('--theme--')),
      [],
    );
  });
}

test('$brand is the brand palette: its pair and join, the same colour in both modes', () => {
  const theme = themes.find((t) => t.label.endsWith('brand-only.scss'))!;
  assert.deepEqual([...theme.own].slice(0, 3), [
    ['--color--brand--mode-light', 'oklch(80% 0.3 150deg)'],
    ['--color--brand--mode-dark', 'oklch(80% 0.3 150deg)'],
    [
      '--color--brand',
      'light-dark(var(--color--brand--mode-light), var(--color--brand--mode-dark))',
    ],
  ]);
  // The rest of the rule is the chain, taken by reference.
  assert.deepEqual([...theme.own].slice(3), GENERATED_PALETTE_NAMES.flatMap(inTheme));
});

// ─── A theme without a brand: its primary is its brand (Phase 14d) ───────────

/** The brand pair of one role taking the primary's by reference, and its join. */
const brandFromPrimary = (role = ''): [string, string][] => [
  ...MODES.map((mode): [string, string] => [
    `--color--brand${role}--mode-${mode}`,
    `var(--color--primary${role}--mode-${mode})`,
  ]),
  [
    `--color--brand${role}`,
    `light-dark(var(--color--brand${role}--mode-light), var(--color--brand${role}--mode-dark))`,
  ],
];
const brandEntries = (own: Map<string, string>) =>
  [...own].filter(([n]) => n.startsWith('--color--brand'));

for (const theme of themes) {
  test(`${theme.label}: the brand palette is the brand it passed, or else the primary it passed`, (t) => {
    const brand = theme.passed.has('brand');
    const primary = theme.passed.has('primary');
    t.diagnostic(
      brand ? 'passes a brand' : primary ? 'no brand: its primary' : 'neither: inherits the brand',
    );
    if (brand) {
      // Its own colour; nothing in the rule reads the primary for it.
      for (const [name, value] of brandEntries(theme.own))
        assert.ok(!value.includes('--color--primary'), name);
      return;
    }
    if (!primary) {
      assert.deepEqual(brandEntries(theme.own), []);
      return;
    }
    // The colour pair, and the pair of each role the primary carries explicitly.
    const explicit = ['--bg', '--stroke', '--focus'].filter((role) =>
      theme.own.has(`--color--primary${role}--mode-light`),
    );
    assert.deepEqual(
      brandEntries(theme.own),
      ['', ...explicit].flatMap((role) => brandFromPrimary(role)),
    );
    // As numbers: every role of the brand palette is the primary's, in both modes.
    for (const mode of MODES) {
      const ctx = contextFor(theme.decls, mode);
      for (const role of ['', '--contrast', '--bg', '--stroke', '--focus', '--high', '--tint-3'])
        assert.equal(
          maxChannelDiff(
            evaluateColor(`var(--color--brand${role})`, ctx),
            evaluateColor(`var(--color--primary${role})`, ctx),
          ),
          0,
          `${mode} --color--brand${role}`,
        );
    }
  });
}

test('every preset passes a primary and no brand, so palette="brand" is its primary', () => {
  for (const theme of themes.filter((t) => t.label.includes('/presets/'))) {
    assert.ok(theme.passed.has('primary') && !theme.passed.has('brand'), theme.label);
    for (const mode of MODES)
      assert.equal(
        theme.decls.get(`--color--brand--mode-${mode}`),
        `var(--color--primary--mode-${mode})`,
        `${theme.label} ${mode}`,
      );
  }
});

test('a theme with a brand and a primary keeps both; an explicit role of the primary is the brand palette’s too', () => {
  const { css } = compileSource(
    `@use "../../scss/theme" as t;
@include t.define-theme("both", t.theme($brand: #ff6a00, $palettes: (primary: t.palette(teal))));
@include t.define-theme("roles", t.theme($palettes: (
  primary: t.light-dark(t.palette(teal, $bg: white), t.palette(aqua, $focus: red)),
)));`,
    path.join(coreDir, 'test/fixtures/__brand-and-primary.scss'),
  );
  const both = declarationsFor(css, themeSelector('both'));
  assert.equal(both.get('--color--brand--mode-light'), '#ff6a00');
  assert.equal(both.get('--color--brand--mode-dark'), '#ff6a00');
  assert.equal(both.get('--color--primary--mode-light'), 'teal');
  assert.equal(both.get('--color--primary--mode-dark'), 'teal');
  // The accents follow the primary and the neutrals the brand, by reference.
  assert.deepEqual(
    [...both.keys()].filter((n) => both.get(n)!.includes('--theme--_generated--')).length,
    2 * 2 + 2 * 4,
  );
  // A role given in one mode applies to both, for the primary and so for the brand.
  const roles = declarationsFor(css, themeSelector('roles'));
  assert.deepEqual(
    brandEntries(roles),
    ['', '--bg', '--focus'].flatMap((role) => brandFromPrimary(role)),
  );
});

test('the root never points the brand at the primary: with no theme the chain starts at the grey brand', () => {
  // Only primary → generated-from-brand on the root; a brand → primary pointer
  // there would close a circle.
  for (const rule of coreRules)
    for (const [name, value] of rule.declarations)
      if (/^--color--brand(--(bg|stroke|focus))?--mode-(light|dark)$/.test(name))
        assert.ok(!value.includes('--color--primary'), `${rule.selector} ${name}`);
  const initial = registeredInitialValues(core.css);
  for (const mode of MODES) {
    assert.ok(!root.has(`--color--brand--mode-${mode}`), `root brand ${mode}`);
    const grey = oklch(cssColor(initial.get(`--color--brand--mode-${mode}`)!));
    assert.ok(close(grey.l, 0.2) && close(grey.c, 0), `initial brand ${mode}`);
  }
});

test('passing the brand as $brand and as the `brand` palette is an error', () => {
  assert.throws(
    () =>
      compileSource(
        `@use "../../scss/theme" as t;
@include t.define-theme("twice", t.theme($brand: red, $palettes: (brand: t.palette(blue))));`,
        path.join(coreDir, 'test/fixtures/__brand-twice.scss'),
      ),
    /passes the brand colour twice/,
  );
});

test('a theme that passes no colour takes no generated colour, so every pair inherits', () => {
  const { css } = compileSource(
    `@use "../../scss/theme" as t;
@include t.define-theme("plain", t.theme($shape: t.shape($md: 7px)));
@include t.define-theme("only-secondary", t.theme($palettes: (secondary: t.palette(teal))));`,
    path.join(coreDir, 'test/fixtures/__plain.scss'),
  );
  assert.deepEqual([...declarationsFor(css, themeSelector('plain'))], [['--shape--md', '7px']]);
  // …the brand among them: only-secondary inherits the brand around it.
  assert.deepEqual(
    [...declarationsFor(css, themeSelector('only-secondary')).keys()],
    ['--color--secondary--mode-light', '--color--secondary--mode-dark', '--color--secondary'],
  );
});

// ─── The relation of each generated palette to its origin ────────────────────

for (const theme of themes) {
  test(`${theme.label}: every palette it did not pass has the chain's relation to its origin`, () => {
    for (const mode of MODES) {
      const ctx = contextFor(theme.decls, mode);
      const read = (token: string) => oklch(evaluateColor(`var(${token})`, ctx));
      const brand = read('--color--brand');
      const primary = read('--color--primary');

      if (!theme.passed.has('primary')) {
        const [min, max] = mode === 'light' ? [0.35, 0.45] : [0.65, 0.82];
        const l = Math.min(Math.max(brand.l, min), max);
        // The band and the cap, then as much of that chroma as sRGB holds.
        const chroma = fitChroma(
          l,
          Math.min(mode === 'light' ? brand.c : brand.c * 0.9, 0.22),
          brand.h,
        );
        assert.ok(close(primary.l, l), `${mode} primary L`);
        assert.ok(close(primary.c, chroma), `${mode} primary C`);
        if (chroma > 1e-4) assert.ok(hueDiff(primary.h, brand.h) < 1e-3, `${mode} primary H`);
      }
      for (const [name, divisor, floor, turn] of [
        ['secondary', 3, 0.04, 0],
        ['tertiary', 2, 0.08, 60],
      ] as const) {
        if (theme.passed.has(name)) continue;
        const accent = read(`--color--${name}`);
        assert.ok(close(accent.l, primary.l), `${mode} ${name} L is primary's`);
        assert.ok(
          close(
            accent.c,
            fitChroma(
              primary.l,
              Math.min(primary.c, Math.max(primary.c / divisor, floor)),
              primary.h + turn,
            ),
          ),
          `${mode} ${name} C is primary's / ${divisor}, ${floor} at least, primary's at most, inside sRGB`,
        );
        if (accent.c > 1e-4)
          assert.ok(
            hueDiff(accent.h, primary.h + turn) < 1e-3,
            `${mode} ${name} H is primary's + ${turn}`,
          );
      }
      for (const [name, l, tint] of [
        ['background', mode === 'light' ? 0.97 : 0.17, 0.006],
        ['surface', mode === 'light' ? 0.93 : 0.22, 0.01],
      ] as const) {
        if (theme.passed.has(name)) continue;
        const neutral = read(`--color--${name}`);
        assert.ok(close(neutral.l, l), `${mode} ${name} L`);
        assert.ok(close(neutral.c, Math.min(brand.c, tint)), `${mode} ${name} C`);
        if (neutral.c > 1e-4) assert.ok(hueDiff(neutral.h, brand.h) < 1e-3, `${mode} ${name} H`);
        // background and surface are backgrounds: the bg role is the base.
        assert.equal(
          maxChannelDiff(
            evaluateColor(`var(--color--${name}--bg)`, ctx),
            evaluateColor(`var(--color--${name})`, ctx),
          ),
          0,
          `${mode} ${name} bg role is its base`,
        );
      }
      // A semantic palette the theme did not pass is the fixed default.
      for (const name of SEMANTIC_PALETTE_NAMES) {
        if (theme.passed.has(name)) continue;
        assert.equal(
          theme.decls.get(`--color--${name}--mode-${mode}`),
          registeredInitialValues(core.css).get(`--color--${name}--mode-${mode}`),
        );
      }
    }
  });
}

// ─── Brand exact, primary readable ───────────────────────────────────────────

test('the brand colour is never adjusted; the primary generated from it reads on the generated background and surface', (t) => {
  // A theme that passes only the brand: core's root rules and nothing else.
  const decls = new Map(registeredInitialValues(core.css));
  for (const rule of coreRules)
    if (rule.selector.includes(':root')) for (const [n, v] of rule.declarations) decls.set(n, v);
  let lowest = { ratio: Infinity, where: '' };
  let adjusted = 0;
  let count = 0;
  let pairs = 0;
  let belowAA = 0;
  for (let h = 0; h < 360; h += 15)
    for (const l of [0.05, 0.2, 0.35, 0.5, 0.65, 0.8, 0.95])
      for (const c of [0, 0.05, 0.15, 0.25, 0.37]) {
        const brand = `oklch(${l} ${c} ${h})`;
        const passed = new Map(MODES.map((mode) => [`--color--brand--mode-${mode}`, brand]));
        for (const mode of MODES) {
          const ctx = contextFor(decls, mode, passed);
          count++;
          assert.equal(
            maxChannelDiff(evaluateColor('var(--color--brand)', ctx), cssColor(brand)),
            0,
            `${mode} --color--brand is ${brand}`,
          );
          const primary = evaluateColor('var(--color--primary)', ctx);
          if (maxChannelDiff(primary, cssColor(brand)) > 1e-6) adjusted++;
          for (const page of ['background', 'surface']) {
            const ratio = wcagContrast(primary, evaluateColor(`var(--color--${page})`, ctx));
            pairs++;
            if (ratio < 4.5) belowAA++;
            if (ratio < lowest.ratio) lowest = { ratio, where: `${mode} ${brand} on ${page}` };
          }
        }
      }
  t.diagnostic(
    `${count} brand × mode cases; the primary differs from the brand in ${adjusted}; ` +
      `primary on its page: ${belowAA} of ${pairs} below 4.5:1, ` +
      `lowest ${lowest.ratio.toFixed(2)}:1 at ${lowest.where}`,
  );
  assert.ok(adjusted > 0 && adjusted < count, 'the grid has brands inside and outside the band');
  // The band is palette-from-brand()'s. Its light-mode top is 0.45 since
  // Phase 14b: at 0.50, 116 of these 3360 were below 4.5:1 (cyan and green
  // brands outside sRGB, on the surface).
  assert.equal(belowAA, 0, `lowest ${lowest.ratio.toFixed(2)}:1 at ${lowest.where}`);
});

// ─── Painted hue (Phase 14c) ─────────────────────────────────────────────────
// A colour outside sRGB is clipped channel by channel, which moves its hue: the
// light primary of an orange brand, oklch(0.45 0.2 45), was painted as a red.
// Every generated accent is therefore brought inside sRGB by lowering its
// chroma, and what is painted has the hue that was asked for.

interface Asked {
  l: number;
  c: number;
  h: number;
}
interface HueReport {
  cases: number;
  worst: { off: number; where: string };
  /** The same, had the colour that was asked for been painted as it is. */
  uncorrected: number;
  /** Lowest share of the chroma sRGB holds at that lightness and hue. */
  share: { ratio: number; where: string };
}
const newReport = (): HueReport => ({
  cases: 0,
  worst: { off: 0, where: '' },
  uncorrected: 0,
  share: { ratio: Infinity, where: '' },
});
/** Records one generated colour against the colour its rule asks for. */
function recordHue(report: HueReport, where: string, asked: Asked, got: Color) {
  // A grey has no hue to keep.
  if (asked.c < 1e-3) return;
  report.cases++;
  const off = hueDiff(paintedHue(got), asked.h);
  if (off > report.worst.off) report.worst = { off, where };
  report.uncorrected = Math.max(
    report.uncorrected,
    hueDiff(paintedHue(new Color('oklch', [asked.l, asked.c, asked.h])), asked.h),
  );
  const ratio = oklch(got).c / gamutChroma(asked.l, asked.h, asked.c);
  if (ratio < report.share.ratio) report.share = { ratio, where };
}
/** What the chain asks for, for each accent of `passed` it generates, in one mode. */
function recordAccents(
  report: HueReport,
  where: string,
  ctx: ReturnType<typeof contextFor>,
  mode: Mode,
  passed: Set<string>,
) {
  const colour = (name: string) => evaluateColor(`var(--color--${name})`, ctx);
  const brand = oklch(colour('brand'));
  const primary = oklch(colour('primary'));
  if (!passed.has('primary')) {
    const [min, max] = mode === 'light' ? [0.35, 0.45] : [0.65, 0.82];
    recordHue(
      report,
      `${where} primary`,
      {
        l: Math.min(Math.max(brand.l, min), max),
        c: Math.min(mode === 'light' ? brand.c : brand.c * 0.9, 0.22),
        h: brand.h,
      },
      colour('primary'),
    );
  }
  for (const [name, divisor, floor, turn] of [
    ['secondary', 3, 0.04, 0],
    ['tertiary', 2, 0.08, 60],
  ] as const)
    if (!passed.has(name))
      recordHue(
        report,
        `${where} ${name}`,
        {
          l: primary.l,
          c: Math.min(primary.c, Math.max(primary.c / divisor, floor)),
          h: (primary.h + turn) % 360,
        },
        colour(name),
      );
}
const describe = (r: HueReport) =>
  `${r.cases} generated colours; painted hue at most ${r.worst.off.toFixed(2)}° from the hue asked for` +
  ` (${r.worst.where}), ${r.uncorrected.toFixed(1)}° without the correction; lowest share of the chroma` +
  ` sRGB holds: ${(r.share.ratio * 100).toFixed(0)}% (${r.share.where})`;

test('every generated accent of every preset and fixture is painted within 6° of the hue asked for', (t) => {
  const report = newReport();
  for (const theme of themes)
    for (const mode of MODES)
      recordAccents(
        report,
        `${theme.label} ${mode}`,
        contextFor(theme.decls, mode),
        mode,
        theme.passed,
      );
  t.diagnostic(describe(report));
  assert.ok(report.cases > 0, 'the presets and fixtures generate accents');
  assert.ok(report.worst.off < 6, describe(report));
});

test('over the hue wheel, every accent generated from a brand is painted within 6° of the hue asked for', (t) => {
  // A theme that passes only the brand: core's root rules and nothing else.
  const decls = new Map(registeredInitialValues(core.css));
  for (const rule of coreRules)
    if (rule.selector.includes(':root')) for (const [n, v] of rule.declarations) decls.set(n, v);
  const report = newReport();
  // Lightness on, between and beyond the edges of both bands; chroma above the
  // cap, and a moderate one.
  for (let h = 0; h < 360; h += 2)
    for (const l of [0.25, 0.4, 0.55, 0.73, 0.9])
      for (const c of [0.12, 0.37]) {
        const brand = `oklch(${l} ${c} ${h})`;
        const passed = new Map(MODES.map((mode) => [`--color--brand--mode-${mode}`, brand]));
        for (const mode of MODES)
          recordAccents(
            report,
            `${mode} ${brand}`,
            contextFor(decls, mode, passed),
            mode,
            new Set(['brand']),
          );
      }
  t.diagnostic(describe(report));
  assert.ok(report.uncorrected > 6, 'the sweep has colours the correction is needed for');
  assert.ok(report.worst.off < 6, describe(report));
  // The correction never takes the colour away: at least half of the chroma
  // sRGB holds is left (one pass halves it at most, and stops there once inside).
  assert.ok(report.share.ratio > 0.5, describe(report));
});

// ─── Semantic defaults ───────────────────────────────────────────────────────

test('error, warn, caution and pass default to the colours the presets share', () => {
  const initial = registeredInitialValues(core.css);
  const azure = themes.find((t) => t.label.endsWith('azure-blue.scss'))!;
  // The presets pass $default-pass, -caution and -warn as they are (and their own error).
  for (const name of ['pass', 'caution', 'warn'])
    for (const mode of MODES) {
      const token = `--color--${name}--mode-${mode}`;
      assert.equal(initial.get(token), azure.own.get(token), token);
    }
  assert.equal(initial.get('--color--error--mode-light'), 'oklch(52% 0.22 27deg)');
  assert.equal(initial.get('--color--error--mode-dark'), 'oklch(70% 0.2 27deg)');
  // …and they differ by mode, unlike the grey initial values of the other palettes.
  for (const name of SEMANTIC_PALETTE_NAMES)
    assert.notEqual(
      initial.get(`--color--${name}--mode-light`),
      initial.get(`--color--${name}--mode-dark`),
      name,
    );
});
