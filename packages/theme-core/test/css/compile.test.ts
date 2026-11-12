// Check 1 — every Sass entry the build names, and every fixture theme, compiles
// through the Sass JS API with zero deprecation warnings from cp-theming's own
// files. Dependencies are quiet (quietDeps); only our files count.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { buildEntries, compileFile, coreDir, fixtureEntries, repoRoot } from '../lib/sass.ts';
import { formatWarning } from '../lib/sets.ts';

const entries = [
  ...buildEntries(coreDir),
  ...fixtureEntries(path.join(coreDir, 'test', 'fixtures')),
];
assert.ok(entries.length >= 6, 'the build command names the core and preset entries');

for (const entry of entries) {
  test(`${path.relative(repoRoot, entry)} compiles with zero deprecation warnings from cp-theming files`, () => {
    const { css, warnings } = compileFile(entry);
    assert.deepEqual(warnings.filter((w) => w.own).map(formatWarning), [], 'own-file warnings');
    if (!entry.endsWith('theme-vars.scss')) assert.ok(css.length > 0, 'produces CSS');
  });
}
