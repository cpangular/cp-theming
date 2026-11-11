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
- **CSS variable system** — all `--color--*`, `--weight--*`, `--space--*`, `--shape--*`, `--motion--*`, `--elevation-*` vars. Registered as typed `@property`: what animation needs (each core palette role's light and dark colour, `--color--brand`, and the scalars); the role tokens and every derivative are unregistered `light-dark()` / `oklch(from …)` expressions that resolve where they are used
- **Brand color API** — `t.palette-from-brand()`, `t.background-from-brand()`, `t.surface-from-brand()` derive palettes from `--color--brand` at CSS runtime
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
--color--brand                       runtime brand seed color (optional)

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

`dist/core.css` registers 94 typed `@property` declarations: `--color--{name}[--bg|--stroke|--focus]--mode-light` / `--mode-dark` for the eight core palettes (64), `--color--brand`, and the 29 scalars (`--weight--*`, `--density-scale`, `--space--*`, `--shape--*`). The role tokens (`--color--{name}` …) are `light-dark()` joins of their registered pair and every derivative is an `oklch(from …)` expression; neither is registered, so they resolve on the element that uses them and `themeMode` works anywhere. A theme switch crossfades when the author transitions the registered pair; a mode flip is instant at the variable level.

Core (`define-core-theme()`) declares every default and every derivation once, on `:where(:root)` and `:where(:root, [theme])`; a theme rule (`define-theme()`) holds only what its author passed, so nested themes inherit, presets coexist, and an author's `:root` rule wins. Load order: core, then themes, then the adapter.

---

## DOM Attributes

```html
<html themeMode="auto|light|dark">
  <body theme="ocean">                <!-- scopes ocean vars to subtree -->
    <div themeMode="invert">...</div> <!-- flips mode in subtree -->
    <div themeMode="dark">...</div>   <!-- forces dark in subtree -->
    <div theme="ember">...</div>      <!-- nested theme: inherits what ember does not pass -->
  </body>
</html>
```

`themeMode` works on any element, with or without a `theme` attribute: the mode rules match the `[themeMode]` element itself and set `color-scheme` plus a private flag that picks the mode-varying percentages. `invert` inside an explicit light ancestor that is itself inside dark still reads the dark ancestor (needs `@scope`; see PORT-PLAN.md).

---

## SCSS Authoring Example (full theme)

```scss
@use '@cpangular/cp-theming-core/scss/theme' as t;

$my-theme: t.theme(
  $brand: oklch(0.44 0.22 253),          // emits --color--brand; enables *-from-brand() helpers
  $palettes: (
    background: t.background-from-brand(),
    surface:    t.surface-from-brand(),
    primary:    t.palette-from-brand(),
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

@include t.define-theme('my-theme', $my-theme, $default: true);
@include t.define-core-theme();
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
- Tertiary palette maps to secondary (documented; no 3rd palette in our system)
- CSS cascade handles nested `[theme]` elements automatically — no per-theme repetition needed
- `scss/material-core.scss` + `scss/material-overrides.scss` — precompiled entry points
- `dist/material-core.css` (166 token mappings) + `dist/material-overrides.css` ✅
- `ng build theme-ng-material` → `dist/theme-ng-material/` (fesm2022 + types) ✅
- Package exports: `./css/material-core`, `./css/material-overrides`, `./scss/*`

### 🟡 Phase 7 — docs site + demos (resumes after Phase 11 — see PORT-PLAN.md)

**docs** (`demos/docs`) — Angular 22 + Material 22 documentation / showcase app:
- Builds and deploys to GitHub Pages at `/cp-theming/` via `.github/workflows/pages.yml`
- Five pages per package: Overview, Getting Started, API Reference, Guides, Showcase
- Showcase page: 4-column theme comparison grid + 3-column density demo (live AM22 components)
- Theme switching (via `ThemeService.setTheme`) and mode toggle (light/dark) both working
- Dev server: `ng serve docs --host 0.0.0.0 --port 4200`

**Bugs fixed in this phase:**
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
  `test.yml`; `pages.yml` is manual-only until the repo is public.

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
  (`primary`, `on-primary`, the container pair for primary / secondary / tertiary (= secondary) /
  error, `surface`, `on-surface`, `background`, `on-background`, `outline-variant`, `scrim`,
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

### ⬛ Phases 12–13 — planned in PORT-PLAN.md
- Phase 12 — Startup: no flash, safe import
- Phase 13 — Release through cpdevtools/git-flow

---
