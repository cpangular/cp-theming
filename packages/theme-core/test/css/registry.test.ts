// Check 4 — core.css: size, @property count and the exact registered list:
// each core palette role's light and dark colour (ten palettes since Phase 14:
// brand and tertiary are core names, and --color--brand is the brand palette's
// pair) and the 29 scalars. Theme stylesheets register nothing for core palette
// names; a custom palette name gets its eight registrations at root level in
// its theme stylesheet.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
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
const MODES = ['--mode-light', '--mode-dark'];

/** The eight registrations of one palette name: four roles × light and dark. */
export const paletteRegistrations = (name: string) =>
  ROLES.flatMap((r) => MODES.map((m) => `--color--${name}${r}${m}`));

export const scalarRegistrations = [
  ...WEIGHTS.map((w) => `--weight--${w}`),
  '--density-scale',
  ...SIZES.map((s) => `--space--${s}`),
  ...SIZES.map((s) => `--shape--${s}`),
  '--shape--full',
];

export const expectedRegistrations = [
  ...CORE_PALETTE_NAMES.flatMap(paletteRegistrations),
  ...scalarRegistrations,
];

test('the scalar list is the 29 the plan names', () => {
  assert.equal(scalarRegistrations.length, 29);
});

test('core.css registers exactly the expected 109 properties, each once', () => {
  const registered = registeredProperties(core.css);
  // 10 palettes × 4 roles × 2 modes + 29 scalars.
  assert.equal(registered.length, 109);
  assert.ok(!registered.includes('--color--brand'), '--color--brand is a join, not registered');
  assert.equal(new Set(registered).size, registered.length, 'no duplicate registrations');
  assert.deepEqual([...registered].sort(), [...expectedRegistrations].sort());
});

// Core carries every derivation once (the presets carried eight copies), for
// ten palette names since Phase 14 (about 20 KB expanded per name).
test('core.css stays under 224 KiB expanded and 16 KiB gzipped', (t) => {
  const bytes = Buffer.byteLength(core.css);
  const gz = gzipSync(core.css).length;
  t.diagnostic(`core.css: ${bytes} bytes, ${gz} gzipped`);
  assert.ok(bytes <= 224 * 1024, `${bytes} bytes`);
  assert.ok(gz <= 16 * 1024, `${gz} bytes gzipped`);
});

test('each preset stays under 4 KiB (a theme rule holds only what was passed)', (t) => {
  for (const p of presets) {
    const bytes = Buffer.byteLength(p.css);
    t.diagnostic(`${p.label}: ${bytes} bytes, ${gzipSync(p.css).length} gzipped`);
    assert.ok(bytes <= 4 * 1024, `${p.label}: ${bytes} bytes`);
  }
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
  test(`${fixture.label} registers 8 names per custom palette (${custom.join(', ') || 'none'}) and nothing else`, () => {
    const expected = custom.flatMap(paletteRegistrations);
    assert.deepEqual([...registeredProperties(fixture.css)].sort(), expected.sort());
  });
}
