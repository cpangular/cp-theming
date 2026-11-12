// The Learn track (PORT-PLAN.md, Phase 17): the chapter list, and next to it
// the two tables the order check reads.
//
// The order of CHAPTERS is the teaching order: a chapter uses only what the
// chapters before it introduced. `demos/docs/scripts/lib/order.ts` enforces it
// with PATTERNS (over a chapter's example files and its prose) and REFS (over
// the Reference entries its prose names), and the docs build fails on a
// violation.
//
// This file is read by the Angular app and, as it is, by Node (the build script
// and the tests): keep it free of imports and of non-erasable syntax.

export interface Chapter {
  n: number;
  /** Route: /learn/{slug}. */
  slug: string;
  /** Example folder: src/examples/learn/{folder}/. */
  folder: string;
  title: string;
  /** The question the chapter answers: one sentence under the title. */
  question: string;
  /** False until the chapter's page exists; the check compares it with the files. */
  written: boolean;
}

export const CHAPTERS: Chapter[] = [
  {
    n: 1,
    slug: 'one-colour',
    folder: '01-one-colour',
    title: 'One colour, a whole palette',
    question: 'What does cp-theming do with a colour I give it?',
    written: true,
  },
  {
    n: 2,
    slug: 'light-and-dark',
    folder: '02-light-and-dark',
    title: 'Light and dark are one theme',
    question: "Why don't I write a dark theme?",
    written: true,
  },
  {
    n: 3,
    slug: 'generated',
    folder: '03-generated',
    title: 'Pass what you have, the rest is generated',
    question: 'I only have a brand colour; what happens?',
    written: true,
  },
  {
    n: 4,
    slug: 'roles',
    folder: '04-roles',
    title: 'Roles, not shades',
    question: 'Why bg, stroke and contrast instead of "a bit lighter"?',
    written: true,
  },
  {
    n: 5,
    slug: 'scopes',
    folder: '05-scopes',
    title: 'Scopes and surfaces',
    question: 'How do I colour a piece of the page?',
    written: true,
  },
  {
    n: 6,
    slug: 'nested',
    folder: '06-nested',
    title: 'Themes inside themes',
    question: 'What does a nested theme inherit?',
    written: true,
  },
  {
    n: 7,
    slug: 'contrast',
    folder: '07-contrast',
    title: 'Readable by construction',
    question: 'Who chooses black or white text?',
    written: true,
  },
  {
    n: 8,
    slug: 'everything-else',
    folder: '08-everything-else',
    title: 'Everything else a theme carries',
    question: 'What about spacing, shape, motion, elevation, weights and typography?',
    written: true,
  },
  {
    n: 9,
    slug: 'runtime',
    folder: '09-runtime',
    title: 'Switching at runtime',
    question: 'How does a user pick a theme or mode?',
    written: true,
  },
  {
    n: 10,
    slug: 'material',
    folder: '10-material',
    title: 'Angular Material',
    question: 'How do Material components get these colours?',
    written: true,
  },
];

// ── The pattern table ────────────────────────────────────────────────────────
// What each chapter introduces, as text that can be searched for. An example
// file or a sentence of chapter N that matches a pattern of a later chapter
// fails the build: the reader would meet it before it is taught.

export interface Pattern {
  /** The chapter that introduces it. */
  chapter: number;
  /** How a failure names it. */
  what: string;
  pattern: RegExp;
}

export const PATTERNS: Pattern[] = [
  // 2 — modes
  { chapter: 2, what: 'themeMode', pattern: /themeMode/i },
  { chapter: 2, what: 'light-dark()', pattern: /light-dark\(/ },
  { chapter: 2, what: '--high / --low', pattern: /--(?:high|low)(?:er|est)?\b/ },
  { chapter: 2, what: 'the light and dark value of a token', pattern: /--mode-(?:light|dark)\b/ },
  { chapter: 2, what: 'color-scheme', pattern: /color-scheme/ },

  // 3 — brand and the chain
  { chapter: 3, what: '$brand', pattern: /\$brand\b/ },
  { chapter: 3, what: 'the brand palette', pattern: /--color--brand\b|-from-brand\b/ },
  {
    chapter: 3,
    what: 'a generated palette (secondary, tertiary, background, surface)',
    pattern: /--color--(?:secondary|tertiary|background|surface)\b/,
  },
  {
    chapter: 3,
    what: 'a generated palette (secondary, tertiary, background, surface)',
    pattern: /\b(?:secondary|tertiary|background|surface):\s*t\./,
  },

  // 4 — roles
  { chapter: 4, what: '--tint-N', pattern: /--tint-\d/ },

  // 5 — scopes and surfaces
  { chapter: 5, what: 'palette=', pattern: /\bpalette=/ },
  { chapter: 5, what: 'tone=', pattern: /\btone=/ },
  {
    chapter: 5,
    what: 'a surface attribute (bg, filled, outlined)',
    pattern: /<[a-z][^<>]*\s(?:bg|filled|outlined)(?=[\s>])/,
  },
  {
    chapter: 5,
    what: 'an apply mixin',
    pattern: /\bt\.(?:apply-palette|bg|filled|outlined|tone)\(/,
  },
  { chapter: 5, what: '--palette-color*', pattern: /--palette-color/ },
  { chapter: 5, what: '--container--*', pattern: /--container--/ },

  // 6 — nesting (a theme= element inside another is found by nestedTheme())
  { chapter: 6, what: '$default', pattern: /\$default\b/ },

  // 7 — the contrast guarantee, and the four palettes with fixed meanings
  { chapter: 7, what: 'the contrast guarantee', pattern: /\bWCAG\b|\b4\.5:1/ },
  {
    chapter: 7,
    what: 'a fixed palette (error, warn, caution, pass)',
    pattern:
      /--color--(?:error|warn|caution|pass)\b|\bpalette="(?:error|warn|caution|pass)"|\b(?:error|warn|caution|pass):\s*t\./,
  },

  // 8 — everything else a theme carries
  {
    chapter: 8,
    what: 'a non-colour token',
    pattern: /--(?:space|shape|weight|text|motion|density|focus|overlay)--|--elevation-\d/,
  },
  {
    chapter: 8,
    what: 'a non-colour attribute (shape, container, elevated, themeDensity)',
    pattern: /\b(?:shape|elevated|themeDensity)=|<[a-z][^<>]*\scontainer(?=[\s>])/,
  },
  {
    chapter: 8,
    what: 'a non-colour config',
    pattern:
      /\bt\.(?:weights|typography|density|shape|motion|elevation|overlays|focus|container|radius|padding)\(/,
  },

  // 9 — the runtime API
  { chapter: 9, what: '<script', pattern: /<script/i },
  {
    chapter: 9,
    what: 'the TypeScript or Angular API',
    pattern:
      /\b(?:ThemeService|provideTheme|setTheme|setMode|getTheme|getMode|getEffectiveMode|watchTheme|watchMode|configurePersistence|restoreTheme|restoreMode|ThemeStorage|themeHeadSnippet|localStorage|sessionStorage)\b/,
  },

  // 10 — Angular Material
  { chapter: 10, what: 'mat-', pattern: /\bmat-[a-z]/ },
  { chapter: 10, what: 'a Material directive', pattern: /\bmat[A-Z]\w+/ },
  { chapter: 10, what: '--mat-sys', pattern: /--mat-sys/ },
  { chapter: 10, what: 'the Material adapter', pattern: /cp-theming-ng-material/ },
];

/**
 * True when an HTML example has a `theme=` element inside another `theme=`
 * element: nesting, which chapter 6 introduces.
 */
export function nestedTheme(html: string): boolean {
  const VOID = /^(?:br|hr|img|input|meta|link)$/i;
  const open: boolean[] = [];
  const tags = html.replace(/<!--[\s\S]*?-->/g, '').matchAll(/<(\/?)([a-zA-Z][\w-]*)([^<>]*)>/g);
  for (const [, close, tag, rest] of tags) {
    if (close) {
      open.pop();
      continue;
    }
    const themed = /\stheme=/.test(rest);
    if (themed && open.includes(true)) return true;
    if (!VOID.test(tag) && !rest.trimEnd().endsWith('/')) open.push(themed);
  }
  return false;
}

// ── The Reference entries a chapter may name ─────────────────────────────────
// Every function, variable or attribute a chapter's prose names is written
// `<cpa-ref name="…" />`, which links it to its Reference entry. A chapter may
// only name an entry its own or an earlier chapter introduced.

export interface Ref {
  /** As prose writes it. */
  name: string;
  /** The chapter that introduces it. */
  chapter: number;
  /** Reference page, a route under /packages. */
  page: string;
  /** Section id on that page. */
  anchor: string;
  /** Text the Reference page has to contain: the entry is really there. */
  find: string;
}

export const REFS: Ref[] = [
  // 1 — theme, palette, the --color--{name} tokens, --contrast
  { name: 't.theme()', chapter: 1, page: 'core/theme', anchor: 'theme-fn', find: 't.theme' },
  {
    name: '$palettes',
    chapter: 1,
    page: 'core/theme',
    anchor: 'theme-fn',
    find: '$palettes',
  },
  {
    name: 't.palette()',
    chapter: 1,
    page: 'core/palette',
    anchor: 'palette-fn',
    find: 't.palette',
  },
  {
    name: 't.define-core-theme()',
    chapter: 1,
    page: 'core/theme',
    anchor: 'define-core-theme',
    find: 'define-core-theme',
  },
  {
    name: 't.define-theme()',
    chapter: 1,
    page: 'core/theme',
    anchor: 'define-theme',
    find: 'define-theme',
  },
  { name: 'theme', chapter: 1, page: 'core/theme', anchor: 'nested-scopes', find: 'theme=' },
  {
    name: '--color--primary',
    chapter: 1,
    page: 'core/variables',
    anchor: 'color-vars',
    find: '--color--',
  },
  {
    name: '--color--{name}',
    chapter: 1,
    page: 'core/variables',
    anchor: 'color-vars',
    find: '--color--',
  },
  {
    name: '--color--{name}--contrast',
    chapter: 1,
    page: 'core/variables',
    anchor: 'color-vars',
    find: '--contrast',
  },
  {
    name: '--color--{name}--dark',
    chapter: 1,
    page: 'core/variables',
    anchor: 'color-vars',
    find: '--dark',
  },
  {
    name: '--color--{name}--light',
    chapter: 1,
    page: 'core/variables',
    anchor: 'color-vars',
    find: '--light',
  },

  // 2 — modes, --high / --low
  {
    name: 't.light-dark()',
    chapter: 2,
    page: 'core/theme',
    anchor: 'light-dark-fn',
    find: 't.light-dark',
  },
  { name: 'themeMode', chapter: 2, page: 'core/theme', anchor: 'light-dark', find: 'themeMode' },
  {
    name: '--color--{name}--high',
    chapter: 2,
    page: 'core/variables',
    anchor: 'color-vars',
    find: '--high',
  },
  {
    name: '--color--{name}--low',
    chapter: 2,
    page: 'core/variables',
    anchor: 'color-vars',
    find: '--low',
  },

  // 3 — brand, the generation chain
  { name: '$brand', chapter: 3, page: 'core/palette', anchor: 'chain', find: '$brand' },
  {
    name: '--color--brand',
    chapter: 3,
    page: 'core/palette',
    anchor: 'chain',
    find: '--color--brand',
  },

  // 4 — the role tokens, --tint-N, focus per palette
  {
    name: '--color--{name}--bg',
    chapter: 4,
    page: 'core/variables',
    anchor: 'color-vars',
    find: '--bg',
  },
  {
    name: '--color--{name}--bg--contrast',
    chapter: 4,
    page: 'core/variables',
    anchor: 'color-vars',
    find: '--bg',
  },
  {
    name: '--color--{name}--stroke',
    chapter: 4,
    page: 'core/variables',
    anchor: 'color-vars',
    find: '--stroke',
  },
  {
    name: '--color--{name}--focus',
    chapter: 4,
    page: 'core/focus',
    anchor: 'css-vars',
    find: '--focus',
  },
  {
    name: '--color--{name}--tint-N',
    chapter: 4,
    page: 'core/variables',
    anchor: 'color-vars',
    find: '--tint-',
  },

  // 5 — scopes and surfaces, --palette-color*, --container--*
  {
    name: 'palette',
    chapter: 5,
    page: 'core/apply-palette',
    anchor: 'activate',
    find: 'palette=',
  },
  { name: 'bg', chapter: 5, page: 'core/apply-surfaces', anchor: 'bg', find: '<code>bg</code>' },
  {
    name: 'filled',
    chapter: 5,
    page: 'core/apply-surfaces',
    anchor: 'filled',
    find: '<code>filled</code>',
  },
  {
    name: 'outlined',
    chapter: 5,
    page: 'core/apply-surfaces',
    anchor: 'outlined',
    find: '<code>outlined</code>',
  },
  { name: 'tone', chapter: 5, page: 'core/apply-tones', anchor: 'overview', find: 'tone' },
  {
    name: 't.apply-palette()',
    chapter: 5,
    page: 'core/apply-palette',
    anchor: 'activate',
    find: 't.apply-palette()',
  },
  { name: 't.bg()', chapter: 5, page: 'core/apply-surfaces', anchor: 'bg', find: 'bg' },
  {
    name: 't.filled()',
    chapter: 5,
    page: 'core/apply-surfaces',
    anchor: 'filled',
    find: 'filled',
  },
  {
    name: 't.outlined()',
    chapter: 5,
    page: 'core/apply-surfaces',
    anchor: 'outlined',
    find: 'outlined',
  },
  { name: 't.tone()', chapter: 5, page: 'core/apply-tones', anchor: 'overview', find: 'tone' },
  {
    name: '--palette-color',
    chapter: 5,
    page: 'core/apply-palette',
    anchor: 'color-properties',
    find: '--palette-color',
  },
  {
    name: '--palette-color--contrast',
    chapter: 5,
    page: 'core/apply-palette',
    anchor: 'color-properties',
    find: '--palette-color',
  },
  {
    name: '--palette-color--bg',
    chapter: 5,
    page: 'core/apply-palette',
    anchor: 'color-properties',
    find: '--palette-color',
  },
  {
    name: '--palette-color--stroke',
    chapter: 5,
    page: 'core/apply-palette',
    anchor: 'color-properties',
    find: '--palette-color',
  },
  {
    name: '--container--text',
    chapter: 5,
    page: 'core/variables',
    anchor: 'container-vars',
    find: '--container--',
  },
  {
    name: '--container--text-deemphasis',
    chapter: 5,
    page: 'core/variables',
    anchor: 'container-vars',
    find: '--container--',
  },
  {
    name: '--container--stroke',
    chapter: 5,
    page: 'core/variables',
    anchor: 'container-vars',
    find: '--container--',
  },

  // 6 — nesting, $default, coexisting themes
  { name: '$default', chapter: 6, page: 'core/theme', anchor: 'define-theme', find: '$default' },

  // 8 — everything else a theme carries
  {
    name: '--space--{size}',
    chapter: 8,
    page: 'core/variables',
    anchor: 'space-vars',
    find: '--space--',
  },
  {
    name: '--shape--{size}',
    chapter: 8,
    page: 'core/variables',
    anchor: 'shape-vars',
    find: '--shape--',
  },
  {
    name: '--elevation-N--shadow',
    chapter: 8,
    page: 'core/variables',
    anchor: 'elevation-vars',
    find: '--elevation-',
  },
  {
    name: '--motion--{name}',
    chapter: 8,
    page: 'core/variables',
    anchor: 'motion-vars',
    find: '--motion--',
  },
  {
    name: '--weight--{name}',
    chapter: 8,
    page: 'core/variables',
    anchor: 'weight-vars',
    find: '--weight--',
  },
  {
    name: '--text--{role}--{property}',
    chapter: 8,
    page: 'core/variables',
    anchor: 'text-vars',
    find: '--text--',
  },
  {
    name: 'themeDensity',
    chapter: 8,
    page: 'core/density',
    anchor: 'overview',
    find: 'themeDensity',
  },
  {
    name: 'container',
    chapter: 8,
    page: 'core/apply-geometry',
    anchor: 'padding',
    find: '<code>container</code>',
  },
  {
    name: 'shape',
    chapter: 8,
    page: 'core/apply-geometry',
    anchor: 'shape',
    find: '<code>shape</code>',
  },
  {
    name: 'elevated',
    chapter: 8,
    page: 'core/elevation',
    anchor: 'overview',
    find: 'elevated',
  },
  { name: 't.shape()', chapter: 8, page: 'core/shape', anchor: 'shape-fn', find: 'shape' },
  { name: 't.density()', chapter: 8, page: 'core/density', anchor: 'density-fn', find: 'density' },
  { name: 't.motion()', chapter: 8, page: 'core/motion', anchor: 'motion-fn', find: 'motion' },
  { name: 't.weights()', chapter: 8, page: 'core/weights', anchor: 'weights-fn', find: 'weights' },
  {
    name: 't.typography()',
    chapter: 8,
    page: 'core/typography',
    anchor: 'typography-fn',
    find: 'typography',
  },
  {
    name: 't.elevation()',
    chapter: 8,
    page: 'core/elevation',
    anchor: 'elevation-fn',
    find: 'elevation',
  },

  // 9 — the TypeScript and Angular APIs
  {
    name: 'setTheme()',
    chapter: 9,
    page: 'core/typescript-api',
    anchor: 'theme-mgmt',
    find: 'setTheme',
  },
  {
    name: 'getTheme()',
    chapter: 9,
    page: 'core/typescript-api',
    anchor: 'theme-mgmt',
    find: 'getTheme',
  },
  {
    name: 'watchTheme()',
    chapter: 9,
    page: 'core/typescript-api',
    anchor: 'theme-mgmt',
    find: 'watchTheme',
  },
  {
    name: 'setMode()',
    chapter: 9,
    page: 'core/typescript-api',
    anchor: 'mode-mgmt',
    find: 'setMode',
  },
  {
    name: 'getMode()',
    chapter: 9,
    page: 'core/typescript-api',
    anchor: 'mode-mgmt',
    find: 'getMode',
  },
  {
    name: 'getEffectiveMode()',
    chapter: 9,
    page: 'core/typescript-api',
    anchor: 'mode-mgmt',
    find: 'getEffectiveMode',
  },
  {
    name: 'watchMode()',
    chapter: 9,
    page: 'core/typescript-api',
    anchor: 'mode-mgmt',
    find: 'watchMode',
  },
  {
    name: 'configurePersistence()',
    chapter: 9,
    page: 'core/typescript-api',
    anchor: 'persistence',
    find: 'configurePersistence',
  },
  {
    name: 'themeHeadSnippet',
    chapter: 9,
    page: 'core/getting-started',
    anchor: 'no-flash',
    find: 'themeHeadSnippet',
  },
  {
    name: 'provideTheme()',
    chapter: 9,
    page: 'ng-core/getting-started',
    anchor: 'bootstrap',
    find: 'provideTheme',
  },
  {
    name: 'ThemeService',
    chapter: 9,
    page: 'ng-core/api',
    anchor: 'theme-service',
    find: 'ThemeService',
  },

  // 10 — the Material adapter, overlays, override patches
  {
    name: '--mat-sys-*',
    chapter: 10,
    page: 'ng-material/api',
    anchor: 'scss-mixins',
    find: '--mat-sys-*',
  },
  {
    name: 'define-ng-material-core-theme()',
    chapter: 10,
    page: 'ng-material/api',
    anchor: 'scss-mixins',
    find: 'define-ng-material-core-theme',
  },
  {
    name: 'apply-material-overrides()',
    chapter: 10,
    page: 'ng-material/api',
    anchor: 'scss-mixins',
    find: 'apply-material-overrides',
  },
  {
    name: 'cpaOverlayScope',
    chapter: 10,
    page: 'ng-material/components',
    anchor: 'overlays',
    find: 'cpaOverlayScope',
  },
];

// ── Frames ───────────────────────────────────────────────────────────────────
// A live example is a frame: an HTML document the docs build writes from the
// files of the chapter's folder and the page shows in an <iframe>.
//
//   theme.scss      the chapter's theme: a complete stylesheet, core included
//   example.html    the markup, placed in <body>
//   example.scss    the example's own styles (optional)
//   example.ts.txt  the example's script: TypeScript, a module at the end of
//                   <body> (optional, chapter 9 on). It is `.txt` on disk
//                   because the page imports it as text, and the Angular
//                   build would compile a `.ts` file instead; the page shows
//                   it as example.ts.
//   head.html       what the example puts in <head>, ahead of the stylesheets
//                   (optional, chapter 9 on)
//
// Any other name X with an X.html, X.scss, X.ts.txt, X.theme.scss or
// X.head.html is one more frame (a "Try it" variation, or the same example
// written another way): it is the example with the files X has swapped in.
//
// TypeScript a chapter only shows (an excerpt of this site's own source) is
// X.app.ts.txt: the second dot keeps it from being read as a frame.

export interface FrameFiles {
  theme: string;
  html: string;
  /** Absent when neither the frame nor the example has a stylesheet. */
  styles?: string;
  /** Absent when neither the frame nor the example has a script. */
  script?: string;
  /** Absent when neither the frame nor the example adds to `<head>`. */
  head?: string;
}

/** Files of a folder that belong to every frame, not to a frame of that name. */
const SHARED = ['theme.scss', 'head.html'];

/** The frames a folder holds, `example` first, from its file names. */
export function frameNames(files: string[]): string[] {
  const names = new Set<string>();
  for (const file of files) {
    const m = /^([\w-]+)\.(?:theme\.scss|head\.html|scss|html|ts\.txt)$/.exec(file);
    if (m && !SHARED.includes(file)) names.add(m[1]);
  }
  names.delete('example');
  return ['example', ...[...names].sort()];
}

/** The files a frame is built from: its own where it has one, the example's otherwise. */
export function frameFiles(frame: string, files: string[]): FrameFiles {
  const pick = (own: string, shared: string) => (files.includes(own) ? own : shared);
  const optional = (key: 'styles' | 'script' | 'head', own: string, shared: string) => {
    const file = pick(own, shared);
    return files.includes(file) ? { [key]: file } : {};
  };
  return {
    theme: pick(`${frame}.theme.scss`, 'theme.scss'),
    html: pick(`${frame}.html`, 'example.html'),
    ...optional('styles', `${frame}.scss`, 'example.scss'),
    ...optional('script', `${frame}.ts.txt`, 'example.ts.txt'),
    ...optional('head', `${frame}.head.html`, 'head.html'),
  };
}

/** A file's name as a page shows it: a script is `.txt` on disk only. */
export const shownName = (file: string) => file.replace(/\.ts\.txt$/, '.ts');

/** Where the built frames are served from, relative to the site root. */
export const FRAMES_PATH = 'learn-frames';

/** The package a frame's script imports, and where the build puts its modules. */
export const CORE_PACKAGE = '@cpangular/cp-theming-core';
export const CORE_MODULES = 'core';
