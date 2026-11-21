// The quiet stroke of background and surface (issue #16): a divider, the edge
// of a card, a table's row line. The Material adapter's `outline-variant` is
// the surface's.
//
//   --color--{background|surface}--stroke--low / --lower / --lowest
//       the stroke mixed into the palette's colour, in oklab: 37.5%, 25% and
//       12.5% of the stroke in light mode, 44.64%, 29.76% and 14.88% in dark.
//       The first is where Material 3 has outline-variant between its surface
//       and its outline; the other two are two thirds and one third of it.
//
// Every other palette, and every other role of these two, keeps the ladder's
// step for its low side. The shares are written here, not read from the Sass,
// so a change has to be made twice. The Material adapter's own test holds the
// low share to the tones the installed Material's tables name.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contextFor, cssColor, evaluateColor, wcagContrast, type Mode } from '../lib/color.ts';
import { normalizeSelector, rules } from '../lib/css.ts';
import {
  CORE_PALETTE_NAMES,
  coreFixtureSheets,
  coreSheets,
  themeDeclarations,
  themeName,
} from '../lib/sets.ts';

const { core, presets } = coreSheets();
const fixtures = coreFixtureSheets();
const MODES: Mode[] = ['light', 'dark'];
const NEUTRALS = ['background', 'surface'];
const STEPS = ['low', 'lower', 'lowest'] as const;

/** The stroke's share of the mix, per step and mode, in percent. */
const SHARE: Record<(typeof STEPS)[number], Record<Mode, number>> = {
  low: { light: 37.5, dark: 44.64 },
  lower: { light: 25, dark: 29.76 },
  lowest: { light: 12.5, dark: 14.88 },
};

const shared = new Map(
  rules(core.css).find(
    (r) => normalizeSelector(r.selector) === ':where(:root, [theme])' && !r.context.length,
  )!.declarations,
);
const themes = [...presets, ...fixtures].map((s) => ({
  label: s.label,
  preset: presets.includes(s),
  decls: themeDeclarations(core, s, themeName(s)),
}));

const oklch = (c: ReturnType<typeof evaluateColor>) =>
  c.to('oklch').coords.map((v) => (Number.isNaN(v ?? NaN) ? 0 : (v ?? 0)));
/** The oklch lightness of an M3 tone (a grey of that L*). */
const toneLightness = (tone: number) => (tone > 8 ? (tone + 16) / 116 : Math.cbrt(tone / 903.3));

// ── What core declares ───────────────────────────────────────────────────────

test('core declares the low side of the background’s and the surface’s stroke as the stroke mixed into the colour, on :where(:root, [theme])', () => {
  const all = rules(core.css).flatMap((r) => r.declarations.map(([n]) => n));
  for (const name of NEUTRALS) {
    const stroke = `--color--${name}--stroke`;
    const mix = (share: number) =>
      `color-mix(in oklab, var(${stroke}) ${share}%, var(--color--${name}))`;
    for (const step of STEPS) {
      // Unregistered, both modes in one light-dark(), from the joined tokens:
      // it resolves where it is used, so a nested themeMode flips it and a
      // hand-written stroke or colour moves it.
      assert.equal(
        shared.get(`${stroke}--${step}`),
        `light-dark(${mix(SHARE[step].light)}, ${mix(SHARE[step].dark)})`,
        `${stroke}--${step}`,
      );
      assert.match(
        shared.get(`${stroke}--${step}--contrast`)!,
        new RegExp(`^oklch\\(from color\\(from var\\(${stroke}--${step}\\) srgb-linear `),
        `${stroke}--${step}--contrast is worked out from the mix`,
      );
      for (const suffix of ['', '--contrast'])
        assert.equal(
          all.filter((n) => n === `${stroke}--${step}${suffix}`).length,
          1,
          `${stroke}--${step}${suffix} is declared once`,
        );
    }
  }
});

test('every other low side is still the ladder’s: the accents’ strokes, and the colour and bg roles of every palette', () => {
  const ladder = (token: string) => ({
    low: `light-dark(var(${token}--light), var(${token}--dark))`,
    lower: `light-dark(var(${token}--lighter), var(${token}--darker))`,
    lowest: `light-dark(var(${token}--lightest), var(${token}--darkest))`,
  });
  for (const name of CORE_PALETTE_NAMES)
    for (const role of ['', '--bg', '--stroke']) {
      if (role === '--stroke' && NEUTRALS.includes(name)) continue;
      const token = `--color--${name}${role}`;
      for (const step of STEPS)
        assert.equal(shared.get(`${token}--${step}`), ladder(token)[step], `${token}--${step}`);
    }
  // The strong side of the neutral stroke is the ladder's too.
  for (const name of NEUTRALS) {
    const token = `--color--${name}--stroke`;
    assert.equal(
      shared.get(`${token}--high`),
      `light-dark(var(${token}--dark), var(${token}--light))`,
    );
  }
});

// ── What it comes to ─────────────────────────────────────────────────────────

for (const theme of themes) {
  test(`${theme.label}: the quiet strokes of background and surface run from the stroke to the colour, each at its share`, (t) => {
    const out: string[] = [];
    for (const mode of MODES) {
      const ctx = contextFor(theme.decls, mode);
      for (const name of NEUTRALS) {
        const token = `--color--${name}--stroke`;
        const colour = evaluateColor(`var(--color--${name})`, ctx);
        const stroke = evaluateColor(`var(${token})`, ctx);
        const [l0] = oklch(colour);
        const [l1] = oklch(stroke);
        // Strictly in order: stroke, low, lower, lowest, colour.
        const line = [l1];
        for (const step of STEPS) {
          const value = evaluateColor(`var(${token}--${step})`, ctx);
          const [l] = oklch(value);
          const share = SHARE[step][mode] / 100;
          assert.ok(
            Math.abs(l - (l0 + share * (l1 - l0))) < 1e-6,
            `${mode} ${token}--${step}: lightness ${l.toFixed(4)}, ${SHARE[step][mode]}% of the way from ${l0.toFixed(4)} to ${l1.toFixed(4)}`,
          );
          line.push(l);
          // Its contrast reads on it, like every step's.
          const ratio = wcagContrast(evaluateColor(`var(${token}--${step}--contrast)`, ctx), value);
          assert.ok(ratio >= 4.5, `${mode} ${token}--${step}--contrast: ${ratio.toFixed(2)}:1`);
        }
        line.push(l0);
        const sign = Math.sign(l0 - l1);
        for (let i = 1; i < line.length; i++)
          assert.ok(
            Math.sign(line[i] - line[i - 1]) === sign,
            `${mode} ${name}: stroke, low, lower, lowest, colour in order (${line.map((v) => v.toFixed(3)).join(', ')})`,
          );
        const ratio = wcagContrast(evaluateColor(`var(${token}--low)`, ctx), colour);
        out.push(
          `${mode} ${name} ${oklch(evaluateColor(`var(${token}--low)`, ctx))[0].toFixed(3)} (${ratio.toFixed(2)}:1)`,
        );
        // A divider: clearly there, and well under the 3:1 of a boundary. On
        // its own surface Material's is 1.62:1 in light mode and 1.98:1 in dark.
        if (theme.preset)
          assert.ok(
            ratio >= 1.5 && ratio <= 2.5,
            `${mode} ${token}--low is ${ratio.toFixed(2)}:1 on --color--${name}`,
          );
      }
    }
    t.diagnostic(`--stroke--low and its contrast on the palette's colour: ${out.join(', ')}`);
  });
}

test('on Material 3’s own surface and outline, the low stroke is Material’s outline-variant', (t) => {
  // The tones of Material 3's tables: surface 98, outline 50 and
  // outline-variant 80 in light mode; 6, 60 and 30 in dark.
  const M3: Record<Mode, { surface: number; outline: number; variant: number }> = {
    light: { surface: 98, outline: 50, variant: 80 },
    dark: { surface: 6, outline: 60, variant: 30 },
  };
  const grey = (tone: number) => `oklch(${toneLightness(tone)} 0 0)`;
  for (const mode of MODES) {
    const ctx = contextFor(
      themes[0].decls,
      mode,
      new Map([
        [`--color--surface--mode-${mode}`, grey(M3[mode].surface)],
        [`--color--surface--stroke--mode-${mode}`, grey(M3[mode].outline)],
      ]),
    );
    const [l] = oklch(evaluateColor('var(--color--surface--stroke--low)', ctx));
    const want = toneLightness(M3[mode].variant);
    t.diagnostic(`${mode}: ${l.toFixed(4)}, tone ${M3[mode].variant} is ${want.toFixed(4)}`);
    assert.ok(
      Math.abs(l - want) < 5e-4,
      `${mode}: ${l.toFixed(4)}, tone ${M3[mode].variant} is ${want.toFixed(4)}`,
    );
  }
});

test('a theme’s own $stroke is mixed the same way: its dividers take its hue, even on a grey surface written with hue 0', () => {
  for (const mode of MODES) {
    const ctx = contextFor(
      themes[0].decls,
      mode,
      new Map([
        [`--color--surface--mode-${mode}`, 'oklch(0.9 0 0)'],
        [`--color--surface--stroke--mode-${mode}`, 'oklch(0.6 0.15 286)'],
      ]),
    );
    const share = SHARE.low[mode] / 100;
    const [l, c, h] = oklch(evaluateColor('var(--color--surface--stroke--low)', ctx));
    assert.ok(Math.abs(l - (0.9 - share * 0.3)) < 1e-6, `${mode}: lightness ${l.toFixed(4)}`);
    assert.ok(Math.abs(c - share * 0.15) < 1e-6, `${mode}: chroma ${c.toFixed(4)}`);
    // An oklch mix would turn it towards the surface's 0°: 332° in light mode.
    assert.ok(Math.abs(h - 286) < 1e-3, `${mode}: hue ${h.toFixed(2)}`);
  }
});

test('a hand-written --color--surface--stroke or --color--surface moves the quiet strokes with it', () => {
  for (const mode of MODES) {
    const share = SHARE.low[mode] / 100;
    const stroke = contextFor(
      themes[0].decls,
      mode,
      new Map([['--color--surface--stroke', 'oklch(0.5 0.1 150)']]),
    );
    const [s0] = oklch(evaluateColor('var(--color--surface)', stroke));
    const [l] = oklch(evaluateColor('var(--color--surface--stroke--low)', stroke));
    assert.ok(Math.abs(l - (s0 + share * (0.5 - s0))) < 1e-6, `${mode}: a stroke of its own`);

    const surface = contextFor(
      themes[0].decls,
      mode,
      new Map([['--color--surface', 'oklch(0.6 0.05 150)']]),
    );
    const [s1] = oklch(evaluateColor('var(--color--surface--stroke)', surface));
    const [m] = oklch(evaluateColor('var(--color--surface--stroke--low)', surface));
    assert.ok(Math.abs(m - (0.6 + share * (s1 - 0.6))) < 1e-6, `${mode}: a surface of its own`);
  }
});

test('over a sweep of colours the screen can show, the low stroke is a visible line that is quieter than the stroke', (t) => {
  // Each colour is one palette's colour in one mode, taken in turn, as in the
  // stroke's own sweep (contrast.test.ts).
  const { decls } = themes[0];
  const pairs = NEUTRALS.flatMap((name) => MODES.map((mode) => ({ name, mode })));
  const measured: { where: string; ratio: number; stroke: number }[] = [];
  let n = 0;
  for (let i = 0; i <= 100; i += 2) {
    const l = i / 100;
    for (const c of [0, 0.01, 0.04, 0.1, 0.2])
      for (let h = 0; h < 360; h += 60) {
        const colour = `oklch(${l} ${c} ${h})`;
        if (!cssColor(colour).inGamut('srgb', { epsilon: 1e-5 })) continue;
        const { name, mode } = pairs[n++ % pairs.length];
        const ctx = contextFor(decls, mode, new Map([[`--color--${name}--mode-${mode}`, colour]]));
        const on = evaluateColor(`var(--color--${name})`, ctx);
        measured.push({
          where: `${colour} ${mode} --color--${name}--stroke--low`,
          ratio: wcagContrast(evaluateColor(`var(--color--${name}--stroke--low)`, ctx), on),
          stroke: wcagContrast(evaluateColor(`var(--color--${name}--stroke)`, ctx), on),
        });
      }
  }
  const sorted = [...measured].sort((a, b) => a.ratio - b.ratio);
  t.diagnostic(
    `${measured.length} colours; lowest ${sorted[0].ratio.toFixed(2)}:1 at ${sorted[0].where}, ` +
      `highest ${sorted.at(-1)!.ratio.toFixed(2)}:1 at ${sorted.at(-1)!.where}`,
  );
  assert.ok(measured.length > 400, `only ${measured.length} colours measured`);
  assert.deepEqual(
    measured.filter((m) => m.ratio < 1.2).map((m) => `${m.where} ${m.ratio.toFixed(2)}`),
    [],
    'a line of 1.2:1 or more on its palette’s colour',
  );
  assert.deepEqual(
    measured
      .filter((m) => m.ratio >= m.stroke)
      .map((m) => `${m.where} ${m.ratio.toFixed(2)} (stroke ${m.stroke.toFixed(2)})`),
    [],
    'quieter than the stroke',
  );
});
