// Check 1 (adapter) — the Material adapter's build entries and its fixture theme
// compile through the Sass JS API with zero deprecation warnings from our files.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {
  buildEntries,
  compileFile,
  fixtureEntries,
  materialDir,
  repoRoot,
} from '../../../theme-core/test/lib/sass.ts';
import { formatWarning } from '../../../theme-core/test/lib/sets.ts';

const entries = [
  ...buildEntries(materialDir),
  ...fixtureEntries(path.join(materialDir, 'test', 'fixtures')),
];
assert.ok(entries.length >= 2, 'the build command names the adapter entries');

for (const entry of entries) {
  test(`${path.relative(repoRoot, entry)} compiles with zero deprecation warnings from cp-theming files`, () => {
    const { css, warnings } = compileFile(entry);
    assert.deepEqual(warnings.filter((w) => w.own).map(formatWarning), []);
    assert.ok(css.length > 0, 'produces CSS');
  });
}
