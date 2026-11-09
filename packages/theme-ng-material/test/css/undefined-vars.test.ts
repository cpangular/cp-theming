// Check 2 (adapter) — every var() the adapter reads is declared by core + a
// theme, and the adaptor fixture declares what its [palette] hooks read.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { undefinedReads } from '../../../theme-core/test/lib/css.ts';
import {
  coreSheets,
  materialFixtureSheets,
  materialSheets,
} from '../../../theme-core/test/lib/sets.ts';

const { core, presets } = coreSheets();
const adapter = materialSheets();
const PHASE_11 = 'Phase 11 — the adapter reads --typescale--* while core emits --text--*';

for (const fixture of materialFixtureSheets()) {
  test(`core + ${fixture.label}: every var() read (including the adaptor hooks) is declared`, () => {
    assert.deepEqual(undefinedReads([core.css, fixture.css]), []);
  });
  test(
    `core + ${fixture.label} + adapter: every var() read is declared`,
    { todo: PHASE_11 },
    (t) => {
      const missing = undefinedReads([core.css, fixture.css, ...adapter.map((s) => s.css)]);
      t.diagnostic(`${missing.length} undefined reads`);
      assert.deepEqual(missing, []);
    },
  );
}

for (const preset of presets) {
  test(
    `core + ${preset.label} + adapter: every var() read is declared`,
    { todo: PHASE_11 },
    (t) => {
      const missing = undefinedReads([core.css, preset.css, ...adapter.map((s) => s.css)]);
      t.diagnostic(`${missing.length} undefined reads`);
      assert.deepEqual(missing, []);
    },
  );
}

test('the adapter reads only cp-theming tokens and its own --mat-sys-* names', () => {
  const foreign = undefinedReads([core.css, presets[0].css, ...adapter.map((s) => s.css)]).filter(
    (n) => !n.startsWith('--typescale--'),
  );
  assert.deepEqual(foreign, []);
});
