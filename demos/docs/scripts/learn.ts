// Builds the Learn track's live examples (PORT-PLAN.md, Phase 17), before
// `ng build` / `ng serve`:
//
//   1. the order check (lib/order.ts). A violation stops the build.
//   2. one HTML document per frame of every written chapter, in
//      demos/docs/.generated/learn-frames/, which angular.json copies into the
//      site as learn-frames/. A chapter page shows it in an <iframe>, beside
//      the text of the same files.
//
// A frame is nothing but its files: the chapter's theme (a complete stylesheet,
// which includes core), the example's own styles and its markup in <body>. The
// docs add frame.css under them (font, page margin, the page colours) and
// nothing else; the page sets light or dark on the frame's <html> to match
// the site.
//
// From chapter 9 an example may run a script: example.ts.txt, a module at the
// end of <body>, and head.html, which goes into <head> ahead of the stylesheets.
// The script is TypeScript with its types taken off, nothing more. It imports
// @cpangular/cp-theming-core by name, as a reader's would; here an import map
// points that name at the package's built modules, copied beside the frames.
// The docs add frame-storage.js to such a frame (see scripts/frame-storage.ts).
//
// From chapter 11 a frame's theme may be plain CSS (X.theme.css), the
// stylesheet of an app without Sass: `@import`s of compiled CSS by package
// name. A bundler would follow them; here each becomes a <link> to the file
// the package's `exports` name, compiled from its source.
//
// Sass is compiled the way a consumer's is: `@cpangular/…` resolves through
// the packages' `exports`. Every theme starts with define-core-theme(), so its
// CSS starts with core's; that part is written once, as core.css, and each
// frame links it ahead of the rest of its theme.
import * as sass from 'sass';
import ts from 'typescript';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import {
  coreDir,
  exportsImporters,
  repoRoot,
  resolveExport,
  sourceOfDist,
} from '../../../packages/theme-core/test/lib/sass.ts';
import {
  CHAPTERS,
  CORE_MODULES,
  CORE_PACKAGE,
  frameFiles,
  frameNames,
} from '../src/app/learn/chapters.ts';
import { TEMPLATE_EXAMPLE, checkLearn, docsDir, exampleFiles, exampleFolder } from './lib/order.ts';

const violations = checkLearn();
if (violations.length) {
  console.error(`learn: the order check failed (${violations.length}):`);
  for (const v of violations) console.error(`  ${v}`);
  process.exit(1);
}

const out = path.join(docsDir, '.generated/learn-frames');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

let warnings = 0;
function compile(file: string): string {
  return sass.compile(file, {
    style: 'compressed',
    quietDeps: true,
    loadPaths: [path.join(repoRoot, 'node_modules')],
    importers: exportsImporters,
    logger: {
      warn(message) {
        warnings++;
        console.error(`learn: ${path.relative(repoRoot, file)}: ${message.split('\n')[0]}`);
      },
    },
  }).css;
}

const core = compile(path.join(coreDir, 'scss/core.scss'));
writeFileSync(path.join(out, 'core.css'), core);
copyFileSync(path.join(import.meta.dirname, 'frame.css'), path.join(out, 'frame.css'));

const sheet = (href: string) => `    <link rel="stylesheet" href="${href}" />`;

/** TypeScript as the JavaScript it is once its types are taken off. */
function strip(file: string): string {
  return ts.transpileModule(readFileSync(file, 'utf8'), {
    fileName: file,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      verbatimModuleSyntax: true,
    },
  }).outputText;
}

/** What a frame with a script gets from the docs, once: the package and the storage shim. */
let scriptsReady = false;
function shareScripts(): void {
  if (scriptsReady) return;
  scriptsReady = true;
  const built = path.join(coreDir, 'dist');
  if (!existsSync(path.join(built, 'index.js'))) {
    console.error(
      `learn: ${path.relative(repoRoot, built)}/index.js is missing. ` +
        `Run: pnpm --filter ${CORE_PACKAGE} build`,
    );
    process.exit(1);
  }
  mkdirSync(path.join(out, CORE_MODULES), { recursive: true });
  for (const name of readdirSync(built).filter((f) => f.endsWith('.js')))
    copyFileSync(path.join(built, name), path.join(out, CORE_MODULES, name));
  writeFileSync(
    path.join(out, 'frame-storage.js'),
    strip(path.join(import.meta.dirname, 'frame-storage.ts')),
  );
}

/** Compiled CSS of a package, by the path its `exports` give: where a frame finds it. */
const PACKAGE_CSS = 'packages';
const packageCss = new Map<string, string>([[path.join(coreDir, 'dist/core.css'), '../core.css']]);

/**
 * The links for a plain CSS theme: one per `@import`, in the file's order.
 * Anything else in it stops the build: such a file is the whole stylesheet of
 * an app without Sass, and the page shows it as that.
 */
function importLinks(file: string): string[] {
  const fail = (why: string): never => {
    console.error(`learn: ${path.relative(repoRoot, file)}: ${why}`);
    process.exit(1);
  };
  const links: string[] = [];
  const rest = readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/@import\s+(["'])([^"']+)\1\s*;/g, (_, _quote, specifier: string) => {
      const target = resolveExport(specifier);
      if (typeof target !== 'string' || !target.endsWith('.css'))
        return fail(`"${specifier}" is not compiled CSS a package exports`);
      let href = packageCss.get(target);
      if (!href) {
        const source = sourceOfDist(target);
        if (!source) return fail(`"${specifier}" has no Sass source to build it from`);
        mkdirSync(path.join(out, PACKAGE_CSS), { recursive: true });
        writeFileSync(path.join(out, PACKAGE_CSS, path.basename(target)), compile(source));
        href = `../${PACKAGE_CSS}/${path.basename(target)}`;
        packageCss.set(target, href);
      }
      links.push(sheet(href));
      return '';
    });
  if (rest.trim()) fail('a CSS theme holds @import of package CSS and nothing else');
  if (!links.length) fail('a CSS theme imports at least one stylesheet');
  return links;
}

const importMap = JSON.stringify({ imports: { [CORE_PACKAGE]: `../${CORE_MODULES}/index.js` } });

let frames = 0;
for (const chapter of CHAPTERS.filter((c) => c.written)) {
  const dir = exampleFolder(chapter);
  const files = exampleFiles(chapter);
  // An Angular template is rendered by the page, not in a frame.
  if (files.includes(TEMPLATE_EXAMPLE)) continue;
  const target = path.join(out, chapter.folder);
  mkdirSync(target, { recursive: true });

  const themes = new Map<string, string[]>();
  /** The links for a theme file: core.css and the rest, or the whole of it. */
  const themeLinks = (file: string): string[] => {
    const known = themes.get(file);
    if (known) return known;
    if (file.endsWith('.css')) {
      const imported = importLinks(path.join(dir, file));
      themes.set(file, imported);
      return imported;
    }
    const css = compile(path.join(dir, file));
    const name = file.replace(/\.scss$/, '.css');
    const split = css.startsWith(core);
    writeFileSync(path.join(target, name), split ? css.slice(core.length) : css);
    const links = split ? [sheet('../core.css'), sheet(name)] : [sheet(name)];
    themes.set(file, links);
    return links;
  };

  for (const frame of frameNames(files)) {
    const use = frameFiles(frame, files);
    const links = [sheet('../frame.css'), ...themeLinks(use.theme)];
    if (use.styles) {
      const name = use.styles.replace(/\.scss$/, '.css');
      writeFileSync(path.join(target, name), compile(path.join(dir, use.styles)));
      links.push(sheet(name));
    }
    const head: string[] = [];
    const scripts: string[] = [];
    if (use.script || use.head) {
      shareScripts();
      head.push('    <script src="../frame-storage.js"></script>');
    }
    if (use.head) head.push(readFileSync(path.join(dir, use.head), 'utf8').trimEnd());
    if (use.script) {
      const name = use.script.replace(/\.ts\.txt$/, '.js');
      writeFileSync(path.join(target, name), strip(path.join(dir, use.script)));
      links.push(`    <script type="importmap">${importMap}</script>`);
      scripts.push(`    <script type="module" src="${name}"></script>`);
    }
    const body = readFileSync(path.join(dir, use.html), 'utf8').trimEnd();
    writeFileSync(
      path.join(target, `${frame}.html`),
      [
        '<!doctype html>',
        '<html lang="en">',
        '  <head>',
        '    <meta charset="utf-8" />',
        `    <title>${chapter.title}: ${frame}</title>`,
        ...head,
        ...links,
        '  </head>',
        '  <body>',
        body,
        ...scripts,
        '  </body>',
        '</html>',
        '',
      ].join('\n'),
    );
    frames++;
  }
}

if (warnings) {
  console.error(`learn: ${warnings} Sass warning(s) in the examples`);
  process.exit(1);
}
console.log(
  `learn: order check passed; ${frames} frames written to ${path.relative(repoRoot, out)}`,
);
