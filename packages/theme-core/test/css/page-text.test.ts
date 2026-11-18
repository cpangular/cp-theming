// Text colours for the page (issue #13, PORT-PLAN.md Phase 19): the three
// --container--text* variables outside any container.
//
//   --container--text             text on the page: the background's contrast
//   --container--text-emphasis    the same
//   --container--text-deemphasis  muted text: that contrast mixed with the
//                                 background at the de-emphasis weight
//
// Core declares them on :where(:root, [theme]), so every theme element has
// them against its own background and `var(--container--text-deemphasis)` is
// muted text anywhere. filled() declares its own, against its fill; bg() and
// outlined() declare none, as before.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { compileSource, coreDir, repoRoot } from '../lib/sass.ts';
import { contextFor, evaluateColor, wcagContrast, type Mode } from '../lib/color.ts';
import { normalizeSelector, rules } from '../lib/css.ts';
import {
  coreFixtureSheets,
  coreSheets,
  themeDeclarations,
  themeName,
  type Stylesheet,
} from '../lib/sets.ts';

const { core, presets } = coreSheets();
const fixtures = coreFixtureSheets();
const MODES: Mode[] = ['light', 'dark'];
const NAMES = ['--container--text', '--container--text-emphasis', '--container--text-deemphasis'];
/** The de-emphasis weight core defaults to, per mode (surface-containers.test.ts). */
const WEIGHT: Record<Mode, number> = { light: 0.63, dark: 0.93 };
const squash = (value: string) =>
  value.replace(/\s+/g, ' ').replace(/\( /g, '(').replace(/ \)/g, ')');

const coreRules = rules(core.css).filter((r) => !r.context.length);
const rule = (selector: string) =>
  coreRules.find((r) => normalizeSelector(r.selector) === selector)!;
const lightness = (c: ReturnType<typeof evaluateColor>) => c.to('oklch').coords[0] ?? NaN;

/** The muted colour the Sass must write: `contrast` mixed with `fill`, each mode at its own weight. */
const muted = (contrast: string, fill: string) =>
  `light-dark(${(['light', 'dark'] as const)
    .map(
      (mode) =>
        `color-mix(in oklch, var(${contrast}) var(--weight--text-deemphasis-blend--mode-${mode}, ${WEIGHT[mode] * 100}%), var(${fill}))`,
    )
    .join(', ')})`;

// ── What core declares ───────────────────────────────────────────────────────

test('core declares the three text variables on :where(:root, [theme]), against the background', () => {
  const shared = new Map(rule(':where(:root, [theme])').declarations);
  assert.equal(shared.get('--container--text'), 'var(--color--background--contrast)');
  assert.equal(shared.get('--container--text-emphasis'), 'var(--color--background--contrast)');
  assert.equal(
    squash(shared.get('--container--text-deemphasis')!),
    muted('--color--background--contrast', '--color--background'),
  );
  // Each side reads its own mode's weight, never the picked one: the picked
  // weight would freeze at the theme element and a themeMode subtree would mix
  // the flipped colours at the outer weight.
  assert.doesNotMatch(
    shared.get('--container--text-deemphasis')!,
    /var\(--weight--text-deemphasis-blend[,)]/,
  );
});

test('only the shared rule and filled() declare them: bg() and outlined() leave them to inherit', () => {
  const declaring = coreRules
    .filter((r) => r.declarations.some(([n]) => NAMES.includes(n)))
    .map((r) => normalizeSelector(r.selector));
  assert.deepEqual(
    declaring.sort(),
    [':where(:root, [theme])', '[palette][filled][filled]'].sort(),
  );
  // filled(): the same three, against its own fill.
  const filled = new Map(rule('[palette][filled][filled]').declarations);
  assert.equal(filled.get('--container--text'), 'var(--palette-color--contrast)');
  assert.equal(
    squash(filled.get('--container--text-deemphasis')!),
    muted('--palette-color--contrast', '--palette-color'),
  );
});

test('no theme declares them: they follow the theme’s background and weights', () => {
  for (const sheet of [...presets, ...fixtures])
    for (const r of rules(sheet.css))
      assert.deepEqual(
        r.declarations.filter(([n]) => NAMES.includes(n)),
        [],
        `${sheet.label} ${r.selector}`,
      );
});

// ── What it comes to ─────────────────────────────────────────────────────────

for (const sheet of [...presets, ...fixtures]) {
  test(`${sheet.label}: page text is the background's contrast; muted text is 4.5:1 or more on the background and on the surface`, (t) => {
    const decls = themeDeclarations(core, sheet, themeName(sheet));
    const out: string[] = [];
    for (const mode of MODES) {
      const context = contextFor(decls, mode);
      const read = (name: string) => evaluateColor(`var(${name})`, context);
      const background = read('--color--background');
      const contrast = read('--color--background--contrast');
      for (const name of ['--container--text', '--container--text-emphasis'])
        assert.equal(wcagContrast(read(name), contrast), 1, `${mode} ${name} is the contrast`);

      const quiet = read('--container--text-deemphasis');
      assert.equal(quiet.alpha ?? 1, 1, `${mode}: opaque`);
      // The weighted mean of the two lightnesses, at the weight in force.
      const weight =
        Number.parseFloat(decls.get(`--weight--text-deemphasis-blend--mode-${mode}`)!) / 100;
      assert.ok(
        Math.abs(
          lightness(quiet) - (weight * lightness(contrast) + (1 - weight) * lightness(background)),
        ) < 1e-6,
        `${mode}: lightness ${lightness(quiet)}`,
      );
      // Quieter than the text, and still text.
      const ratios = ['background', 'surface'].map((on) =>
        wcagContrast(quiet, read(`--color--${on}`)),
      );
      assert.ok(ratios[0] < wcagContrast(contrast, background), `${mode}: quieter than the text`);
      for (const [i, on] of ['background', 'surface'].entries())
        assert.ok(ratios[i] >= 4.5, `${mode} on the ${on}: ${ratios[i].toFixed(2)}:1`);
      out.push(
        `${mode} ${(weight * 100).toFixed(0)}%: L ${lightness(quiet).toFixed(3)}, ` +
          `${ratios[0].toFixed(2)}:1 on the background, ${ratios[1].toFixed(2)}:1 on the surface`,
      );
    }
    t.diagnostic(out.join('; '));
  });
}

function theme(name: string, args: string): Stylesheet {
  const compiled = compileSource(
    `@use "theme" as t;\n@include t.define-theme("${name}", t.theme(${args}));`,
    path.join(coreDir, 'scss', `__page-text-${name}.scss`),
    [path.join(coreDir, 'scss')],
  );
  assert.deepEqual(compiled.warnings, [], `${name} compiles without warnings`);
  return { ...compiled, label: path.relative(repoRoot, compiled.entry) };
}

test('a theme’s own $text-deemphasis-blend moves the page’s muted text', () => {
  const sheet = theme(
    'quiet',
    '$palettes: (primary: t.palette(#0c6ab6), background: t.palette(oklch(0.97 0 0))), ' +
      '$weights: t.weights($text-deemphasis-blend: 75%)',
  );
  const decls = themeDeclarations(core, sheet, 'quiet');
  const quiet = evaluateColor('var(--container--text-deemphasis)', contextFor(decls, 'light'));
  // Black at 75% into a background of 0.97.
  assert.ok(Math.abs(lightness(quiet) - 0.25 * 0.97) < 1e-6, `${lightness(quiet)}`);
});

test('a theme with a dark page in light mode: the text variables are white-based', () => {
  // The background decides, not the mode.
  const sheet = theme(
    'night',
    '$palettes: (primary: t.palette(#8ab4f8), background: t.palette(oklch(0.2 0.02 260)))',
  );
  const context = contextFor(themeDeclarations(core, sheet, 'night'), 'light');
  const read = (name: string) => evaluateColor(`var(${name})`, context);
  assert.ok(lightness(read('--container--text')) > 0.99);
  const quiet = read('--container--text-deemphasis');
  assert.ok(Math.abs(lightness(quiet) - (0.63 + 0.37 * 0.2)) < 1e-4, `${lightness(quiet)}`);
  assert.ok(wcagContrast(quiet, read('--color--background')) >= 4.5);
});

test('muted text on a coloured fill keeps the fill’s hue: the contrast colour has no hue', () => {
  // Black and white are written `oklch(… l 0 none / 1)`. With a hue of 0
  // instead, a mix in oklch turned towards 0° by the weight: muted text on a
  // blue fill came out purple.
  const shared = new Map(rule(':where(:root, [theme])').declarations);
  for (const [name, value] of shared)
    if (name.endsWith('--contrast') && value.includes('srgb-linear'))
      assert.match(squash(value), / l 0 none \/ 1\)$/, name);
  for (const sheet of presets)
    for (const mode of MODES) {
      const context = contextFor(themeDeclarations(core, sheet, themeName(sheet)), mode);
      const fill = evaluateColor('var(--color--primary)', context);
      const mix = evaluateColor(
        'color-mix(in oklch, var(--color--primary--contrast) 63%, var(--color--primary))',
        context,
      );
      const [fh, mh] = [fill.to('oklch').coords[2]!, mix.to('oklch').coords[2]!];
      const distance = Math.abs(((fh - mh + 540) % 360) - 180);
      assert.ok(
        distance < 1,
        `${sheet.label} ${mode}: fill ${fh.toFixed(1)}°, muted ${mh.toFixed(1)}°`,
      );
    }
});
