# material-theming — Claude Instructions

See [.github/copilot-instructions.md](.github/copilot-instructions.md) for the full
project context, conventions, non-negotiable design decisions, and what is stub vs real.

See [PLAN.md](PLAN.md) for the full architecture, current status, and development phases, and
[PORT-PLAN.md](PORT-PLAN.md) for phases 8–19.

## Quick Context

This is a CSS-variable-based theming system. Key facts:

- All color derivatives are **runtime** — computed by the browser via `oklch(from ...)`.
  Never compile-time Sass color functions.
- Colour inputs: **any CSS colour** (oklch, hex, `rgb()`, `hsl()`, …). Derivation: **oklch**,
  always `oklch(from …)` at runtime. oklch inputs are recommended, not required.
- Scripts and tests are **TypeScript run by Node 24** — never `.mjs`, `.cjs` or `.js`.
- Tests: `pnpm test` (CSS checks with `node --test`, API tests with vitest). A check today's code
  fails is marked `todo` with the phase that fixes it. Browser check: `pnpm --filter
  @cpangular/cp-theming-core render` (Playwright, local only).
- SCSS public API lives in `packages/theme-core/scss/_theme.scss` (`@cpangular/cp-theming-core`) — single `@use '@cpangular/cp-theming-core/scss/theme' as t;` import.
- Mode variation uses `t.light-dark($light, $dark)` wrapper — not CSS `light-dark()` for percentages.
- Cascade (Phase 9): core (`define-core-theme()`) derives once on `:where(:root, [theme])`; a theme
  rule holds only what was passed. Registered: the role colour pairs `--mode-light`/`--mode-dark`
  of the ten core palettes, the scalars. Load order: core, themes, adapter.
- Palette chain (Phase 14): brand → primary → secondary, tertiary → background, surface. `brand`
  and `tertiary` are core palettes; `--color--brand` is the brand palette's colour and is never
  adjusted. Core declares the generated colour of each chain palette once, on the shared selector,
  as a private variable (`--theme--_generated--{name}--{light|dark}`); `:where(:root)` points every
  pair of the chain at it, and a theme rule does so for each palette it left out that is
  downstream of something it passed. So the root generates everything, a nested theme only what
  follows from what it passed, the rest inherits, and a theme on `<html>` beats a default theme
  loaded beside it. A theme rule that passes a primary and no brand points its brand pair (and
  each role the primary sets) at its primary pair (Phase 14d, `emit-brand-from-primary`), so its
  brand palette is its primary and, on `<html>`, the root's neutrals take the primary's hue. The
  root never points brand at primary: with no theme the brand is grey and primary follows it.
  Semantic palettes default to their registered initial values. Checks:
  `test/css/chain.test.ts`, the `chain/` rows of `render.ts`, `demos/docs/test/chain.ts`.
- Chain numbers (Phase 14b): generated primary is the brand with L in 0.35–0.45 light / 0.65–0.82
  dark, C 0.22 at most; secondary `min(c, max(c / 3, 0.04))`, tertiary `min(c, max(c / 2, 0.08))`
  at hue + 60°. `bg()` on `background` / `surface` gives contrast text through the private
  `--container--_bg-text`; `bg()` itself declares no `color`.
- Gamut (Phase 14c): the generated primary, secondary and tertiary and `palette-from-var()` /
  `palette-from-brand()` are wrapped by `_in-gamut()` (`_palette.scss`) after the clamp and cap:
  four nested passes that multiply the chroma by `1 − 2 × overshoot` (worst sRGB channel outside
  0–1, counted up to 0.25), the factor carried in the alpha of `color(from … srgb r g b / …)`.
  Lightness and hue stay, so the painted hue is the one asked for (chain test: within 6°; the
  `gamut/` rows of `render.ts`). Do not let the overshoot count past 0.25: the factor reaches 0
  and a vivid teal brand turns grey. Chromium reports no hue for a non-oklch origin below chroma
  0.02, so a corrected colour that faint is painted at hue 0 there.
- Neutral stroke: the default stroke of `background` and `surface` (not the other palettes,
  whose stroke is the colour moved into a band per mode, see "Text role and accent stroke") is
  derived from the palette's colour to 4.6:1 against it when
  darker and 6:1 when lighter (white when out of reach; never under 4.58:1), from its luminance
  in closed form (`--theme--_stroke-*`, declared once on `:where(:root)` like the contrast step,
  "Neutral stroke" in `_palette.scss`). Checks: the stroke tests in `test/css/contrast.test.ts`
  (presets, fixtures, a sweep of colours) and the outline tests in the adapter's
  `material-roles.test.ts`.
- Contrast (Phase 10): `--contrast` is black or white by a step at relative luminance 0.179 in
  clamped linear sRGB; the step is declared once as `--theme--_contrast-step`. Every relative-colour
  derivation ends `/ 1` (only the tints carry an alpha); a harness check enforces it.
- Contrast preference (Phase 19, issue #8): `t.palette(…, $contrast: prefer-white | prefer-black)`,
  also through `$brand: t.palette(…)`. The palette's colour role (the colour and its six ladder
  steps; the high / low aliases follow) takes the preferred text colour wherever it reaches 3:1,
  the other elsewhere; the bg and stroke roles keep the default step. Two more private steps on
  `:where(:root)`, `--theme--_contrast-step--prefer-white` (cut-off luminance 0.30) and
  `--prefer-black` (0.10); the theme rule re-declares the seven contrasts with the one asked for
  (`_emit-contrast-preference`, also for the brand a primary-only theme points at its primary). A
  theme without `$contrast` declares no contrast. A nested theme re-derives with the default step
  unless it passes the preference itself. A preference in one config of `t.light-dark()` applies
  in that mode only. Not a fixed colour: that stays a hand-written `--color--x--contrast`.
  Checks: `test/css/contrast-preference.test.ts` (not a fixture: the fixtures are swept at
  4.5:1), the `prefer/` rows of `render.ts`, `node demos/docs/test/brand-text.ts` (the Palette
  page's live example and every figure it states).
- Text role and accent stroke (Phase 19, issues #15 and #9): every accent palette (every name
  but `background` and `surface`; custom names too) has a fifth role, `text`:
  `--color--{name}--text`, and `--palette-color--text` in a `[palette]` scope (cleared with
  `initial` in a background or surface scope). It is the colour with `min(l, 0.4)` in light mode
  and `max(l, 0.82)` in dark, hue and chroma kept, through `_in-gamut()`; a registered pair
  derived on the shared selector like stroke and focus (ten registrations per accent, eight per
  neutral: 125 in core), replaced by `$text` in `t.palette()` (a Sass error on a neutral). The
  accent stroke is per mode: `clamp(0.42, l, 0.55)` in light, `max(l, 0.65)` in dark (it was
  0.42–0.60 in both, which put a dark-mode accent's stroke under 3:1 on a filled field; the
  light ceiling was 0.60 until Session C, 2.9:1 for a pale green on the presets' surface), then
  through `_in-gamut()` like the text role. So a preset's stroke has its accent's lightness and
  hue in both modes; 33 of the presets' 64 accents are written outside sRGB, and those strokes
  have less chroma than the clipped fill. The Material adapter reads both
  (`theme-ng-material/scss/_tokens.scss`): labels Material paints in primary or error are
  `var(--color--{name}--text)`, the lines (a field's focused outline, active indicator, caret,
  arrow) `var(--color--{name}--stroke)`, declared by `define-ng-material-core-theme()` on
  `:where(:root, [theme])` (no specificity: an app's `html` rule wins) and, the primary ones, by
  `material-palette()` in every `[palette]` scope. Never declare one of them on a component: a
  value set on a toolbar or wrapper must reach the component (#9), and a check fails it. The
  adapter works out no lightness itself. `apply-material-overrides()` keeps the other patches.
  Checks: `theme-core/test/css/accent-roles.test.ts`, the `text/` and `line/` rows of core's
  `render.ts`, the accent-token tests in the adapter's `material-roles.test.ts`,
  `node demos/docs/test/material-tokens.ts` (built site: a wrapper's token reaches three kinds of
  button and a field), and the gallery run, which also measures every field's outline, indicator
  and arrow (below 3:1 fails).
- Surface scale (Phase 19, issue #12): the surface has five container colours,
  `--color--surface--container-lowest`, `-low`, `--color--surface--container`, `-high`,
  `-highest`, each with a `--contrast`: Material 3's surface containers, the surface moved by the
  lightness M3 puts between its surface and each container (light +0.0172, −0.0172, −0.0345,
  −0.0517, −0.069; dark −0.0238, +0.0362, +0.0534, +0.0965, +0.1396; `$surface-containers` in
  `_palette.scss`). Derived on the shared selector from the joined `--color--surface`, like the
  ladder; not registered; surface only. The adapter's `--mat-sys-surface-container-*` are
  `var()` of them, so there is one scale: never derive a container in the adapter again. The
  shade steps (`--high`, `--low`, ±0.12) stay as they are for every palette. The de-emphasis
  weight defaults per mode, 63% light and 93% dark (`_weights.scss`: a default may be a
  `(light, dark)` map), which is where Angular Material 22's tables have `on-surface-variant`
  on the default surface (its dark table has tone 90; the M3 guidelines' tone 80 would be 82%). Checks:
  `theme-core/test/css/surface-containers.test.ts`, the container tests in the adapter's
  `material-roles.test.ts` (core's distances against the tones of the installed Material's
  tables), the `container/` rows of core's `render.ts`, and `demos/docs/test/surface-scale.test.ts`
  (the Palette page's strip, and the table "Material's colour roles in cp-theming" on the
  ng-material API page and in the adapter's README against the adapter's compiled CSS).
- Page text (Phase 19, issue #13): core declares `--container--text`, `--container--text-emphasis`
  and `--container--text-deemphasis` on `:where(:root, [theme])` (`page-text()` in `_apply.scss`,
  included by `define-core-theme()`), against the **background**: the first two are
  `--color--background--contrast`, the third that contrast mixed with the background in oklch at
  the de-emphasis weight, each side of a `light-dark()` reading its own mode's weight (never the
  picked `--weight--text-deemphasis-blend`). `filled()` declares the same three against its fill
  through the same mixin (`_text-on()`); `bg()` and `outlined()` declare none, as Learn chapter 5
  says. The adapter's `--mat-sys-on-surface-variant` is the same mix at the same weight against
  the surface (`_roles.scss`, "Muted text"), not a tone offset: a theme's
  `$text-deemphasis-blend` moves both. The test evaluator (`test/lib/color.ts`) evaluates
  `color-mix()`. A hue written as a number is interpolated even at chroma 0, and the contrast
  colour is `oklch(l 0 0)`, so muted text on a strongly coloured fill drifts towards hue 0°;
  invisible on a near-neutral page or surface. Checks: `theme-core/test/css/page-text.test.ts`,
  the muted-text tests in the adapter's `material-roles.test.ts`, the `muted/` rows of core's
  `render.ts`.
- Material adapter (Phase 11): the `--mat-sys-*` colour roles come from Angular Material's own
  role tables (`theme-ng-material/scss/_roles.scss`); roles cp-theming has a token for map to it
  (containers are `--bg`, one ladder step lighter in dark mode; the five surface containers are
  core's `--color--surface--container-*`), the rest are `m3-tone()` of the theme colour, and the
  other neutral roles (dim, bright, the variants) are offsets from `--color--surface`. `outline` is `--color--surface--stroke` and `outline-variant` its `--low`
  step, so a theme's surface `$stroke` drives every Material outline. Tokens that read a cp-theming variable sit on `:root, :where([theme])`.
  State-layer opacities are numbers (`calc(weight / 100%)`), as Material expects. Harness checks
  fail any `--mat-sys-*` name the installed Material reads that the adapter does not declare, and
  any component token the adapter sets that Material does not read.
- Startup (Phase 12): `theme-core/src` touches no storage at import; every storage access is
  guarded. `themeHeadSnippet` (inline `<head>` script, built from `src/storage-keys.ts`) applies the
  saved theme and mode before first paint; `demos/docs/src/index.html` carries a copy that a vitest
  check compares with the export. Browser check: `node demos/docs/test/startup.ts` (needs
  `pnpm --filter docs build`). The docs build keeps critical-CSS inlining off: it drops the theme rules
  from the first frame.
- Docs examples (Phase 7 resumed): every Sass, CSS and attribute sample the docs show is a file
  in `demos/docs/src/examples/{page}/`, imported as text (`with { loader: 'text' }`) and shown by
  `cpa-code` / `cpa-theme-example` (which renders an attribute example from the same `.html`).
  `demos/docs/test/examples.test.ts` compiles every `.scss` through the packages' `exports` with
  zero warnings and runs the undefined-variable check on core + a preset + the example; a
  fragment that cannot be checked is named `*.display.*`. Never write such a sample in a page
  template (a check fails). The examples are in `.prettierignore`: their layout is part of the
  sample. Contrast report over the built showcase: `node demos/docs/test/render.ts`.
- Component gallery (Phase 15): the ng-material **Components** page renders every Angular
  Material family from `demos/docs/src/examples/components/*.ng.html`, each the `templateUrl`
  of a component in `pages/components/gallery.components.ts`, so what the page shows is what
  runs. The check allows HTML, Material and library elements and attributes only, no `style`,
  layout classes only (`gallery-layout.scss`, which may not declare a colour). Never colour a
  gallery example: a wrong colour is fixed in the adapter or as a measured patch in
  `apply-material-overrides()`. `*.ts.txt` is TypeScript the docs show, verbatim from a source
  file. `node demos/docs/test/render.ts` screenshots the gallery per preset and mode with every
  overlay open (`--only=gallery`, `--preset=`, `--mode=`, `--section=`); a component label below
  4.5:1 fails the run, and so does a line of a form field (outline, active indicator, select
  arrow) below 3:1 against what it is drawn on (one more screenshot with those lines made
  transparent; `gallery-{engine}-lines.txt`). The docs read the adapter's built CSS: after a change in
  `packages/theme-ng-material/scss/`, run `pnpm --filter @cpangular/cp-theming-ng-material build`
  before `npx ng build docs` (root `pnpm build` runs the docs' own build, which builds the adapter).
- Releases (Phase 13): cpdevtools/git-flow. Every manifest carries `0.0.0-MAIN`; the version is
  `.publish/versions.yml` (changed only by `pnpm gitflow version`, which the user runs). A push
  updates a draft release PR into `release/<branch>`; merging it publishes to GitHub Packages.
  Never merge it, never merge into `main`. theme-core packs with `publishConfig.exports`,
  theme-ng-core with `publishConfig.directory` (ng-packagr output; its production tsconfig reads
  core's built types, so build core first), theme-ng-material as plain Sass/CSS.
- Docs site and demo-core (Phase 16): `demos/docs` is a git-flow `static-site` artifact
  (`pagesRoot`, `deploy: [gh-pages]`). `pnpm --filter docs build` builds core, the adapter and
  `demos/demo-core`, runs the production `ng build`, then `demos/docs/scripts/assemble.ts` copies
  demo-core to `dist/docs/browser/demos/demo-core/` and writes `404.html`. Merging a release PR
  attaches the site to the release; it does not deploy. `pnpm gitflow deploy` (the user runs it)
  dispatches `.github/workflows/deploy-production.yml`, which commits the site to `gh-pages`.
  The site has a `<base href>`: a link to a file of the site is relative to the site root
  (`demos/demo-core/index.html`), and `href="#section"` stays on the page only because
  `packages-layout.component.ts` handles the click. An example's `href` is a fragment, an
  absolute path or a URL (a check fails anything else). demo-core uses the public `theme` module
  only; root `pnpm build` builds core, the two example theme packages, demo-core and the docs site.
- Learn track (Phase 17, ten chapters and their review pass; chapter 11 is Phase 18):
  `demos/docs/src/app/learn/chapters.ts` is the chapter list plus the order check's tables,
  `PATTERNS` (text a chapter introduces) and `REFS` (Reference entries prose may name, with the
  chapter and the section each links to). A chapter is `learn/chapters/NN-name.component.ts`: the
  five parts of `cpa-chapter` (`chapterExample`, `chapterIdea`, `chapterCode`, `chapterTry`,
  `chapterNow`), library names only through `<cpa-ref name="…" />`. Its live examples are files
  in `src/examples/learn/NN-name/`: `theme.scss` (complete, core included), `example.html`,
  optional `example.scss`, and `X.html` / `X.scss` / `X.theme.scss` for a variation frame `X`.
  From chapter 9 a frame may run a script: `example.ts.txt` (TypeScript; `.txt` because the
  Angular build would compile a `.ts` it imports as text; the examples test type-checks it against
  core's source and the build runs it with its types taken off) and `head.html` (goes into
  `<head>`; a vitest check holds it to `themeHeadSnippet`). `X.app.ts.txt` is an excerpt of the
  docs app, not a frame. A frame with a script also gets the docs' `frame-storage.js`, which keeps
  its saved theme under its own storage keys so it cannot change the site's. Chapter 10's example
  is an Angular template, `example.ng.html`, rendered in the page by `cpa-live-template` through
  `chapters/10-material.examples.ts`; its two themes are defined again in `src/styles.scss` and a
  test keeps them equal to the chapter's `theme.scss`. `cpa-live-example` takes `controls` (a
  colour picker or a slider that sets custom properties or an attribute in the frame), `measures`
  (contrast ratios the page reads out of the frame) and `ownMode`. `demos/docs/scripts/learn.ts`
  runs the order check (exit 1 on a violation) and writes the frames to
  `demos/docs/.generated/learn-frames/`. A chapter may use only what earlier chapters introduced:
  when one needs something new, add it to `PATTERNS` / `REFS` under that chapter. Checks:
  `demos/docs/test/learn.test.ts` (in `pnpm test`), `node demos/docs/test/learn.ts` (browser:
  every chapter in light and dark, and what each of chapters 6–10 claims).
- Theme packages (Phase 18): `demos/demo-brand-core` is `@acme/theme` and
  `demos/demo-brand-material` is `@acme/theme-material`, both `private` and never published, each
  shaped like a package a company would publish: `scss/_index.scss` (the theme as `$theme` and a
  `define($default: true)` mixin; the Material one includes the theme, the adapter, its patches
  and density scopes, and Acme's own `overrides()`), a one-line `_index.scss` at the package root
  that forwards it (what `@use "@acme/theme"` finds by folder; `exports["."]` names it under the
  `sass` condition), a build entry that compiles to `dist/*.css` with the load order in its
  header, cp-theming as `workspace:^` peers, `pack:check`, and a README whose file list
  `pnpm pack --dry-run` has to match. Neither holds core. Consumers: `demos/demo-core` imports
  `@acme/theme/css` (after core, before ocean, so ocean stays its default); the docs app's
  `styles.scss` includes `acme.define($default: false)` and the theme switcher offers `acme`.
  `demos/docs/test/theme-packages.test.ts` (in `pnpm test`) builds both, holds the compiled CSS
  to what `define()` emits, the pack listing to the README and the consumers to their path.
  Learn chapter 11 (`11-package`) shows both paths: its `css` frame has a plain CSS theme,
  `css.theme.css`, which holds `@import`s of package CSS only and which `scripts/learn.ts` turns
  into `<link>`s (`.generated/learn-frames/packages/`); the chapter and the core Guides page
  import the package's `scss/_index.scss` and `package.json` as text from the package itself.
  `packages/theme-core/test/lib/sass.ts` resolves `@acme/…` through the packages' `exports` like
  `@cpangular/…`. Browser: `node demos/docs/test/learn.ts` (both apps paint the same);
  `node demos/docs/test/render.ts --only=showcase --theme=acme`, `--only=gallery --preset=acme`.
- Package `exports` (Phase 19, issue #7): the Angular CLI resolves a bare `@use` with esbuild
  under the `style` / `sass` conditions and takes the target exactly as mapped (no partial
  underscore, no extension). So every Sass entry point the docs name has its own entry under the
  `sass` condition pointing at the real file (`./scss/theme` → `./scss/_theme.scss`), and
  `./scss/*.scss` hands a full file name through. Never a bare `./scss/*` pattern. A new entry
  point goes into `exports` and, in core, into `publishConfig.exports` as well (the two may differ
  only at `.`). The harness importer (`test/lib/sass.ts`) fails a target that is not a file as
  written; `demos/docs/test/exports.test.ts` resolves every `@use` / `@forward` / `@import` of a
  package that the docs, READMEs and sources show with `@angular/build`'s own esbuild, against
  both maps. The docs app has no include path into `node_modules`.
- Page rule (Phase 19, issue #10): core styles no element. `t.apply-document-base()` is the
  opt-in: one `:where(body)` rule (background colour, its contrast as text, the plain font
  family; zero specificity, so an app's `body` rule wins in any load order; no font size, margin
  or scrollbar colours). `scss/base.scss` compiles it to `dist/base.css`, exported as
  `./css/base`. The docs app includes the mixin and keeps Roboto on top; `demos/demo-core`
  imports `css/base`. Checks: `test/css/base.test.ts`, the `base/` rows of `render.ts`,
  `node demos/docs/test/page-base.ts` (built site, three engines). Getting Started has "Style
  the page" and "Coming from ng-material-theme".
- CSS Variables page (Phase 17): generated. `demos/docs/scripts/variables.ts` reads the compiled
  `core.css` (`scripts/lib/variables.ts`) and writes `demos/docs/.generated/variables.ts`, which
  `pages/variables.component.ts` imports: one live swatch per colour token by palette and role
  (`variables/colour-swatches.component.ts`, with a theme and mode switch), one table row per
  other variable. A name that fits nowhere throws, which fails the build and
  `test/variables.test.ts`: give a new token family a place in `TABLES`. `NOTES` there is the
  only hand-written part. Never list a variable in the page's template.
- The docs need both generated parts before `ng build` / `ng serve`: `pnpm --filter docs build`
  (and `start`, `dev`, `build:dev`) run them; before a bare `npx ng build docs`, run
  `pnpm --filter docs generate` once. Browser check of the page: `node demos/docs/test/variables.ts`.
- `watchMode()` observes `themeMode` and `thememode`: an HTML document stores an attribute's name
  in lower case, and a MutationObserver filter is compared with the stored name
  (`test/api/watch.spec.ts`).
- A box-shadow token cannot be wrapped in `light-dark()` (colours only): each layer of
  `--elevation-N--shadow` is `<geometry> light-dark(<colour>, <colour>)`; a harness check fails a
  list inside `light-dark()`.
- Elevation (Phase 19, issue #11): levels 1–5 are Material's three layers each (key, penumbra,
  ambient; `$_geometry` in `_elevation.scss`, the lengths Angular Material draws for elevations
  1, 3, 6, 8 and 12). The default layer colours are written out: black at 20 / 14 / 12% in light
  mode, 33.3 / 23.3 / 20% in dark (shares 2/3, 7/15 and 2/5 of 30% and 50%). An author's
  `$shadow-color` is shared out the same way by the browser,
  `oklch(from <colour> l c h / calc(alpha * <share>))`, the one relative colour that does not end
  `/ 1` besides the tints (the contrast check knows it). A `$levels` shadow is used as written,
  with as many layers as it has; `_compatible()` / `_by-mode()` walk multi-layer lists. Checks:
  `theme-core/test/css/elevation.test.ts`, the elevation test in the adapter's
  `material-roles.test.ts` (core's default against Material's own `get-box-shadow()`), the
  `elevation/` rows of core's `render.ts` (`read: 'shadow'` with `layer`, and
  `read: 'shadow-geometry'`). `core.css` may be 16.5 KiB gzipped since this session
  (`registry.test.ts` says why).
- Focus ring color is **per-palette**, auto-derived via CSS relative color.
- `cp-theming-core` has **zero Angular dependency**.
- Most packages are currently **stubs** — implement with `// TODO(phase-N):` comments.
- `cp-theming-material` targets **Angular Material M3 only** (Angular Material 17+). No M2 support.
- Do not use `@forward ... show X as Y` — invalid SCSS; use wrapper functions instead.
- Do not copy from the old `ng-material-theme` repo.
