// Check 3 — contrast sweep with colorjs.io. Every input is read from the
// compiled CSS (the derivation expressions, --contrast rule and preset colours)
// and from $theme-step-1..3; nothing is restated here. The ratio is WCAG 2.1 on
// the colours as painted (clipped to sRGB).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { themeSteps } from '../lib/sass.ts';
import { declarationsFor } from '../lib/css.ts';
import { contextFor, evaluateColor, wcagContrast, type Mode } from '../lib/color.ts';
import { CORE_PALETTE_NAMES, coreFixtureSheets, coreSheets, themeName } from '../lib/sets.ts';

const MIN_RATIO = 4.5;
const MODES: Mode[] = ['light', 'dark'];
const ROLES = ['', '--bg', '--stroke'];
const STEPS = ['', '--dark', '--darker', '--darkest', '--light', '--lighter', '--lightest'];
const PHASE_10 = 'Phase 10 — contrast chosen by a luminance step at 0.179 in clamped linear sRGB';

const { presets } = coreSheets();
const themes = [...presets, ...coreFixtureSheets()].map((s) => ({
  label: s.label,
  decls: declarationsFor(s.css, `[theme="${themeName(s)}"]`),
}));

interface Failure {
  where: string;
  ratio: number;
}

function sweep(
  decls: Map<string, string>,
  mode: Mode,
  names: string[],
): { checked: number; failures: Failure[] } {
  const ctx = contextFor(decls, mode);
  const failures: Failure[] = [];
  let checked = 0;
  for (const name of names) {
    if (!decls.has(`--color--${name}`)) continue;
    for (const role of ROLES) {
      for (const step of STEPS) {
        const token = `--color--${name}${role}${step}`;
        const ratio = wcagContrast(
          evaluateColor(`var(${token}--contrast)`, ctx),
          evaluateColor(`var(${token})`, ctx),
        );
        checked++;
        if (ratio < MIN_RATIO) failures.push({ where: `${mode} ${token}`, ratio });
      }
    }
  }
  return { checked, failures };
}

const summarize = (f: Failure[]) =>
  f.length
    ? `worst ${Math.min(...f.map((x) => x.ratio)).toFixed(2)}:1 at ${f.reduce((a, b) => (a.ratio < b.ratio ? a : b)).where}`
    : 'none';

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

for (const theme of themes) {
  test(
    `${theme.label}: every role and ladder step reaches ${MIN_RATIO}:1 against its --contrast`,
    { todo: PHASE_10 },
    (t) => {
      let checked = 0;
      const failures: Failure[] = [];
      // Every palette the theme declares, core or custom (a palette has a --contrast; --color--brand does not).
      const names = [...theme.decls.keys()]
        .map((k) => /^--color--(\w+)--contrast$/.exec(k)?.[1] ?? '')
        .filter(Boolean);
      for (const mode of MODES) {
        const r = sweep(theme.decls, mode, names);
        checked += r.checked;
        failures.push(...r.failures);
      }
      t.diagnostic(`${failures.length} of ${checked} below ${MIN_RATIO}:1; ${summarize(failures)}`);
      assert.deepEqual(
        failures.map((f) => `${f.where} ${f.ratio.toFixed(2)}`),
        [],
      );
    },
  );

  test(`${theme.label}: identity text on the auto --bg role (reported, not failed)`, (t) => {
    const low: string[] = [];
    for (const mode of MODES) {
      const ctx = contextFor(theme.decls, mode);
      for (const name of CORE_PALETTE_NAMES) {
        if (name === 'background' || name === 'surface' || !theme.decls.has(`--color--${name}`))
          continue;
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

test(
  'hue × lightness × chroma grid, including colours outside sRGB, against --contrast',
  { todo: PHASE_10 },
  (t) => {
    const { decls } = themes[0];
    const failures: Failure[] = [];
    let checked = 0;
    for (let h = 0; h < 360; h += 10) {
      for (let l = 0.3; l <= 0.8001; l += 0.05) {
        for (const c of [0.02, 0.08, 0.14, 0.2, 0.26, 0.32]) {
          const base = `oklch(${l.toFixed(2)} ${c} ${h})`;
          const ctx = contextFor(decls, 'light', new Map([['--color--primary', base]]));
          const ratio = wcagContrast(
            evaluateColor('var(--color--primary--contrast)', ctx),
            evaluateColor('var(--color--primary)', ctx),
          );
          checked++;
          if (ratio < MIN_RATIO) failures.push({ where: base, ratio });
        }
      }
    }
    t.diagnostic(
      `${failures.length} of ${checked} grid colours below ${MIN_RATIO}:1; ${summarize(failures)}`,
    );
    assert.equal(
      failures.length,
      0,
      `${failures.length} grid colours below ${MIN_RATIO}:1, ${summarize(failures)}`,
    );
  },
);
