// Compiles the library's Sass through the Sass JS API, the way the harness
// checks it: expanded output, dependencies quiet, every warning kept.
import * as sass from 'sass';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const repoRoot = path.resolve(import.meta.dirname, '..', '..', '..', '..');
export const coreDir = path.join(repoRoot, 'packages/theme-core');
export const materialDir = path.join(repoRoot, 'packages/theme-ng-material');
export const docsDir = path.join(repoRoot, 'demos/docs');
/** The two example theme packages (PORT-PLAN.md, Phase 18). */
export const acmeThemeDir = path.join(repoRoot, 'demos/demo-brand-core');
export const acmeMaterialDir = path.join(repoRoot, 'demos/demo-brand-material');

export interface SassWarning {
  deprecation: boolean;
  type: string | null;
  file: string | null;
  line: number | null;
  message: string;
  /** True when the warning points at a file of this repository (not node_modules). */
  own: boolean;
}

export interface Compiled {
  /** Path of the entry, or a label for string sources. */
  entry: string;
  css: string;
  warnings: SassWarning[];
}

function collect(warnings: SassWarning[]): sass.Logger {
  return {
    warn(message, options) {
      const url = options.span?.url;
      const file = url ? fileURLToPath(url) : null;
      warnings.push({
        deprecation: options.deprecation,
        type: options.deprecation ? options.deprecationType.id : null,
        file,
        line: options.span ? options.span.start.line + 1 : null,
        message: message.split('\n')[0],
        own:
          file !== null &&
          file.startsWith(repoRoot) &&
          !file.includes(`${path.sep}node_modules${path.sep}`),
      });
    },
  };
}

const baseLoadPaths = [path.join(repoRoot, 'node_modules')];

/** Compiles a Sass file. `loadPaths` are added to node_modules. */
export function compileFile(
  file: string,
  loadPaths: string[] = [],
  importers: sass.Options<'sync'>['importers'] = [],
): Compiled {
  const warnings: SassWarning[] = [];
  const result = sass.compile(file, {
    style: 'expanded',
    quietDeps: true,
    loadPaths: [...loadPaths, ...baseLoadPaths],
    importers,
    logger: collect(warnings),
  });
  return { entry: file, css: result.css, warnings };
}

/** The workspace packages a consumer imports by name. */
export const workspacePackages: Record<string, string> = {
  '@cpangular/cp-theming-core': coreDir,
  '@cpangular/cp-theming-ng-material': materialDir,
  '@acme/theme': acmeThemeDir,
  '@acme/theme-material': acmeMaterialDir,
};

/** A specifier of a workspace package, as an example or a consumer writes it. */
export const PACKAGE_SPECIFIER =
  /@(?:cpangular\/cp-theming-[\w-]+|acme\/theme(?:-material)?)(?:\/[\w.*-]+)*/g;

/**
 * Resolves `<package>/<subpath>` the way a bundler does: through the package's
 * `exports` only. Returns the absolute target, `null` when the subpath is not
 * exported, `undefined` when the specifier names no workspace package. A
 * `./scss/*` pattern returns the path without extension (Sass adds the partial
 * underscore and the extension). A target written as conditions is read by its
 * `sass` condition, the one Sass tools ask for.
 */
export function resolveExport(specifier: string): string | null | undefined {
  // The longest name first: `@acme/theme-material` is not `@acme/theme`.
  const name = Object.keys(workspacePackages)
    .sort((a, b) => b.length - a.length)
    .find((n) => specifier === n || specifier.startsWith(`${n}/`));
  if (!name) return undefined;
  const dir = workspacePackages[name];
  const exportsMap: Record<string, string | { sass?: string }> =
    JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8')).exports ?? {};
  const targetOf = (value: string | { sass?: string } | undefined) =>
    typeof value === 'string' ? value : value?.sass;
  const subpath = `.${specifier.slice(name.length)}`;
  const exact = targetOf(exportsMap[subpath]);
  if (exact) return path.join(dir, exact);
  for (const [key, value] of Object.entries(exportsMap)) {
    const star = key.indexOf('*');
    const target = targetOf(value);
    if (star < 0 || !target) continue;
    const [head, tail] = [key.slice(0, star), key.slice(star + 1)];
    if (subpath.startsWith(head) && subpath.endsWith(tail) && subpath.length > key.length - 1)
      return path.join(
        dir,
        target.replace('*', subpath.slice(head.length, subpath.length - tail.length)),
      );
  }
  return null;
}

/**
 * Sass importers for what a consumer writes: `@use '@cpangular/…'` (or one of
 * the example theme packages, `@acme/…`) resolves
 * through the package's `exports` and nothing else, so an example that names
 * an unexported path fails to compile. A built `dist/x.css` target is compiled
 * from its Sass source and loaded as CSS, so the check does not depend on a
 * prior build; a `./scss/*` target is a Sass file.
 */
export const exportsImporters: NonNullable<sass.Options<'sync'>['importers']> = [
  {
    canonicalize(url) {
      const target = resolveExport(url);
      return typeof target === 'string' && target.endsWith('.css')
        ? new URL(`cp-theming-css:${encodeURI(target)}`)
        : null;
    },
    load(canonicalUrl) {
      const target = decodeURI(canonicalUrl.pathname);
      const source = sourceOfDist(target);
      // A package's entry may itself name another package (the example theme
      // packages do), so it is compiled through the same importers.
      const contents = source
        ? compileFile(source, [], exportsImporters).css
        : readFileSync(target, 'utf8');
      return { contents, syntax: 'css' };
    },
  },
  {
    findFileUrl(url) {
      const target = resolveExport(url);
      if (target === undefined) return null;
      if (target === null) throw new Error(`"${url}" is not in the package's "exports"`);
      return pathToFileURL(target);
    },
  },
];

/** Compiles Sass source as if it lived at `virtualPath`, so relative @use works. */
export function compileSource(
  source: string,
  virtualPath: string,
  loadPaths: string[] = [],
): Compiled {
  const warnings: SassWarning[] = [];
  const result = sass.compileString(source, {
    style: 'expanded',
    quietDeps: true,
    url: pathToFileURL(virtualPath),
    loadPaths: [...loadPaths, ...baseLoadPaths],
    logger: collect(warnings),
  });
  return { entry: virtualPath, css: result.css, warnings };
}

/**
 * The Sass entries a package's build command names, read from its package.json
 * (`sass ... scss/x.scss:dist/x.css ...`). Returned as absolute .scss paths.
 */
export function buildEntries(pkgDir: string): string[] {
  const pkg = JSON.parse(readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));
  const commands: string[] = Object.values<{ command?: string }>(pkg.wireit ?? {})
    .map((w) => w.command ?? '')
    .filter((c) => c.startsWith('sass ') && !c.includes('--watch'));
  const entries = new Set<string>();
  for (const command of commands) {
    for (const arg of command.split(/\s+/)) {
      const match = /^(\S+\.scss):\S+\.css$/.exec(arg);
      if (match) entries.add(path.join(pkgDir, match[1]));
    }
  }
  return [...entries];
}

/** `dist/x.css` → the `scss/x.scss` it is built from, when that file exists. */
export function sourceOfDist(cssPath: string): string | null {
  const scss = cssPath
    .replace(/[\\/]dist[\\/]/, `${path.sep}scss${path.sep}`)
    .replace(/\.css$/, '.scss');
  return scss !== cssPath && existsSync(scss) ? scss : null;
}

/** Every `.scss` fixture theme in a directory (partials excluded), sorted. */
export function fixtureEntries(dir: string): string[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.scss') && !f.startsWith('_'))
    .sort()
    .map((f) => path.join(dir, f));
}

/**
 * The docs app's full style list from angular.json, as compiled CSS text in
 * order. Built `dist/*.css` entries are compiled from their Sass source so the
 * check does not depend on a prior build; plain CSS files are read as they are.
 */
export function docsStyleList(): { entry: string; compiled: Compiled }[] {
  const angular = JSON.parse(readFileSync(path.join(repoRoot, 'angular.json'), 'utf8'));
  const build = angular.projects.docs.architect.build.options;
  const includePaths: string[] = (build.stylePreprocessorOptions?.includePaths ?? []).map(
    (p: string) => path.join(repoRoot, p),
  );
  const styles: string[] = build.styles;
  return styles.map((entry) => {
    const abs = path.join(repoRoot, entry);
    if (entry.endsWith('.scss')) return { entry, compiled: compileFile(abs, includePaths) };
    const source = sourceOfDist(abs);
    if (source) return { entry, compiled: compileFile(source) };
    const file = existsSync(abs) ? abs : path.join(repoRoot, 'node_modules', entry);
    return { entry, compiled: { entry, css: readFileSync(file, 'utf8'), warnings: [] } };
  });
}

/** Reads `$theme-step-1..3` from scss/_variables.scss by compiling them out. */
export function themeSteps(): [number, number, number] {
  const { css } = compileSource(
    `@use "variables" as v;\n:root { --s1: #{v.$theme-step-1}; --s2: #{v.$theme-step-2}; --s3: #{v.$theme-step-3}; }`,
    path.join(coreDir, 'scss', '__steps.scss'),
    [path.join(coreDir, 'scss')],
  );
  const read = (n: number) =>
    Number(/--s\d: ([\d.]+)/.exec(css.split('\n').find((l) => l.includes(`--s${n}:`)) ?? '')?.[1]);
  return [read(1), read(2), read(3)];
}
