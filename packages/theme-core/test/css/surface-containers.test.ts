// The surface's container colours and the de-emphasis weight (issue #12,
// PORT-PLAN.md Phase 19): one scale for an app's own panels and Material's.
//
//   --color--surface--container-lowest / -low / (none) / -high / -highest
//       the surface moved by the lightness Material 3 puts between its surface
//       and each of its surface containers, per mode, each with a --contrast.
//   --weight--text-deemphasis-blend
//       63% in light mode and 93% in dark: muted text where Angular
//       Material has on-surface-variant.
//
// The distances and the weights are written here, not read from the Sass, so a
// change to either has to be made twice. The Material adapter's own test holds
// the same distances to the tones the installed Material's tables name.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  contextFor,
  evaluateColor,
  evaluateNumber,
  wcagContrast,
  type Mode,
} from '../lib/color.ts';
import {
  declarationsFor,
  normalizeSelector,
  registeredInitialValues,
  registeredProperties,
  rules,
  themeSelector,
} from '../lib/css.ts';
import { coreFixtureSheets, coreSheets, themeDeclarations, themeName } from '../lib/sets.ts';

const { core, presets } = coreSheets();
const fixtures = coreFixtureSheets();
const MODES: Mode[] = ['light', 'dark'];

/** The lightness between the surface and each container, per mode. */
const DISTANCE: Record<string, Record<Mode, number>> = {
  'container-lowest': { light: 0.0172, dark: -0.0238 },
  'container-low': { light: -0.0172, dark: 0.0362 },
  container: { light: -0.0345, dark: 0.0534 },
  'container-high': { light: -0.0517, dark: 0.0965 },
  'container-highest': { light: -0.069, dark: 0.1396 },
};
const NAMES = Object.keys(DISTANCE);
const token = (name: string) => `--color--surface--${name}`;

const shared = new Map(
  rules(core.css).find(
    (r) => normalizeSelector(r.selector) === ':where(:root, [theme])' && !r.context.length,
  )!.declarations,
);
const root = declarationsFor(core.css, ':where(:root)');
const oklch = (c: ReturnType<typeof evaluateColor>) =>
  c.to('oklch').coords.map((v) => (Number.isNaN(v ?? NaN) ? 0 : (v ?? 0)));

// ── What core declares ───────────────────────────────────────────────────────

test('core declares the five container colours of the surface once, on :where(:root, [theme]), from the joined surface token', () => {
  const all = rules(core.css).flatMap((r) => r.declarations.map(([n]) => n));
  assert.deepEqual(
    all.filter((n) => /^--color--[\w-]+--container(-|$)/.test(n)).sort(),
    NAMES.flatMap((n) => [token(n), `${token(n)}--contrast`]).sort(),
    'ten declarations: the surface only, each colour with its contrast',
  );
  const sign = (d: number) => `l ${d < 0 ? '-' : '+'} ${Math.abs(d)}`;
  for (const name of NAMES) {
    const { light, dark } = DISTANCE[name];
    // Unregistered, both modes in one light-dark(): it resolves where it is
    // used, so a nested themeMode flips it; from the joined token, like the
    // ladder, so a hand-written --color--surface moves it.
    assert.equal(
      shared.get(token(name)),
      `light-dark(oklch(from var(--color--surface) clamp(0, ${sign(light)}, 1) c h / 1), ` +
        `oklch(from var(--color--surface) clamp(0, ${sign(dark)}, 1) c h / 1))`,
      name,
    );
    assert.match(
      shared.get(`${token(name)}--contrast`)!,
      new RegExp(`^oklch\\(from color\\(from var\\(${token(name)}\\) srgb-linear `),
    );
  }
  assert.deepEqual(
    registeredProperties(core.css).filter((n) => n.includes('--container')),
    [],
    'none is registered: they are derived, like the ladder steps',
  );
});

test('no theme declares a container colour: core derives them from the theme’s surface', () => {
  for (const sheet of [...presets, ...fixtures])
    assert.deepEqual(
      [...declarationsFor(sheet.css, themeSelector(themeName(sheet))).keys()].filter((n) =>
        n.includes('--container'),
      ),
      [],
      sheet.label,
    );
});

// ── What it comes to ─────────────────────────────────────────────────────────

for (const sheet of [...presets, ...fixtures]) {
  test(`${sheet.label}: each container is the surface at its distance, same hue and chroma, and its contrast reads on it`, (t) => {
    const decls = themeDeclarations(core, sheet, themeName(sheet));
    let lowest = Infinity;
    for (const mode of MODES) {
      const context = contextFor(decls, mode);
      const read = (name: string) => evaluateColor(`var(${name})`, context);
      const [sl, sc, sh] = oklch(read('--color--surface'));
      const line: string[] = [];
      for (const name of NAMES) {
        const colour = read(token(name));
        const [l, c, h] = oklch(colour);
        const wanted = Math.min(1, Math.max(0, sl + DISTANCE[name][mode]));
        assert.ok(Math.abs(l - wanted) < 1e-6, `${mode} ${name}: lightness ${l}, not ${wanted}`);
        assert.ok(Math.abs(c - sc) < 1e-9, `${mode} ${name}: the surface's chroma`);
        if (sc > 1e-6) assert.ok(Math.abs(h - sh) < 1e-6, `${mode} ${name}: the surface's hue`);
        assert.equal(colour.alpha ?? 1, 1, `${mode} ${name} is opaque`);
        const ratio = wcagContrast(read(`${token(name)}--contrast`), colour);
        lowest = Math.min(lowest, ratio);
        assert.ok(ratio >= 4.5, `${mode} ${name}: its contrast is ${ratio.toFixed(2)}:1`);
        line.push(`${name.replace('container', 'c')} ${l.toFixed(3)}`);
      }
      t.diagnostic(`${mode}: surface ${sl.toFixed(3)}; ${line.join(', ')}`);
    }
    t.diagnostic(`lowest contrast on a container: ${lowest.toFixed(2)}:1`);
  });
}

test('M3’s order holds around any surface: one container on the far side, four on the near side, each a little further', () => {
  // Light: lowest is lighter than the surface, the others darker in turn.
  // Dark: lowest is darker, the others lighter in turn.
  const decls = themeDeclarations(core, presets[0], themeName(presets[0]));
  for (const mode of MODES)
    for (const surface of ['oklch(0.93 0.01 250)', 'oklch(0.6 0.05 30)', 'oklch(0.22 0.01 250)']) {
      const context = contextFor(
        decls,
        mode,
        new Map([
          ['--color--surface--mode-light', surface],
          ['--color--surface--mode-dark', surface],
        ]),
      );
      const l = (name: string) => oklch(evaluateColor(`var(${name})`, context))[0];
      const order = [
        token('container-lowest'),
        '--color--surface',
        token('container-low'),
        token('container'),
        token('container-high'),
        token('container-highest'),
      ].map(l);
      for (let i = 1; i < order.length; i++) {
        // Strictly in order, unless both ran into black or white.
        const clamped = order[i] === order[i - 1] && (order[i] <= 0 || order[i] >= 1);
        assert.ok(
          (mode === 'light' ? order[i] < order[i - 1] : order[i] > order[i - 1]) || clamped,
          `${mode} on ${surface}: ${order.map((v) => v.toFixed(3)).join(' → ')}`,
        );
      }
    }
});

test('a hand-written --color--surface moves the containers with it, like the ladder', () => {
  const decls = themeDeclarations(core, presets[0], themeName(presets[0]));
  const context = contextFor(
    decls,
    'light',
    new Map([['--color--surface', 'oklch(0.8 0.03 120)']]),
  );
  const [l, c, h] = oklch(evaluateColor(`var(${token('container-high')})`, context));
  assert.ok(Math.abs(l - (0.8 - 0.0517)) < 1e-6);
  assert.ok(Math.abs(c - 0.03) < 1e-9 && Math.abs(h - 120) < 1e-6);
});

// ── The de-emphasis weight ───────────────────────────────────────────────────

const WEIGHT = '--weight--text-deemphasis-blend';
const DEEMPHASIS: Record<Mode, number> = { light: 0.63, dark: 0.93 };

test('the de-emphasis weight defaults to 63% in light mode and 93% in dark', () => {
  assert.equal(root.get(`${WEIGHT}--mode-light`), '63%');
  assert.equal(root.get(`${WEIGHT}--mode-dark`), '93%');
  // What a page without core's rules gets: the light value.
  assert.equal(registeredInitialValues(core.css).get(WEIGHT), '63%');
  // No preset passes one of its own.
  for (const sheet of presets)
    assert.deepEqual(
      [...declarationsFor(sheet.css, themeSelector(themeName(sheet))).keys()].filter((n) =>
        n.startsWith(WEIGHT),
      ),
      [],
      sheet.label,
    );
  // The fallbacks filled() writes are the same two numbers.
  const mixed = rules(core.css)
    .find((r) => normalizeSelector(r.selector) === '[palette][filled][filled]')!
    .declarations.find(([n]) => n === '--container--text-deemphasis')![1];
  assert.match(mixed, /--mode-light, 63%\)/);
  assert.match(mixed, /--mode-dark, 93%\)/);
});

test('muted text on the default surface is where Angular Material has on-surface-variant: 0.344 in light mode, 0.946 in dark', (t) => {
  // Angular Material 22's role tables: on-surface-variant is tone 30 on a
  // surface at tone 98, and tone 90 on one at tone 6 (the Material 3
  // guidelines have tone 80 in dark). The adapter's test reads the tones from
  // the installed Material; here they are written out. As a lightness (a grey
  // of that L*):
  const tone = (n: number) => (n > 8 ? (n + 16) / 116 : Math.cbrt(n / 903.3));
  const m3: Record<Mode, number> = { light: tone(30) - tone(98), dark: tone(90) - tone(6) };
  // No theme: the generated surface, 0.93 and 0.22.
  const decls = new Map(registeredInitialValues(core.css));
  for (const rule of rules(core.css))
    if (!rule.context.length && rule.selector.includes(':root'))
      for (const [n, v] of rule.declarations) decls.set(n, v);
  for (const mode of MODES) {
    const context = contextFor(decls, mode);
    const weight = evaluateNumber(`var(${WEIGHT}--mode-${mode})`, context);
    assert.equal(weight, DEEMPHASIS[mode]);
    const surface = oklch(evaluateColor('var(--color--surface)', context))[0];
    const text = oklch(evaluateColor('var(--color--surface--contrast)', context))[0];
    // color-mix(in oklch, text W, surface): the lightness is the weighted mean.
    const muted = weight * text + (1 - weight) * surface;
    t.diagnostic(
      `${mode}: surface ${surface.toFixed(3)}, muted text ${muted.toFixed(3)}, ` +
        `Material's on-surface-variant ${(surface + m3[mode]).toFixed(3)}`,
    );
    assert.ok(Math.abs(muted - (surface + m3[mode])) < 0.002, `${mode}: ${muted}`);
  }
});
