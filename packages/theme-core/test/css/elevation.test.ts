// Elevation shadows (issue #11, PORT-PLAN.md Phase 19): Material's three
// layers per level are the default geometry.
//
//   --elevation-N--shadow   key, penumbra and ambient shadow of level N, the
//                           offsets, blurs and spreads Angular Material draws
//                           for its levels 1–5, in black at 20%, 14% and 12%
//                           in light mode and 33.3%, 23.3% and 20% in dark.
//   $shadow-color           shared out over the three layers at 2/3, 7/15 and
//                           2/5 of its alpha, by the browser.
//   $levels                 a shadow passed for a level is used as written.
//
// The geometry and the shares are written here, not read from the Sass; the
// Material adapter's own test holds the geometry to the installed Material's.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { compileSource, coreDir } from '../lib/sass.ts';
import { contextFor, cssColor, evaluateColor, type Mode } from '../lib/color.ts';
import { declarationsFor, themeSelector } from '../lib/css.ts';
import { coreSheets } from '../lib/sets.ts';

const { core, presets } = coreSheets();
const root = declarationsFor(core.css, ':where(:root)');

/** Key, penumbra, ambient: offset-x, offset-y, blur, spread. */
const GEOMETRY: Record<number, string[]> = {
  1: ['0 2px 1px -1px', '0 1px 1px 0', '0 1px 3px 0'],
  2: ['0 3px 3px -2px', '0 3px 4px 0', '0 1px 8px 0'],
  3: ['0 3px 5px -1px', '0 6px 10px 0', '0 1px 18px 0'],
  4: ['0 5px 5px -3px', '0 8px 10px 1px', '0 3px 14px 2px'],
  5: ['0 7px 8px -4px', '0 12px 17px 2px', '0 5px 22px 4px'],
};
const SHARE = [2 / 3, 7 / 15, 2 / 5];
const DEFAULT_ALPHA: Record<Mode, number> = { light: 0.3, dark: 0.5 };

/** The layers of a box-shadow value: split at its top-level commas. */
function layers(value: string): string[] {
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
  return out;
}

/** One layer as its geometry and the colour that follows it. */
function parts(layer: string): { geometry: string; colour: string } {
  const m = /^((?:-?[\d.]+(?:px)? ){4})(.+)$/.exec(layer);
  assert.ok(m, `a layer is four lengths and a colour: ${layer}`);
  return { geometry: m[1].trim(), colour: m[2] };
}

const alphaOf = (colour: string, mode: Mode, decls = new Map<string, string>()) =>
  evaluateColor(colour, contextFor(decls, mode)).alpha ?? 1;

function theme(name: string, args: string): Map<string, string> {
  const compiled = compileSource(
    `@use "theme" as t;\n@include t.define-theme("${name}", t.theme(${args}));`,
    path.join(coreDir, 'scss', `__elevation-${name}.scss`),
    [path.join(coreDir, 'scss')],
  );
  assert.deepEqual(compiled.warnings, [], `${name} compiles without warnings`);
  return declarationsFor(compiled.css, themeSelector(name));
}

// ── The defaults ─────────────────────────────────────────────────────────────

test('levels 1 to 5 are three shadows each, with Material’s offsets, blurs and spreads; level 0 is none', () => {
  assert.equal(root.get('--elevation-0--shadow'), 'none');
  for (let level = 1; level <= 5; level++) {
    const value = root.get(`--elevation-${level}--shadow`)!;
    assert.deepEqual(
      layers(value).map((l) => parts(l).geometry),
      GEOMETRY[level],
      `level ${level}`,
    );
  }
});

test('the default layers are black at 20%, 14% and 12% in light mode and at 33%, 23% and 20% in dark', () => {
  for (let level = 1; level <= 5; level++)
    for (const [i, layer] of layers(root.get(`--elevation-${level}--shadow`)!).entries()) {
      const { colour } = parts(layer);
      // One colour per mode, light-dark() around the colour only.
      assert.match(colour, /^light-dark\([^,]+, [^,]+\)$/, `level ${level} layer ${i + 1}`);
      for (const mode of ['light', 'dark'] as Mode[]) {
        const c = evaluateColor(colour, contextFor(new Map(), mode));
        assert.deepEqual(
          c.to('srgb').coords.map((v) => v ?? 0),
          [0, 0, 0],
          'black',
        );
        assert.ok(
          Math.abs((c.alpha ?? 1) - DEFAULT_ALPHA[mode] * SHARE[i]) < 0.0005,
          `level ${level} layer ${i + 1} ${mode}: ${c.alpha}`,
        );
      }
    }
  // Material's own three: 0.2, 0.14, 0.12.
  const light = layers(root.get('--elevation-1--shadow')!).map((l) =>
    alphaOf(parts(l).colour, 'light'),
  );
  assert.deepEqual(light, [0.2, 0.14, 0.12]);
});

test('no preset declares a shadow: every one has core’s', () => {
  for (const sheet of presets) assert.ok(!/--elevation-\d--shadow/.test(sheet.css), sheet.label);
});

// ── $shadow-color ────────────────────────────────────────────────────────────

test('$shadow-color is shared out over the three layers by the browser: 2/3, 7/15 and 2/5 of its alpha', () => {
  const decls = theme(
    'tinted',
    '$elevation: t.elevation($shadow-color: oklch(0.45 0.2 300 / 45%))',
  );
  assert.ok(!decls.has('--elevation-0--shadow'), 'level 0 stays none');
  for (let level = 1; level <= 5; level++) {
    const all = layers(decls.get(`--elevation-${level}--shadow`)!);
    assert.deepEqual(
      all.map((l) => parts(l).geometry),
      GEOMETRY[level],
      `level ${level}`,
    );
    for (const [i, layer] of all.entries()) {
      const { colour } = parts(layer);
      // The same in both modes, so no light-dark(); the colour itself is not
      // worked out by Sass.
      assert.match(
        colour,
        /^oklch\(from oklch\(45% 0\.2 300deg \/ 0\.45\) l c h \/ calc\(alpha \* 0\.\d+\)\)$/,
      );
      const c = evaluateColor(colour, contextFor(new Map(), 'light'));
      assert.ok(Math.abs((c.alpha ?? 1) - 0.45 * SHARE[i]) < 0.0005, `layer ${i + 1}: ${c.alpha}`);
      const [l, ch, h] = c.to('oklch').coords;
      assert.ok(
        Math.abs(l! - 0.45) < 1e-6 && Math.abs(ch! - 0.2) < 1e-6 && Math.abs(h! - 300) < 1e-6,
        'the colour is the one passed',
      );
    }
  }
});

test('passing the default colours gives the default shadows', () => {
  const decls = theme(
    'defaults',
    '$elevation: t.light-dark(t.elevation($shadow-color: oklch(0 0 0 / 30%)), t.elevation($shadow-color: oklch(0 0 0 / 50%)))',
  );
  for (let level = 1; level <= 5; level++) {
    const passed = layers(decls.get(`--elevation-${level}--shadow`)!);
    const defaults = layers(root.get(`--elevation-${level}--shadow`)!);
    for (const [i, layer] of passed.entries())
      for (const mode of ['light', 'dark'] as Mode[])
        assert.ok(
          Math.abs(alphaOf(parts(layer).colour, mode) - alphaOf(parts(defaults[i]).colour, mode)) <
            0.0005,
          `level ${level} layer ${i + 1} ${mode}`,
        );
  }
});

test('a $shadow-color in one mode only: the other mode keeps the default, one declaration serves both', () => {
  const decls = theme(
    'dark-only',
    '$elevation: t.light-dark(t.elevation(), t.elevation($shadow-color: oklch(0 0 0 / 60%)))',
  );
  for (const [i, layer] of layers(decls.get('--elevation-3--shadow')!).entries()) {
    const { geometry, colour } = parts(layer);
    assert.equal(geometry, GEOMETRY[3][i]);
    assert.match(colour, /^light-dark\(oklch\(0% 0 0deg \/ [\d.]+\), oklch\(from /);
    assert.ok(Math.abs(alphaOf(colour, 'light') - 0.3 * SHARE[i]) < 0.0005);
    assert.ok(Math.abs(alphaOf(colour, 'dark') - 0.6 * SHARE[i]) < 0.0005);
  }
});

test('a var() works as $shadow-color: the shares are taken where it is used', () => {
  const decls = theme('from-var', '$elevation: t.elevation($shadow-color: var(--my-shadow))');
  const value = decls.get('--elevation-2--shadow')!;
  assert.equal(value.split('var(--my-shadow)').length - 1, 3);
  const mine = new Map([['--my-shadow', 'rgb(20 30 90 / 0.6)']]);
  for (const [i, layer] of layers(value).entries()) {
    const c = evaluateColor(parts(layer).colour, contextFor(mine, 'light'));
    assert.ok(Math.abs((c.alpha ?? 1) - 0.6 * SHARE[i]) < 0.0005);
    assert.ok(
      Math.max(...c.to('srgb').coords.map((v, k) => Math.abs((v ?? 0) - [20, 30, 90][k] / 255))) <
        1e-6,
    );
  }
});

// ── $levels ──────────────────────────────────────────────────────────────────

// What IdealLINK passed while core's shadows were one layer (issue #11).
const MATERIAL_1 =
  '0 2px 1px -1px rgb(0 0 0 / 20%), 0 1px 1px 0 rgb(0 0 0 / 14%), 0 1px 3px 0 rgb(0 0 0 / 12%)';

test('a three-layer shadow passed in $levels lands as written, for both modes', () => {
  const decls = theme('levels', `$elevation: t.elevation($levels: (1: (shadow: (${MATERIAL_1}))))`);
  const value = decls.get('--elevation-1--shadow')!;
  assert.ok(!value.includes('light-dark('), value);
  assert.deepEqual(
    layers(value).map((l) => parts(l).geometry),
    GEOMETRY[1],
  );
  assert.deepEqual(
    layers(value).map((l) => cssColor(parts(l).colour).alpha),
    [0.2, 0.14, 0.12],
  );
  // The levels it did not pass are core's.
  assert.ok(!decls.has('--elevation-2--shadow'));
});

test('a single-layer shadow passed in $levels is still one layer, in both modes', () => {
  const decls = theme(
    'one-layer',
    '$elevation: t.elevation($levels: (2: (shadow: 0 2px 6px rgb(0 0 0 / 30%))))',
  );
  const value = decls.get('--elevation-2--shadow')!;
  assert.equal(layers(value).length, 1);
  // (Sass writes a colour it was given as a colour in its own notation.)
  assert.match(value, /^0 2px 6px rgba\(0, 0, 0, 0\.3\)$/);
});

test('a level passed in one mode with the default’s geometry takes the default’s colours in the other', () => {
  // Same three layers as the default, other colours: one declaration, with
  // light-dark() around each colour.
  const decls = theme(
    'light-levels',
    `$elevation: t.light-dark(t.elevation($levels: (1: (shadow: (${MATERIAL_1.replaceAll('rgb(0 0 0', 'rgb(0 0 90')})))), t.elevation())`,
  );
  const all = layers(decls.get('--elevation-1--shadow')!);
  assert.equal(all.length, 3);
  for (const [i, layer] of all.entries()) {
    const { geometry, colour } = parts(layer);
    assert.equal(geometry, GEOMETRY[1][i]);
    assert.match(colour, /^light-dark\(rgba\(0, 0, 90, [\d.]+\), oklch\(0% 0 0deg \/ [\d.]+\)\)$/);
    assert.ok(Math.abs(alphaOf(colour, 'dark') - 0.5 * SHARE[i]) < 0.0005);
  }
});

test('a level whose light and dark shadows differ in more than colour is an error', () => {
  assert.throws(
    () =>
      theme(
        'mismatch',
        `$elevation: t.light-dark(t.elevation($levels: (1: (shadow: (${MATERIAL_1})))), t.elevation($levels: (1: (shadow: 0 1px 2px black))))`,
      ),
    /differ in more than their colours/,
  );
});
