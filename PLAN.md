# material-theming — Development Plan

## What This Is
A modern CSS-variable-based theming system, built as the successor to
`@cpangular/ng-material-theme`. Core philosophy: **all color derivatives are
computed at runtime by the browser** via CSS relative color syntax (`oklch(from ...)`).
Angular Material is an optional adapter layer, not a core dependency.

## Package Map

```
packages/
  theme-core/          @cpangular/cp-theming-core
  theme-ng-core/       @cpangular/cp-theming-ng-core
  theme-material/      @cpangular/cp-theming-material
  theme-m3/            @cpangular/cp-theming-m3       ⬛ stub

demos/
  demo-core/           Vanilla TS + Vite
  demo-material/       Angular app (Material adapter)
  demo-brand-core/     Example: company creates own theme pack
  demo-brand-material/ Example: company wires brand into Material
```

### @cpangular/cp-theming-core
The only package with real implementation initially. Contains:
- **SCSS theme authoring API** — `t.palette()`, `t.theme()`, `@include t.define-theme()`, `@include t.define-core-theme()`, etc.
- **CSS variable system** — all `--color--*`, `--weight--*`, `--space--*`, `--shape--*`, `--motion--*`, `--elevation-*` vars. Registered as typed `@property`: what animation needs (each core palette role's light and dark colour, and the scalars); the role tokens and every derivative are unregistered `light-dark()` / `oklch(from …)` expressions that resolve where they are used
- **Palette chain** — brand → primary → secondary, tertiary → background, surface: a theme passes what it has (`$brand`, one, two or three accents) and core generates the rest at CSS runtime; the brand colour is kept exact, the primary made from it is adjusted for readability; a theme that passes a primary and no brand has that primary as its brand palette
- **Brand color API** — `t.palette-from-brand()`, `t.background-from-brand()`, `t.surface-from-brand()` derive palettes from `--color--brand` at CSS runtime, for numbers other than the ones core generates with
- **Preset palettes + themes** — azure-blue, rose-red, cyan-orange, magenta-violet (M3-inspired)
- **Vanilla TS API** — `ThemeMode`, `setTheme()`, `setMode()`, `watchMode()`, `watchTheme()`, `getAvailableThemes()`, `configurePersistence()`, etc.
- **Precompiled CSS** — `dist/core.css` (shared), `dist/presets/{theme}.css` (one per preset), for users without Sass

### @cpangular/cp-theming-ng-core
Signal-based Angular wrapper around cp-theming-core. No Angular Material dependency.
- `ThemeService` — `theme`, `mode`, `effectiveMode` signals
- `[cpaTheme]` structural directive

### @cpangular/cp-theming-material
SCSS adapter mapping our CSS vars → Angular Material `--mat-sys-*` tokens.
- **M3 only** — Angular Material 17+ (M3). No M2 support.
- `material-core()` mixin — invariant Angular Material token overrides
- Typography + density passthrough to Angular Material
- Depends on cp-theming-ng-core + cp-theming-core

### @cpangular/cp-theming-m3  ⬛ stub
Same concept as cp-theming-material but without the Angular Material dependency.
Maps our vars → plain M3 reference/system/component CSS tokens.

### Demos
Each demo is a consumer project showing a specific use case. No library code here.

---

## Design Principles (do not reverse these)

1. **Runtime derivatives** — Browser computes all color variants. No Sass
   color math. `oklch(from var(--pal-primary--base) calc(l - 0.1) c h)` not
   `darken($color, 10%)`.

2. **Single SCSS import** — `@use '@cpangular/cp-theming-core/scss/theme' as t;`
   gives the entire authoring API.

3. **Typed sub-configs** — All theme settings use named builder functions
   (`t.weights()`, `t.typography()`, etc.), never raw maps. Makes API
   discoverable and type-safe.

4. **light/dark via t.light-dark()** — The universal wrapper for anything that
   varies by mode. Works for palettes, weights, overlays, elevation. Does NOT
   use CSS `light-dark()` for percentages (only valid for `<color>`).

5. **Per-palette focus color** — Focus ring color is derived per palette via
   CSS relative color, not a global. A blue focus ring on a blue surface is
   invisible. `--pal-{name}--focus` is auto-derived unless overridden.

6. **Framework-agnostic core** — `theme-core` has zero Angular dependency.
   Angular belongs in `theme-ng-core`.

7. **Any colour in, oklch out** — Authors may pass any CSS colour (oklch, hex, `rgb()`,
   `hsl()`, …). Every derivative is computed in oklch at runtime, so steps stay perceptually
   uniform whatever the input. oklch inputs are recommended for predictable steps.

---

## CSS Variable Conventions

`--` separates namespace segments (like `.` in OOP). `-` is a word separator within a segment.
The `color` role is the palette's primary identity — it becomes the namespace prefix with no trailing segment.

```
--color--{name}                      primary identity color (no role suffix)
--color--{name}--contrast            black or white (whichever contrasts more)
--color--{name}--dark                lightness − 0.12
--color--{name}--darker              lightness − 0.24
--color--{name}--light               lightness + 0.12
--color--{name}--lighter             lightness + 0.24
--color--{name}--high                mode-relative: darker in light, lighter in dark
--color--{name}--higher
--color--{name}--low                 mode-relative: opposite of high
--color--{name}--lower
--color--{name}--bg                  background role (same full derivative set)
--color--{name}--stroke              stroke/border role (same full derivative set)
--color--{name}--focus               focus ring color (auto-derived or explicit)
--color--{name}--tint-1..5           transparent tints at 10%/20%/38%/60%/80%
--color--brand                       the brand palette's color: the brand colour as given, never adjusted
--color--{brand|tertiary}--…         brand and tertiary are core palettes: the full set above

--weight--text-blend                 blend percentages for text/state overlays
--weight--text-emphasis-blend
--weight--text-deemphasis-blend
--weight--text-primary-tint
--weight--state-hover/press/focus/drag
--weight--tint-1..5

--overlay--scrim / --overlay--shadow

--density-scale                      0 (default) to −5 (most compact)
--space--xxs .. --space--xxl         calc() using density-scale

--shape--xxs .. --shape--full        corner radii

--focus--width / --focus--offset / --focus--style

--motion--duration-short/medium/long/extra
--motion--easing-standard/emphasized/decelerate/accelerate

--elevation-{0..5}--shadow
--elevation-{0..5}--tint

--palette-color                      scope vars: active palette's color role
--palette-color--bg / --stroke / --focus / --tint-1..5
--container--text / --text-emphasis / --text-deemphasis / --stroke
```

`dist/core.css` registers 109 typed `@property` declarations: `--color--{name}[--bg|--stroke|--focus]--mode-light` / `--mode-dark` for the ten core palettes (80: `background`, `surface`, `brand`, `primary`, `secondary`, `tertiary`, `error`, `warn`, `caution`, `pass`), and the 29 scalars (`--weight--*`, `--density-scale`, `--space--*`, `--shape--*`). The role tokens (`--color--{name}` …) are `light-dark()` joins of their registered pair and every derivative is an `oklch(from …)` expression; neither is registered, so they resolve on the element that uses them and `themeMode` works anywhere. A theme switch crossfades when the author transitions the registered pair; a mode flip is instant at the variable level.

Core (`define-core-theme()`) declares every default and every derivation once, on `:where(:root)` and `:where(:root, [theme])`; a theme rule (`define-theme()`) holds only what its author passed, so nested themes inherit, presets coexist, and an author's `:root` rule wins. Load order: core, then themes, then the adapter.

**Palette chain (Phase 14).** brand → primary → secondary, tertiary → background, surface. A theme passes whichever it has; core generates each one it left out, on the same shared selector, from the nearest thing the theme passed: primary is the brand with lightness held to 0.35–0.45 (light; 0.50 until Phase 14b) / 0.65–0.82 (dark) and chroma capped at 0.22; secondary is primary's hue with a third of its chroma, 0.04 at least; tertiary is primary's hue + 60° with half its chroma, 0.08 at least (neither floor lifts an accent above the primary's own chroma, so a grey primary gives grey accents); background and surface are neutrals of the brand hue (lightness 0.97 / 0.17 and 0.93 / 0.22, chroma 0.006 and 0.01 at most). The three accents then give up chroma until sRGB can show them, so the hue asked for is the hue painted (Phase 14c). The brand colour is never adjusted. `error`, `warn`, `caution` and `pass` have fixed defaults (the registered initial values). The root generates the whole chain; a nested theme generates what is downstream of what it passed and inherits the rest. Core holds each generated colour in a private variable (`--theme--_generated--{name}--{mode}`); `:where(:root)` points every pair of the chain at it and a theme rule does so for the palettes it left out that follow from one it passed, so nothing sets a pair where nothing upstream was passed. A theme rule that passes a primary and no brand points its brand pair at its primary pair (Phase 14d), so its brand palette is its primary; the root never does, so with no theme the brand is grey and primary follows it, without a cycle.

---

## DOM Attributes

```html
<html themeMode="auto|light|dark">
  <body theme="ocean">                <!-- scopes ocean vars to subtree -->
    <div themeMode="invert">...</div> <!-- flips mode in subtree -->
    <div themeMode="dark">...</div>   <!-- forces dark in subtree -->
    <div theme="ember">...</div>      <!-- nested theme: generates what follows from what ember passes, inherits the rest -->
  </body>
</html>
```

`themeMode` works on any element, with or without a `theme` attribute: the mode rules match the `[themeMode]` element itself and set `color-scheme` plus a private flag that picks the mode-varying percentages. `invert` inside an explicit light ancestor that is itself inside dark still reads the dark ancestor (needs `@scope`; see PORT-PLAN.md).

---

## SCSS Authoring Example (full theme)

```scss
@use '@cpangular/cp-theming-core/scss/theme' as t;

$my-theme: t.theme(
  $brand: oklch(0.44 0.22 253),          // the brand palette (--color--brand), kept exact
  $palettes: (
    // Everything here is optional. Left out: primary, tertiary, background and
    // surface, which core generates from the brand.
    secondary:  t.light-dark(
      t.palette(oklch(0.46 0.27 264)),
      t.palette(oklch(0.71 0.21 264)),
    ),
    error:   t.light-dark(t.palette(oklch(0.52 0.22 27)),  t.palette(oklch(0.70 0.20 27))),
    pass:    t.light-dark(t.palette(oklch(0.48 0.18 145)), t.palette(oklch(0.72 0.16 145))),
    caution: t.light-dark(t.palette(oklch(0.55 0.16 103)), t.palette(oklch(0.82 0.15 103))),
    warn:    t.light-dark(t.palette(oklch(0.55 0.18 55)),  t.palette(oklch(0.76 0.16 55))),
  ),
  $weights:    t.light-dark(t.weights($text-blend: 82%), t.weights($text-blend: 78%)),
  $overlay:    t.light-dark(t.overlays($shadow: oklch(0.2 0.02 240 / 30%)), t.overlays()),
  $elevation:  t.light-dark(t.elevation(), t.elevation($shadow-color: oklch(0 0 0 / 50%))),
  $typography: t.typography($plain-family: system-ui),
  $density:    t.density($scale: 0),
  $shape:      t.shape(),
  $focus:      t.focus($width: 3px, $offset: 2px),
  $motion:     t.motion(),
);

@include t.define-core-theme();                                  // once, first
@include t.define-theme('my-theme', $my-theme, $default: true);
```

---

## Current Status

### ✅ Phase 1 — Workspace scaffold
- Root pnpm-workspace.yaml, all package stubs
- SCSS migrated from theme-concept into theme-core/scss

### ✅ Phase 2 — theme-core SCSS finalization
- Complete palette system (`_palette.scss`) with runtime derivatives, from-var/from-brand helpers
- All sub-config modules: weights, overlay, typography, density, shape, focus, motion, elevation
- `_apply.scss` composable mixin system: apply-palette, tone, container, filled, outlined, stroke, radius, padding
- `define-core-theme()` — replaces legacy `global-selectors()` — emits attribute rules + density scopes + all `@property` registrations
- Brand API: `$brand` param in `t.theme()`, `palette-from-brand()`, `background-from-brand()`, `surface-from-brand()`
- Preset palettes (`scss/presets/_palettes.scss`) — 4 M3-inspired color sets + semantic defaults
- Preset themes (`scss/presets/_themes.scss`) — `$azure-blue`, `$rose-red`, `$cyan-orange`, `$magenta-violet`

### ✅ Phase 3 — theme-core TypeScript API
- `ThemeMode` enum (`AUTO`, `LIGHT`, `DARK`, `INVERT`), `ThemeStorage` enum, `ThemeDef` interface
- `getTheme`, `setTheme`, `clearTheme`
- `getMode`, `setMode`, `getEffectiveMode`, `getPreferredMode`
- `watchMode` — watches `[themeMode]` attribute + `prefers-color-scheme` via `MediaQueryList`
- `watchTheme` — watches `[theme]` attribute changes
- `getAvailableThemes` — scans loaded stylesheets for `[theme="..."]` selectors
- `configurePersistence`, `getPersistence`, `restoreTheme`, `restoreMode` — localStorage/sessionStorage

### ✅ Phase 4 — theme-core precompiled CSS output
- `dist/core.css` — shared, theme-independent; `@property` registrations + attribute rules + density scopes
- `dist/presets/azure-blue.css`
- `dist/presets/rose-red.css`
- `dist/presets/cyan-orange.css`
- `dist/presets/magenta-violet.css`
- All exports wired in `package.json` (`./css/core`, `./css/presets/{name}`)

### ✅ Phase 5 — theme-ng-core
- Angular workspace scaffolded at monorepo root (`angular.json` + `tsconfig.json`)
- `ng generate library` wired into `packages/theme-ng-core` via `ng-package.json`, `tsconfig.lib.json`, `tsconfig.lib.prod.json`
- `ThemeService` (`providedIn: 'root'`) — signals wrapping theme-core TS API
  - `theme`, `mode`, `effectiveMode`, `availableThemes` readonly signals
  - `setTheme()`, `setMode()`, `configurePersistence()`, `getPersistence()`, `restorePersistedState()`, `refreshAvailableThemes()` methods
  - `watchMode()` + `watchTheme()` from theme-core wired in constructor; `DestroyRef.onDestroy` cleans up
  - No NgZone — zoneless-first; `signal.set()` in observer callbacks is sufficient
- `ThemeDirective` — standalone attribute directive `[theme]`
  - Signal inputs: `theme`, `themeMode`
  - `effect()` syncs inputs to `[theme]` / `[themeMode]` attrs on host via `Renderer2`
- `public-api.ts` re-exports `ThemeMode`, `ThemeStorage`, `ThemeDef` from `@cpangular/cp-theming-core`
- `ng build theme-ng-core` → `dist/theme-ng-core/` (fesm2022 + types) ✅

### ✅ Phase 6 — theme-ng-material
- `packages/theme-material` renamed to `packages/theme-ng-material` (`@cpangular/cp-theming-ng-material`)
- All Angular peerDeps bumped to `^22.0.0`; TypeScript bumped to `^6.0.0` (Angular 22 requirement)
- `ng-package.json`, `tsconfig.lib.json`, `tsconfig.lib.prod.json` wired into `angular.json` library project
- `scss/_material.scss` — two mixins:
  - `define-ng-material-core-theme()` — single unscoped `:root {}` block; 166 `--mat-sys-*` → `var(--color--*)` assignments covering color, surface tones, overlays, state layers, shape, elevation, motion, typography
  - `apply-material-overrides()` — component patches (initially empty; grows during demo-material development)
- Tertiary palette mapped to secondary (reversed by Phase 14: `tertiary` is a core palette and the tertiary roles read `--color--tertiary`)
- CSS cascade handles nested `[theme]` elements automatically — no per-theme repetition needed
- `scss/material-core.scss` + `scss/material-overrides.scss` — precompiled entry points
- `dist/material-core.css` (166 token mappings) + `dist/material-overrides.css` ✅
- `ng build theme-ng-material` → `dist/theme-ng-material/` (fesm2022 + types) ✅
- Package exports: `./css/material-core`, `./css/material-overrides`, `./scss/*`

### 🟡 Phase 7 — docs site + demos (docs examples done; the four demos pending)

**docs** (`demos/docs`) — Angular 22 + Material 22 documentation / showcase app. Dev server:
`ng serve docs --host 0.0.0.0 --port 4200`. Deploys to GitHub Pages at `/cp-theming/` as git-flow's
`static-site` artifact, by `gitflow deploy` through `.github/workflows/deploy-production.yml` (Phase 16).

**Navigation, as the code has it** (`app.routes.ts`, `packages/packages.routes.ts`,
`packages/packages-layout.component.ts`):

- `/` — home: one card per package and a "Get started" link to `/packages/core/getting-started`.
- Toolbar (every page): the logo (home), one link per package (`/packages/core`,
  `/packages/ng-core`, `/packages/ng-material`), the theme selector and the light/dark toggle.
- `/packages/:lib/…` — a sidebar on the left, the page, and an "on this page" rail on the right
  that each page fills through `TocService`. `/packages/:lib` redirects to `categories`.
- Sidebar for **core** (18 pages, in this order):
  - Getting Started
  - _SCSS API_: Palette, Theme, Weights, Typography, Density, Shape, Focus, Motion, Elevation, Overlay
  - _Theming_: Palette Scopes (`apply-palette`), Surface Types (`apply-surfaces`), Borders
    (`apply-borders`), Geometry (`apply-geometry`), Tones (`apply-tones`)
  - _Reference_: CSS Variables (`variables`), TypeScript API (`typescript-api`)
- Sidebar for **ng-core** and **ng-material** (4 pages): Overview (`categories`), Getting Started,
  API Reference (`api`), Guides. One component per page switches its content on `:lib`.
- Routed but in no sidebar:
  - `categories` for core: the card index `/packages/core` lands on. Its "Apply Mixins" card goes
    to `apply`, which redirects to `apply-palette`.
  - `showcase`: the live Material showcase (4-column theme comparison, density scopes, relative
    density, palette swatches). It has content for `ng-material` only and is reached from the
    link at the end of ng-material Getting Started.
  - `api` and `guides` for core: the older single-page reference and guide. Core Getting Started
    links to `api`; nothing links to core `guides`.
  - `overview`: an older per-package overview; nothing links to it.

**Examples are real files** (PORT-PLAN.md, "Phase 7 (resumed)"):

- Every Sass, CSS and theme-attribute sample is a file in `demos/docs/src/examples/{page}/`. Pages
  import it as text (`import x from '…' with { loader: 'text' }`, typed by `src/examples.d.ts`) and
  show it with `cpa-code` or `cpa-theme-example`. A page that repeats another page's sample
  imports the same file.
- `cpa-theme-example` renders an attribute example from the same `.html` it shows. Sass examples
  are compiled by the harness, not injected into the page.
- `demos/docs/test/examples.test.ts` (`pnpm --filter docs test`, part of `pnpm test` and of CI):
  - `name.scss` compiles through the packages' `exports` with zero warnings, and core + a preset +
    the example leaves no `var()` read undeclared;
  - `name.css` is valid CSS; `name.output.css` is an excerpt of compiled output, every
    declaration verbatim under the same selector;
  - `name.html` uses only attributes and values the library's CSS selects on;
  - `name.display.*` is display-only (a listing of variable names, an Angular template) and the
    marker is refused on a file that would pass its check;
  - `name.ng.html` (Phase 15) is an Angular template the docs render: the `templateUrl` of a
    component, so what the page shows is what runs. Every element and static attribute is HTML's,
    Angular Material's or the library's; it has no `style`, its classes are layout classes, and
    its component has no other stylesheet;
  - `name.ts.txt` (Phase 15) is TypeScript the docs show: the text is in a source file of the
    docs app, verbatim;
  - every file names only custom properties the library declares or reads and `@cpangular/…`
    paths the packages export; every file is imported by a page; no `<pre>` or string field of a
    page holds a Sass, CSS or attribute sample.
- The other TypeScript, shell and JSON samples stay in the page templates; nothing checks them.
- `demos/docs/test/render.ts` (local, `pnpm --filter docs render` after `npx ng build docs`):
  painted contrast measured from screenshots, over the built showcase in light and dark and
  (Phase 15) over the component gallery in every preset and both modes: as loaded, hovered,
  focused and with each overlay open. A component label below 4.5:1 fails the run; a docs caption
  and the label of a disabled control are reported.

**Corrections made with the move** (the prose a compile check cannot see): `define-core-theme()`
takes no `$selector`; the "simplified output CSS" is now the compiled output itself;
`getAvailableThemes()` reads `[theme="name"]` selectors, not an `@property` registry; the Material
tokens are re-declared on every `[theme]` element because `var()` is substituted where a property
is declared; stylesheets are loaded through the exported `…/css/…` paths, not `dist/…`; any CSS
colour format is accepted and oklch is recommended.

**Bugs fixed earlier in this phase:**
- `ThemeService.setMode` / `setTheme` now update the internal signal synchronously so Angular
  zoneless change detection picks up the change in the same microtask as the button click.
  Previously the update relied solely on the async `watchMode` MutationObserver callback which
  did not trigger the Angular scheduler.
- Multi-preset cascade bug: loading all four preset CSS files simultaneously caused each preset's
  `body { --color--* }` declaration to race, leaving the *last-loaded* preset's colour on `<body>`
  regardless of which `[theme]` was set on `<html>`. Worked around in Phase 7 with a `body { unset }`
  block in `demos/docs/src/styles.scss`; Phase 9 removed the cause (a default theme is `:where(:root)`,
  not `body`) and the block.
- Material list items in the sidenav needed `mat-list-item` (kebab-case attribute selector) not the
  deprecated `matListItem` camelCase; also required `<span matListItemTitle>` child for M3 styling.
- `::ng-deep` required for nested Material component styles in `ThemeSwitcherComponent`.

**Still pending:**
- demo-core: Vite + vanilla TS
- demo-material: Angular + Material (separate from docs)
- demo-brand-core: example brand pack
- demo-brand-material: example brand + Material

### ✅ Phase 8 — Test harness and CI (PORT-PLAN.md)
- CSS checks, `node --test` + Sass JS API (`packages/theme-core/test/css`, `packages/theme-ng-material/test/css`):
  zero deprecation warnings from our files; every `var()` read without a fallback is declared
  (core + preset, core + fixture, core + preset + adapter, the docs style list); contrast sweep
  with colorjs.io over every preset role and ladder step plus a hue × lightness × chroma grid;
  size, `@property` count and the exact registered list of `core.css`. Checks today's code fails
  are `todo` naming their phase: the 75 `--typescale--*` reads (Phase 11), the contrast sweep
  (Phase 10), the cascade-shape check (written in Phase 9).
- Fixture themes: brand + `*-from-brand()` + custom palette name, explicit `$bg`/`$stroke`/`$focus`
  with `t.light-dark()` weights and elevation, hex/`rgb()`/`hsl()` inputs, and a theme defined with
  `$adaptor: mat.adaptor()`.
- TypeScript API tests with vitest + jsdom: persistence and `getAvailableThemes`.
- Browser check `packages/theme-core/test/render.ts` (Playwright, Chromium + Firefox, local only):
  31 rows, one per "Behaviour today" case plus the mode, palette and nesting cases; 15 pass today,
  the other 16 are the cascade defects Phase 9 fixes.
- Wiring: wireit `test` scripts, `github.actions.build` / `github.actions.test`, git-flow's
  `test.yml`; `pages.yml` was manual-only until the repo went public (deleted in Phase 16).

### ✅ Phase 9 — Cascade: a theme is one rule; core derives once (PORT-PLAN.md)
- Registration is what animation needs, nothing derived: each core palette role's light and dark
  colour (`--color--{name}[--role]--mode-light` / `--mode-dark`, 64), `--color--brand` and the 29
  scalars — 94 `@property` rules. The eight alias registrations (`--palette-color*`, `--container--*`)
  are gone; the greyscale fallback lives in the pairs' initial values.
- `t.define-core-theme()` emits once: `:where(:root)` defaults (colour joins, weight and tint pairs,
  overlay, elevation, typography, focus, motion), the `themeMode` rules (`:where()`, `color-scheme` +
  a private 0/1 flag), every derivation for the core names on `:where(:root, [theme])`, the
  percentage pick on `:where(:root, [theme], [themeMode])`, the `[palette="name"]` rules, apply layers
  and density scopes.
- `t.define-theme()` emits one rule, `:where([theme="name"]):not(cp-theming-none)` — specificity
  (0,0,1), so an author's `:root` rule wins even on `<html theme="…">` — (+ `:where(:root)` when
  `$default`), holding only what was passed. Custom palette names and `$adaptor` hooks are emitted
  once at root level. Sub-config builders and `t.theme()` return only passed keys.
- Each preset went from 124 KB (9.9 KB gzipped) to 2.5 KB; core.css from 29 KB to 159 KB
  (12 KB gzipped) because it now carries the derivations once instead of eight times.
- Harness check 5 (cascade shape) written; render.ts has 53 rows including the theme-switch
  crossfade (base, ladder step, nested theme, dark subtree, auto ↔ explicit bg) and the eight
  defects the Phase 9 critique confirmed (PORT-PLAN.md), all passing in Chromium and Firefox.
- Consumers: the docs workaround block is deleted; demo-core loads core first via
  `t.define-core-theme()`.

### ✅ Phase 10 — Contrast and alpha (PORT-PLAN.md)
- `--contrast` (base, ladder steps, `--bg`, `--stroke`) is black or white by a step at WCAG relative
  luminance 0.179, read from linear sRGB with each channel clamped to 0–1, kept as an oklch value:
  `oklch(from color(from var(--x) srgb-linear S S S) l 0 0 / 1)`. Core declares `S` once on
  `:where(:root)` as the private `--theme--_contrast-step`; every `--contrast` substitutes it.
- Alpha is pinned to 1 on ladder steps, the auto `--bg` / `--stroke` / `--focus`, the contrasts, the
  `*-from-var` / `*-from-brand` helpers and the adapter's slide-toggle handle tints. `--tint-1..5`
  keep their weight alpha.
- Contrast sweep has no `todo`: 0 of 1344 preset role/step colours and 0 of 2376 grid colours below
  4.5:1 (lowest 4.60:1 and 4.58:1). Before: 59 preset colours and 162 grid colours below, worst
  3.28:1. A new check asserts every relative-colour derivation pins alpha except the tints.
- Visible change: 68 preset role/step colours switch from black to white text, none the other way,
  including the `warn` and `caution` bases in light mode (accepted 2026-11-09).
- render.ts has 92 rows: the browser's `--contrast` equals the sweep's prediction for 11 sample
  colours (either side of the step, outside sRGB, hex/`rgb()`/`hsl()`), five ladder and role
  contrasts, and every azure-blue palette in both modes; a translucent input gives opaque
  derivatives. All pass in Chromium, Firefox and WebKit.
- core.css went from 165 KB to 178 KB (12.2 KB to 12.4 KB gzipped).

### ✅ Phase 11 — Material adapter from Material's role tables (PORT-PLAN.md)
- `scss/_roles.scss` computes the `--mat-sys-*` colour roles from Angular Material's own tables
  (`md-sys-color-values-light` / `-dark`): the roles cp-theming has a token for map to it
  (`primary`, `on-primary`, the container pair for primary / secondary / tertiary (= secondary
  until Phase 14, its own palette since) / error, `surface`, `on-surface`, `background`, `on-background`, `outline-variant`, `scrim`,
  `shadow`); every other accent role is the theme colour at the M3 tone the table names
  (`scss/_m3-tone.scss`, `m3-tone()`); the neutral roles (surface containers, dim, bright,
  `surface-variant`, `on-surface-variant`, `inverse-*`, `outline`) are offsets from
  `--color--surface` by the tone's distance from M3's own surface tone (98 light, 6 dark). A
  container is `--bg`, one ladder step lighter in dark mode.
- `--mat-sys-neutral10` and `--mat-sys-neutral-variant20` are declared; typography reads `--text--*`
  and the font shorthand tokens (`--mat-sys-body-large` …) are emitted; the state-layer opacities
  are numbers (`calc(var(--weight--state-*) / 100%)`), which is what Material's `color-mix()`
  expressions need.
- Selectors: every token that reads a cp-theming variable is on `:root, :where([theme])`; the two
  literal constants on `:root` only; state layers again on `:where([themeMode])`.
- `material-palette()` is generated from the same tables with `--color--{name}` as the origin. The
  adapter's core mixin emits `[palette="name"]` for the six core accent palettes; `mat.adaptor()`
  emits it for custom names only.
- `apply-material-overrides()` went from five patches to two: the slide-toggle selected icon and
  the filled form field (container `surface-container-high`, primary and error accents held to
  M3's lightness on it). Removed: the select option checkmark, the slide-toggle track outline,
  unselected track and icon, the selected handle tints, and nine declarations for tokens
  Material 22 never reads.
- Core fix found by the critique: `--elevation-N--shadow` was `light-dark()` around a whole
  box-shadow (invalid, computed to `none`); it is `<geometry> light-dark(<colour>, <colour>)`.
- Harness (`packages/theme-ng-material/test/css/material-roles.test.ts` and core): every
  `--mat-sys-*` name read by the installed Material component styles is declared (94 read, 186
  declared); every role of Material's tables is declared; the surface roles keep M3's lightness
  order in both modes for every preset and fixture; the state-layer opacities are the weight
  divided by 100%; every component token the adapter sets is one Material reads; every
  `light-dark()` argument is a single value. No `todo` is left in either package.
- render.ts has 104 rows (table roles in a nested theme, nested mode and `[palette]` scope, the
  state layer inside Material's own `color-mix()`, shadow tokens as `box-shadow`), all passing in
  Chromium, Firefox and WebKit. The docs showcase was screenshotted in light and dark for the four
  themes and nested themes; an Opus critique (three critics, eight verifiers) confirmed five
  defects, all fixed (PORT-PLAN.md, "Amended after the Phase 11 critique").

### ✅ Phase 12 — Startup: no flash, safe import (PORT-PLAN.md)
- `src/theme.ts` touches no storage when the module loads. The persist config is read on first
  use; every storage read, write and removal is guarded, so the package imports where there is no
  `localStorage` and keeps working where storage is blocked or full (the attributes are still set,
  the selection is just not saved). An unknown persist config reads as `NONE`; `restoreMode()`
  ignores a saved value that is not a `ThemeMode`.
- `getPreferredMode(element?)` and `watchMode()` read `prefers-color-scheme` from the element's own
  window and answer `LIGHT` where there is none; `getAvailableThemes(doc = document)` takes the
  document to scan.
- `themeHeadSnippet` (`src/head-snippet.ts`) is the JavaScript text for an inline `<script>` in
  `<head>`. It is built from `src/storage-keys.ts`, the same constants `theme.ts` uses (also
  exported: `PERSIST_CONFIG_KEY`, `PERSIST_THEME_KEY`, `PERSIST_MODE_KEY`, `ATTR_THEME`,
  `ATTR_MODE`). It reads the persist config, and for `local` or `session` sets `theme` and
  `themeMode` on `<html>`, accepting only `auto` / `light` / `dark` / `invert` as a mode.
- theme-ng-core: `provideTheme()` does nothing outside a browser; `ThemeService` there skips the
  stylesheet scan, the observers and storage. `themeHeadSnippet` is re-exported.
- Docs: `demos/docs/src/index.html` carries the snippet (a vitest check fails if it differs from
  the export by one character); Getting Started has "No flash on reload" for all three packages,
  with the CSP nonce / hash note. The docs production build no longer inlines critical CSS:
  with it, the first frame had no theme rules at all, snippet or not.
- Tests: 33 vitest tests (were 12): import in a Node environment with no DOM and no storage, and with
  storage whose getter throws; the snippet restores from both storages, round-trips what
  `setTheme()` / `setMode()` save, and ignores bad modes, unknown configs and blocked storage.
- Browser check `demos/docs/test/startup.ts` (local): the production docs build, reloaded with
  saved `rose-red` / `dark` under a light OS scheme and every script request held open, paints the
  same colours as the running app; with the snippet stripped the same frame is `azure-blue` /
  `light`. Passes in Chromium, Firefox and WebKit. WebKit paints no frame while the module script
  is pending, so its first frame is taken after the load is abandoned, still without the bundle.

### ✅ Phase 14 — Brand and accent palettes: pass what you have, the rest are generated (PORT-PLAN.md)
- `brand` and `tertiary` are core palette names: ten palettes, 109 registered properties.
  `--color--brand` is the brand palette's colour (the join of its registered pair) and is never
  adjusted; `$brand` in `t.theme()` is that palette, and `$palettes` is optional, so
  `t.theme($brand: #ff6a00)` is a complete theme.
- The chain brand → primary → secondary, tertiary → background, surface. Core declares the
  registered pair of each palette a theme did not pass on `:where(:root, [theme])`: primary from
  the brand pair with `palette-from-brand()`'s clamps, secondary and tertiary from the primary
  pair (same hue, C / 3; hue + 60°, C / 2), background and surface as neutrals of the brand hue
  with the `*-from-var` helpers' numbers. Pass one, two or three accents.
- `error`, `warn`, `caution` and `pass` default to the colours the presets share (the registered
  initial values of their pairs, one per mode; one map in `_palette.scss` feeds both).
- Nesting: the root generates the whole chain; a nested theme generates what is downstream of what
  it passed and inherits the rest. Core declares each generated colour once on the shared selector
  as a private variable and sets no pair there; `:where(:root)` points every pair of the chain at
  its variable, and a theme rule does the same, at its own specificity, for each palette it left
  out that follows from one it passed. This is the one change from the plan's text, which declared
  the generated pairs themselves on every `[theme]` element: that gave a nested theme without a
  primary a grey one, dropped the outer theme's explicit secondary, background and surface in any
  nested theme, and lost to a default theme loaded beside the theme on `<html>`, which is every
  preset (PORT-PLAN.md, "As landed").
- Material adapter: the tertiary roles read `--color--tertiary`; `palette="brand"` and
  `palette="tertiary"` remap `--mat-sys-primary` like the other accents. The presets pass no
  tertiary, so theirs is generated and the showcase shows it.
- Docs: Getting Started is a theme with only `$brand`, rendered live with a `palette="brand"`
  swatch; the Palette and Theme pages explain the chain; the "tertiary = secondary" guide section
  is gone; example themes with only `brand`, only `primary`, and one, two and three accents are
  compiled by the harness.
- Harness: `test/css/chain.test.ts` (the generated expressions, what the root and each theme rule
  take by reference, each palette's relation
  to its origin for every preset and fixture, the brand never adjusted); the contrast sweep and
  the Material surface-order check cover all ten palettes (0 of 1680 preset role/step colours
  below 4.5:1); two fixtures (only `brand`, only `primary`). render.ts had 190 rows at Phase 14, 84 of them
  `chain/`, all passing in Chromium, Firefox and WebKit. `demos/docs/test/chain.ts` (local) reads
  pixels on the built docs: the `brand` swatch is the example's colour in both modes, and every
  preset column shows three different accents.
- core.css: 178 KB → 221 KB (12.4 KB → 15.2 KB gzipped).

### ✅ Phase 14b — Follow-ups from the Phase 14 review (PORT-PLAN.md)
- Generated accents have a chroma floor: secondary `min(c, max(c / 3, 0.04))`, tertiary
  `min(c, max(c / 2, 0.08))` of the primary pair. The outer `min` keeps a floor from lifting an
  accent above the primary's own chroma, so a grey primary (the no-theme fallback) still gives
  grey accents. cyan-orange's tertiary went from a slate grey to a blue.
- The light-mode band of the generated primary is 0.35–0.45 (was 0.35–0.50), in the chain and in
  `palette-from-brand()` / `palette-from-var()`. Over the 1680-case brand grid the primary is at
  4.5:1 or better on the generated background and surface in all 3360 cases (116 were below);
  the lowest is 4.60:1. The chain test asserts 0.
- `bg` on `background` and `surface` sets the text to the bg role's contrast. `bg()` hands it
  over in a private variable (`--container--_bg-text`) that only those two `[palette]` rules
  read; `bg()` declares no `color` itself, so every other palette is unchanged. The Getting
  Started example uses `bg` for its background and surface.
- Docs: themes come from `t.define-theme()` (Theme page, TypeScript API page, API reference),
  with the caveat for a nested rule written directly in CSS. Showcase is back in the ng-material
  sidebar, which has its own nav list.
- Harness: core.css ceiling 256 KiB (221,168 bytes, 15,211 gzipped today). render.ts has 207 rows
  (two new `chain/` rows for a muted brand, 15 `bg-text/` rows), all passing in Chromium,
  Firefox and WebKit.

### ✅ Phase 14c — Generated colours stay inside the screen's gamut (PORT-PLAN.md)
- The generated primary, secondary and tertiary, and `palette-from-var()` / `palette-from-brand()`,
  are wrapped by `_in-gamut()` (`_palette.scss`) after the lightness clamp and chroma cap: four
  nested passes, each multiplying the chroma by `1 − 2 × overshoot`, where the overshoot is how
  far the worst sRGB channel lies outside 0–1. The factor travels in the alpha channel of a
  `color(from … srgb r g b / …)`, so the colour expression is written once. Lightness and hue
  are untouched; a colour inside sRGB is unchanged; a grey stays grey.
- Changed from PORT-PLAN.md: the overshoot counts up to 0.25, so one pass halves the chroma at
  most. As written, the alpha reached 0 at an overshoot of 0.5 and a vivid teal or green brand
  got a grey primary in dark mode (489 of 2520 sweep colours kept less than half of the chroma
  sRGB holds; now none, lowest 55%).
- `#ff6a00`: light primary `#a60000` (a red, 15.5° off) → `#8d3700`; dark `#f7722b` unchanged.
  `#ffd400`: light `#764d00` (20° off) → `#65540a`; dark `#e7c11e` unchanged. `#1a56c4`:
  `#0e4bb8` / `#538cf2`, unchanged.
- Harness: the chain test asserts the painted hue of every generated accent within 6° of the hue
  asked for, over every preset and fixture and over a hue-wheel sweep (10,800 colours, worst
  0.70°; 46.7° uncorrected), and that at least half of the chroma sRGB holds is left. render.ts
  has 230 rows (23 `gamut/` rows, with a painted-hue assertion), all passing in Chromium, Firefox
  and WebKit. `demos/docs/test/chain.ts` asserts the Getting Started primary's painted hue.
- core.css: 221,168 → 224,536 bytes (15,211 → 15,316 gzipped).

### ✅ Phase 15 — Material component gallery in the ng-material docs (PORT-PLAN.md)
- **Components page** (`demos/docs`, `packages/ng-material/components`): 27 sections, one per
  Angular Material 22 component family, live in the page's theme and mode. The 12 families that
  read the primary roles (buttons, form field, select and autocomplete, checkbox, radio, slide
  toggle, slider, datepicker, tabs, list, progress, stepper) are repeated under
  `palette="secondary"`, `"tertiary"`, `"error"` and `"brand"`.
- **Every component is an example file**: 34 `.ng.html` templates and 2 `.ts.txt` files in
  `demos/docs/src/examples/components/`. A template is the `templateUrl` of the component the
  page renders (`pages/components/gallery.components.ts`), so the source shown is what runs. The
  examples check refuses a `style` attribute, a class that is not a layout class, and a component
  stylesheet other than `gallery-layout.scss`: nothing in the gallery is coloured by the docs.
- **Overlays section**: menu, dialog, select, autocomplete, datepicker, snackbar, tooltip and
  bottom sheet opened from the page, from a nested `theme`, from a nested `themeMode`, and a
  dialog themed through its panel. A table says where Material renders each and what it needs;
  a list says what cannot follow a nested scope. Select and autocomplete need nothing (their
  panel is inside the field's element). The others need an overlay container that carries the
  scope's attributes: `cpaOverlayScope`, a directive of the docs app
  (`src/app/shared/overlay-scope.directive.ts`), shown on the page as source. It is not part of
  a package.
- **Harness**: `demos/docs/test/render.ts` measures the gallery in the four presets, light and
  dark: 2,390 labels per preset and mode (19,120 per engine), as loaded, with the pointer over
  each control, with keyboard focus on it, and with each overlay open; a screenshot of every
  section and every open overlay goes to `dist/docs-render/gallery/`. A component label below
  4.5:1 is an error; a docs caption and the label of a disabled control are reported. It also
  asserts that each overlay resolves the theme and mode of the scope that opened it.
- **What the screenshots found, fixed in `apply-material-overrides()`** (now six patches, each
  with its measured reason in the source):
  - an accent painted as a label (text, outlined and elevated buttons; the focused and invalid
    label, outline, indicator, caret and arrow of a form field; the label and icon of a step in
    error) is held to lightness ≤ 0.40 in light mode and ≥ 0.82 in dark mode. Was 3.3–4.4:1 for a
    focused text button on a filled card in all eight preset modes, 4.3:1 for a focused button on
    the surface in two, and 1.04–1.11:1 for every such label under `palette="brand"` in dark
    mode. The Phase 11 limit for the filled field (0.44) became 0.40 and now covers all of them;
  - the filled card's container is `surface-container-high`, not `surface-container-highest`;
  - a hint, a list subheader and the content of a tab and of a step have no colour in Material
    and inherited the palette's identity colour inside a `[palette]` scope (1.04–1.11:1 under
    `brand` in dark mode); they get `on-surface-variant` / `on-surface`;
  - the scrim under a grid tile's header and footer is 60% black, not 38% (white text was 3.2:1
    over a light tile).
- **Result**: no component label below 4.5:1 in any preset in either mode, in Chromium and in
  Firefox; lowest 4.73:1 (Chromium) and 4.68:1 (Firefox), a focused text button on the filled
  card in cyan-orange, light mode. 0 harness errors; every overlay resolved its opener's theme
  and mode.
- Left as found, then changed by Phase 14d: the presets pass no brand, so `palette="brand"` was
  core's near-black in both modes. It is now each preset's primary.
- `demo-material` stays as listed below: the gallery lives in the docs.

### ✅ Phase 14d — A theme without a brand uses its primary as the brand (PORT-PLAN.md)
- A theme rule that passes `primary` and no `brand` points its brand pair at its primary pair
  (`emit-brand-from-primary` in `_palette.scss`, called by `define-theme()`), and likewise each
  role the primary sets itself. A theme with both keeps both; one with only a brand is unchanged;
  a nested theme with only a secondary inherits the outer brand; with no theme the brand is grey
  (`oklch(0.2 0 0)`) and primary follows it. The root never points brand at primary, so there is
  no cycle.
- Follows from it: a primary-only theme on `<html>` that passes no background gets the root's
  generated neutrals in the primary's hue rather than grey. Presets pass their own neutrals.
- Brand fill under `palette="brand"`, light / dark, equal to each preset's primary in Chromium
  and Firefox: azure-blue `#004ab3` / `#4ca7ff`, rose-red `#b20072` / `#fe69bb`, cyan-orange
  `#006360` / `#6ccac5`, magenta-violet `#9d00be` / `#e365ff`. The Components page's paragraph
  about near-black brand fills is replaced by one sentence saying so.
- Harness: the chain test asserts, per preset and fixture, that the brand palette is the brand
  passed or else the primary passed, that every preset passes a primary and no brand, and that
  the root never points the brand at the primary. render.ts has 258 rows (28 new), all passing
  in Chromium, Firefox and WebKit.
- Gallery (`demos/docs/test/render.ts`, 2,392 labels per preset and mode, 19,136 per engine): no
  component label below 4.5:1 in any preset in either mode, in Chromium and in Firefox; lowest
  4.73:1 (Chromium) and 4.68:1 (Firefox), a focused text button on the filled card in
  cyan-orange, light mode, as before. 0 harness errors; every overlay resolved its opener's
  theme and mode.

### ✅ Phase 13 — Release through cpdevtools/git-flow (PORT-PLAN.md)
- Every manifest carries `0.0.0-MAIN`; `.publish/versions.yml` holds `0.1.0-alpha.0`,
  `.publish/registries.yml` the one registry (GitHub Packages, scope `@cpangular`).
- Workflows from the template: `create-release-pr.yml`, `build-pack-publish.yml`,
  `cleanup-scheduled.yml`, `cleanup-deleted-branch.yml`, beside `test.yml`. The wireit root scripts
  stay; the template's `deps.yml`, syncpack and `devutil` scripts are not adopted.
- Each of the three packages has a `release-artifacts.yml` (type `npm`) and
  `github.actions.pack`. theme-core: `publishConfig.exports` + `files`. theme-ng-core:
  `github.actions.build` runs ng-packagr and `publishConfig.directory` packs its output; its
  production tsconfig reads core through `packages/theme-core/dist/index.d.ts`. theme-ng-material:
  `files: [dist, scss]`, no `sideEffects: false` (it is CSS).
- Peers between the three packages are `workspace:^`.
- Docs deploy: the repo was private when this landed, so `pages.yml` stayed on manual trigger.
  Phase 16 replaced it with the `static-site` artifact.

### ✅ Phase 16 — Wrap-up: docs deploy, demo-core, gallery hrefs (PORT-PLAN.md)

Done in the repo; the first deploy has not been run (it needs the release PR merged, the Pages
source set to `gh-pages`, and `pnpm gitflow deploy`, all the user's to do).

- `demos/docs/release-artifacts.yml`: `static-site`, `directory: ../..`, `packDir:
  dist/docs/browser`, `pagesRoot: true`, `deploy: [gh-pages]`. The docs have
  `github.actions.build` (core, the adapter and demo-core first, then `ng build docs
  --configuration production`, then `scripts/assemble.ts`: demo-core copied to
  `demos/demo-core/` and `404.html`) and `github.actions.pack`. `pages.yml` is deleted.
- Merging a release PR does not deploy (git-flow keeps the two apart).
  `.github/workflows/deploy-production.yml` is the environment `gitflow deploy` dispatches: it
  fetches `deploy-gh-pages.zip` from the release and commits the site to the `gh-pages` branch.
- `demos/demo-core` builds: its Sass goes through the public `theme` module only, its markup uses
  today's attributes (`bg`, the `error` palette, the mode-relative tones), Vite builds with a
  relative `base`. Root `pnpm build` builds core and demo-core.
- Gallery demo links are `href="#sidenav"` / `href="#list"`. The site has a `<base href>`, which
  a fragment-only link resolves against, so the docs layout keeps such a click on the page.
  `examples.test.ts` refuses an `href` that is not a fragment, an absolute path or a URL.
- The home page and the core Getting Started page link to the hosted demo-core; the home page
  says the three Angular demos are stubs.

### ⬛ Phase 17 — Docs that teach (PORT-PLAN.md)

Not started. A Learn track of ten chapters above the existing pages, which become the Reference.

---
