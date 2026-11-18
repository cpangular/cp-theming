// What the docs state about the surface scale (issue #12, PORT-PLAN.md Phase
// 19), held to the compiled CSS:
//
//   - the Palette page's "Surface containers" strip: the lightness between
//     the surface and each container, in light and in dark mode;
//   - the table "Material's colour roles in cp-theming" on the ng-material API
//     page and in the adapter's README: each Material role is the cp-theming
//     variable beside it, and the two tables are the same.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  declarationsFor,
  normalizeSelector,
  rules,
} from '../../../packages/theme-core/test/lib/css.ts';
import {
  compileFile,
  coreDir,
  docsDir,
  materialDir,
} from '../../../packages/theme-core/test/lib/sass.ts';

const core = compileFile(path.join(coreDir, 'scss/core.scss')).css;
const adapter = compileFile(path.join(materialDir, 'scss/material-core.scss')).css;
const shared = new Map(
  rules(core).find(
    (r) => normalizeSelector(r.selector) === ':where(:root, [theme])' && !r.context.length,
  )!.declarations,
);
const roles = declarationsFor(adapter, ':root');
const page = (name: string) =>
  readFileSync(path.join(docsDir, 'src/app/packages/pages', `${name}.component.ts`), 'utf8');

// ── The Palette page's strip ─────────────────────────────────────────────────

test('the Palette page’s container strip: the tokens core declares, with the distances core gives them', () => {
  const source = page('palette');
  const strip = [
    ...source.matchAll(/\{ token: '(--color--[\w-]+)', light: '([^']+)', dark: '([^']+)' \}/g),
  ].map(([, token, light, dark]) => ({ token, light, dark }));
  assert.equal(strip.length, 6, 'the surface and its five containers');
  const number = (text: string) => Number(text.replace('−', '-'));
  for (const { token, light, dark } of strip) {
    if (token === '--color--surface') {
      assert.deepEqual([light, dark], ['0', '0']);
      continue;
    }
    const value = shared.get(token);
    assert.ok(value, `${token} is declared by core`);
    // light-dark(oklch(from … clamp(0, l - 0.0172, 1) …), oklch(from … clamp(0, l + 0.0362, 1) …))
    const moved = [...value.matchAll(/clamp\(0, l ([+-]) ([\d.]+), 1\)/g)].map(
      ([, sign, amount]) => (sign === '-' ? -1 : 1) * Number(amount),
    );
    assert.equal(moved.length, 2, token);
    assert.ok(
      Math.abs(number(light) - moved[0]) < 0.00051,
      `${token} light: ${light} for ${moved[0]}`,
    );
    assert.ok(
      Math.abs(number(dark) - moved[1]) < 0.00051,
      `${token} dark: ${dark} for ${moved[1]}`,
    );
  }
  // In M3's order, the surface second.
  assert.deepEqual(
    strip.map((s) => s.token.replace('--color--surface', '')),
    [
      '--container-lowest',
      '',
      '--container-low',
      '--container',
      '--container-high',
      '--container-highest',
    ],
  );
});

// ── The role table ───────────────────────────────────────────────────────────

/** [role, variable] rows of the table on the ng-material API page. */
function pageTable(): [string, string][] {
  const source = page('api');
  const start = source.indexOf('data-role-map');
  assert.ok(start > 0, 'the API page has the role table');
  const table = source.slice(start, source.indexOf('</table>', start));
  return [
    ...table.matchAll(
      /<td><code>(--mat-sys-[\w-]+)<\/code><\/td>\s*<td><code>(--[\w-]+)<\/code><\/td>/g,
    ),
  ].map(([, role, variable]) => [role, variable]);
}

/** The same rows of the adapter's README. */
function readmeTable(): [string, string][] {
  const readme = readFileSync(path.join(materialDir, 'README.md'), 'utf8');
  const start = readme.indexOf("## Material's colour roles in cp-theming");
  assert.ok(start >= 0, 'the README has the role table');
  const section = readme.slice(start, readme.indexOf('\n## ', start + 4));
  return [...section.matchAll(/^\| `(--mat-sys-[\w-]+)` \| `(--[\w-]+)` \|/gm)].map(
    ([, role, variable]) => [role, variable],
  );
}

test('“Material’s colour roles in cp-theming”: every row is what the adapter declares', () => {
  const table = pageTable();
  assert.ok(table.length >= 17, `${table.length} rows`);
  for (const [role, variable] of table) {
    const value = roles.get(role);
    assert.ok(value, `${role} is declared by the adapter`);
    // The role is the variable, or the variable in light mode and a shade
    // step of it in dark (the accent containers).
    assert.ok(
      value === `var(${variable})` ||
        value.startsWith(`light-dark(var(${variable}), var(--color--`),
      `${role} is ${value}, not ${variable}`,
    );
  }
});

test('the role table lists every Material role that is a cp-theming variable (primary for the four accents)', () => {
  const listed = new Set(pageTable().map(([role]) => role));
  const direct = [...roles]
    .filter(([name]) => name.startsWith('--mat-sys-'))
    .filter(
      ([, value]) =>
        /^var\(--(color|overlay)--[\w-]+\)$/.test(value) ||
        /^light-dark\(var\(--color--[\w-]+\), var\(--color--[\w-]+\)\)$/.test(value),
    )
    .map(([name]) => name)
    // secondary, tertiary and error repeat primary's four rows; the page says so.
    .filter((name) => !/^--mat-sys-(on-)?(secondary|tertiary|error)(-container)?$/.test(name));
  assert.deepEqual(direct.filter((name) => !listed.has(name)).sort(), []);
});

test('the adapter’s README has the same table', () => {
  assert.deepEqual(readmeTable(), pageTable());
});

test('the surface containers are in the table, each as core’s token of the same name', () => {
  const table = new Map(pageTable());
  for (const step of ['-lowest', '-low', '', '-high', '-highest'])
    assert.equal(
      table.get(`--mat-sys-surface-container${step}`),
      `--color--surface--container${step}`,
    );
});
