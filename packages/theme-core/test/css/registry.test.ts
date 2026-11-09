// Check 4 — core.css: size, @property count and the exact registered list.
// Theme stylesheets register nothing for core palette names; a custom palette
// name gets four registrations in its theme stylesheet until Phase 9 moves them
// to root level (Phase 9 updates the custom-palette assertion).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registeredProperties } from '../lib/css.ts';
import { CORE_PALETTE_NAMES, coreFixtureSheets, coreSheets } from '../lib/sets.ts';

const { core, presets } = coreSheets();

const WEIGHTS = [
  'text-blend',
  'text-emphasis-blend',
  'text-deemphasis-blend',
  'text-primary-tint',
  'state-hover',
  'state-press',
  'state-focus',
  'state-drag',
  'tint-1',
  'tint-2',
  'tint-3',
  'tint-4',
  'tint-5',
];
const SIZES = ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
const ROLES = ['', '--bg', '--stroke', '--focus'];

export const expectedRegistrations = [
  ...CORE_PALETTE_NAMES.flatMap((n) => ROLES.map((r) => `--color--${n}${r}`)),
  ...ROLES.map((r) => `--palette-color${r}`),
  '--container--text',
  '--container--text-emphasis',
  '--container--text-deemphasis',
  '--container--stroke',
  '--color--brand',
  ...WEIGHTS.map((w) => `--weight--${w}`),
  '--density-scale',
  ...SIZES.map((s) => `--space--${s}`),
  ...SIZES.map((s) => `--shape--${s}`),
  '--shape--full',
];

test('core.css registers exactly the expected 70 properties, each once', () => {
  const registered = registeredProperties(core.css);
  assert.equal(registered.length, 70);
  assert.equal(new Set(registered).size, registered.length, 'no duplicate registrations');
  assert.deepEqual([...registered].sort(), [...expectedRegistrations].sort());
});

test('core.css stays under 32 KiB', (t) => {
  const bytes = Buffer.byteLength(core.css);
  t.diagnostic(`core.css: ${bytes} bytes`);
  assert.ok(bytes <= 32 * 1024, `${bytes} bytes`);
});

test('preset sizes (recorded, not asserted)', (t) => {
  for (const p of presets) t.diagnostic(`${p.label}: ${Buffer.byteLength(p.css)} bytes`);
});

for (const preset of presets) {
  test(`${preset.label} registers no @property (core palette names are registered by core.css)`, () => {
    assert.deepEqual(registeredProperties(preset.css), []);
  });
}

for (const fixture of coreFixtureSheets()) {
  const custom = [
    ...new Set([...fixture.css.matchAll(/\[palette=["']?([\w-]+)["']?\]/g)].map((m) => m[1])),
  ].filter((n) => !CORE_PALETTE_NAMES.includes(n));
  test(`${fixture.label} registers 4 names per custom palette (${custom.join(', ') || 'none'}) and nothing else`, () => {
    const expected = custom.flatMap((n) => ROLES.map((r) => `--color--${n}${r}`));
    assert.deepEqual([...registeredProperties(fixture.css)].sort(), expected.sort());
  });
}
