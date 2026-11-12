// Check 2 — every `var(--x)` read without a fallback is declared or registered
// by some stylesheet in the set. Sets: core + each preset, core + each fixture,
// core + preset + Material adapter, and the docs app's full style list.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { docsStyleList } from '../lib/sass.ts';
import { undefinedReads } from '../lib/css.ts';
import { coreFixtureSheets, coreSheets, materialSheets } from '../lib/sets.ts';

const { core, presets } = coreSheets();
const adapter = materialSheets();

for (const preset of presets) {
  test(`core + ${preset.label}: every var() read is declared`, () => {
    assert.deepEqual(undefinedReads([core.css, preset.css]), []);
  });
}

for (const fixture of coreFixtureSheets()) {
  test(`core + ${fixture.label}: every var() read is declared`, () => {
    assert.deepEqual(undefinedReads([core.css, fixture.css]), []);
  });
}

for (const preset of presets) {
  test(`core + ${preset.label} + adapter: every var() read is declared`, () => {
    assert.deepEqual(undefinedReads([core.css, preset.css, ...adapter.map((s) => s.css)]), []);
  });
}

test('docs app full style list (angular.json): every var() read is declared', (t) => {
  const list = docsStyleList();
  t.diagnostic(`styles: ${list.map((s) => s.entry).join(', ')}`);
  assert.deepEqual(undefinedReads(list.map((s) => s.compiled.css)), []);
});
