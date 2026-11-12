// The Learn track's order check (PORT-PLAN.md, Phase 17).
//
// A chapter uses only what the chapters before it introduced. The tables are
// in src/app/learn/chapters.ts, next to the chapter list:
//
//   PATTERNS   text a chapter introduces. An example file or a sentence of an
//              earlier chapter that matches fails.
//   REFS       the Reference entries prose may name, each with the chapter
//              that introduces it and the Reference section it links to.
//
// Run by the docs build (scripts/learn.ts, which stops the build) and by the
// docs tests (test/learn.test.ts).
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { VARIABLES_PAGE, sectionNames, variablesData } from './variables.ts';
import {
  CHAPTERS,
  PATTERNS,
  REFS,
  frameFiles,
  frameNames,
  nestedTheme,
  type Chapter,
} from '../../src/app/learn/chapters.ts';

export const docsDir = path.resolve(import.meta.dirname, '../..');
export const learnExamplesDir = path.join(docsDir, 'src/examples/learn');
export const learnPagesDir = path.join(docsDir, 'src/app/learn/chapters');
const referencePagesDir = path.join(docsDir, 'src/app/packages/pages');

/** The chapter that first teaches nesting (see nestedTheme()). */
const NESTING_CHAPTER = 6;

/** The parts of a chapter page, in the order the page shows them. */
export const SLOTS = ['chapterExample', 'chapterIdea', 'chapterCode', 'chapterTry', 'chapterNow'];

const lineOf = (text: string, index: number) => text.slice(0, index).split('\n').length;

/** What in one example file of chapter `n` belongs to a later chapter. */
export function checkExample(n: number, file: string, text: string): string[] {
  const found: string[] = [];
  for (const { chapter, what, pattern } of PATTERNS) {
    if (chapter <= n) continue;
    const m = pattern.exec(text);
    if (m)
      found.push(
        `${file}:${lineOf(text, m.index)} uses ${what}, which chapter ${chapter} introduces`,
      );
  }
  if (n < NESTING_CHAPTER && file.endsWith('.html') && nestedTheme(text))
    found.push(`${file} nests a theme= element, which chapter ${NESTING_CHAPTER} introduces`);
  return found;
}

/** The `template` of a chapter page: its prose. */
export function templateOf(source: string): string {
  const m = /\btemplate:\s*`((?:[^`\\]|\\[\s\S])*)`/.exec(source);
  return m ? m[1] : '';
}

/** The tab and control labels a chapter page gives its examples: prose too. */
export function labelsOf(source: string): string {
  return [...source.matchAll(/\blabel:\s*(?:'([^']*)'|"([^"]*)")/g)]
    .map((m) => m[1] ?? m[2])
    .join('\n');
}

const decode = (html: string) =>
  html
    .replace(/&#64;/g, '@')
    .replace(/&#123;/g, '{')
    .replace(/&#125;/g, '}')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

/** A name with the shape of something the library defines. */
const LIBRARY_NAME = /^(?:--[a-z]|t\.[a-z-]+\(|\$[a-z])/;

/** What in the prose of chapter `n` breaks the order or is not linked. */
export function checkProse(n: number, file: string, template: string): string[] {
  const found: string[] = [];
  const text = decode(template);

  for (const { chapter, what, pattern } of PATTERNS) {
    if (chapter <= n) continue;
    const m = pattern.exec(text);
    if (m) found.push(`${file}: the prose uses ${what}, which chapter ${chapter} introduces`);
  }

  // Every entry named is one the reader has been taught.
  for (const m of template.matchAll(/<cpa-ref\b[^>]*\bname="([^"]*)"/g)) {
    const ref = REFS.find((r) => r.name === decode(m[1]));
    if (!ref) found.push(`${file}: <cpa-ref name="${m[1]}"> is not in REFS (chapters.ts)`);
    else if (ref.chapter > n)
      found.push(`${file}: names ${ref.name}, which chapter ${ref.chapter} introduces`);
  }

  // …and everything the library defines is named through cpa-ref, so it links.
  for (const m of template.matchAll(/<code>([\s\S]*?)<\/code>/g)) {
    const name = decode(m[1]).trim();
    if (REFS.some((r) => r.name === name) || LIBRARY_NAME.test(name))
      found.push(
        `${file}: <code>${m[1].trim()}</code> names a library entry: write <cpa-ref name="…" />`,
      );
  }
  return found;
}

/** A live example in a page: a frame, or a template Angular renders. */
const LIVE = /<cpa-live-(?:example|template)\b/;

/** The live example of a chapter whose example is an Angular template. */
export const TEMPLATE_EXAMPLE = 'example.ng.html';

/** What is missing from the shape every chapter page has. */
export function checkShape(file: string, template: string): string[] {
  const found: string[] = [];
  let from = 0;
  for (const slot of SLOTS) {
    const at = template.indexOf(` ${slot}`, from);
    if (at < 0) found.push(`${file}: no ${slot} part, or it is out of order (${SLOTS.join(', ')})`);
    else from = at;
  }
  const part = (slot: string, next: string | undefined) => {
    const start = template.indexOf(` ${slot}`);
    const end = next ? template.indexOf(` ${next}`) : template.length;
    return start < 0 ? '' : template.slice(start, end < 0 ? template.length : end);
  };
  // A frame (cpa-live-example) or, for Angular components, a template the
  // page renders itself (cpa-live-template).
  if (!LIVE.test(part('chapterExample', 'chapterIdea')))
    found.push(`${file}: the example part has no <cpa-live-example>`);
  if (!LIVE.test(part('chapterTry', 'chapterNow')))
    found.push(`${file}: the Try it part has no <cpa-live-example>`);
  if (!part('chapterCode', 'chapterTry').match(/<cpa-code|<cpa-live-example|<cpa-live-template/))
    found.push(`${file}: the code part shows no code`);
  if (/<table\b/.test(template)) found.push(`${file}: a Learn page has no API tables`);
  return found;
}

let generated: Map<string, string[]> | undefined;

/** Entries of REFS whose Reference section does not exist or does not name them. */
export function checkRefs(): string[] {
  const found: string[] = [];
  const names = new Set<string>();
  for (const ref of REFS) {
    if (names.has(ref.name)) found.push(`REFS lists ${ref.name} twice`);
    names.add(ref.name);
    if (!CHAPTERS.some((c) => c.n === ref.chapter))
      found.push(`REFS: ${ref.name} names chapter ${ref.chapter}`);
    const file = path.join(referencePagesDir, `${ref.page.split('/')[1]}.component.ts`);
    if (!existsSync(file)) {
      found.push(`REFS: ${ref.name} links to ${ref.page}, which has no page`);
      continue;
    }
    const source = readFileSync(file, 'utf8');
    if (!source.includes(`id="${ref.anchor}"`))
      found.push(`REFS: ${ref.name} links to ${ref.page}#${ref.anchor}, which is not on that page`);
    // The CSS Variables page is generated: what a section holds is the data
    // the build writes for it, not text in the page's source.
    if (ref.page === VARIABLES_PAGE) {
      generated ??= sectionNames(variablesData());
      if (!generated.get(ref.anchor)?.some((name) => name.includes(ref.find)))
        found.push(
          `REFS: ${ref.page}#${ref.anchor} shows no variable with "${ref.find}" (${ref.name})`,
        );
      continue;
    }
    if (!decode(source).includes(ref.find))
      found.push(`REFS: ${ref.page} does not mention "${ref.find}" (${ref.name})`);
  }
  return found;
}

export const pageFile = (chapter: Chapter) =>
  path.join(learnPagesDir, `${chapter.folder}.component.ts`);
export const exampleFolder = (chapter: Chapter) => path.join(learnExamplesDir, chapter.folder);

/** The example files of a chapter, by name. */
export function exampleFiles(chapter: Chapter): string[] {
  const dir = exampleFolder(chapter);
  return existsSync(dir) ? readdirSync(dir).sort() : [];
}

/** Every violation in the Learn track as it is on disk. Empty when it holds. */
export function checkLearn(): string[] {
  const found: string[] = [...checkRefs()];
  const rel = (file: string) => path.relative(docsDir, file);

  CHAPTERS.forEach((chapter, i) => {
    if (chapter.n !== i + 1) found.push(`CHAPTERS: chapter ${chapter.n} is at position ${i + 1}`);
    const page = pageFile(chapter);
    const files = exampleFiles(chapter);

    if (!chapter.written) {
      if (existsSync(page)) found.push(`${rel(page)} exists: set written for chapter ${chapter.n}`);
      return;
    }
    if (!existsSync(page)) {
      found.push(`chapter ${chapter.n} is marked written and has no page (${rel(page)})`);
      return;
    }
    // The live example is a frame built from example.html, or (Angular
    // components cannot run in a frame) a template the page renders.
    const rendered = files.includes(TEMPLATE_EXAMPLE);
    for (const need of ['theme.scss', rendered ? TEMPLATE_EXAMPLE : 'example.html'])
      if (!files.includes(need))
        found.push(`${rel(exampleFolder(chapter))} has no ${need}: there is no live example`);

    for (const file of files) {
      const text = readFileSync(path.join(exampleFolder(chapter), file), 'utf8');
      found.push(...checkExample(chapter.n, `${rel(exampleFolder(chapter))}/${file}`, text));
    }

    const source = readFileSync(page, 'utf8');
    const template = templateOf(source);
    if (!template) found.push(`${rel(page)}: no inline template`);
    found.push(...checkProse(chapter.n, rel(page), `${template}\n${labelsOf(source)}`));
    found.push(...checkShape(rel(page), template));

    const imports = (file: string) => source.includes(`/examples/learn/${chapter.folder}/${file}'`);
    if (rendered) {
      // The page shows the text of every file of the folder, and the template
      // is the one a component of the chapter renders.
      for (const file of files)
        if (!imports(file)) found.push(`${rel(page)}: does not import ${file}`);
      const examples = page.replace(/\.component\.ts$/, '.examples.ts');
      const url = `/examples/learn/${chapter.folder}/${TEMPLATE_EXAMPLE}'`;
      if (
        !existsSync(examples) ||
        !readFileSync(examples, 'utf8').includes(`templateUrl: '../../..${url}`)
      )
        found.push(`${rel(examples)}: no component renders ${TEMPLATE_EXAMPLE}`);
      return;
    }

    // The frames the page shows are the frames the folder holds, and the page
    // has the text of every file they are built from.
    const frames = frameNames(files);
    const shown = new Set([...source.matchAll(/\bframe:\s*'([\w-]+)'/g)].map((m) => m[1]));
    for (const frame of shown)
      if (!frames.includes(frame)) found.push(`${rel(page)}: there is no frame '${frame}'`);
    for (const frame of frames) {
      if (!shown.has(frame)) found.push(`${rel(page)}: the frame '${frame}' is never shown`);
      for (const file of Object.values(frameFiles(frame, files)))
        if (!imports(file)) found.push(`${rel(page)}: shows '${frame}' without importing ${file}`);
    }
  });
  return found;
}
