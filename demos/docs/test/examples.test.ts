// Docs examples (PORT-PLAN.md, "Phase 7 (resumed)"). Every code sample the docs
// show for Sass, CSS or theme attributes is a file under
// demos/docs/src/examples/{page}/, imported by the page as text. This file checks
// those files against the real packages, so a sample cannot disagree with the
// library:
//
//   name.scss          compiles through the packages' `exports` with zero
//                      warnings; core + a preset + the example leaves no var()
//                      read undeclared
//   name.css           plain CSS an author writes: valid CSS, exported paths only
//   name.output.css    an excerpt of compiled output: every declaration is in
//                      core.css or the preset, verbatim, under the same selector
//   name.html          theme attributes: every attribute and value is one the
//                      library's CSS selects on; cpa-theme-example renders it
//   name.display.*     display-only: a fragment that cannot be checked that way
//                      (a listing of variable names, an Angular template). The
//                      marker is refused on a file that would pass the check.
//   name.ng.html       an Angular template the docs render: it is the
//                      `templateUrl` of a component, so what the page shows is
//                      what runs. Every element and static attribute is HTML's,
//                      Angular Material's or the library's (with a value the
//                      library's CSS selects on); it has no `style`, its
//                      classes are layout classes, and its component has no
//                      other stylesheet. Bindings are the Angular build's.
//   name.ts.txt        TypeScript the docs show: the text is in a source file
//                      of the docs app, verbatim
//
// Every file, display-only or not, may only name custom properties the library
// declares or reads and `@cpangular/…` paths the packages export.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import {
  compileFile,
  docsDir,
  docsStyleList,
  exportsImporters,
  repoRoot,
  resolveExport,
  sourceOfDist,
  type Compiled,
} from '../../../packages/theme-core/test/lib/sass.ts';
import {
  declaredCustomProperties,
  normalizeSelector,
  registeredProperties,
  rules,
  stripComments,
  undefinedReads,
  varReads,
} from '../../../packages/theme-core/test/lib/css.ts';
import {
  coreSheets,
  formatWarning,
  materialSheets,
} from '../../../packages/theme-core/test/lib/sets.ts';

const examplesDir = path.join(docsDir, 'src', 'examples');
const appDir = path.join(docsDir, 'src', 'app');

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]))
    .sort();
}

const rel = (file: string) => path.relative(examplesDir, file);
const all = walk(examplesDir);
const isDisplay = (f: string) => /\.display\.[a-z]+$/.test(f);
const scss = all.filter((f) => f.endsWith('.scss') && !isDisplay(f));
const outputCss = all.filter((f) => f.endsWith('.output.css'));
const plainCss = all.filter((f) => f.endsWith('.css') && !isDisplay(f) && !outputCss.includes(f));
const templates = all.filter((f) => f.endsWith('.ng.html'));
const html = all.filter((f) => f.endsWith('.html') && !isDisplay(f) && !templates.includes(f));
const code = all.filter((f) => f.endsWith('.ts.txt'));
const display = all.filter(isDisplay);

test('every example is a .scss, .css, .html or .ts.txt file in a page folder', () => {
  assert.ok(all.length > 0, 'examples exist');
  const odd = all.filter((f) => !/^[\w-]+[\\/][\w.-]+\.(scss|css|html|ts\.txt)$/.test(rel(f)));
  assert.deepEqual(odd.map(rel), []);
});

// ── The library the examples are checked against ─────────────────────────────

const { core, presets } = coreSheets();
const preset = presets.find((p) => p.entry.endsWith('azure-blue.scss'))!;
const adapter = materialSheets();
const libraryCss = [core.css, ...presets.map((p) => p.css), ...adapter.map((s) => s.css)];

const compile = (file: string): Compiled => compileFile(file, [], exportsImporters);
const compiled = new Map<string, Compiled>();
const compileErrors = new Map<string, string>();
for (const file of scss) {
  try {
    compiled.set(file, compile(file));
  } catch (error) {
    compileErrors.set(file, String((error as Error).message).split('\n')[0]);
  }
}
const exampleCss = [...compiled.values()].map((c) => c.css);

// ── Sass examples ────────────────────────────────────────────────────────────

for (const file of scss) {
  test(`${rel(file)} compiles against the packages with zero warnings`, () => {
    assert.equal(compileErrors.get(file), undefined, 'compiles');
    assert.deepEqual(compiled.get(file)!.warnings.map(formatWarning), []);
  });

  test(`core + ${path.basename(preset.entry, '.scss')} + ${rel(file)}: every var() read is declared`, () => {
    const result = compiled.get(file);
    assert.ok(result, 'compiles');
    const usesAdapter = readFileSync(file, 'utf8').includes('cp-theming-ng-material');
    const set = [
      core.css,
      preset.css,
      result.css,
      ...(usesAdapter ? adapter.map((s) => s.css) : []),
    ];
    assert.deepEqual(undefinedReads(set), []);
  });
}

// ── Plain CSS examples ───────────────────────────────────────────────────────

for (const file of plainCss) {
  test(`${rel(file)} is valid CSS`, () => {
    const { warnings } = compileFile(file);
    assert.deepEqual(warnings.map(formatWarning), []);
  });
}

// ── Output excerpts ──────────────────────────────────────────────────────────

const squash = (value: string) => value.replace(/\s+/g, ' ').trim();

for (const file of outputCss) {
  test(`${rel(file)}: every declaration is compiled output, verbatim`, () => {
    const reference = [core.css, preset.css].flatMap((css) => rules(css));
    const missing: string[] = [];
    let count = 0;
    for (const rule of rules(readFileSync(file, 'utf8'))) {
      const same = reference.filter(
        (r) =>
          r.context.length === 0 &&
          normalizeSelector(r.selector) === normalizeSelector(rule.selector),
      );
      for (const [name, value] of rule.declarations) {
        count++;
        const found = same.some((r) =>
          r.declarations.some(([n, v]) => n === name && squash(v) === squash(value)),
        );
        if (!found) missing.push(`${rule.selector} { ${name}: ${squash(value)} }`);
      }
    }
    assert.ok(count > 0, 'the excerpt has declarations');
    assert.deepEqual(missing, []);
  });
}

// ── Attribute examples ───────────────────────────────────────────────────────

interface Attribute {
  tag: string;
  name: string;
  value: string | null;
}

function attributesOf(source: string): Attribute[] {
  const out: Attribute[] = [];
  const text = source.replace(/<!--[\s\S]*?-->/g, '');
  const tagRe =
    /<([a-zA-Z][\w-]*)((?:\s+[^\s"'<>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'<>]+))?)*)\s*\/?>/g;
  let tag: RegExpExecArray | null;
  while ((tag = tagRe.exec(text))) {
    out.push({ tag: tag[1], name: '', value: null });
    const attrRe = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'<>]+)))?/g;
    let attr: RegExpExecArray | null;
    while ((attr = attrRe.exec(tag[2])))
      out.push({ tag: tag[1], name: attr[1], value: attr[2] ?? attr[3] ?? attr[4] ?? null });
  }
  return out;
}

/** Attribute names the library's selectors use, with the values they select on. */
function vocabulary(cssSet: string[]): Map<string, { bare: boolean; values: Set<string> }> {
  const vocab = new Map<string, { bare: boolean; values: Set<string> }>();
  for (const css of cssSet)
    for (const rule of rules(css))
      for (const m of rule.selector.matchAll(
        /\[([\w-]+)(?:=(?:"([^"\]]*)"|'([^'\]]*)'|([^\]]*)))?\]/g,
      )) {
        const entry = vocab.get(m[1].toLowerCase()) ?? { bare: false, values: new Set<string>() };
        const value = m[2] ?? m[3] ?? m[4];
        if (value === undefined) entry.bare = true;
        else entry.values.add(value);
        vocab.set(m[1].toLowerCase(), entry);
      }
  return vocab;
}

const HTML_TAGS = new Set(
  'html body div span section aside article header footer main nav p a button hr h1 h2 h3 h4 ul ol li strong em code'.split(
    ' ',
  ),
);
const HTML_ATTRIBUTES = new Set([
  'class',
  'style',
  'lang',
  'id',
  'title',
  'type',
  'href',
  'hidden',
]);

const vocab = vocabulary([...libraryCss, ...exampleCss]);
const declared = new Set<string>();
const known = new Set<string>();
for (const css of [...libraryCss, ...exampleCss]) {
  for (const n of declaredCustomProperties(css)) declared.add(n);
  for (const n of registeredProperties(css)) declared.add(n);
  for (const r of varReads(css)) known.add(r.name);
}
for (const n of declared) known.add(n);

/** What in an HTML example the library's CSS does not account for. */
function unknownMarkup(source: string): string[] {
  const unknown: string[] = [];
  for (const { tag, name, value } of attributesOf(source)) {
    if (name === '') {
      if (!HTML_TAGS.has(tag.toLowerCase())) unknown.push(`<${tag}>`);
      continue;
    }
    if (HTML_ATTRIBUTES.has(name.toLowerCase())) {
      if (name.toLowerCase() === 'style')
        for (const read of varReads(value ?? ''))
          if (!declared.has(read.name)) unknown.push(`${name}: var(${read.name})`);
      continue;
    }
    const entry = vocab.get(name.toLowerCase());
    const shown = value === null ? name : `${name}="${value}"`;
    if (!entry) unknown.push(shown);
    else if (value === null ? !entry.bare : !entry.values.has(value)) unknown.push(shown);
  }
  return unknown;
}

for (const file of html) {
  test(`${rel(file)}: every attribute and value is one the library's CSS selects on`, () => {
    const source = readFileSync(file, 'utf8');
    assert.ok(attributesOf(source).length > 0, 'has markup');
    assert.deepEqual(unknownMarkup(source), []);
  });
}

// ── Angular templates ────────────────────────────────────────────────────────

const appSources = walk(appDir)
  .filter((f) => f.endsWith('.ts'))
  .map((f) => ({
    path: f,
    file: path.relative(repoRoot, f),
    dir: path.dirname(f),
    text: readFileSync(f, 'utf8'),
  }));

/**
 * Element names and attribute names Angular Material, the CDK and forms
 * declare, and the selectors of the docs app's own components and directives.
 */
function angularVocabulary(): { tags: Set<string>; attributes: Set<string> } {
  const tags = new Set<string>();
  const attributes = new Set<string>();
  const selector = (value: string) => {
    for (const part of value.split(',')) {
      const tag = /^\s*([a-zA-Z][\w-]*)/.exec(part)?.[1];
      if (tag) tags.add(tag.toLowerCase());
      for (const a of part.matchAll(/\[([\w-]+)/g)) attributes.add(a[1].toLowerCase());
    }
  };
  for (const { text } of appSources)
    for (const m of text.matchAll(/\bselector:\s*'([^']+)'/g)) selector(m[1]);
  for (const pkg of ['material', 'cdk', 'forms']) {
    const dir = path.join(repoRoot, 'node_modules', '@angular', pkg, 'fesm2022');
    for (const name of readdirSync(dir).filter((f) => f.endsWith('.mjs'))) {
      const text = readFileSync(path.join(dir, name), 'utf8');
      for (const m of text.matchAll(/\bselector:\s*(["'])((?:(?!\1).)+)\1/g)) selector(m[2]);
      // An input, in each form the compiler writes: `name: "public"`,
      // `name: ["public", …]` and `name: { publicName: "public", … }`.
      for (const m of text.matchAll(/\binputs:\s*\{/g)) {
        let depth = 1;
        let end = m.index + m[0].length;
        for (; depth > 0 && end < text.length; end++)
          depth += text[end] === '{' ? 1 : text[end] === '}' ? -1 : 0;
        const body = text.slice(m.index, end);
        for (const i of body.matchAll(/[\w$]+:\s*\[?\s*"([^"]+)"/g))
          attributes.add(i[1].toLowerCase());
      }
    }
  }
  return { tags, attributes };
}

const TEMPLATE_TAGS = new Set([
  ...HTML_TAGS,
  ...'input textarea label form table thead tbody tr th td img ng-container ng-template ng-content'.split(
    ' ',
  ),
]);
const TEMPLATE_ATTRIBUTES = new Set(
  'class id type href title value placeholder rows disabled checked name role for tabindex alt'.split(
    ' ',
  ),
);

// Layout: where a thing sits and how big it is. Nothing that paints.
const LAYOUT_PROPERTY =
  /^(display|box-sizing|flex(-[a-z]+)*|grid(-[a-z]+)*|gap|(row|column)-gap|(align|justify|place)-(items|content|self)|(min-|max-)?(width|height)|margin(-[a-z]+)*|padding(-[a-z]+)*)$/;

const layoutSheet = path.join(appDir, 'packages/pages/components/gallery-layout.scss');
const layoutRules = rules(compileFile(layoutSheet).css);
const layoutClasses = new Set(
  layoutRules.flatMap((r) => [...r.selector.matchAll(/\.([\w-]+)/g)].map((m) => m[1])),
);

test('gallery-layout.scss declares layout and nothing else', () => {
  assert.ok(layoutRules.length > 0, 'has rules');
  const other = layoutRules.flatMap((r) =>
    r.declarations
      .filter(([name]) => !LAYOUT_PROPERTY.test(name))
      .map(([name, value]) => `${r.selector} { ${name}: ${value} }`),
  );
  assert.deepEqual(other, []);
});

const ng = angularVocabulary();

/** What in a template is neither HTML's, Angular's nor the library's. */
function unknownTemplate(source: string): string[] {
  const unknown: string[] = [];
  for (const { tag, name, value } of attributesOf(source)) {
    const shown = value === null ? name : `${name}="${value}"`;
    if (name === '') {
      if (!TEMPLATE_TAGS.has(tag.toLowerCase()) && !ng.tags.has(tag.toLowerCase()))
        unknown.push(`<${tag}>`);
      continue;
    }
    // Colour comes from the adapter or a cp-theming attribute, never from here.
    if (/^\[?(attr\.)?(style|ngStyle)\b/i.test(name)) {
      unknown.push(`${shown} (a template has no styles of its own)`);
      continue;
    }
    // A binding, a listener, a structural directive or a reference: the Angular
    // build type-checks these against the components the template uses.
    if (/^[[(*#@]/.test(name)) continue;
    const lower = name.toLowerCase();
    if (lower === 'class') {
      for (const c of (value ?? '').split(/\s+/).filter(Boolean))
        if (!layoutClasses.has(c)) unknown.push(`class="${c}" (not in gallery-layout.scss)`);
      continue;
    }
    if (TEMPLATE_ATTRIBUTES.has(lower) || lower.startsWith('aria-')) continue;
    // A name both vocabularies have (`mode`, `color`) is Material's if the
    // value is not one the library selects on.
    const entry = vocab.get(lower);
    if (entry && (value === null ? entry.bare : entry.values.has(value))) continue;
    if (ng.attributes.has(lower)) continue;
    unknown.push(shown);
  }
  return unknown;
}

for (const file of templates) {
  test(`${rel(file)}: every element and attribute is HTML's, Angular's or the library's`, () => {
    const source = readFileSync(file, 'utf8');
    assert.ok(attributesOf(source).length > 0, 'has markup');
    assert.deepEqual(unknownTemplate(source), []);
  });
}

test('every template example is the template of a component with the layout sheet only', () => {
  assert.ok(ng.tags.has('mat-form-field') && ng.attributes.has('matbutton'), 'read Material');
  const rendered = new Set<string>();
  const styled: string[] = [];
  for (const { path: file, dir, text } of appSources)
    for (const block of text.split(/^@Component\(/m).slice(1)) {
      const meta = block.slice(0, block.search(/^\}\)/m));
      const url = /templateUrl:\s*'([^']+)'/.exec(meta)?.[1];
      if (!url || !path.resolve(dir, url).startsWith(examplesDir)) continue;
      rendered.add(path.resolve(dir, url));
      const sheet = /styleUrl:\s*(?:'([^']+)'|(\w+))/.exec(meta);
      const named =
        sheet?.[1] ?? new RegExp(`const ${sheet?.[2]} = '([^']+)'`).exec(text)?.[1] ?? '';
      if (/\bstyles:|styleUrls:/.test(meta) || path.resolve(dir, named) !== layoutSheet)
        styled.push(`${path.relative(repoRoot, file)}: ${url}`);
    }
  assert.deepEqual(styled, [], 'components with a stylesheet other than gallery-layout.scss');
  assert.deepEqual(templates.filter((f) => !rendered.has(f)).map(rel), [], 'not a templateUrl');
});

// ── TypeScript the docs show ─────────────────────────────────────────────────

for (const file of code) {
  test(`${rel(file)}: the text is in a source file of the docs app, verbatim`, () => {
    const shown = readFileSync(file, 'utf8').trim();
    assert.ok(shown.length > 0, 'has text');
    assert.ok(
      appSources.some((s) => s.text.includes(shown)),
      'no .ts file under src/app contains this text',
    );
  });
}

// ── The example theme the docs app renders ───────────────────────────────────

// Getting Started shows custom-theme.scss and renders brand-chain.html with
// it, live. The docs app cannot load that file as it is (it includes core and
// is a default theme), so src/styles.scss defines the same theme again; the two
// theme rules have to stay the same, or the page shows one theme and renders
// another.
test('the docs app defines the Getting Started theme exactly as the example shows it', () => {
  const themeRule = (css: string) =>
    rules(css)
      .filter((r) => /\[theme=["']?my-brand["']?\]/.test(r.selector))
      .map((r) => r.declarations);
  const example = compiled.get(path.join(examplesDir, 'getting-started', 'custom-theme.scss'));
  assert.ok(example, 'custom-theme.scss compiles');
  // Compiled the way the docs build compiles it (angular.json's include paths).
  const app = docsStyleList().find((s) => s.entry.endsWith('docs/src/styles.scss'));
  assert.ok(app, 'angular.json lists the docs stylesheet');
  assert.equal(themeRule(example.css).length, 1, 'the example defines my-brand');
  assert.deepEqual(themeRule(app.compiled.css), themeRule(example.css));
  // …and that theme passes the brand colour and nothing else: the rest of its
  // rule points at the colours core generates.
  const [declarations] = themeRule(example.css);
  assert.deepEqual(
    declarations.slice(0, 3).map(([n]) => n),
    ['--color--brand--mode-light', '--color--brand--mode-dark', '--color--brand'],
  );
  assert.deepEqual(
    declarations
      .slice(3)
      .filter(([, v]) => !v.includes('--theme--_generated--') && !v.startsWith('light-dark(')),
    [],
  );
  // The live example has an element in the brand palette inside that theme.
  const live = readFileSync(path.join(examplesDir, 'getting-started', 'brand-chain.html'), 'utf8');
  assert.match(live, /theme="my-brand"/);
  assert.match(live, /palette="brand"/);
});

// ── Display-only fragments ───────────────────────────────────────────────────

test('display-only fragments are the ones that cannot be checked', (t) => {
  const checkable: string[] = [];
  for (const file of display) {
    if (file.endsWith('.html')) {
      if (unknownMarkup(readFileSync(file, 'utf8')).length === 0) checkable.push(rel(file));
      continue;
    }
    try {
      compile(file);
      checkable.push(rel(file));
    } catch {
      // does not compile: the marker is justified
    }
  }
  t.diagnostic(`display-only (${display.length}): ${display.map(rel).join(', ')}`);
  assert.deepEqual(checkable, [], 'these pass their check: drop the .display marker');
});

// ── Every file: names and paths ──────────────────────────────────────────────

for (const file of all) {
  test(`${rel(file)}: names only custom properties the library declares or reads`, () => {
    const source = file.endsWith('.html')
      ? readFileSync(file, 'utf8').replace(/<!--|-->/g, ' ')
      : readFileSync(file, 'utf8');
    const names = [...source.matchAll(/(?<![\w-])--[a-z][\w-]*/g)]
      .map((m) => m[0])
      .filter((n) => !n.endsWith('-')); // `--palette-color--*` in a comment
    assert.deepEqual([...new Set(names.filter((n) => !known.has(n)))], []);
  });
}

test('every @cpangular path an example names is in the package exports', () => {
  const bad: string[] = [];
  for (const file of all) {
    const source = readFileSync(file, 'utf8');
    for (const [specifier] of source.matchAll(/@cpangular\/cp-theming-[\w-]+(?:\/[\w.*-]+)*/g)) {
      const target = resolveExport(specifier);
      const exists =
        typeof target === 'string' &&
        (existsSync(target) ||
          sourceOfDist(target) !== null ||
          existsSync(`${target}.scss`) ||
          existsSync(path.join(path.dirname(target), `_${path.basename(target)}.scss`)));
      if (!exists) bad.push(`${rel(file)}: ${specifier}`);
    }
  }
  assert.deepEqual(bad, []);
});

// ── The pages ────────────────────────────────────────────────────────────────

test('every example is imported as text by a page, and every import exists', () => {
  const imported = new Set<string>();
  const broken: string[] = [];
  for (const { file, dir, text } of appSources)
    for (const m of text.matchAll(
      /from\s+'([^']*\/examples\/[^']+)'\s+with\s+\{\s*loader:\s*'text',?\s*\}/g,
    )) {
      const target = path.resolve(dir, m[1]);
      if (existsSync(target)) imported.add(target);
      else broken.push(`${file}: ${m[1]}`);
    }
  assert.deepEqual(broken, []);
  assert.deepEqual(all.filter((f) => !imported.has(f)).map(rel), [], 'examples no page imports');
});

test('no hand-written Sass, CSS or attribute sample remains in a page', () => {
  const SAMPLE =
    /@use|@include|&#64;use|&#64;include|\$[a-z][\w-]*\s*:|\bt\.[a-z-]+\(|(?<![[\w])(?:palette|theme|themeMode|themeDensity|tone|elevated|shape)="|var\(--|^\s*--[a-z]/m;
  const found: string[] = [];
  for (const { file, text } of appSources) {
    const line = (index: number) => text.slice(0, index).split('\n').length;
    for (const m of text.matchAll(/<pre[^>]*>([\s\S]*?)<\/pre>/g))
      if (SAMPLE.test(m[1])) found.push(`${file}:${line(m.index)} <pre>`);
    // A string field of the component class (not `template:` / `styles:`).
    for (const m of text.matchAll(/^\s*(?:readonly\s+)?(\w+)\s*=\s*`([^`]*)`/gm))
      if (SAMPLE.test(m[2])) found.push(`${file}:${line(m.index)} ${m[1]}`);
  }
  assert.deepEqual(found, []);
});

test('summary', (t) => {
  t.diagnostic(
    `${all.length} examples: ${scss.length} Sass compiled, ${plainCss.length} CSS, ` +
      `${outputCss.length} output excerpt, ${html.length} attribute HTML, ` +
      `${templates.length} Angular templates, ${code.length} TypeScript, ${display.length} display-only`,
  );
  // stripComments is what the readers above rely on; keep the import honest.
  assert.equal(stripComments('/* x */a'), 'a');
});
