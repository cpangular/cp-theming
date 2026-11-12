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
// Sass is compiled the way a consumer's is: `@cpangular/…` resolves through
// the packages' `exports`. Every theme starts with define-core-theme(), so its
// CSS starts with core's; that part is written once, as core.css, and each
// frame links it ahead of the rest of its theme.
import * as sass from 'sass';
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { coreDir, exportsImporters, repoRoot } from '../../../packages/theme-core/test/lib/sass.ts';
import { CHAPTERS, frameFiles, frameNames } from '../src/app/learn/chapters.ts';
import { checkLearn, docsDir, exampleFiles, exampleFolder } from './lib/order.ts';

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

let frames = 0;
for (const chapter of CHAPTERS.filter((c) => c.written)) {
  const dir = exampleFolder(chapter);
  const files = exampleFiles(chapter);
  const target = path.join(out, chapter.folder);
  mkdirSync(target, { recursive: true });

  const themes = new Map<string, string[]>();
  /** The links for a theme file: core.css and the rest, or the whole of it. */
  const themeLinks = (file: string): string[] => {
    const known = themes.get(file);
    if (known) return known;
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
    const body = readFileSync(path.join(dir, use.html), 'utf8').trimEnd();
    writeFileSync(
      path.join(target, `${frame}.html`),
      [
        '<!doctype html>',
        '<html lang="en">',
        '  <head>',
        '    <meta charset="utf-8" />',
        `    <title>${chapter.title}: ${frame}</title>`,
        ...links,
        '  </head>',
        '  <body>',
        body,
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
