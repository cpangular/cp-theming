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
- **CSS variable system** — all `--color--*`, `--weight--*`, `--space--*`, `--shape--*`, `--motion--*`, `--elevation-*` vars, all registered as typed `@property` declarations
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

7. **oklch everywhere** — Perceptually uniform, wide gamut, direct hue/lightness
   control. Not hsl.

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

All vars listed above are registered as typed `@property` declarations (in `dist/core.css`), enabling CSS transitions and `@keyframes` interpolation.

---

## DOM Attributes

```html
<html themeMode="auto|light|dark">
  <body theme="ocean">                <!-- scopes ocean vars to subtree -->
    <div themeMode="invert">...</div> <!-- flips mode in subtree -->
    <div themeMode="dark">...</div>   <!-- forces dark in subtree -->
  </body>
</html>
```

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

### 🟡 Phase 7 — docs site + demos

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
  regardless of which `[theme]` was set on `<html>`. Fixed by adding a `body { unset }` reset block
  in `demos/docs/src/styles.scss` (loaded last) so all `--color--*` vars on body inherit from
  `<html theme="azure-blue">` via `@property { inherits: true }`.
- Material list items in the sidenav needed `mat-list-item` (kebab-case attribute selector) not the
  deprecated `matListItem` camelCase; also required `<span matListItemTitle>` child for M3 styling.
- `::ng-deep` required for nested Material component styles in `ThemeSwitcherComponent`.

**Still pending:**
- demo-core: Vite + vanilla TS
- demo-material: Angular + Material (separate from docs)
- demo-brand-core: example brand pack
- demo-brand-material: example brand + Material

---
