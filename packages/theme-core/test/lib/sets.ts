// The stylesheet sets the checks run on: the build entries of both packages,
// the fixture themes, and the docs app's style list. Compiled once per import.
import path from 'node:path';
import { declarationsFor, registeredInitialValues, rules, themeSelector } from './css.ts';
import {
  buildEntries,
  compileFile,
  coreDir,
  fixtureEntries,
  materialDir,
  repoRoot,
  type Compiled,
} from './sass.ts';

export interface Stylesheet extends Compiled {
  /** Path relative to the repository root. */
  label: string;
}

function sheet(file: string): Stylesheet {
  return { label: path.relative(repoRoot, file), ...compileFile(file) };
}

export const CORE_PALETTE_NAMES = [
  'background',
  'surface',
  'primary',
  'secondary',
  'error',
  'warn',
  'caution',
  'pass',
];

let coreCache: { core: Stylesheet; presets: Stylesheet[]; others: Stylesheet[] } | undefined;
/** core.scss, the preset themes, and any other core build entry (theme-vars). */
export function coreSheets() {
  if (!coreCache) {
    const all = buildEntries(coreDir).map(sheet);
    coreCache = {
      core: all.find((s) => path.basename(s.entry) === 'core.scss')!,
      presets: all.filter((s) => s.entry.includes(`${path.sep}presets${path.sep}`)),
      others: all.filter(
        (s) =>
          path.basename(s.entry) !== 'core.scss' &&
          !s.entry.includes(`${path.sep}presets${path.sep}`),
      ),
    };
  }
  return coreCache;
}

/** Theme name of a preset or fixture stylesheet, from its `[theme=…]` rule. */
export function themeName(s: Stylesheet): string {
  const m = /\[theme=["']?([\w-]+)["']?\]/.exec(s.css);
  if (!m) throw new Error(`${s.label} defines no [theme] rule`);
  return m[1];
}

let materialCache: Stylesheet[] | undefined;
/** The Material adapter's build entries (material-core, material-overrides). */
export function materialSheets(): Stylesheet[] {
  return (materialCache ??= buildEntries(materialDir).map(sheet));
}

export function coreFixtureSheets(): Stylesheet[] {
  return fixtureEntries(path.join(coreDir, 'test', 'fixtures')).map(sheet);
}

export function materialFixtureSheets(): Stylesheet[] {
  return fixtureEntries(path.join(materialDir, 'test', 'fixtures')).map(sheet);
}

export function formatWarning(w: {
  type: string | null;
  file: string | null;
  line: number | null;
  message: string;
}): string {
  return `${w.type ?? 'warning'} ${w.file ? path.relative(repoRoot, w.file) : '?'}:${w.line ?? '?'} ${w.message}`;
}

/**
 * The declarations in force on a theme's root element, in cascade order: the
 * registered initial values, every root-level variable rule of core and of the
 * theme stylesheet (`:where(:root)`, `:where(:root, [theme])`, … and
 * `:where([theme])`, where a custom palette name is derived), then the theme's
 * own `[theme="name"]` rule. This is what the evaluator reads a token from now
 * that core derives once and a theme rule holds only what was passed.
 */
export function themeDeclarations(core: Stylesheet, theme: Stylesheet, name: string) {
  const map = new Map<string, string>();
  for (const css of [core.css, theme.css])
    for (const [n, v] of registeredInitialValues(css)) map.set(n, v);
  for (const css of [core.css, theme.css])
    for (const rule of rules(css)) {
      if (rule.context.length) continue;
      if (!rule.selector.includes(':root') && rule.selector !== ':where([theme])') continue;
      for (const [n, v] of rule.declarations) map.set(n, v);
    }
  for (const [n, v] of declarationsFor(theme.css, themeSelector(name))) map.set(n, v);
  return map;
}

/** Palette names a theme rule itself declares (its colour-role pairs). */
export function themePalettes(theme: Stylesheet, name: string): string[] {
  return [...declarationsFor(theme.css, themeSelector(name)).keys()]
    .map((k) => /^--color--([\w-]+)--mode-light$/.exec(k)?.[1] ?? '')
    .filter((n) => n && !n.includes('--'));
}
