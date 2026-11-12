// The Reference's CSS Variables page is generated from the compiled core.css
// (PORT-PLAN.md, Phase 17; scripts/lib/variables.ts). These checks hold the
// generator to that: every name core has is on the page once, nothing on the
// page is a name core does not have, and the page has no list of its own.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  declaredCustomProperties,
  registeredProperties,
  varReads,
} from '../../../packages/theme-core/test/lib/css.ts';
import { docsDir } from '../../../packages/theme-core/test/lib/sass.ts';
import {
  NOTES,
  TABLES,
  compiledCore,
  sectionNames,
  variablesData,
} from '../scripts/lib/variables.ts';

const css = compiledCore();
const data = variablesData(css);
const page = readFileSync(
  path.join(docsDir, 'src/app/packages/pages/variables.component.ts'),
  'utf8',
);

/** Every name core declares, registers or reads, without the private ones. */
const inCore = new Set(
  [
    ...declaredCustomProperties(css),
    ...registeredProperties(css),
    ...varReads(css).map((r) => r.name),
  ].filter((name) => !/--_/.test(name)),
);
const onPage = [...sectionNames(data).values()].flat();
// Shown inside another section as well as in its own table.
const shown = onPage.filter(
  (name, i) => !(name.startsWith('--palette-src') && onPage.indexOf(name) !== i),
);
// A value kept per mode is a row with its two sides named in it.
const sides = data.tables.flatMap((t) => t.rows.flatMap((r) => r.pair ?? []));

test('every public name in core.css is on the page, once', () => {
  const all = [...shown, ...sides];
  assert.deepEqual([...inCore].filter((n) => !all.includes(n)).sort(), [], 'missing');
  assert.deepEqual(all.filter((n) => !inCore.has(n)).sort(), [], 'not in core.css');
  assert.equal(new Set(all).size, all.length, 'a name is on the page twice');
});

test('every colour token has a swatch under its palette and role', () => {
  const colour = [...inCore].filter((n) => n.startsWith('--color--'));
  assert.equal(data.colourTokens, colour.length);
  assert.ok(colour.length > 900, `${colour.length} colour tokens`);
  assert.deepEqual(
    data.palettes.map((p) => p.name),
    [
      'brand',
      'primary',
      'secondary',
      'tertiary',
      'background',
      'surface',
      'error',
      'warn',
      'caution',
      'pass',
    ],
  );
  for (const p of data.palettes) {
    assert.deepEqual(
      p.roles.map((r) => r.base.name),
      [`--color--${p.name}`, `--color--${p.name}--bg`, `--color--${p.name}--stroke`],
    );
    for (const r of p.roles) {
      assert.equal(r.fixed.length, 6, `${r.base.name}: fixed steps`);
      assert.equal(r.relative.length, 6, `${r.base.name}: steps by mode`);
      assert.equal(r.inputs.length, 2, `${r.base.name}: a light and a dark value`);
      for (const t of [r.base, ...r.fixed, ...r.relative])
        assert.equal(t.contrast, `${t.name}--contrast`, t.name);
    }
    assert.equal(p.focus[0].name, `--color--${p.name}--focus`);
    assert.equal(p.tints.length, 5, `${p.name}: tints`);
  }
  // The chain palettes are the ones core generates.
  assert.deepEqual(
    data.palettes.filter((p) => p.generated).map((p) => p.name),
    ['primary', 'secondary', 'tertiary', 'background', 'surface'],
  );
});

test('a value comes from core.css: the registration, the root rule or the declaration', () => {
  const value = (name: string) => data.tables.flatMap((t) => t.rows).find((r) => r.name === name);
  assert.equal(value('--shape--xxl')?.value, '48px');
  assert.equal(value('--shape--xxl')?.type, '<length>');
  assert.equal(value('--motion--duration-medium')?.value, '200ms');
  assert.equal(value('--focus--width')?.value, '3px');
  assert.equal(value('--space--md')?.value, '16px');
  assert.equal(value('--weight--state-hover')?.value, '8%');
  assert.deepEqual(value('--weight--state-hover')?.pair, [
    '--weight--state-hover--mode-light',
    '--weight--state-hover--mode-dark',
  ]);
  assert.match(value('--elevation-2--shadow')?.value ?? '', /^0 2px 6px light-dark\(/);
  assert.equal(value('--container--padding')?.input, true);
  assert.match(value('--palette-color')?.value ?? '', /^var\(--palette-src/);
  const title = data.typeScale.styles.find((s) => s.style === 'title-large');
  assert.equal(title?.values['size'], '22px');
  assert.equal(data.typeScale.styles.length, 15);
});

test('a token with no place on the page stops the generator', () => {
  const extra = (declaration: string) => `${css}\n:where(:root){${declaration}}`;
  assert.throws(
    () => variablesData(extra('--color--primary--shiny: red;')),
    /no place on the page/,
  );
  assert.throws(() => variablesData(extra('--gizmo--size: 1px;')), /no table on the page/);
  // A private name is left out, not refused.
  assert.doesNotThrow(() => variablesData(extra('--gizmo--_size: 1px;')));
});

test('every note is for a variable core has', () => {
  for (const name of Object.keys(NOTES)) assert.ok(inCore.has(name), name);
});

test('the page renders the generated data and lists no variable itself', () => {
  assert.match(page, /from '\.\.\/\.\.\/\.\.\/\.\.\/\.generated\/variables'/);
  // Every table of the generator has its section, and no table is empty.
  for (const { id } of TABLES) {
    assert.ok(page.includes(`tables['${id}']`), `${id} is rendered`);
    assert.ok((data.tables.find((t) => t.id === id)?.rows.length ?? 0) > 0, `${id} has rows`);
  }
  for (const id of ['color-vars', 'text-vars', 'container-vars'])
    assert.ok(page.includes(`id="${id}"`), `section ${id}`);
  // A full variable name written into the template would be a hand-kept list.
  const template = /\btemplate:\s*`((?:[^`\\]|\\[\s\S])*)`/.exec(page)?.[1] ?? '';
  const written = [
    ...template.matchAll(
      /--(?:color|weight|space|shape|focus|motion|overlay|text|container|palette-color|palette-src)--[a-z][\w-]*|--elevation-\d[\w-]*/g,
    ),
  ]
    .map((m) => m[0])
    .filter((name) => inCore.has(name));
  assert.deepEqual(written, []);
});

test('summary', (t) => {
  t.diagnostic(
    `${data.colourTokens} colour tokens in ${data.palettes.length} palettes, ` +
      `${data.otherVariables} other variables in ${data.tables.length} tables and the type scale`,
  );
});
