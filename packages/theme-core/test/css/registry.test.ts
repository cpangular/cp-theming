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
const NEUTRALS = ['background', 'surface'];

/**
 * The registrations of one palette name, light and dark of each role: eight
 * for background and surface (colour, bg, stroke, focus), ten for an accent,
 * which also has the text role (Phase 19).
 */
export const paletteRegistrations = (name: string) =>
  [...ROLES, ...(NEUTRALS.includes(name) ? [] : ['--text'])].flatMap((r) =>
    MODES.map((m) => `--color--${name}${r}${m}`),
  );

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

test('core.css registers exactly the expected 125 properties, each once', () => {
  const registered = registeredProperties(core.css);
  // 10 palettes × 4 roles × 2 modes, the text role of the 8 accents × 2 modes, 29 scalars.
  assert.equal(registered.length, 125);
  assert.ok(!registered.includes('--color--brand'), '--color--brand is a join, not registered');
  assert.equal(new Set(registered).size, registered.length, 'no duplicate registrations');
  assert.deepEqual([...registered].sort(), [...expectedRegistrations].sort());
});

// Core carries every derivation once (the presets carried eight copies), for
// ten palette names since Phase 14 (about 20 KB expanded per name). The
// gzipped size is the one that matters: the expanded ceiling is 256 KiB since
// Phase 14b, when core.css was 221,168 bytes (216 KiB), 15,211 gzipped.
//
// 16.5 KiB gzipped since Phase 19, Session C (16 KiB until then), where
// core.css came to 16,471 bytes: the surface's ten container declarations
// (132 bytes gzipped), the three text variables of the page (66), ten more
// shadow layers (89) and the accent stroke through the gamut correction (36).
// Declaring the gamut factor once took 4.4 KB off the expanded file and 31
// bytes off the gzipped one: gzip had already folded the repetition.
// 16,572 bytes since issue #16: the low side of the two neutral strokes is
// written out as six mixes with a contrast each.
test('core.css stays under 256 KiB expanded and 16.5 KiB gzipped', (t) => {
  const bytes = Buffer.byteLength(core.css);
  const gz = gzipSync(core.css).length;
  t.diagnostic(`core.css: ${bytes} bytes, ${gz} gzipped`);
  assert.ok(bytes <= 256 * 1024, `${bytes} bytes`);
  assert.ok(gz <= 16.5 * 1024, `${gz} bytes gzipped`);
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
  test(`${fixture.label} registers 10 names per custom palette (${custom.join(', ') || 'none'}) and nothing else`, () => {
    const expected = custom.flatMap(paletteRegistrations);
    assert.deepEqual([...registeredProperties(fixture.css)].sort(), expected.sort());
  });
}
