// The data of the Reference's CSS Variables page, read out of the compiled
// core.css (PORT-PLAN.md, Phase 17). Every custom property core declares,
// registers or reads lands in exactly one place:
//
//   --color--…            a swatch, under its palette and its role
//   everything else       a row of the table for its family (weights, space, …)
//   a private name        left out: any name with a segment that starts `_`
//
// A name that fits nowhere throws, so a new token cannot be missing from the
// page without the docs build and the docs tests failing.
import path from 'node:path';
import {
  normalizeSelector,
  registeredInitialValues,
  rules,
  stripComments,
  varReads,
} from '../../../../packages/theme-core/test/lib/css.ts';
import { compileFile, coreDir } from '../../../../packages/theme-core/test/lib/sass.ts';
import type {
  ColourToken,
  PaletteGroup,
  RoleGroup,
  TypeScale,
  VariableRow,
  VariableTable,
  VariablesData,
} from '../../src/app/packages/pages/variables/variables-data.ts';

/** core.css as the package builds it. */
export function compiledCore(): string {
  return compileFile(path.join(coreDir, 'scss/core.scss')).css;
}

// ── Colour tokens ────────────────────────────────────────────────────────────

/** The order palettes are shown in: the chain, then the four fixed ones. */
const PALETTE_ORDER = [
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
];
const FIXED_STEPS = ['darkest', 'darker', 'dark', 'light', 'lighter', 'lightest'];
const RELATIVE_STEPS = ['lowest', 'lower', 'low', 'high', 'higher', 'highest'];
const ROLES = ['bg', 'stroke'];
const MODES: [suffix: string, label: string][] = [
  ['mode-light', 'light value'],
  ['mode-dark', 'dark value'],
];

function palettesOf(names: Set<string>): PaletteGroup[] {
  const colour = [...names].filter((n) => n.startsWith('--color--'));
  const used = new Set<string>();
  const take = (name: string): string | undefined => {
    if (!names.has(name)) return undefined;
    used.add(name);
    return name;
  };
  const token = (name: string, label: string): ColourToken | undefined => {
    if (!take(name)) return undefined;
    const contrast = take(`${name}--contrast`);
    return { name, label, ...(contrast ? { contrast } : {}) };
  };
  const tokens = (base: string, suffixes: string[]): ColourToken[] =>
    suffixes.flatMap((s) => token(`${base}--${s}`, s) ?? []);
  const inputs = (base: string): ColourToken[] =>
    MODES.flatMap(([suffix, label]) => token(`${base}--${suffix}`, label) ?? []);

  const found = new Set(colour.map((n) => n.split('--')[2]));
  const order = [...PALETTE_ORDER.filter((p) => found.has(p)), ...[...found].sort()];
  const palettes: PaletteGroup[] = [...new Set(order)].map((palette) => {
    const root = `--color--${palette}`;
    const role = (name: string, base: string): RoleGroup => ({
      role: name,
      base: token(base, name === 'colour' ? palette : name)!,
      inputs: inputs(base),
      fixed: tokens(base, FIXED_STEPS),
      relative: tokens(base, RELATIVE_STEPS),
    });
    return {
      name: palette,
      generated: names.has(`--theme--_generated--${palette}--light`),
      roles: [role('colour', root), ...ROLES.map((r) => role(r, `${root}--${r}`))],
      focus: [token(`${root}--focus`, 'focus'), ...inputs(`${root}--focus`)].filter(
        (t): t is ColourToken => !!t,
      ),
      tints: tokens(
        root,
        [1, 2, 3, 4, 5].map((n) => `tint-${n}`),
      ),
    };
  });

  const missed = colour.filter((n) => !used.has(n));
  if (missed.length)
    throw new Error(`variables: colour tokens with no place on the page: ${missed.join(', ')}`);
  return palettes;
}

const countColour = (palettes: PaletteGroup[]): number => {
  const count = (list: ColourToken[]) => list.reduce((n, t) => n + 1 + (t.contrast ? 1 : 0), 0);
  return palettes.reduce(
    (n, p) =>
      n +
      count(p.focus) +
      count(p.tints) +
      p.roles.reduce(
        (m, r) => m + count([r.base]) + count(r.inputs) + count(r.fixed) + count(r.relative),
        0,
      ),
    0,
  );
};

// ── Everything else ──────────────────────────────────────────────────────────

/** The tables, in page order, and the names each one takes. */
export const TABLES: { id: string; match: RegExp }[] = [
  { id: 'weight-vars', match: /^--weight--/ },
  { id: 'space-vars', match: /^--density-scale$|^--space--/ },
  { id: 'shape-vars', match: /^--shape--/ },
  { id: 'focus-vars', match: /^--focus--/ },
  { id: 'motion-vars', match: /^--motion--/ },
  { id: 'elevation-vars', match: /^--elevation-\d/ },
  { id: 'overlay-vars', match: /^--overlay--/ },
  { id: 'text-vars', match: /^--text--(?!(?:display|headline|title|body|label)-)/ },
  { id: 'palette-scope-vars', match: /^--palette-color\b/ },
  { id: 'palette-source-vars', match: /^--palette-src\b/ },
  {
    id: 'container-vars',
    match: /^--container--|^--bg-bleed\b|^--bg-chroma$|^--stroke-width$/,
  },
];

/** `--text--{style}--{property}`: the type scale, shown as a grid. */
const TYPE_SCALE = /^--text--((?:display|headline|title|body|label)-[a-z]+)--([a-z-]+)$/;

/**
 * What a name is for, where the name does not say it. A note is the one thing
 * on the page that is written by hand; `variablesData()` throws when a note
 * names a variable core does not have.
 */
export const NOTES: Record<string, string> = {
  '--weight--text-blend': 'How much of the contrast colour ordinary text keeps.',
  '--weight--text-emphasis-blend': 'The same for text that should stand out.',
  '--weight--text-deemphasis-blend': 'The same for a quieter line.',
  '--weight--text-primary-tint': 'How much of the primary is mixed into text.',
  '--weight--state-hover': 'Strength of the wash over a hovered element.',
  '--weight--state-press': 'Strength of the wash while pressed.',
  '--weight--state-focus': 'Strength of the wash on the focused element.',
  '--weight--state-drag': 'Strength of the wash while dragged.',
  '--weight--tint-1': 'Opacity of --color--{name}--tint-1, and so on to tint-5.',
  '--density-scale': 'The density of this scope, from -5 to 5.',
  '--overlay--scrim': 'The veil behind a dialog.',
  '--overlay--shadow': 'The base colour of overlay shadows.',
  '--palette-color': 'The colour of the palette this element is in.',
  '--palette-src': 'The same before tone is applied: what tone slides.',
  '--container--text': 'Text on the fill of the nearest filled element.',
  '--container--text-emphasis': 'The same at full contrast.',
  '--container--text-deemphasis': 'The same for a quieter line.',
  '--container--stroke': 'The border colour outlined draws with.',
  '--container--stroke-width': 'The border width outlined draws with.',
  '--container--radius': 'The corner radius shape sets.',
  '--container--padding': 'Padding of a container, all sides. The more specific ones win.',
  '--container--radius--tl': 'One corner. Also --top, --bottom, --left and --right for two.',
  '--bg-bleed': 'How far a bg fill reaches past its element.',
  '--bg-chroma': 'How much of the colour a bg role keeps.',
  '--stroke-width': 'Width of an outlined border.',
};

const isPrivate = (name: string) => /--_/.test(name);
const squash = (value: string) => value.replace(/\s+/g, ' ').trim();

/**
 * One text for the values a name is declared with in different scopes: the
 * value itself when they agree, otherwise what they share with `…` where they
 * differ (`var(--color--…--tint-1)` for the ten `[palette=…]` rules).
 */
function merged(values: string[]): string {
  const distinct = [...new Set(values)];
  if (distinct.length === 1) return distinct[0];
  let start = 0;
  while (distinct.every((v) => v[start] !== undefined && v[start] === distinct[0][start])) start++;
  let end = 0;
  while (
    distinct.every(
      (v) =>
        v.length - end > start &&
        v[v.length - 1 - end] === distinct[0][distinct[0].length - 1 - end],
    )
  )
    end++;
  return `${distinct[0].slice(0, start)}…${distinct[0].slice(distinct[0].length - end)}`;
}

/** `@property` name → its syntax. */
function registeredSyntax(css: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const m of stripComments(css).matchAll(/@property\s+(--[\w-]+)\s*\{([^}]*)\}/g)) {
    const syntax = /syntax\s*:\s*["']([^"']+)["']/.exec(m[2]);
    if (syntax) map.set(m[1], syntax[1]);
  }
  return map;
}

/** The page root's own rule: what a page has before any theme. */
const ROOT = normalizeSelector(':where(:root)');

export function variablesData(css: string = compiledCore()): VariablesData {
  const all = rules(css);
  const initial = registeredInitialValues(css);
  const syntax = registeredSyntax(css);

  /** Every declaration of a name, in order. */
  const declared = new Map<string, { selector: string; value: string }[]>();
  for (const rule of all)
    for (const [name, value] of rule.declarations) {
      if (!name.startsWith('--')) continue;
      const list = declared.get(name) ?? [];
      list.push({ selector: squash(rule.selector), value: squash(value) });
      declared.set(name, list);
    }
  const read = new Set(varReads(css).map((r) => r.name));
  const names = new Set([...declared.keys(), ...initial.keys(), ...read]);

  const palettes = palettesOf(names);

  const rest = [...names].filter((n) => !n.startsWith('--color--') && !isPrivate(n));
  const onRoot = (name: string) =>
    declared.get(name)?.find((d) => normalizeSelector(d.selector) === ROOT)?.value;

  // A value kept per mode is the pair `--x--mode-light` / `--x--mode-dark`.
  const sides = new Set(rest.filter((n) => /--mode-(?:light|dark)$/.test(n)));

  function row(name: string): VariableRow {
    const out: VariableRow = { name, value: '' };
    const type = syntax.get(name);
    if (type) out.type = type;
    const light = `${name}--mode-light`;
    const dark = `${name}--mode-dark`;
    const declarations = declared.get(name) ?? [];
    if (sides.has(light) && sides.has(dark)) {
      out.pair = [light, dark];
      const l = onRoot(light) ?? '';
      const d = onRoot(dark) ?? '';
      out.value = l === d ? l : `${l} in light, ${d} in dark`;
    } else if (onRoot(name) !== undefined) {
      out.value = onRoot(name)!;
    } else if (initial.has(name)) {
      out.value = initial.get(name)!;
    } else if (declarations.length) {
      out.value = merged(declarations.map((d) => d.value));
      out.where = [...new Set(declarations.map((d) => d.selector.replace(/=[^\]]+\]/g, ']')))];
    } else {
      // Read with a fallback, never declared: an input.
      out.input = true;
    }
    if (NOTES[name]) out.note = NOTES[name];
    return out;
  }

  // The type scale, as a grid.
  const scale = new Map<string, Record<string, string>>();
  const properties: string[] = [];
  const typed = new Set<string>();
  for (const name of rest) {
    const m = TYPE_SCALE.exec(name);
    if (!m) continue;
    typed.add(name);
    if (!properties.includes(m[2])) properties.push(m[2]);
    const values = scale.get(m[1]) ?? {};
    values[m[2]] = row(name).value;
    scale.set(m[1], values);
  }
  const typeScale: TypeScale = {
    properties,
    styles: [...scale].map(([style, values]) => ({ style, values })),
  };

  const placed = new Set<string>([...typed, ...sides]);
  const tables: VariableTable[] = TABLES.map(({ id, match }) => {
    const mine = rest.filter((n) => match.test(n) && !placed.has(n));
    for (const n of mine) placed.add(n);
    return { id, rows: mine.map(row) };
  });

  const unplaced = rest.filter((n) => !placed.has(n));
  if (unplaced.length)
    throw new Error(`variables: names with no table on the page: ${unplaced.join(', ')}`);
  const orphan = [...sides].filter((n) => !names.has(n.replace(/--mode-(?:light|dark)$/, '')));
  if (orphan.length)
    throw new Error(`variables: a light or dark value without its token: ${orphan.join(', ')}`);
  const stale = Object.keys(NOTES).filter((n) => !names.has(n));
  if (stale.length) throw new Error(`variables: notes for names core does not have: ${stale}`);

  return {
    palettes,
    tables,
    typeScale,
    colourTokens: countColour(palettes),
    otherVariables:
      tables.reduce((n, t) => n + t.rows.length, 0) + typeScale.styles.length * properties.length,
  };
}

/** The page the data is rendered by, as REFS names it. */
export const VARIABLES_PAGE = 'core/variables';

/**
 * The variable names a section of the generated page shows, by section id:
 * what a Learn chapter's link to that section can expect to find there.
 */
export function sectionNames(data: VariablesData): Map<string, string[]> {
  const tokens = (list: ColourToken[]) => list.flatMap((t) => [t.name, t.contrast ?? '']);
  const sections = new Map<string, string[]>();
  sections.set(
    'color-vars',
    data.palettes
      .flatMap((p) => [
        ...tokens(p.focus),
        ...tokens(p.tints),
        ...p.roles.flatMap((r) => tokens([r.base, ...r.inputs, ...r.fixed, ...r.relative])),
      ])
      .filter(Boolean),
  );
  for (const table of data.tables)
    sections.set(
      table.id,
      table.rows.map((r) => r.name),
    );
  const scale = data.typeScale.styles.flatMap((s) =>
    data.typeScale.properties.map((property) => `--text--${s.style}--${property}`),
  );
  sections.set('text-vars', [...(sections.get('text-vars') ?? []), ...scale]);
  // A table shown inside another section.
  sections.set('palette-scope-vars', [
    ...(sections.get('palette-scope-vars') ?? []),
    ...(sections.get('palette-source-vars') ?? []),
  ]);
  return sections;
}
