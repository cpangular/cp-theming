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
import { contextFor, evaluateColor, painted, wcagContrast, type Mode } from '../lib/color.ts';
import { relativeColors, rules } from '../lib/css.ts';
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
const themes = [...presets, ...fixtures].map((s) => ({
  label: s.label,
  decls: themeDeclarations(core, s, themeName(s)),
  names: themePalettes(s, themeName(s)),
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
    // Every palette the theme declares, core or custom.
    assert.ok(theme.names.length > 0, 'the theme declares palettes');
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

// ─── Alpha ───────────────────────────────────────────────────────────────────
// A relative colour keeps its origin's alpha unless it says otherwise, so a
// translucent input would make every ladder step, auto role and contrast
// translucent too. Each derivation pins `/ 1`. The tints are the exception:
// their alpha is the point.
test('every relative-colour derivation pins alpha to 1, except the tints', (t) => {
  const unpinned: string[] = [];
  let pinned = 0;
  let tints = 0;
  for (const sheet of [core, ...presets, ...fixtures, ...materialSheets()]) {
    for (const rule of rules(sheet.css)) {
      for (const [name, value] of rule.declarations) {
        for (const fn of relativeColors(value)) {
          if (/--tint-\d+$/.test(name)) {
            assert.match(fn.alpha ?? '', /^var\(--weight--tint-\d+--mode-(light|dark), [\d.]+%\)$/);
            tints++;
          } else if (fn.alpha === '1') pinned++;
          else unpinned.push(`${sheet.label} ${rule.selector} { ${name} }: ${fn.text}`);
        }
      }
    }
  }
  t.diagnostic(`${pinned} derivations pin alpha to 1; ${tints} tint sides carry their weight`);
  assert.ok(pinned > 0 && tints > 0, 'the check found derivations and tints');
  assert.deepEqual(unpinned, []);
});
