// A palette that prefers white or black text (issue #8, PORT-PLAN.md Phase 19):
// `$contrast: prefer-white | prefer-black` in t.palette().
//
// Without it, --contrast is black or white by the step at luminance 0.179 and
// reaches 4.5:1 (contrast.test.ts). With it, the palette's colour and its six
// ladder steps take the preferred colour wherever that colour reaches 3:1 on
// them (WCAG large text and icons) and the other one elsewhere. Every colour
// here is read from the compiled CSS through the evaluator; what "white reaches
// 3:1" means is worked out here from the colour itself, not from the CSS.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { compileSource, coreDir, repoRoot } from '../lib/sass.ts';
import {
  contextFor,
  cssColor,
  evaluateColor,
  painted,
  wcagContrast,
  type Mode,
} from '../lib/color.ts';
import { declarationsFor, rules, themeSelector } from '../lib/css.ts';
import { coreSheets, themeDeclarations, type Stylesheet } from '../lib/sets.ts';

const { core, presets } = coreSheets();
const FLOOR = 3;
const STEPS = ['', '--dark', '--darker', '--darkest', '--light', '--lighter', '--lightest'];
const ALIASES = ['--high', '--higher', '--highest', '--low', '--lower', '--lowest'];
const WHITE = cssColor('white');
const BLACK = cssColor('black');
type Preference = 'prefer-white' | 'prefer-black';

function theme(name: string, args: string): Stylesheet {
  const compiled = compileSource(
    `@use "theme" as t;\n@include t.define-theme("${name}", t.theme(${args}));`,
    path.join(coreDir, 'scss', `__contrast-${name}.scss`),
    [path.join(coreDir, 'scss')],
  );
  assert.deepEqual(compiled.warnings, [], `${name} compiles without warnings`);
  return { ...compiled, label: path.relative(repoRoot, compiled.entry) };
}
const declsOf = (s: Stylesheet, name: string) => themeDeclarations(core, s, name);
const ruleOf = (s: Stylesheet, name: string) => declarationsFor(s.css, themeSelector(name));

/** Black or white, as painted. Anything else fails. */
function textOf(token: string, ctx: ReturnType<typeof contextFor>): 'white' | 'black' {
  const text = evaluateColor(`var(${token}--contrast)`, ctx);
  const [r, g, b] = painted(text).coords.map((v) => v ?? 0);
  assert.equal(text.alpha ?? 1, 1, `${token}--contrast is opaque`);
  if (Math.min(r, g, b) > 1 - 1e-4) return 'white';
  if (Math.max(r, g, b) < 1e-4) return 'black';
  return assert.fail(`${token}--contrast is neither black nor white: ${text.toString()}`);
}

/** What the preference asks for on this colour, from the colour alone. */
function expected(colour: ReturnType<typeof cssColor>, preference: Preference): 'white' | 'black' {
  if (preference === 'prefer-white')
    return wcagContrast(WHITE, colour) >= FLOOR ? 'white' : 'black';
  return wcagContrast(BLACK, colour) >= FLOOR ? 'black' : 'white';
}

// ── The steps ────────────────────────────────────────────────────────────────

test('core declares the two preference steps once, beside the default one', () => {
  const root = rules(core.css).filter((r) => r.selector === ':where(:root)' && !r.context.length);
  const steps = root
    .flatMap((r) => r.declarations)
    .filter(([n]) => n.startsWith('--theme--_contrast-step'));
  assert.deepEqual(
    steps.map(([n]) => n),
    [
      '--theme--_contrast-step',
      '--theme--_contrast-step--prefer-white',
      '--theme--_contrast-step--prefer-black',
    ],
  );
  const cutoff = (value: string) => Number(/^clamp\(0, \(([\d.]+) - /.exec(value)?.[1]);
  // White reaches 3:1 while 1.05 / (Y + 0.05) >= 3; black while (Y + 0.05) / 0.05 >= 3.
  assert.ok(Math.abs(cutoff(steps[1][1]) - (1.05 / FLOOR - 0.05)) < 1e-9, steps[1][1]);
  assert.ok(Math.abs(cutoff(steps[2][1]) - (0.05 * FLOOR - 0.05)) < 1e-9, steps[2][1]);
  // The same expression as the default step, another cut-off.
  const shape = (value: string) => value.replace(/^clamp\(0, \([\d.]+ - /, 'clamp(0, (N - ');
  assert.equal(shape(steps[1][1]), shape(steps[0][1]));
  assert.equal(shape(steps[2][1]), shape(steps[0][1]));
});

// ── What a theme rule holds ──────────────────────────────────────────────────

const red = theme('red', '$brand: t.palette(#e65151, $contrast: prefer-white)');
const plain = theme('plain', '$brand: #e65151');

test('a palette with a preference declares its seven colour-role contrasts, and nothing else new', () => {
  const withPreference = [...ruleOf(red, 'red').keys()];
  const without = [...ruleOf(plain, 'plain').keys()];
  assert.deepEqual(
    withPreference.filter((n) => !without.includes(n)),
    STEPS.map((s) => `--color--brand${s}--contrast`),
  );
  assert.deepEqual(
    without.filter((n) => !withPreference.includes(n)),
    [],
  );
  for (const step of STEPS) {
    const value = ruleOf(red, 'red').get(`--color--brand${step}--contrast`)!;
    assert.match(value, /var\(--theme--_contrast-step--prefer-white\)/);
    assert.match(value, /\/ 1\)$/, 'opaque');
  }
});

test('without a preference a theme rule declares no contrast: the presets do not', () => {
  for (const preset of [...presets, plain]) {
    const contrasts = rules(preset.css)
      .filter((r) => r.selector.includes('[theme='))
      .flatMap((r) => r.declarations.map(([n]) => n))
      .filter((n) => n.endsWith('--contrast'));
    assert.deepEqual(contrasts, [], preset.label);
  }
});

// ── #e65151, the colour of the issue ─────────────────────────────────────────

test('#e65151: black by default (5.66:1), white with prefer-white (3.71:1), its --dark step (#bb252e) white at 6.13:1', (t) => {
  for (const mode of ['light', 'dark'] as Mode[]) {
    const byDefault = contextFor(declsOf(plain, 'plain'), mode);
    assert.equal(textOf('--color--brand', byDefault), 'black');
    const brand = evaluateColor('var(--color--brand)', byDefault);
    assert.ok(Math.abs(wcagContrast(BLACK, brand) - 5.66) < 0.01);
    assert.ok(Math.abs(wcagContrast(WHITE, brand) - 3.71) < 0.01);

    const preferred = contextFor(declsOf(red, 'red'), mode);
    assert.equal(textOf('--color--brand', preferred), 'white');
    const dark = evaluateColor('var(--color--brand--dark)', preferred);
    assert.equal(textOf('--color--brand--dark', preferred), 'white');
    const ratio = wcagContrast(WHITE, dark);
    t.diagnostic(`${mode}: white on --color--brand--dark ${ratio.toFixed(2)}:1`);
    assert.ok(Math.abs(ratio - 6.13) < 0.01, `${ratio}`);
  }
});

test('#e65151 with prefer-white: every ladder step and alias takes white where white reaches 3:1', (t) => {
  const lines: string[] = [];
  for (const mode of ['light', 'dark'] as Mode[]) {
    const ctx = contextFor(declsOf(red, 'red'), mode);
    for (const step of [...STEPS, ...ALIASES]) {
      const token = `--color--brand${step}`;
      const colour = evaluateColor(`var(${token})`, ctx);
      const text = textOf(token, ctx);
      assert.equal(text, expected(colour, 'prefer-white'), `${mode} ${token}`);
      const ratio = wcagContrast(text === 'white' ? WHITE : BLACK, colour);
      assert.ok(ratio >= FLOOR, `${mode} ${token} ${ratio.toFixed(2)}:1`);
      if (mode === 'light' && STEPS.includes(step))
        lines.push(`${step || 'base'} ${text} ${ratio.toFixed(2)}:1`);
    }
  }
  t.diagnostic(lines.join(', '));
});

test('the preference is the colour role only: the bg and stroke roles keep the default step', () => {
  const rule = ruleOf(red, 'red');
  assert.deepEqual(
    [...rule.keys()].filter((n) => /--(?:bg|stroke)(?:--\w+)?--contrast$/.test(n)),
    [],
  );
  for (const mode of ['light', 'dark'] as Mode[]) {
    const withPreference = contextFor(declsOf(red, 'red'), mode);
    const byDefault = contextFor(declsOf(plain, 'plain'), mode);
    for (const role of ['--bg', '--stroke'])
      for (const step of STEPS)
        assert.equal(
          textOf(`--color--brand${role}${step}`, withPreference),
          textOf(`--color--brand${role}${step}`, byDefault),
          `${mode} --color--brand${role}${step}`,
        );
  }
});

test("the docs' other way to 4.5:1: #e65151 with 0.05 less oklch lightness is #d44042, white at 4.55:1", () => {
  const [l, c, h] = cssColor('#e65151')
    .to('oklch')
    .coords.map((v) => v ?? 0);
  const darker = cssColor(`oklch(${l - 0.05} ${c} ${h})`);
  const hex = painted(darker)
    .coords.map((v) =>
      Math.round((v ?? 0) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('');
  assert.equal(hex, 'd44042');
  assert.ok(Math.abs(wcagContrast(WHITE, cssColor('#d44042')) - 4.55) < 0.01);
});

// ── Any colour ───────────────────────────────────────────────────────────────

for (const preference of ['prefer-white', 'prefer-black'] as Preference[]) {
  test(`${preference} over a hue × lightness × chroma grid: the preferred colour wherever it reaches ${FLOOR}:1, never under ${FLOOR}:1`, (t) => {
    const sheet = theme(
      `grid-${preference}`,
      `$palettes: (primary: t.palette(#808080, $contrast: ${preference}))`,
    );
    const decls = declsOf(sheet, `grid-${preference}`);
    let lowest = { ratio: Infinity, where: '' };
    let preferred = 0;
    let total = 0;
    for (let h = 0; h < 360; h += 10)
      for (let l = 0.1; l <= 0.9501; l += 0.05)
        for (const c of [0, 0.04, 0.1, 0.16, 0.22, 0.3]) {
          const base = `oklch(${l.toFixed(2)} ${c} ${h})`;
          const ctx = contextFor(decls, 'light', new Map([['--color--primary', base]]));
          const colour = evaluateColor('var(--color--primary)', ctx);
          const want = expected(colour, preference);
          const ratio = wcagContrast(want === 'white' ? WHITE : BLACK, colour);
          // Within a hair of the cut-off the step is between 0 and 1; none of
          // the grid's colours is that close (the assertion in textOf holds).
          assert.equal(textOf('--color--primary', ctx), want, base);
          assert.ok(ratio >= FLOOR, `${base} ${ratio.toFixed(2)}:1`);
          total++;
          if (want === (preference === 'prefer-white' ? 'white' : 'black')) preferred++;
          if (ratio < lowest.ratio) lowest = { ratio, where: base };
        }
    t.diagnostic(
      `${preferred} of ${total} colours take ${preference === 'prefer-white' ? 'white' : 'black'}; lowest ${lowest.ratio.toFixed(2)}:1 at ${lowest.where}`,
    );
  });
}

test('prefer-black: a green the default step gives white text takes black at 3:1 or more', () => {
  const green = theme('green', '$palettes: (primary: t.palette(#2e7d32, $contrast: prefer-black))');
  const plainGreen = theme('plain-green', '$palettes: (primary: t.palette(#2e7d32))');
  const colour = cssColor('#2e7d32');
  assert.equal(
    textOf('--color--primary', contextFor(declsOf(plainGreen, 'plain-green'), 'light')),
    'white',
  );
  assert.equal(textOf('--color--primary', contextFor(declsOf(green, 'green'), 'light')), 'black');
  assert.ok(wcagContrast(BLACK, colour) >= FLOOR);
});

// ── Who the preference belongs to ────────────────────────────────────────────

test('a primary with a preference and no brand: the brand palette, which is that primary, takes it too', () => {
  const sheet = theme('pri', '$palettes: (primary: t.palette(#e65151, $contrast: prefer-white))');
  const rule = ruleOf(sheet, 'pri');
  for (const step of STEPS)
    assert.equal(
      rule.get(`--color--brand${step}--contrast`),
      rule
        .get(`--color--primary${step}--contrast`)!
        .replaceAll('--color--primary', '--color--brand'),
    );
  const ctx = contextFor(declsOf(sheet, 'pri'), 'light');
  assert.equal(textOf('--color--primary', ctx), 'white');
  assert.equal(textOf('--color--brand', ctx), 'white');
});

test('a brand with a preference: the primary generated from it keeps the default step', () => {
  const rule = ruleOf(red, 'red');
  assert.equal(
    [...rule.keys()].some((n) => n.startsWith('--color--primary') && n.endsWith('--contrast')),
    false,
  );
});

test('a preference in one mode of t.light-dark() applies in that mode only', () => {
  const sheet = theme(
    'one-mode',
    '$palettes: (primary: t.light-dark(t.palette(#e65151, $contrast: prefer-white), t.palette(#e65151)))',
  );
  const value = ruleOf(sheet, 'one-mode').get('--color--primary--contrast')!;
  assert.match(
    value,
    /^light-dark\(oklch\(.*prefer-white.*\/ 1\), oklch\(.*--theme--_contrast-step\).*\/ 1\)\)$/,
  );
  const decls = declsOf(sheet, 'one-mode');
  assert.equal(textOf('--color--primary', contextFor(decls, 'light')), 'white');
  assert.equal(textOf('--color--primary', contextFor(decls, 'dark')), 'black');
});

test('$brand takes a colour or a t.palette(); any other $contrast value is an error', () => {
  const asPalettes = theme(
    'red',
    '$palettes: (brand: t.palette(#e65151, $contrast: prefer-white))',
  );
  assert.deepEqual([...ruleOf(asPalettes, 'red')], [...ruleOf(red, 'red')]);
  assert.throws(
    () => theme('bad', '$brand: t.palette(#e65151, $contrast: white)'),
    /prefer-white or prefer-black/,
  );
});
