// Check 3 — contrast sweep with colorjs.io. Every input is read from the
// compiled CSS (the derivation expressions, --contrast rule and preset colours)
// and from $theme-step-1..3; nothing is restated here. The ratio is WCAG 2.1 on
// the colours as painted (clipped to sRGB). test/render.ts compares what the
// browsers compute for --contrast with what this evaluator predicts.
//
// Also here: alpha. Every relative-colour derivation pins `/ 1`, so the
// guarantee above is about opaque colours; only the tints carry an alpha.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { themeSteps } from '../lib/sass.ts';
import {
  contextFor,
  cssColor,
  evaluateColor,
  painted,
  wcagContrast,
  type Mode,
} from '../lib/color.ts';
import { declarationsFor, relativeColors, rules, themeSelector } from '../lib/css.ts';
import {
  CORE_PALETTE_NAMES,
  coreFixtureSheets,
  coreSheets,
  materialSheets,
  themeDeclarations,
  themeName,
  themePalettes,
} from '../lib/sets.ts';

const MIN_RATIO = 4.5;
const MODES: Mode[] = ['light', 'dark'];
const ROLES = ['', '--bg', '--stroke'];
const STEPS = ['', '--dark', '--darker', '--darkest', '--light', '--lighter', '--lightest'];

const { core, presets } = coreSheets();
const fixtures = coreFixtureSheets();
// Core derives once, so a token is read from core's root rules + the theme rule.
// Every core palette is swept for every theme, whether the theme passed it,
// core generated it (primary, the accents, the neutrals) or it is a semantic
// default, plus the theme's own custom names.
const themes = [...presets, ...fixtures].map((s) => ({
  label: s.label,
  decls: themeDeclarations(core, s, themeName(s)),
  names: [...new Set([...CORE_PALETTE_NAMES, ...themePalettes(s, themeName(s))])],
}));

interface Measured {
  where: string;
  ratio: number;
}

/** Every role and ladder step of the named palettes against its --contrast. */
function sweep(decls: Map<string, string>, mode: Mode, names: string[]): Measured[] {
  const ctx = contextFor(decls, mode);
  const measured: Measured[] = [];
  for (const name of names) {
    for (const role of ROLES) {
      for (const step of STEPS) {
        const token = `--color--${name}${role}${step}`;
        const text = evaluateColor(`var(${token}--contrast)`, ctx);
        assertBlackOrWhite(text, `${mode} ${token}--contrast`);
        measured.push({
          where: `${mode} ${token}`,
          ratio: wcagContrast(text, evaluateColor(`var(${token})`, ctx)),
        });
      }
    }
  }
  return measured;
}

/** --contrast is a choice, never a grey: opaque black or opaque white. */
function assertBlackOrWhite(text: ReturnType<typeof evaluateColor>, where: string): void {
  const [r, g, b] = painted(text).coords.map((v) => v ?? 0);
  const black = Math.max(r, g, b) < 1e-4;
  const white = Math.min(r, g, b) > 1 - 1e-4;
  assert.ok(black || white, `${where} is neither black nor white: ${text.toString()}`);
  assert.equal(text.alpha ?? 1, 1, `${where} is opaque`);
}

const below = (m: Measured[]) => m.filter((x) => x.ratio < MIN_RATIO);
const lowest = (m: Measured[]) => m.reduce((a, b) => (a.ratio <= b.ratio ? a : b));
/** `0 of 336 below 4.5:1; lowest 4.60:1 at light --color--warn--stroke`. */
const summarize = (m: Measured[], what = '') =>
  `${below(m).length} of ${m.length} ${what}below ${MIN_RATIO}:1; ` +
  `lowest ${lowest(m).ratio.toFixed(2)}:1 at ${lowest(m).where}`;

test('ladder steps move lightness by $theme-step-1..3 (evaluator reads the CSS correctly)', () => {
  const [s1, s2, s3] = themeSteps();
  const { decls } = themes[0];
  const ctx = contextFor(decls, 'light');
  const l = (token: string) => evaluateColor(`var(${token})`, ctx).to('oklch').coords[0] ?? NaN;
  const base = l('--color--primary');
  const close = (a: number, b: number) => Math.abs(a - b) < 1e-6;
  assert.ok(close(l('--color--primary--dark'), base - s1), '--dark = L - step-1');
  assert.ok(close(l('--color--primary--darker'), base - s2), '--darker = L - step-2');
  assert.ok(
    close(l('--color--primary--darkest'), Math.max(0, base - s3)),
    '--darkest = L - step-3',
  );
  assert.ok(close(l('--color--primary--light'), base + s1), '--light = L + step-1');
  assert.ok(close(l('--color--primary--lighter'), base + s2), '--lighter = L + step-2');
  assert.ok(
    close(l('--color--primary--lightest'), Math.min(1, base + s3)),
    '--lightest = L + step-3',
  );
});

const presetMeasured: Measured[] = [];
for (const theme of themes) {
  test(`${theme.label}: every role and ladder step reaches ${MIN_RATIO}:1 against its --contrast`, (t) => {
    // Every core palette, passed or not, and every custom one the theme declares.
    assert.ok(theme.names.length >= CORE_PALETTE_NAMES.length, 'every core palette is swept');
    const measured = MODES.flatMap((mode) => sweep(theme.decls, mode, theme.names));
    if (presets.some((p) => p.label === theme.label)) presetMeasured.push(...measured);
    t.diagnostic(summarize(measured));
    assert.deepEqual(
      below(measured).map((f) => `${f.where} ${f.ratio.toFixed(2)}`),
      [],
    );
  });

  test(`${theme.label}: identity text on the auto --bg role (reported, not failed)`, (t) => {
    const low: string[] = [];
    for (const mode of MODES) {
      const ctx = contextFor(theme.decls, mode);
      for (const name of CORE_PALETTE_NAMES) {
        if (name === 'background' || name === 'surface' || !theme.names.includes(name)) continue;
        const ratio = wcagContrast(
          evaluateColor(`var(--color--${name})`, ctx),
          evaluateColor(`var(--color--${name}--bg)`, ctx),
        );
        if (ratio < MIN_RATIO) low.push(`${mode} ${name} ${ratio.toFixed(2)}:1`);
      }
    }
    t.diagnostic(
      low.length
        ? `below ${MIN_RATIO}:1: ${low.join(', ')}`
        : `all identity-on-bg pairs reach ${MIN_RATIO}:1`,
    );
  });
}

test('hue × lightness × chroma grid, including colours outside sRGB, against --contrast', (t) => {
  const { decls } = themes[0];
  const measured: Measured[] = [];
  for (let h = 0; h < 360; h += 10) {
    for (let l = 0.3; l <= 0.8001; l += 0.05) {
      for (const c of [0.02, 0.08, 0.14, 0.2, 0.26, 0.32]) {
        const base = `oklch(${l.toFixed(2)} ${c} ${h})`;
        const ctx = contextFor(decls, 'light', new Map([['--color--primary', base]]));
        const text = evaluateColor('var(--color--primary--contrast)', ctx);
        assertBlackOrWhite(text, `--contrast of ${base}`);
        measured.push({
          where: base,
          ratio: wcagContrast(text, evaluateColor('var(--color--primary)', ctx)),
        });
      }
    }
  }
  t.diagnostic(summarize(measured, 'grid colours '));
  // One line for the whole sweep (the preset tests above ran first).
  if (presetMeasured.length)
    t.diagnostic(
      `sweep summary: ${summarize(presetMeasured, 'preset role/step colours ')}; ` +
        summarize(measured, 'grid colours '),
    );
  assert.equal(below(measured).length, 0, summarize(measured, 'grid colours '));
});

// ─── The stroke of background and surface ────────────────────────────────────
// Their stroke is a boundary drawn on the palette's own colour (the Material
// adapter's outline is the surface's). WCAG 1.4.11 asks 3:1 of a control's
// boundary; core derives it at 4.5:1 or more against that colour, whatever its
// lightness (_palette.scss, "Neutral stroke"). A theme's own $stroke is used as
// passed and is not checked here.
const BOUNDARY = 3;
const STROKE_DERIVED = 4.5;
const NEUTRALS = ['background', 'surface'];

/** The neutral's stroke against the neutral, for each palette and mode. */
function neutralStrokes(decls: Map<string, string>, overrides?: Map<string, string>) {
  return MODES.flatMap((mode) => {
    const ctx = contextFor(decls, mode, overrides);
    return NEUTRALS.map((name) => ({
      where: `${mode} --color--${name}--stroke`,
      ratio: wcagContrast(
        evaluateColor(`var(--color--${name}--stroke)`, ctx),
        evaluateColor(`var(--color--${name})`, ctx),
      ),
    }));
  });
}

const strokeSummary = (m: Measured[]) =>
  `lowest ${lowest(m).ratio.toFixed(2)}:1 at ${lowest(m).where}`;

for (const theme of themes) {
  test(`${theme.label}: the default background and surface strokes are ${BOUNDARY}:1 or more against their palette's colour`, (t) => {
    const own = declarationsFor(
      [...presets, ...fixtures].find((s) => s.label === theme.label)!.css,
      themeSelector(themeName([...presets, ...fixtures].find((s) => s.label === theme.label)!)),
    );
    for (const name of NEUTRALS)
      assert.ok(
        !own.has(`--color--${name}--stroke--mode-light`),
        `${name}: the theme passes no $stroke`,
      );
    const measured = neutralStrokes(theme.decls);
    t.diagnostic(measured.map((m) => `${m.where} ${m.ratio.toFixed(2)}:1`).join(', '));
    assert.deepEqual(
      measured.filter((m) => m.ratio < BOUNDARY).map((m) => `${m.where} ${m.ratio.toFixed(2)}`),
      [],
    );
    assert.deepEqual(
      measured
        .filter((m) => m.ratio < STROKE_DERIVED)
        .map((m) => `${m.where} ${m.ratio.toFixed(2)}`),
      [],
      `the derivation promises ${STROKE_DERIVED}:1`,
    );
  });
}

test(`the default background and surface strokes over a sweep of colours the screen can show: ${BOUNDARY}:1 or more`, (t) => {
  // Lightness 0 to 1 in steps of 0.01, at chroma from grey to vivid and hues
  // round the wheel. Each colour is one palette's colour in one mode, taken in
  // turn: the derivation is the same for both, and evaluating all four for
  // every colour took a minute and a half.
  const { decls } = themes[0];
  const measured: Measured[] = [];
  const pairs = NEUTRALS.flatMap((name) => MODES.map((mode) => ({ name, mode })));
  let n = 0;
  for (let i = 0; i <= 100; i++) {
    const l = i / 100;
    for (const c of [0, 0.006, 0.01, 0.02, 0.04, 0.06, 0.1, 0.15, 0.2, 0.3])
      for (let h = 0; h < 360; h += 30) {
        const colour = `oklch(${l} ${c} ${h})`;
        if (!cssColor(colour).inGamut('srgb', { epsilon: 1e-5 })) continue;
        const { name, mode } = pairs[n++ % pairs.length];
        const ctx = contextFor(decls, mode, new Map([[`--color--${name}--mode-${mode}`, colour]]));
        measured.push({
          where: `${colour} ${mode} --color--${name}--stroke`,
          ratio: wcagContrast(
            evaluateColor(`var(--color--${name}--stroke)`, ctx),
            evaluateColor(`var(--color--${name})`, ctx),
          ),
        });
      }
  }
  t.diagnostic(`${measured.length} strokes; ${strokeSummary(measured)}`);
  assert.ok(measured.length > 3000, `only ${measured.length} strokes measured`);
  assert.deepEqual(
    measured.filter((m) => m.ratio < BOUNDARY).map((m) => `${m.where} ${m.ratio.toFixed(2)}`),
    [],
  );
  assert.deepEqual(
    measured.filter((m) => m.ratio < STROKE_DERIVED).map((m) => `${m.where} ${m.ratio.toFixed(2)}`),
    [],
    `the derivation promises ${STROKE_DERIVED}:1`,
  );
});

// ─── Alpha ───────────────────────────────────────────────────────────────────
// A relative colour keeps its origin's alpha unless it says otherwise, so a
// translucent input would make every ladder step, auto role and contrast
// translucent too. Each derivation pins `/ 1`. The tints are the exception:
// their alpha is the point. So are the layers of a shadow drawn in a theme's
// $shadow-color (Phase 19, issue #11): each takes a share of that colour's
// alpha, `calc(alpha * <share>)`.
test('every relative-colour derivation pins alpha to 1, except the tints and the layers of a shadow', (t) => {
  const unpinned: string[] = [];
  let pinned = 0;
  let tints = 0;
  let shadows = 0;
  for (const sheet of [core, ...presets, ...fixtures, ...materialSheets()]) {
    for (const rule of rules(sheet.css)) {
      for (const [name, value] of rule.declarations) {
        for (const fn of relativeColors(value)) {
          if (/--tint-\d+$/.test(name)) {
            assert.match(fn.alpha ?? '', /^var\(--weight--tint-\d+--mode-(light|dark), [\d.]+%\)$/);
            tints++;
          } else if (/^--elevation-\d--shadow$/.test(name)) {
            assert.match(fn.alpha ?? '', /^calc\(alpha \* 0\.\d+\)$/, `${name}: ${fn.text}`);
            shadows++;
          } else if (fn.alpha === '1') pinned++;
          else unpinned.push(`${sheet.label} ${rule.selector} { ${name} }: ${fn.text}`);
        }
      }
    }
  }
  t.diagnostic(
    `${pinned} derivations pin alpha to 1; ${tints} tint sides carry their weight; ` +
      `${shadows} shadow layers take a share of their colour's alpha`,
  );
  assert.ok(pinned > 0 && tints > 0, 'the check found derivations and tints');
  assert.deepEqual(unpinned, []);
});

// ─── light-dark() ────────────────────────────────────────────────────────────
// light-dark() accepts two colours and nothing else. Around a whole box-shadow
// (`light-dark(0 1px 2px black, …)`) the declaration is invalid wherever it is
// used and the shadow computes to `none`, so each argument has to be a single
// value: one colour function, one var(), one keyword.
test('every light-dark() argument is a single value, never a list', (t) => {
  const offenders: string[] = [];
  let seen = 0;
  for (const sheet of [core, ...presets, ...fixtures, ...materialSheets()]) {
    for (const rule of rules(sheet.css)) {
      for (const [name, value] of rule.declarations) {
        for (const args of lightDarkArguments(value)) {
          seen++;
          if (args.length !== 2 || args.some((a) => topLevelWords(a) !== 1))
            offenders.push(`${sheet.label} ${rule.selector} { ${name}: ${value} }`);
        }
      }
    }
  }
  t.diagnostic(`${seen} light-dark() calls`);
  assert.ok(seen > 0, 'the check found light-dark() calls');
  assert.deepEqual(offenders, []);
});

/** The top-level, comma-separated arguments of every light-dark() in a value, nested ones included. */
function lightDarkArguments(value: string): string[][] {
  const out: string[][] = [];
  const re = /\blight-dark\(/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(value))) {
    const args: string[] = [];
    let depth = 1;
    let current = '';
    let i = m.index + m[0].length;
    for (; i < value.length && depth > 0; i++) {
      const ch = value[i];
      if (ch === '(') depth++;
      else if (ch === ')' && --depth === 0) break;
      if (ch === ',' && depth === 1) {
        args.push(current.trim());
        current = '';
      } else current += ch;
    }
    args.push(current.trim());
    out.push(args);
  }
  return out;
}

/** How many whitespace-separated components a value has outside any parentheses. */
function topLevelWords(value: string): number {
  let depth = 0;
  let words = 0;
  let inWord = false;
  for (const ch of value) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    const space = /\s/.test(ch) && depth === 0;
    if (!space && !inWord) words++;
    inWord = !space;
  }
  return words;
}
