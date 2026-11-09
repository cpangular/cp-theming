// The stylesheet sets the checks run on: the build entries of both packages,
// the fixture themes, and the docs app's style list. Compiled once per import.
import path from 'node:path';
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
