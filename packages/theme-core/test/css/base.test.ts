// The opt-in page rule (issue #10, PORT-PLAN.md Phase 19): `apply-document-base()`
// and its compiled form, `css/base`. Core styles no element by itself; an app
// asks for the page to take the theme with one include or one import.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { compileFile, compileSource, coreDir, resolveExport } from '../lib/sass.ts';
import { declaredCustomProperties, rules, varReads } from '../lib/css.ts';
import { coreSheets } from '../lib/sets.ts';

const mixin = compileSource(
  `@use "theme" as t;\n@include t.apply-document-base();`,
  path.join(coreDir, 'scss', '__base.scss'),
  [path.join(coreDir, 'scss')],
);
const entry = compileFile(path.join(coreDir, 'scss/base.scss'));

test('apply-document-base() is one zero-specificity body rule: background, text, font family', () => {
  assert.deepEqual(mixin.warnings, []);
  const all = rules(mixin.css);
  assert.equal(all.length, 1);
  assert.equal(all[0].selector, ':where(body)');
  assert.deepEqual(
    [...all[0].declarations],
    [
      ['background-color', 'var(--color--background)'],
      ['color', 'var(--color--background--contrast)'],
      ['font-family', 'var(--text--plain-family)'],
    ],
  );
});

test('included inside a rule it still styles the body, not a descendant', () => {
  const nested = compileSource(
    `@use "theme" as t;\n.app { @include t.apply-document-base(); }`,
    path.join(coreDir, 'scss', '__base-nested.scss'),
    [path.join(coreDir, 'scss')],
  );
  assert.deepEqual(
    rules(nested.css).map((r) => r.selector),
    [':where(body)'],
  );
});

test('css/base is the mixin compiled, and the package exports it in both maps', () => {
  assert.equal(entry.css, mixin.css);
  assert.equal(
    resolveExport('@cpangular/cp-theming-core/css/base'),
    path.join(coreDir, 'dist/base.css'),
  );
  const manifest = JSON.parse(readFileSync(path.join(coreDir, 'package.json'), 'utf8'));
  assert.equal(manifest.publishConfig.exports['./css/base'], './dist/base.css');
  assert.match(manifest.wireit['build.css'].command, / scss\/base\.scss:dist\/base\.css /);
});

test('core declares every variable the rule reads', () => {
  const declared = declaredCustomProperties(coreSheets().core.css);
  for (const read of varReads(mixin.css)) assert.ok(declared.has(read.name), read.name);
});

test('opt-in: core and the presets style no element selector', () => {
  const { core, presets } = coreSheets();
  for (const sheet of [core, ...presets]) {
    const typed = rules(sheet.css)
      .flatMap((r) => r.selector.split(','))
      // A type selector outside :root / :where(:root …): body, html, a, …
      .filter((s) => /(^|[\s>+~(,])(body|html)\b/.test(s.trim()));
    assert.deepEqual(typed, [], sheet.label);
  }
});
