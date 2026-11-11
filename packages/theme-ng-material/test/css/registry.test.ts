// Check 4 (adapter) — the adapter registers nothing and remaps --mat-sys-primary
// for the eight core accent palettes itself (brand and tertiary among them); the adaptor fixture registers eight
// names (four roles × light and dark) for its custom palette, once at root
// level, and its [palette] hooks emit the Material remap for the custom
// palette names only, once per name.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  registeredProperties,
  rules,
  normalizeSelector,
} from '../../../theme-core/test/lib/css.ts';
import {
  CORE_PALETTE_NAMES,
  materialFixtureSheets,
  materialSheets,
} from '../../../theme-core/test/lib/sets.ts';

/** Palette names with a `[palette="name"]` rule that points --mat-sys-primary at that palette. */
function remapped(css: string): string[] {
  const names = new Set<string>();
  for (const rule of rules(css)) {
    const m = /^\[palette=([\w-]+)\]$/.exec(normalizeSelector(rule.selector));
    if (
      m &&
      rule.declarations.some(([n, v]) => n === '--mat-sys-primary' && v === `var(--color--${m[1]})`)
    )
      names.add(m[1]);
  }
  return [...names].sort();
}

for (const sheet of materialSheets()) {
  test(`${sheet.label} registers no @property`, () => {
    assert.deepEqual(registeredProperties(sheet.css), []);
  });
}

for (const fixture of materialFixtureSheets()) {
  const palettes = [
    ...new Set([...fixture.css.matchAll(/\[palette=["']?([\w-]+)["']?\]/g)].map((m) => m[1])),
  ];
  const custom = palettes.filter((n) => !CORE_PALETTE_NAMES.includes(n));

  test(`${fixture.label} registers 8 names per custom palette (${custom.join(', ')})`, () => {
    const expected = custom.flatMap((n) =>
      ['', '--bg', '--stroke', '--focus'].flatMap((r) =>
        ['--mode-light', '--mode-dark'].map((m) => `--color--${n}${r}${m}`),
      ),
    );
    assert.deepEqual([...registeredProperties(fixture.css)].sort(), expected.sort());
  });

  test(`${fixture.label}: mat.adaptor() remaps --mat-sys-primary for the custom palette names only`, () => {
    assert.deepEqual(remapped(fixture.css), custom.sort());
    // Once per palette name, at root level (no [theme] ancestor).
    const hookRules = rules(fixture.css).filter((r) =>
      r.declarations.some(([n]) => n === '--mat-sys-primary'),
    );
    for (const r of hookRules) assert.doesNotMatch(r.selector, /\[theme/, r.selector);
    assert.equal(
      hookRules.length,
      new Set(hookRules.map((r) => r.selector)).size,
      'no duplicate hook rules',
    );
  });
}

test('material-core.css remaps --mat-sys-primary for every core palette except surface and background', () => {
  const adapterCore = materialSheets().find((s) => s.label.endsWith('material-core.scss'))!;
  assert.deepEqual(
    remapped(adapterCore.css),
    CORE_PALETTE_NAMES.filter((n) => n !== 'surface' && n !== 'background').sort(),
  );
});
