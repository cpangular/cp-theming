// Check 4 (adapter) — the adapter registers nothing; the adaptor fixture registers
// four names for its custom palette (until Phase 9) and its [palette] hooks emit
// the Material remap for every non-neutral palette.
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

  test(`${fixture.label} registers 4 names per custom palette (${custom.join(', ')})`, () => {
    const expected = custom.flatMap((n) =>
      ['', '--bg', '--stroke', '--focus'].map((r) => `--color--${n}${r}`),
    );
    assert.deepEqual([...registeredProperties(fixture.css)].sort(), expected.sort());
  });

  test(`${fixture.label}: mat.adaptor() remaps --mat-sys-primary for every palette except surface and background`, () => {
    const remapped = new Set<string>();
    for (const rule of rules(fixture.css)) {
      const sel = normalizeSelector(rule.selector);
      const m = /\[palette=([\w-]+)\]$/.exec(sel.split(',')[0].trim());
      if (
        m &&
        rule.declarations.some(
          ([n, v]) => n === '--mat-sys-primary' && v === `var(--color--${m[1]})`,
        )
      )
        remapped.add(m[1]);
    }
    assert.deepEqual(
      [...remapped].sort(),
      palettes.filter((n) => n !== 'surface' && n !== 'background').sort(),
    );
  });
}
