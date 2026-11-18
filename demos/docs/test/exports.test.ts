// Every package path the docs and READMEs show resolves the way the Angular CLI
// resolves it (issue #7, PORT-PLAN.md Phase 19).
//
// `@angular/build` hands a bare `@use` to esbuild's resolver with the `style`
// and `sass` conditions and takes the `exports` target exactly as mapped: it
// tries no partial underscore and no extension. Sass alone is more forgiving,
// so a map such as `"./scss/*": "./scss/*"` compiled in every other check of
// this repository and failed in an app. This file asks esbuild itself, the
// copy `@angular/build` depends on, with the options of its stylesheet bundle.
//
// Each package is laid out in a temporary folder as it is installed in an app:
// its `scss` folder and top-level Sass, a `dist` with a placeholder for every
// compiled file that has a Sass source (so the check needs no build), and a
// `package.json` holding the map under test. Both maps are tried: `exports`,
// which the workspace uses, and `publishConfig.exports`, which replaces it in
// the published package.
import assert from 'node:assert/strict';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';
import {
  isFile,
  repoRoot,
  resolveExport,
  sourceOfDist,
  workspacePackages,
} from '../../../packages/theme-core/test/lib/sass.ts';

// ── esbuild, as @angular/build sets it up ────────────────────────────────────

interface ResolveResult {
  path: string;
  errors: { text: string }[];
}
interface PluginBuild {
  onStart(callback: () => Promise<void>): void;
  resolve(specifier: string, options: { kind: string; resolveDir: string }): Promise<ResolveResult>;
}
interface Esbuild {
  build(options: Record<string, unknown>): Promise<unknown>;
}

const angularBuild = realpathSync(path.join(repoRoot, 'node_modules/@angular/build'));
const esbuild: Esbuild = createRequire(path.join(angularBuild, 'package.json'))('esbuild');

/** `conditions`, `mainFields` and `resolveExtensions` of Angular's stylesheet bundle. */
const ANGULAR = {
  conditions: ['style', 'sass', 'less', 'production'],
  mainFields: ['style', 'sass'],
  resolveExtensions: [] as string[],
};

/** Resolves each specifier from `resolveDir`: the file found, or the resolver's error. */
async function resolveAll(specifiers: string[], resolveDir: string): Promise<Map<string, string>> {
  const found = new Map<string, string>();
  await esbuild.build({
    stdin: { contents: '', loader: 'css' },
    absWorkingDir: resolveDir,
    bundle: true,
    write: false,
    logLevel: 'silent',
    platform: 'browser',
    ...ANGULAR,
    plugins: [
      {
        name: 'resolve-as-angular',
        setup(build: PluginBuild) {
          build.onStart(async () => {
            for (const specifier of specifiers) {
              // The call of `sass-language.js`.
              const result = await build.resolve(specifier, { kind: 'import-rule', resolveDir });
              found.set(
                specifier,
                result.path && isFile(result.path)
                  ? result.path
                  : `not resolved: ${result.errors[0]?.text ?? 'no file'}`,
              );
            }
          });
        },
      },
    ],
  });
  return found;
}

// ── The packages, installed ──────────────────────────────────────────────────

type ExportsMap = Record<string, string | Record<string, string>>;
interface Manifest {
  name: string;
  exports?: ExportsMap;
  publishConfig?: { exports?: ExportsMap };
}

const manifestOf = (dir: string): Manifest =>
  JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8'));

/** Every file target of a map, conditions flattened. */
const targetsOf = (map: ExportsMap): [key: string, target: string][] =>
  Object.entries(map).flatMap(([key, value]) =>
    typeof value === 'string'
      ? [[key, value] as [string, string]]
      : Object.values(value).map((target) => [key, target] as [string, string]),
  );

const tmp = mkdtempSync(path.join(os.tmpdir(), 'cp-theming-exports-'));
after(() => rmSync(tmp, { recursive: true, force: true }));

/**
 * An app folder whose `node_modules` holds every workspace package with the
 * given map as its `exports`. Returns the folder.
 */
function install(which: 'exports' | 'publishConfig.exports'): string {
  const app = path.join(tmp, which);
  for (const [name, dir] of Object.entries(workspacePackages)) {
    const manifest = manifestOf(dir);
    const map =
      which === 'exports'
        ? manifest.exports
        : (manifest.publishConfig?.exports ?? manifest.exports);
    const to = path.join(app, 'node_modules', name);
    mkdirSync(to, { recursive: true });
    writeFileSync(path.join(to, 'package.json'), JSON.stringify({ name, exports: map }));
    cpSync(path.join(dir, 'scss'), path.join(to, 'scss'), { recursive: true });
    for (const file of readdirSync(dir))
      if (file.endsWith('.scss')) cpSync(path.join(dir, file), path.join(to, file));
    for (const [, target] of targetsOf(map ?? {}))
      if (target.endsWith('.css') && sourceOfDist(path.join(dir, target))) {
        mkdirSync(path.dirname(path.join(to, target)), { recursive: true });
        writeFileSync(path.join(to, target), '');
      }
  }
  return app;
}

/** A resolved file as a path inside its package: `scss/_theme.scss`. */
const inPackage = (app: string, file: string): string => {
  const parts = path.relative(path.join(app, 'node_modules'), file).split(path.sep);
  return parts.slice(parts[0].startsWith('@') ? 2 : 1).join('/');
};

// ── What the docs and READMEs show ───────────────────────────────────────────

const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  '.git',
  '.angular',
  '.generated',
  '.scratch',
  '.wireit',
  'test',
]);
// The plans record what was true when a phase was written, old paths included.
const SKIP_FILES = new Set(['PLAN.md', 'PORT-PLAN.md', 'PORT-SESSIONS.md']);
const SHOWN = /\.(?:scss|css|md|html|txt|ts)$/;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(path.join(dir, entry.name), out);
    } else if (SHOWN.test(entry.name) && !SKIP_FILES.has(entry.name)) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

/** `@use`, `@forward` and `@import` of a package of this repository, by file. */
function shown(): Map<string, string[]> {
  const bySpecifier = new Map<string, string[]>();
  for (const file of walk(repoRoot)) {
    // A page template writes `@` as `&#64;`.
    const text = readFileSync(file, 'utf8').replaceAll('&#64;', '@');
    for (const match of text.matchAll(
      /@(?:use|forward|import)\s+(["'])(@(?:cpangular|acme)\/[^"']+)\1/g,
    )) {
      const files = bySpecifier.get(match[2]) ?? [];
      files.push(path.relative(repoRoot, file));
      bySpecifier.set(match[2], files);
    }
  }
  return bySpecifier;
}

const specifiers = shown();

test('the options are still the ones of the Angular CLI stylesheet bundle', () => {
  const options = readFileSync(
    path.join(angularBuild, 'src/tools/esbuild/stylesheets/bundle-options.js'),
    'utf8',
  );
  assert.ok(
    options.includes("conditions: ['style', 'sass', 'less', options.optimization"),
    'conditions',
  );
  assert.ok(options.includes("mainFields: ['style', 'sass']"), 'mainFields');
  assert.ok(options.includes('resolveExtensions: []'), 'resolveExtensions');
});

test('the docs and READMEs show the documented Sass entry points', () => {
  for (const expected of [
    '@cpangular/cp-theming-core/scss/theme',
    '@cpangular/cp-theming-core/scss/presets/themes',
    '@cpangular/cp-theming-core/scss/presets/palettes',
    '@cpangular/cp-theming-ng-material/scss/material',
    '@acme/theme',
    '@acme/theme-material',
  ])
    assert.ok(specifiers.has(expected), `${expected} is shown somewhere`);
});

for (const which of ['exports', 'publishConfig.exports'] as const) {
  test(`every package path the docs and READMEs show resolves in the Angular CLI (${which})`, async () => {
    const app = install(which);
    const found = await resolveAll([...specifiers.keys()], app);
    const bad: string[] = [];
    for (const [specifier, files] of specifiers) {
      const file = found.get(specifier)!;
      if (!path.isAbsolute(file)) {
        const where = [...new Set(files)];
        const more = where.length > 3 ? ` and ${where.length - 3} more` : '';
        bad.push(`${specifier} (${where.slice(0, 3).join(', ')}${more}): ${file}`);
        continue;
      }
      // esbuild and the harness resolver agree, so every other check of this
      // repository compiles the file an app gets.
      const harness = resolveExport(specifier);
      const name = Object.keys(workspacePackages)
        .sort((a, b) => b.length - a.length)
        .find((n) => specifier === n || specifier.startsWith(`${n}/`))!;
      assert.equal(
        inPackage(app, file),
        typeof harness === 'string'
          ? path.relative(workspacePackages[name], harness).split(path.sep).join('/')
          : harness,
        specifier,
      );
    }
    assert.deepEqual(bad, []);
  });

  test(`a full file name resolves, a name that needs completing does not (${which})`, async () => {
    const app = install(which);
    const full = [
      '@cpangular/cp-theming-core/scss/_theme.scss',
      '@cpangular/cp-theming-core/scss/presets/_themes.scss',
      '@cpangular/cp-theming-ng-material/scss/_material.scss',
      '@acme/theme/scss/_index.scss',
    ];
    const incomplete = [
      // No entry of its own: Sass would complete it, the Angular CLI does not.
      '@cpangular/cp-theming-core/scss/palette',
      '@cpangular/cp-theming-core/scss/_theme',
      '@cpangular/cp-theming-ng-material/scss/roles',
      '@acme/theme/scss/index',
    ];
    const found = await resolveAll([...full, ...incomplete], app);
    for (const specifier of full)
      assert.equal(
        inPackage(app, found.get(specifier)!),
        specifier.split('/').slice(2).join('/'),
        specifier,
      );
    for (const specifier of incomplete)
      assert.match(found.get(specifier)!, /^not resolved/, specifier);
  });
}

// ── The maps themselves, every package ───────────────────────────────────────

const manifests = ['packages', 'demos']
  .flatMap((group) =>
    readdirSync(path.join(repoRoot, group)).map((name) => path.join(repoRoot, group, name)),
  )
  .filter((dir) => existsSync(path.join(dir, 'package.json')))
  .map((dir) => ({ dir, manifest: manifestOf(dir) }));

test('every Sass target of every exports map is a file, exactly as written', () => {
  const bad: string[] = [];
  let checked = 0;
  for (const { dir, manifest } of manifests)
    for (const [label, map] of [
      ['exports', manifest.exports],
      ['publishConfig.exports', manifest.publishConfig?.exports],
    ] as const)
      for (const [key, target] of targetsOf(map ?? {})) {
        const where = `${manifest.name} ${label} "${key}"`;
        if (key.includes('*')) {
          // A pattern hands the file name through, extension included: one
          // that maps `scss/theme` to `./scss/theme` names no file.
          if (!/\*\.\w+$/.test(key) || !/\*\.\w+$/.test(target))
            bad.push(`${where}: a pattern has to end in an extension`);
        } else if (target.endsWith('.scss')) {
          checked++;
          if (!isFile(path.join(dir, target))) bad.push(`${where}: ${target} is not a file`);
        } else if (target.includes('/scss/')) {
          bad.push(`${where}: ${target} has no extension`);
        }
      }
  assert.deepEqual(bad, []);
  assert.ok(checked >= 9, `${checked} Sass targets checked`);
});

test('the published map of a package differs from its workspace map only at "."', () => {
  for (const { manifest } of manifests) {
    const published = manifest.publishConfig?.exports;
    if (!published) continue;
    const rest = (map: ExportsMap) => Object.entries(map).filter(([key]) => key !== '.');
    assert.deepEqual(rest(published), rest(manifest.exports ?? {}), manifest.name);
  }
});
