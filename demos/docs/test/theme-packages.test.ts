// The two example theme packages (PORT-PLAN.md, Phase 18): @acme/theme in
// demos/demo-brand-core and @acme/theme-material in demos/demo-brand-material.
// Each is shaped like a package a company would publish, and this file holds
// it to that shape:
//
//   - it builds, with zero Sass warnings, and what it builds leaves no var()
//     read undeclared beside core
//   - its compiled CSS (the path for an app without Sass) is what its
//     define() mixin emits for an app with Sass, declaration for declaration
//   - `pnpm pack --dry-run` lists exactly the files its README names
//   - its manifest: the three exports, cp-theming as a caret peer dependency
//     and never a dependency
//
// and the consumers in the repository to the two paths: demo-core loads the
// compiled CSS, the docs app includes the mixin, and Learn chapter 11 and the
// Theme packages guide show the package's own files.
//
// The check builds each package first (its own `build` script), so it does not
// depend on a prior build.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import * as sass from 'sass';
import {
  acmeMaterialDir,
  acmeThemeDir,
  compileFile,
  docsDir,
  docsStyleList,
  exportsImporters,
  repoRoot,
  resolveExport,
} from '../../../packages/theme-core/test/lib/sass.ts';
import { rules, stripComments, undefinedReads } from '../../../packages/theme-core/test/lib/css.ts';
import { coreSheets, formatWarning } from '../../../packages/theme-core/test/lib/sets.ts';

interface ThemePackage {
  name: string;
  dir: string;
  /** The build entry and the file it compiles to. */
  entry: string;
  css: string;
  /** Peer dependencies it has to state. */
  peers: string[];
}

const PACKAGES: ThemePackage[] = [
  {
    name: '@acme/theme',
    dir: acmeThemeDir,
    entry: 'scss/acme.scss',
    css: 'dist/acme.css',
    peers: ['@cpangular/cp-theming-core'],
  },
  {
    name: '@acme/theme-material',
    dir: acmeMaterialDir,
    entry: 'scss/acme-material.scss',
    css: 'dist/acme-material.css',
    peers: ['@cpangular/cp-theming-core', '@cpangular/cp-theming-ng-material'],
  },
];

const { core } = coreSheets();
const read = (file: string) => readFileSync(file, 'utf8');
const pnpm = (dir: string, ...args: string[]) =>
  execFileSync('pnpm', args, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

/** Every rule of a stylesheet as text, comments and layout aside. */
const shape = (css: string) =>
  rules(stripComments(css)).map((r) => ({
    context: r.context,
    selector: r.selector.replace(/\s+/g, ' '),
    declarations: r.declarations,
  }));

/** What an app with Sass gets from the package: core aside, the mixin and nothing else. */
function consumerCss(name: string): string {
  return sass.compileString(`@use "${name}" as acme;\n@include acme.define();\n`, {
    style: 'expanded',
    quietDeps: true,
    loadPaths: [path.join(repoRoot, 'node_modules')],
    importers: exportsImporters,
  }).css;
}

/** The file list under "What is in the package" in a README. */
function readmeFiles(readme: string): string[] {
  const section = readme.split(/^## What is in the package$/m)[1] ?? '';
  const block = /```text\n([\s\S]*?)```/.exec(section)?.[1] ?? '';
  return block
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

for (const pkg of PACKAGES) {
  const manifest = JSON.parse(read(path.join(pkg.dir, 'package.json')));
  const where = path.relative(repoRoot, pkg.dir);

  test(`${pkg.name} (${where}) builds, with zero Sass warnings`, () => {
    assert.equal(manifest.name, pkg.name);
    assert.equal(manifest.scripts['github.actions.build'], 'pnpm run build', 'built in CI');
    assert.ok(manifest.scripts.build.includes(`${pkg.entry}:${pkg.css}`), 'the build entry');
    pnpm(pkg.dir, 'run', 'build');
    assert.ok(existsSync(path.join(pkg.dir, pkg.css)), `${pkg.css} is written`);
    const { warnings } = compileFile(path.join(pkg.dir, pkg.entry), [], exportsImporters);
    assert.deepEqual(warnings.map(formatWarning), []);
  });

  test(`${pkg.name}: the compiled CSS is what define() emits`, () => {
    const built = read(path.join(pkg.dir, pkg.css));
    assert.ok(shape(built).length > 0, 'has rules');
    assert.deepEqual(shape(built), shape(consumerCss(pkg.name)));
    // The file an app without Sass loads says what to load before it.
    assert.match(built, /^\/\*[\s\S]*?Load order: cp-theming's core first/, 'the header');
    assert.match(built, /\[theme=["']?acme["']?\]/, 'the theme rule');
  });

  test(`${pkg.name}: core and the compiled CSS leave no var() read undeclared`, () => {
    assert.deepEqual(undefinedReads([core.css, read(path.join(pkg.dir, pkg.css))]), []);
  });

  test(`${pkg.name}: the package holds no core`, () => {
    // Core is the app's to include: neither path brings a second copy.
    const built = read(path.join(pkg.dir, pkg.css));
    assert.doesNotMatch(built, /@property/, 'no registrations');
    assert.doesNotMatch(built, /color-scheme\s*:/, 'no mode rules');
    for (const file of ['_index.scss', 'scss/_index.scss', pkg.entry])
      assert.doesNotMatch(read(path.join(pkg.dir, file)), /^\s*@include [\w.]*define-core-theme/m);
  });

  test(`${pkg.name}: pnpm pack --dry-run lists exactly the files the README names`, () => {
    assert.match(manifest.scripts['pack:check'], /pnpm pack --dry-run/);
    const named = readmeFiles(read(path.join(pkg.dir, 'README.md')));
    assert.ok(named.length > 0, 'the README has the list');
    const packed: { files: { path: string }[] } = JSON.parse(
      pnpm(pkg.dir, 'pack', '--dry-run', '--json'),
    );
    assert.deepEqual(packed.files.map((f) => f.path).sort(), [...named].sort());
  });

  test(`${pkg.name}: the manifest exports both paths and keeps cp-theming a peer`, () => {
    assert.equal(manifest.private, true, 'an example: never published');
    assert.equal(manifest.version, '0.0.0-MAIN');
    // The Sass path, by the package's name and by folder, and the CSS path.
    assert.equal(resolveExport(pkg.name), path.join(pkg.dir, '_index.scss'));
    assert.match(read(path.join(pkg.dir, '_index.scss')), /^@forward "scss\/index";$/m);
    assert.equal(resolveExport(`${pkg.name}/scss/index`), path.join(pkg.dir, 'scss/index'));
    assert.equal(resolveExport(`${pkg.name}/css`), path.join(pkg.dir, pkg.css));
    assert.deepEqual(manifest.files, ['_index.scss', 'scss', 'dist']);
    assert.deepEqual(Object.keys(manifest.peerDependencies).sort(), pkg.peers);
    for (const peer of pkg.peers) {
      // A caret range: `workspace:^` here, the version with a caret once packed.
      assert.equal(manifest.peerDependencies[peer], 'workspace:^', peer);
      assert.equal(manifest.dependencies?.[peer], undefined, `${peer} is not a dependency`);
    }
  });
}

test('@acme/theme-material includes the theme, the adapter, its patches and its own', () => {
  const built = read(path.join(acmeMaterialDir, 'dist/acme-material.css'));
  const theme = read(path.join(acmeThemeDir, 'dist/acme.css'));
  const themeRule = (css: string) =>
    shape(css).filter((r) => /\[theme=["']?acme["']?\]/.test(r.selector));
  assert.equal(themeRule(theme).length, 1);
  assert.deepEqual(themeRule(built), themeRule(theme), 'the same theme rule');
  assert.match(built, /--mat-sys-primary:/, 'the adapter');
  assert.match(built, /--mat-slide-toggle-selected-icon-color:/, "the adapter's patches");
  // Acme's own: every token it sets is one the installed Angular Material reads.
  const own = [
    ...read(path.join(acmeMaterialDir, 'scss/_index.scss')).matchAll(/^\s*(--mat-[\w-]+):/gm),
  ].map((m) => m[1]);
  assert.ok(own.length > 0, 'Acme sets component tokens');
  const material = path.join(repoRoot, 'node_modules/@angular/material/fesm2022');
  const button = read(path.join(material, 'button.mjs'));
  for (const token of own) {
    assert.ok(built.includes(`${token}:`), `${token} is in the compiled CSS`);
    assert.ok(button.includes(`var(${token}`), `Angular Material reads ${token}`);
  }
});

// ── The consumers in the repository ──────────────────────────────────────────

test('demo-core takes the theme by the CSS path, after core', () => {
  const dir = path.join(repoRoot, 'demos/demo-core');
  const main = read(path.join(dir, 'src/main.ts'));
  const imports = [...main.matchAll(/^import '([^']+)';/gm)].map((m) => m[1]);
  assert.ok(imports.includes('@acme/theme/css'), 'imports the compiled CSS');
  assert.ok(
    imports.indexOf('./scss/base.scss') < imports.indexOf('@acme/theme/css'),
    'core (base.scss) loads first',
  );
  assert.doesNotMatch(main, /@acme\/theme\/scss|@acme\/theme'/, 'not the Sass path');
  const manifest = JSON.parse(read(path.join(dir, 'package.json')));
  assert.ok(manifest.dependencies['@acme/theme'], 'depends on the package');
});

test('the docs app takes the theme by the Sass path, and its switcher offers it', () => {
  const styles = read(path.join(docsDir, 'src/styles.scss'));
  assert.match(styles, /^@use "@acme\/theme" as acme;$/m);
  assert.match(styles, /^@include acme\.define\(\$default: false\);$/m);
  // Compiled the way the docs build compiles it, the rule is the package's.
  const app = docsStyleList().find((s) => s.entry.endsWith('docs/src/styles.scss'));
  assert.ok(app, 'angular.json lists the docs stylesheet');
  const themeRule = (css: string) =>
    rules(css)
      .filter((r) => /\[theme=["']?acme["']?\]/.test(r.selector))
      .map((r) => r.declarations);
  const packaged = themeRule(read(path.join(acmeThemeDir, 'dist/acme.css')));
  assert.equal(packaged.length, 1);
  assert.deepEqual(themeRule(app.compiled.css), packaged);
  // Not a default here: the docs' default theme is a preset.
  assert.ok(
    rules(app.compiled.css)
      .filter((r) => /\[theme=["']?acme["']?\]/.test(r.selector))
      .every((r) => !r.selector.includes(':root')),
    'acme is not on :root in the docs',
  );
  const switcher = read(path.join(docsDir, 'src/app/shell/theme-switcher.component.ts'));
  assert.match(switcher, /value: 'acme'/);
});

test('Learn chapter 11 and the Theme packages guide show the package as it is', () => {
  const chapter = read(path.join(docsDir, 'src/app/learn/chapters/11-package.component.ts'));
  const guide = read(path.join(docsDir, 'src/app/packages/pages/guides.component.ts'));
  const from = (source: string, dir: string, file: string) => {
    const m = new RegExp(`from '([^']*${file.replace(/[.]/g, '\\.')})' with`).exec(source);
    return m ? path.resolve(dir, m[1]) : null;
  };
  const chapterDir = path.join(docsDir, 'src/app/learn/chapters');
  const guideDir = path.join(docsDir, 'src/app/packages/pages');
  assert.equal(
    from(chapter, chapterDir, 'demo-brand-core/scss/_index.scss'),
    path.join(acmeThemeDir, 'scss/_index.scss'),
  );
  assert.equal(
    from(chapter, chapterDir, 'demo-brand-core/package.json'),
    path.join(acmeThemeDir, 'package.json'),
  );
  assert.equal(
    from(guide, guideDir, 'demo-brand-core/scss/_index.scss'),
    path.join(acmeThemeDir, 'scss/_index.scss'),
  );
  // The guide's folder layout is the README's file list.
  const layout = /<pre\s+class="package-layout"\s*><code[^>]*>([\s\S]*?)<\/code><\/pre>/.exec(
    guide,
  );
  assert.ok(layout, 'the guide has the folder layout');
  const listed = layout[1]
    .split('\n')
    .map((line) => line.trim().split(/\s+/)[0])
    .filter(Boolean);
  assert.deepEqual(listed, readmeFiles(read(path.join(acmeThemeDir, 'README.md'))));
});

test('both consumption paths of Learn chapter 11 load the same theme', () => {
  // The two frames of the chapter's example: the app with Sass and the app
  // without. Core aside, their stylesheets hold the same rules.
  const dir = path.join(docsDir, 'src/examples/learn/11-package');
  const withSass = compileFile(path.join(dir, 'theme.scss'), [], exportsImporters).css;
  const imports = [
    ...stripComments(read(path.join(dir, 'css.theme.css'))).matchAll(/@import\s+"([^"]+)";/g),
  ].map((m) => m[1]);
  assert.deepEqual(imports, ['@cpangular/cp-theming-core/css/core', '@acme/theme/css']);
  const withoutSass = [core.css, read(path.join(acmeThemeDir, 'dist/acme.css'))].join('\n');
  assert.deepEqual(shape(withSass), shape(withoutSass));
});
