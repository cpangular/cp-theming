# cp-theming

> **Status: Early Development** — Core SCSS authoring API is functional. Most packages are stubs.

A modern CSS-variable-based theming system for Angular applications. All color derivatives are computed at **runtime by the browser** via CSS relative color syntax (`oklch(from ...)`). Angular Material is an optional adapter layer, not a core dependency.

---

## Install

The packages are published to GitHub Packages, not npmjs.com. GitHub Packages needs the scope's
registry line and a token in the consumer's `.npmrc`, even for public packages (a classic personal
access token with `read:packages`; in GitHub Actions, `GITHUB_TOKEN`):

```ini
# .npmrc
@cpangular:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```bash
npm install @cpangular/cp-theming-core                    # framework-agnostic core
npm install @cpangular/cp-theming-ng-core                 # Angular wrapper (peer: core)
npm install @cpangular/cp-theming-ng-material             # Angular Material adapter, Sass and CSS (peers: core, ng-core)
```

Until the first stable release every version is a pre-release, so install one by its dist-tag or
exact version (see the repository's Releases).

## Packages

| Package | npm | Status |
|---|---|---|
| `packages/theme-core` | `@cpangular/cp-theming-core` | 🟡 In Progress — SCSS real, TS API real (Phase 3 done), harness in `test/` (Phase 8 done), cascade: core derives once, a theme is one rule (Phase 9 done), contrast by luminance step (Phase 10 done), palette chain: `brand` and `tertiary` are core palettes and a theme passes only the colours it has (Phase 14 done), generated accents kept inside sRGB so their hue is the one painted (Phase 14c done), a theme without a brand has its primary as its brand palette (Phase 14d done) |
| `packages/theme-ng-core` | `@cpangular/cp-theming-ng-core` | ✅ Done — `ThemeService`, `ThemeDirective`, `ThemeModeDirective` |
| `packages/theme-ng-material` | `@cpangular/cp-theming-ng-material` | ✅ Done — every `--mat-sys-*` token Angular Material 22 reads (186 declared), colour roles from Material's own role tables (Phase 11 done), tertiary roles from `--color--tertiary` (Phase 14 done), `[palette]` scopes for the eight accent palettes, six measured component patches in `apply-material-overrides()` (Phase 15 done), density scopes |
| `packages/theme-material` | `@cpangular/cp-theming-material` | ⬛ Stub |
| `packages/theme-m3` | `@cpangular/cp-theming-m3` | ⬛ Stub |

## Demos

| Demo | Description | Status |
|---|---|---|
| `demos/docs` | Angular 22 + Material 22 docs/showcase site | 🟡 In Progress — all pages built; every Sass, CSS and attribute sample is a real file under `demos/docs/src/examples/`, compiled and checked by `pnpm test` and rendered live from the same file; theme + mode switching working, saved theme and mode painted on the first frame (`node demos/docs/test/startup.ts`), a Components page in the ng-material section with every Angular Material 22 component family live (27 sections, the accent families repeated under `palette="secondary"`, `"tertiary"`, `"error"` and `"brand"`, and the overlays inside a nested `theme` and a nested `themeMode`; Phase 15 done), painted-contrast report over the showcase and the component gallery, where a component label below 4.5:1 is an error (`node demos/docs/test/render.ts`), pixel check of the palette chain on Getting Started and the showcase (`node demos/docs/test/chain.ts`); a Learn track (Phase 17, ten chapters; the review pass is not done) whose live examples are built into frames by `node demos/docs/scripts/learn.ts` and held to the chapter order by `demos/docs/test/learn.test.ts`; a CSS Variables reference page generated from the compiled `core.css` (`node demos/docs/scripts/variables.ts`), one live swatch per colour token; TypeScript, shell and JSON samples outside the Learn track are still hand-written; its build (`pnpm --filter docs build`) includes `demo-core` under `demos/demo-core/`, linked from the home page and the core Getting Started page; released as a git-flow `static-site` artifact and deployed to GitHub Pages with `gitflow deploy` (see Docs site below; not deployed yet) |
| `demos/demo-core` | Vanilla TS + Vite | 🟡 In Progress — builds again (root `pnpm build` and CI build it): two themes, modes, tones, nested themes and density through the public `theme` module only (`t.apply-palette()`, `t.tone()`, `t.bg()`, `t.filled()`, `t.outlined()`, `t.container()`); the docs build copies it into the site as the live demo. Still a single hand-written page with no tests of its own |
| `demos/demo-material` | Angular + Material adapter | ⬛ Stub |
| `demos/demo-brand-core` | Example brand theme pack | ⬛ Stub |
| `demos/demo-brand-material` | Example brand + Material | ⬛ Stub |

---

## Development Phases

| Phase | Description | Status |
|---|---|---|
| 1 | Workspace scaffold, SCSS authoring API | ✅ Done |
| 2 | Preset palettes + themes (`scss/presets/`) | ✅ Done |
| 3 | `theme-core` TS API (real implementation) | ✅ Done |
| 4 | Precompiled CSS per preset theme | ✅ Done |
| 5 | `theme-ng-core` — Angular signals wrapper | ✅ Done |
| 6 | `theme-ng-material` — Angular Material M3 adapter + density scopes | ✅ Done |
| 7 | `demos/docs` — Documentation + showcase site | 🟡 In Progress — docs examples are real, checked files (PORT-PLAN.md "Phase 7 (resumed)" done); the four demos below the docs are still stubs |
| 8 | Test harness and CI (`node --test` CSS checks, vitest API tests, Playwright `render.ts`, git-flow `test.yml`) | ✅ Done |
| 9 | Cascade: a theme is one rule; core derives once | ✅ Done |
| 10 | Contrast and alpha (`--contrast` by a luminance step; every derivation opaque except the tints) | ✅ Done |
| 11 | Material adapter from Material's role tables (`--mat-sys-*` roles computed from Material's tables, checked against what its components read) | ✅ Done |
| 12 | Startup: no flash, safe import (lazy guarded persistence, `themeHeadSnippet`, browser-only work skipped off-browser) | ✅ Done |
| 13 | Release through cpdevtools/git-flow (`0.0.0-MAIN` in every manifest, `.publish/`, the release workflows, `gitflow pack` for the three packages; GitHub Packages only; the docs deploy joins once the repo is public) | ✅ Done |
| 14 | Brand and accent palettes: pass what you have, the rest are generated (`brand` and `tertiary` core palettes; the chain brand → primary → secondary, tertiary → background, surface; semantic defaults; Material tertiary from `--color--tertiary`) | ✅ Done |
| 14b | Follow-ups from the Phase 14 review: chroma floors for the generated secondary and tertiary, the generated primary readable on the generated background in every hue, `bg` on `background` and `surface` with readable text, Showcase back in the ng-material sidebar | ✅ Done |
| 14c | Generated colours stay inside the screen's gamut: the generated primary, secondary and tertiary and `palette-from-var()` / `palette-from-brand()` give up chroma until sRGB can show them, so an orange brand no longer gets a red primary | ✅ Done |
| 14d | A theme without a brand uses its primary as the brand: the brand pair of such a theme points at its primary pair, so `palette="brand"` on a preset paints the preset's primary; with no theme the brand stays grey | ✅ Done |
| 15 | Material component gallery in the ng-material docs (Components page, every family an example file, `render.ts` screenshots it per preset and mode with overlays open and fails a component label below 4.5:1) | ✅ Done |
| 16 | Wrap-up: the docs site as a git-flow `static-site` artifact deployed to GitHub Pages (`pages.yml` deleted), `demos/demo-core` building again and hosted inside the docs site, gallery demo links as same-page anchors with a check that refuses a relative `href` | ✅ Done — in the repo; the first deploy has not been run |
| 17 | Docs that teach: a Learn track of ten chapters with live examples, the existing pages as the Reference underneath | 🟡 In Progress — the ten chapters are written and pass the order check: Learn / Reference / Explore navigation with Learn first on the home page, the chapter page shape, live examples as files under `demos/docs/src/examples/learn/` that the docs build renders into `<iframe>` documents with their source beside them (chapter 9's with a script, chapter 10's rendered by Angular from the Components gallery), the order check, which fails the build, and the Reference's CSS Variables page generated from the compiled `core.css`. The review pass (one reader per chapter) is not done |

Phases 8–17 are specified in [PORT-PLAN.md](PORT-PLAN.md); 14, 14b, 14c, 14d and 15 were done before 13.

### Docs site

The docs are served by GitHub Pages at <https://cpangular.github.io/cp-theming/>, from the root of
the `gh-pages` branch. `demos/docs` is a git-flow `static-site` artifact
(`demos/docs/release-artifacts.yml`): merging a release PR builds the site and attaches it to the
`docs` release, as `docs-site.zip` and the deploy bundle `deploy-gh-pages.zip`. Merging does not
deploy. A deploy is a separate step a person starts:

```bash
pnpm gitflow deploy     # pick Production, the branch, the version and the docs package
```

which runs `.github/workflows/deploy-production.yml`; that commits the site to `gh-pages`. Once,
by hand: set the repository's Pages source to the `gh-pages` branch (Settings → Pages → Deploy
from a branch → `gh-pages`, `/ (root)`). The site includes `demos/demo-core` at
`demos/demo-core/index.html`.

### Releases

Versions, tags and publishing run through [cpdevtools/git-flow](https://github.com/cpdevtools/git-flow).
Every manifest carries the placeholder `0.0.0-MAIN`; the real version is the one line in
`.publish/versions.yml` (`0.1.0-alpha.0`). Every push keeps a draft release PR from the branch into
`release/<branch>` up to date; merging that PR builds, packs and publishes the three packages to
GitHub Packages. A branch with a slash publishes pre-releases that carry its name
(`0.1.0-feature.<name>.alpha.0`); `main` publishes `0.1.0-alpha.0` itself. Merging a release PR,
merging into `main` and `pnpm gitflow version` are done by hand.

| Package | Packed from | Contents |
|---|---|---|
| `@cpangular/cp-theming-core` | its own directory; `publishConfig.exports` points `.` at the built JS and types | `dist/` (JS, types, CSS), `scss/` |
| `@cpangular/cp-theming-ng-core` | its own directory with `publishConfig.directory` set to the ng-packagr output (`dist/theme-ng-core`), so the `workspace:^` peer is rewritten | `fesm2022/`, `types/` |
| `@cpangular/cp-theming-ng-material` | its own directory, as a plain Sass/CSS package while its TypeScript API is empty | `dist/` (CSS), `scss/` |

`theme-m3` and the demos are not published. To pack locally, set the version and build first, as the
pipeline does: `pnpm exec gitflow apply-version <version>`, `pnpm run github.actions.build`, then
`PROJECT_NAME=<name> PROJECT_VERSION=<version> pnpm run github.actions.pack` in each package, and
restore the placeholder afterwards.

### Browser baseline

`packages/theme-core/test/render.ts` (258 rows: `themeMode` on any element, nested themes, coexisting
presets, user overrides, the theme-switch crossfade, the eight defects the Phase 9 critique
confirmed, the browser-computed `--contrast` against the contrast sweep's prediction for a
sample of colours, the Material roles, state layers and shadows of Phase 11, and the palette
chain of Phase 14: what is generated for a theme with only a brand, only a primary, a nested
theme, a theme beside a loaded default, and what a nested theme inherits; and the text colour of
`bg` on the neutral palettes, Phase 14b; the painted hue of the primary generated from an orange,
a yellow and a blue brand, Phase 14c; the brand of a theme that passes only a primary, both, only
a brand, a nested theme with only a secondary, and no theme, Phase 14d) passes 258 of 258 in the Playwright builds
installed here: **Chromium 158**, **Firefox 159** and **WebKit 27.2** (the Safari engine; run with
`node test/render.ts webkit`). WebKit gets the OS colour scheme pinned into the CSS rather than
emulated, because Playwright's emulated dark scheme makes WebKit resolve `light-dark()` to dark
whatever `color-scheme` says, which real Safari does not do. No Mac is available, so Safari itself is
unverified; `node test/render.ts --html` writes `dist/render.html`, a self-contained page that runs
every row in whatever browser opens it and prints a pass count, for whenever one is. The newest
features the cascade needs are `light-dark()` (Chrome 123, Firefox 120, Safari 17.5), `@property`
(Chrome 85, Firefox 128, Safari 16.4) and relative colour syntax (Chrome 119, Firefox 128, Safari
16.4), so the expected floor is Chrome 123, Firefox 128 and Safari 17.5. The palette chain adds no
newer feature. The Material adapter's
state layers also need typed `calc()` division (a percentage divided by `100%`), which the three
builds above evaluate; the oldest versions that do have not been checked, and a browser without it
shows Material components without hover, focus and press layers.

---

## Getting Started

```bash
pnpm install
pnpm build         # builds @cpangular/cp-theming-core and demos/demo-core
pnpm --filter docs build   # the docs site as it is deployed: core, the adapter and demo-core first, then ng build, then demo-core copied to dist/docs/browser/demos/demo-core/
pnpm build.core    # the same, by name
pnpm --filter @cpangular/cp-theming-ng-material build   # the adapter's CSS; the docs app reads it, so run it before `npx ng build docs` after a change in scss/
pnpm test          # CSS checks (node --test) + TypeScript API tests (vitest) in both packages, and the docs examples
pnpm fix           # format all files with prettier
pnpm --filter @cpangular/cp-theming-ng-core build   # the Angular wrapper (ng-packagr → dist/theme-ng-core); needs core built

# Browser check of the cascade (Playwright, Chromium + Firefox; local only)
pnpm --filter @cpangular/cp-theming-core render

# Browser check of startup: saved theme and mode painted before the docs bundle runs (local only)
pnpm --filter docs build && node demos/docs/test/startup.ts

# Painted contrast over the built showcase and the component gallery: every preset, light and dark,
# as loaded, hovered, focused and with overlays open; screenshots in dist/docs-render/ (local only).
# A component label below 4.5:1 fails the run. About 14 minutes per engine for the gallery.
pnpm --filter docs build && node demos/docs/test/render.ts chromium firefox --jobs=8
# One part of it: --only=gallery|showcase --preset=rose-red --mode=dark --section=card,buttons

# Pixel check of the palette chain on the built docs: the brand swatch, three accents per preset (local only)
pnpm --filter docs build && node demos/docs/test/chain.ts

# The generated parts of the docs. `pnpm --filter docs build` (and its start / dev / build:dev)
# runs both before `ng build`; a bare `npx ng build docs` does neither, and fails without the
# second, so run them first: `pnpm --filter docs generate`.
node demos/docs/scripts/learn.ts       # order check + frames into demos/docs/.generated/learn-frames
node demos/docs/scripts/variables.ts   # the CSS Variables page's data, read from compiled core.css
# Browser check of the Learn track: every chapter's examples rendered, source beside them,
# Reference links, and what chapters 6–10 claim; screenshots in dist/docs-render/learn/ (local only)
pnpm --filter docs build && node demos/docs/test/learn.ts chromium firefox webkit
# Browser check of the CSS Variables page: a swatch per colour token, the theme and mode switch,
# the tables; screenshots in dist/docs-render/variables/ (local only)
node demos/docs/test/variables.ts chromium firefox webkit
```

---

## SCSS Usage (theme-core)

```scss
@use '@cpangular/cp-theming-core/scss/theme' as t;

// Pass the colours you have. Here: the brand colour and one accent.
$my-theme: t.theme(
  $brand: #ff6a00,                 // kept exact: palette="brand", --color--brand
  $palettes: (
    secondary: t.light-dark(t.palette(oklch(0.45 0.12 200)), t.palette(oklch(0.78 0.10 200))),
  ),
  $weights:    t.light-dark(t.weights(), t.weights($text-blend: 78%)),
  $typography: t.typography($plain-family: system-ui),
);

@include t.define-core-theme();                                   // once, first: registrations, defaults, derivations
@include t.define-theme('my-theme', $my-theme, $default: true);  // one rule holding only what was passed
```

A theme declares only what its author passed and core derives everything once, so `themeMode`
works on any element, themes nest and inherit, presets coexist, an author's own `:root` rule wins,
and a theme switch crossfades when the registered light/dark colours are transitioned.

Colours follow the chain **brand → primary → secondary, tertiary → background, surface**. A theme
passes whichever it has and the browser generates the rest from the nearest one it passed: above,
primary is the brand moved into the lightness that reads on the page, tertiary is primary's hue
turned 60° with half its chroma (0.08 at least), and background and surface are neutrals with a trace of the
brand's hue. A theme that passes a primary and no brand has that primary as its brand palette. Pass one, two or three accents; `error`, `warn`, `caution` and `pass` have defaults.

---

## Design Principles

- **Runtime derivatives** — `oklch(from var(--pal-primary--color) calc(l - 0.1) c h)`, not `darken($color, 10%)`
- **Any colour in, oklch out** — pass palette colours in any CSS format (oklch, hex, `rgb()`, `hsl()`); every derivative is computed in oklch, so steps stay perceptually uniform
- **Single SCSS import** — one `@use` gives the full authoring surface
- **Pass what you have** — the brand colour is kept exact, and a theme that passes none uses its primary as the brand; the primary, accents and neutrals a theme leaves out are generated from the nearest colour it passed
- **Per-palette focus color** — focus ring is derived per palette, not global
- **Framework-agnostic core** — `theme-core` has zero Angular dependency
- **M3 only** — `theme-material` targets Angular Material 17+ (M3). No M2 support.

See [PLAN.md](PLAN.md) for the full architecture and CSS variable reference.
