// Check 2 (adapter) — every var() the adapter reads is declared by core + a
// theme, and the adaptor fixture declares what its [palette] hooks read.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rules, undefinedReads } from '../../../theme-core/test/lib/css.ts';
import {
  coreSheets,
  materialFixtureSheets,
  materialSheets,
} from '../../../theme-core/test/lib/sets.ts';

const { core, presets } = coreSheets();
const adapter = materialSheets();

for (const fixture of materialFixtureSheets()) {
  test(`core + ${fixture.label}: every var() read (including the adaptor hooks) is declared`, () => {
    assert.deepEqual(undefinedReads([core.css, fixture.css]), []);
  });
  test(`core + ${fixture.label} + adapter: every var() read is declared`, () => {
    assert.deepEqual(undefinedReads([core.css, fixture.css, ...adapter.map((s) => s.css)]), []);
  });
}

for (const preset of presets) {
  test(`core + ${preset.label} + adapter: every var() read is declared`, () => {
    assert.deepEqual(undefinedReads([core.css, preset.css, ...adapter.map((s) => s.css)]), []);
  });
}

test('the --mat-sys-* tokens read only cp-theming tokens, never another --mat-* name', () => {
  const own = adapter
    .flatMap((s) => rules(s.css))
    .flatMap((r) => r.declarations)
    .filter(([n, v]) => n.startsWith('--mat-sys-') && /var\(\s*--mat-/.test(v))
    .map(([n]) => n);
  assert.deepEqual(own, []);
});
