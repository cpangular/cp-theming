// An accent on the page (issue #15, PORT-PLAN.md Phase 19): the text role and
// the stroke of every palette except background and surface.
//
//   --color--{name}--text    the colour as text: no lighter than 0.40 in light
//                            mode, no darker than 0.82 in dark, same hue,
//                            inside sRGB. 4.5:1 or more on the background and
//                            on the surface.
//   --color--{name}--stroke  the colour as a line: 0.42–0.55 in light mode,
//                            0.65 or lighter in dark, same hue, inside sRGB.
//                            3:1 or more on the background and on the
//                            surface.
//
// Every colour is read from the compiled CSS through the evaluator. The limits
// and the ratios are written here, not read from the Sass, so a change to
// either has to be made twice.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { compileSource, coreDir, repoRoot } from '../lib/sass.ts';
import {
  contextFor,
  cssColor,
  evaluateColor,
  maxChannelDiff,
  painted,
  wcagContrast,
  type Mode,
} from '../lib/color.ts';
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
  themeDeclarations,
  themeName,
  themePalettes,
  type Stylesheet,
} from '../lib/sets.ts';

const { core, presets } = coreSheets();
const fixtures = coreFixtureSheets();
const MODES: Mode[] = ['light', 'dark'];
const NEUTRALS = ['background', 'surface'];
const ACCENTS = CORE_PALETTE_NAMES.filter((n) => !NEUTRALS.includes(n));
const TEXT = 4.5;
const LINE = 3;
/** The text role's limits: the lightest it is in light mode, the darkest in dark. */
const TEXT_LIMIT = { light: 0.4, dark: 0.82 };
const STROKE_BAND = { light: [0.42, 0.55], dark: [0.65, 1] };
const EPSILON = 1e-6;

const lightness = (c: ReturnType<typeof evaluateColor>) => c.to('oklch').coords[0] ?? NaN;
const chroma = (c: ReturnType<typeof evaluateColor>) => c.to('oklch').coords[1] ?? 0;
const hue = (c: ReturnType<typeof evaluateColor>) => c.to('oklch').coords[2] ?? NaN;
const hueDistance = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);
/**
 * How far the worst sRGB channel lies outside 0–1, before any clipping.
 * (maxChannelDiff() clips both of its colours, so it cannot answer this.)
 */
const outside = (c: ReturnType<typeof evaluateColor>) =>
  Math.max(0, ...c.to('srgb').coords.map((v) => Math.max((v ?? 0) - 1, -(v ?? 0))));

function theme(name: string, args: string): Stylesheet {
  const compiled = compileSource(
    `@use "theme" as t;\n@include t.define-theme("${name}", t.theme(${args}));`,
    path.join(coreDir, 'scss', `__accent-${name}.scss`),
    [path.join(coreDir, 'scss')],
  );
  assert.deepEqual(compiled.warnings, [], `${name} compiles without warnings`);
  return { ...compiled, label: path.relative(repoRoot, compiled.entry) };
}

const shared = new Map(
  rules(core.css).find(
    (r) => normalizeSelector(r.selector) === ':where(:root, [theme])' && !r.context.length,
  )!.declarations,
);

// ── What core declares ───────────────────────────────────────────────────────

test('every accent has a text role: a registered pair, derived from the colour pair, joined', () => {
  const registered = registeredProperties(core.css);
  for (const name of ACCENTS) {
    const token = `--color--${name}--text`;
    assert.equal(
      shared.get(token),
      `light-dark(var(${token}--mode-light), var(${token}--mode-dark))`,
      `${token} is the join of its pair`,
    );
    for (const mode of MODES) {
      const pair = `${token}--mode-${mode}`;
      assert.ok(registered.includes(pair), `${pair} is registered`);
      const value = shared.get(pair)!;
      // The gamut correction wraps it, and names its origin once.
      assert.match(value, /^oklch\(from color\(from oklch\(/, pair);
      assert.deepEqual(
        value.match(/var\(--color[\w-]+\)/g),
        [`var(--color--${name}--mode-${mode})`],
        `${pair} reads its own mode's colour, once`,
      );
      const limit = mode === 'light' ? `min(l, ${TEXT_LIMIT.light})` : `max(l, ${TEXT_LIMIT.dark})`;
      assert.ok(
        value.includes(`oklch(from var(--color--${name}--mode-${mode}) ${limit} c h / 1)`),
        `${pair}: ${limit}, hue and chroma kept, opaque`,
      );
      assert.match(value, /\/ ?1\)$/, `${pair} is opaque`);
    }
  }
});

test('background and surface have no text role', () => {
  const declared = rules(core.css).flatMap((r) => r.declarations.map(([n]) => n));
  for (const name of NEUTRALS) {
    const found = [...declared, ...registeredProperties(core.css)].filter((n) =>
      n.startsWith(`--color--${name}--text`),
    );
    assert.deepEqual(found, [], name);
  }
});

test('a [palette] scope has --palette-color--text for an accent and clears it for background and surface', () => {
  for (const name of CORE_PALETTE_NAMES) {
    const scope = rules(core.css).find(
      (r) =>
        normalizeSelector(r.selector) === `[palette=${name}]` &&
        r.declarations.some(([n]) => n === '--palette-src'),
    )!;
    assert.equal(
      new Map(scope.declarations).get('--palette-color--text'),
      NEUTRALS.includes(name) ? 'initial' : `var(--color--${name}--text)`,
      name,
    );
  }
});

// ── What it comes to ─────────────────────────────────────────────────────────

const themes = [...presets, ...fixtures].map((s) => ({
  label: s.label,
  preset: presets.includes(s),
  decls: themeDeclarations(core, s, themeName(s)),
  names: [
    ...new Set(
      [...ACCENTS, ...themePalettes(s, themeName(s))].filter((n) => !NEUTRALS.includes(n)),
    ),
  ],
  // An explicit role is the author's: it is reported, not held to the limits.
  explicit: (name: string, role: string) =>
    declarationsFor(s.css, themeSelector(themeName(s))).has(`--color--${name}${role}--mode-light`),
}));

for (const t of themes) {
  test(`${t.label}: the text role of every accent is ${TEXT}:1 or more on the background and on the surface`, (ctx) => {
    let lowest = { ratio: Infinity, where: '' };
    for (const mode of MODES) {
      const context = contextFor(t.decls, mode);
      const read = (token: string) => evaluateColor(`var(${token})`, context);
      for (const name of t.names) {
        const text = read(`--color--${name}--text`);
        const colour = read(`--color--${name}`);
        const where = `${mode} --color--${name}--text`;
        assert.equal(text.alpha ?? 1, 1, `${where} is opaque`);

        for (const on of NEUTRALS) {
          const ratio = wcagContrast(text, read(`--color--${on}`));
          if (ratio < lowest.ratio) lowest = { ratio, where: `${where} on ${on}` };
          assert.ok(ratio >= TEXT, `${where} on ${on}: ${ratio.toFixed(2)}:1`);
        }

        // Held to the limit, and no further than the limit.
        const l = lightness(text);
        const limit = TEXT_LIMIT[mode];
        if (mode === 'light') {
          assert.ok(l <= limit + EPSILON, `${where}: lightness ${l.toFixed(3)}`);
          assert.ok(
            Math.abs(l - Math.min(lightness(colour), limit)) < 1e-4,
            `${where}: ${l.toFixed(3)} is the colour's lightness or the limit`,
          );
        } else {
          assert.ok(l >= limit - EPSILON, `${where}: lightness ${l.toFixed(3)}`);
          assert.ok(
            Math.abs(l - Math.max(lightness(colour), limit)) < 1e-4,
            `${where}: ${l.toFixed(3)} is the colour's lightness or the limit`,
          );
        }

        // The screen can show it, so the hue painted is the accent's.
        assert.ok(outside(text) < 0.02, `${where} is inside sRGB: ${text.to('srgb').toString()}`);
        if (chroma(colour) > 0.03 && chroma(text) > 0.03)
          assert.ok(
            hueDistance(hue(painted(text)), hue(colour)) < 6,
            `${where}: hue ${hue(painted(text)).toFixed(1)}, the colour's is ${hue(colour).toFixed(1)}`,
          );

        // A colour already past the limit, which the screen can show, is unchanged.
        const past = mode === 'light' ? lightness(colour) <= limit : lightness(colour) >= limit;
        if (past && outside(colour) < 1e-6)
          assert.ok(maxChannelDiff(text, colour) < 1 / 255, `${where} is the colour itself`);
      }
    }
    ctx.diagnostic(`lowest ${lowest.ratio.toFixed(2)}:1 at ${lowest.where}`);
  });
}

for (const t of themes.filter((x) => x.preset)) {
  test(`${t.label}: the stroke of every accent is ${LINE}:1 or more on the background and on the surface`, (ctx) => {
    let lowest = { ratio: Infinity, where: '' };
    for (const mode of MODES) {
      const context = contextFor(t.decls, mode);
      const read = (token: string) => evaluateColor(`var(${token})`, context);
      for (const name of t.names) {
        if (t.explicit(name, '--stroke')) continue;
        const stroke = read(`--color--${name}--stroke`);
        const colour = read(`--color--${name}`);
        const where = `${mode} --color--${name}--stroke`;
        const [min, max] = STROKE_BAND[mode];
        const l = lightness(stroke);
        assert.ok(
          Math.abs(l - Math.min(max, Math.max(min, lightness(colour)))) < 1e-4,
          `${where}: lightness ${l.toFixed(3)} is the colour's, moved into ${min}–${max}`,
        );
        // The screen can show it; chroma is only given up for that.
        assert.ok(
          outside(stroke) < 0.02,
          `${where} is inside sRGB: ${stroke.to('srgb').toString()}`,
        );
        assert.ok(chroma(stroke) <= chroma(colour) + 1e-4, `${where} gains no chroma`);
        if (outside(colour) < 1e-6 && Math.abs(l - lightness(colour)) < 1e-4)
          assert.ok(Math.abs(chroma(stroke) - chroma(colour)) < 1e-4, `${where} keeps the chroma`);
        for (const on of NEUTRALS) {
          const ratio = wcagContrast(stroke, read(`--color--${on}`));
          if (ratio < lowest.ratio) lowest = { ratio, where: `${where} on ${on}` };
          assert.ok(ratio >= LINE, `${where} on ${on}: ${ratio.toFixed(2)}:1`);
        }
      }
    }
    ctx.diagnostic(`lowest ${lowest.ratio.toFixed(2)}:1 at ${lowest.where}`);
  });
}

test('in a preset the stroke of an accent is the accent, in both modes: its lightness and hue, its chroma as far as sRGB holds it', (ctx) => {
  // The presets write their accents for the page they are on: 0.43–0.55 in
  // light mode, 0.67–0.82 in dark, so the band moves none of them. (Until
  // Phase 19 the dark stroke was held to 0.60, darker than the accent.) Many
  // of them are written with more chroma than sRGB holds at their lightness
  // (azure-blue's light primary, oklch(0.43 0.19 253), has a red channel of
  // −0.16); the fill is painted clipped, the stroke gives up the chroma.
  let beyond = 0;
  let most = { lost: 0, where: '' };
  for (const t of themes.filter((x) => x.preset))
    for (const mode of MODES) {
      const context = contextFor(t.decls, mode);
      for (const name of ACCENTS) {
        const stroke = evaluateColor(`var(--color--${name}--stroke)`, context);
        const colour = evaluateColor(`var(--color--${name})`, context);
        const where = `${t.label} ${mode} ${name}`;
        assert.ok(Math.abs(lightness(stroke) - lightness(colour)) < 1e-4, `${where}: lightness`);
        assert.ok(hueDistance(hue(stroke), hue(colour)) < 0.01, `${where}: hue`);
        if (outside(colour) < 1e-6) {
          assert.ok(maxChannelDiff(stroke, colour) < 1 / 255, `${where} is the accent itself`);
        } else {
          beyond++;
          const lost = 1 - chroma(stroke) / chroma(colour);
          if (lost > most.lost) most = { lost, where };
          assert.ok(
            lost > 0 && lost <= 0.5 + 1e-6,
            `${where}: ${(lost * 100).toFixed(0)}% of its chroma`,
          );
        }
      }
    }
  ctx.diagnostic(
    `${beyond} of ${4 * 2 * ACCENTS.length} preset accents are outside sRGB; ` +
      `most chroma given up: ${(most.lost * 100).toFixed(0)}% (${most.where})`,
  );
});

test('a brand that is one dark colour in both modes: its dark stroke and text are moved to where they show', () => {
  const navy = theme('navy', '$brand: oklch(0.25 0.1 260)');
  const context = contextFor(themeDeclarations(core, navy, 'navy'), 'dark');
  const read = (token: string) => evaluateColor(`var(${token})`, context);
  const surface = read('--color--surface');
  // As written it does not show: this is what Material's outline was.
  assert.ok(wcagContrast(read('--color--brand'), surface) < 1.5);
  assert.ok(Math.abs(lightness(read('--color--brand--stroke')) - 0.65) < 1e-4);
  assert.ok(wcagContrast(read('--color--brand--stroke'), surface) >= LINE);
  assert.ok(Math.abs(lightness(read('--color--brand--text')) - 0.82) < 1e-4);
  assert.ok(wcagContrast(read('--color--brand--text'), surface) >= TEXT);
});

test('any accent, however pale or vivid: its light stroke is at most 0.55, inside sRGB and 3:1 or more on the presets’ background and surface', (ctx) => {
  // The ceiling was 0.60 until Session C: a green there is 2.9:1 on the
  // presets' surface. The stroke is read through the compiled CSS for a sweep
  // of colours lighter than the ceiling, with the pair set as a theme would.
  let lowest = { ratio: Infinity, where: '' };
  let dark = { ratio: Infinity, where: '' };
  for (const t of themes.filter((x) => x.preset)) {
    for (const mode of MODES)
      for (const l of mode === 'light' ? [0.56, 0.6, 0.75, 0.9] : [0.2, 0.4, 0.6, 0.64])
        for (const c of [0, 0.04, 0.1, 0.16, 0.22, 0.3, 0.37])
          for (let h = 0; h < 360; h += 6) {
            const colour = `oklch(${l} ${c} ${h})`;
            const context = contextFor(
              t.decls,
              mode,
              new Map([[`--color--primary--mode-${mode}`, colour]]),
            );
            const stroke = evaluateColor(`var(--color--primary--stroke--mode-${mode})`, context);
            const limit = STROKE_BAND[mode][mode === 'light' ? 1 : 0];
            assert.ok(
              Math.abs(lightness(stroke) - limit) < 1e-4,
              `${colour}: ${lightness(stroke)}`,
            );
            assert.ok(outside(stroke) < 0.02, `${colour} inside sRGB`);
            for (const on of NEUTRALS) {
              const ratio = wcagContrast(stroke, evaluateColor(`var(--color--${on})`, context));
              const where = `${t.label} ${colour} on ${on}`;
              if (mode === 'light' && ratio < lowest.ratio) lowest = { ratio, where };
              if (mode === 'dark' && ratio < dark.ratio) dark = { ratio, where };
              assert.ok(ratio >= LINE, `${mode} ${where}: ${ratio.toFixed(2)}:1`);
            }
          }
  }
  ctx.diagnostic(`light, at the ceiling: lowest ${lowest.ratio.toFixed(2)}:1 at ${lowest.where}`);
  ctx.diagnostic(`dark, at the floor: lowest ${dark.ratio.toFixed(2)}:1 at ${dark.where}`);
});

test('a vivid accent as a line keeps its hue: the chroma is given up, not the hue', () => {
  // A pure yellow moved down to 0.55 keeps a chroma sRGB does not hold there:
  // clipped, a browser paints it as an ochre, more than 10° away.
  const yellow = theme('stroke-yellow', '$palettes: (primary: t.palette(#ffd400))');
  const context = contextFor(themeDeclarations(core, yellow, 'stroke-yellow'), 'light');
  const colour = evaluateColor('var(--color--primary)', context);
  const stroke = evaluateColor('var(--color--primary--stroke)', context);
  assert.ok(Math.abs(lightness(stroke) - 0.55) < 1e-4);
  assert.ok(chroma(stroke) < chroma(colour), 'chroma given up');
  assert.ok(outside(stroke) < 0.02, 'inside sRGB');
  assert.ok(
    hueDistance(hue(painted(stroke)), hue(colour)) < 3,
    `hue ${hue(painted(stroke)).toFixed(1)}, the colour's is ${hue(colour).toFixed(1)}`,
  );
  const clipped = painted(cssColor(`oklch(0.55 ${chroma(colour)} ${hue(colour)})`));
  assert.ok(
    hueDistance(hue(clipped), hue(colour)) > 10,
    'the uncorrected colour is painted off its hue',
  );
});

test('a vivid accent as text keeps its hue: the chroma is given up, not the hue', () => {
  // An orange at lightness 0.40 with this chroma is outside sRGB: clipped, a
  // browser paints it as a red, 16° away (what Phase 14c found for a primary).
  const vivid = theme('vivid', '$palettes: (primary: t.palette(oklch(0.63 0.2 45)))');
  const context = contextFor(themeDeclarations(core, vivid, 'vivid'), 'light');
  const text = evaluateColor('var(--color--primary--text)', context);
  assert.ok(Math.abs(lightness(text) - 0.4) < 1e-4);
  assert.ok(chroma(text) < 0.2, 'chroma given up');
  assert.ok(outside(text) < 0.02, 'inside sRGB');
  assert.ok(hueDistance(hue(painted(text)), 45) < 3, `hue ${hue(painted(text)).toFixed(1)}`);
  const clipped = painted(cssColor('oklch(0.4 0.2 45)'));
  assert.ok(hueDistance(hue(clipped), 45) > 10, 'the uncorrected colour is painted off its hue');
});

// ── $text ────────────────────────────────────────────────────────────────────

test('a theme that passes no $text declares no text pair: core derives it', () => {
  for (const sheet of [...presets, ...fixtures]) {
    const rule = declarationsFor(sheet.css, themeSelector(themeName(sheet)));
    assert.deepEqual(
      [...rule.keys()].filter((n) => /--text(--mode-(light|dark))?$/.test(n)),
      [],
      sheet.label,
    );
  }
});

test('$text in t.palette() is the text role as passed, in both modes when given in one', () => {
  const both = theme(
    'text-both',
    '$palettes: (error: t.light-dark(t.palette(#b3261e, $text: #8c1d18), t.palette(#f2b8b5, $text: #ffdad6)))',
  );
  const rule = declarationsFor(both.css, themeSelector('text-both'));
  assert.equal(rule.get('--color--error--text--mode-light'), '#8c1d18');
  assert.equal(rule.get('--color--error--text--mode-dark'), '#ffdad6');
  assert.equal(
    rule.get('--color--error--text'),
    'light-dark(var(--color--error--text--mode-light), var(--color--error--text--mode-dark))',
  );
  const decls = themeDeclarations(core, both, 'text-both');
  for (const [mode, expected] of [
    ['light', '#8c1d18'],
    ['dark', '#ffdad6'],
  ] as [Mode, string][])
    assert.ok(
      maxChannelDiff(
        evaluateColor('var(--color--error--text)', contextFor(decls, mode)),
        cssColor(expected),
      ) < 1e-6,
      mode,
    );

  const one = theme(
    'text-one',
    '$palettes: (error: t.light-dark(t.palette(#b3261e), t.palette(#f2b8b5, $text: #ffdad6)))',
  );
  const oneRule = declarationsFor(one.css, themeSelector('text-one'));
  assert.equal(oneRule.get('--color--error--text--mode-light'), '#ffdad6');
  assert.equal(oneRule.get('--color--error--text--mode-dark'), '#ffdad6');
});

test('a primary-only theme: the brand takes the primary’s $text with its colour', () => {
  const sheet = theme('text-primary', '$palettes: (primary: t.palette(#0c6ab6, $text: #084a80))');
  const rule = declarationsFor(sheet.css, themeSelector('text-primary'));
  for (const mode of MODES)
    assert.equal(
      rule.get(`--color--brand--text--mode-${mode}`),
      `var(--color--primary--text--mode-${mode})`,
    );
  const context = contextFor(themeDeclarations(core, sheet, 'text-primary'), 'light');
  assert.ok(
    maxChannelDiff(evaluateColor('var(--color--brand--text)', context), cssColor('#084a80')) < 1e-6,
  );
  // Without $text the brand's text pair is left to core, which derives it from
  // the brand pair: the primary pair.
  const plain = theme('text-plain', '$palettes: (primary: t.palette(#0c6ab6))');
  assert.ok(
    !declarationsFor(plain.css, themeSelector('text-plain')).has(
      '--color--brand--text--mode-light',
    ),
  );
  const plainContext = contextFor(themeDeclarations(core, plain, 'text-plain'), 'light');
  assert.ok(
    maxChannelDiff(
      evaluateColor('var(--color--brand--text)', plainContext),
      evaluateColor('var(--color--primary--text)', plainContext),
    ) < 1e-6,
  );
});

test('$text on background or surface is an error that names --contrast', () => {
  for (const name of NEUTRALS)
    assert.throws(
      () => theme(`text-${name}`, `$palettes: (${name}: t.palette(#eee, $text: #333))`),
      new RegExp(`\`${name}\` has no text role[\\s\\S]*--color--${name}--contrast`),
    );
});

test('a custom palette name has the text role too', () => {
  const sheet = fixtures.find((f) => f.label.endsWith('brand.scss'))!;
  const registered = registeredProperties(sheet.css);
  assert.ok(registered.includes('--color--accent--text--mode-light'));
  assert.ok(registered.includes('--color--accent--text--mode-dark'));
  const scope = rules(sheet.css).find((r) => normalizeSelector(r.selector) === '[palette=accent]')!;
  assert.equal(
    new Map(scope.declarations).get('--palette-color--text'),
    'var(--color--accent--text)',
  );
});

// ── What the docs state ──────────────────────────────────────────────────────

test('the Palette page’s figures for #e65151: 3.71:1 on white as written, #85151d and 9.92:1 as text', () => {
  const red = theme('page-red', '$palettes: (primary: t.palette(#e65151))');
  const context = contextFor(themeDeclarations(core, red, 'page-red'), 'light');
  const white = cssColor('white');
  const colour = evaluateColor('var(--color--primary)', context);
  const text = evaluateColor('var(--color--primary--text)', context);
  assert.equal(wcagContrast(colour, white).toFixed(2), '3.71');
  assert.equal(painted(text).to('srgb').toString({ format: 'hex' }), '#85151d');
  assert.equal(wcagContrast(text, white).toFixed(2), '9.92');
});
