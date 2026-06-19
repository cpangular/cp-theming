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
  theme-angular/       @cpangular/cp-theming-angular
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
- **SCSS theme authoring API** — `t.palette()`, `t.theme()`, `@include t.define-theme()`, etc.
- **CSS variable system** — all `--pal-*`, `--theme--*`, `--typescale--*` etc vars
- **Preset palettes + themes** — ocean, ember, and more
- **Vanilla TS API** — `ThemeMode`, `setTheme()`, `setMode()`, `watchMode()`, etc.
- **Precompiled CSS** — one file per preset theme, for users without Sass

### @cpangular/cp-theming-angular
Signal-based Angular wrapper around cp-theming-core. No Angular Material dependency.
- `ThemeService` — `theme`, `mode`, `effectiveMode` signals
- `[cpaTheme]` structural directive

### @cpangular/cp-theming-material
SCSS adapter mapping our CSS vars → Angular Material `--mat-sys-*` tokens.
- **M3 only** — Angular Material 17+ (M3). No M2 support.
- `material-core()` mixin — invariant Angular Material token overrides
- Typography + density passthrough to Angular Material
- Depends on cp-theming-angular + cp-theming-core

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
   Angular belongs in `theme-angular`.

7. **oklch everywhere** — Perceptually uniform, wide gamut, direct hue/lightness
   control. Not hsl.

---

## CSS Variable Conventions

`--` separates namespace segments (like `.` in OOP). `-` is a word separator within a segment.

```
--pal-{name}--base                   seed color — never use in UI directly
--pal-{name}--color                  primary UI color role
--pal-{name}--color--contrast        black or white (whichever contrasts)
--pal-{name}--color--dark            l - step-1
--pal-{name}--color--darker          l - step-2
--pal-{name}--color--light           l + step-1
--pal-{name}--color--lighter         l + step-2
--pal-{name}--color--high            mode-relative alias → dark in light, light in dark
--pal-{name}--color--higher          mode-relative alias → darker / lighter
--pal-{name}--color--low             mode-relative alias → opposite of high
--pal-{name}--color--lower           opposite of higher
--pal-{name}--bg                     background role (same derivative set)
--pal-{name}--stroke                 border/outline role (same derivative set)
--pal-{name}--focus                  focus ring color (auto-derived or explicit)
--pal-{name}--tint-1..5              transparent tints of color role

--theme--text-blend                  global blend weights (percentages)
--theme--text-emphasis-blend
--theme--text-deemphasis-blend
--theme--text-primary-tint
--theme--state-hover/press/focus/drag
--theme--tint-1..5
--theme--scrim / --theme--shadow

--typescale--{role}--font/size/line-height/weight/tracking
--density-scale                      0 (default) to -5 (most compact)
--space--xxs .. --space--xxl         calc() using density-scale
--shape--xxs .. --shape--full        corner radii
--focus--width / --focus--offset / --focus--style
--motion--duration-short/medium/long/extra
--motion--easing-standard/emphasized/decelerate/accelerate
--elevation-{0..5}--shadow
--elevation-{0..5}--tint
```

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

$primary: t.light-dark(
  t.palette(oklch(0.55 0.18 240)),
  t.palette(oklch(0.65 0.16 240)),
);

$my-theme: t.theme(
  $palettes: (
    background: t.light-dark(t.palette(oklch(0.97 0.005 220)), t.palette(oklch(0.18 0.015 220))),
    surface:    t.light-dark(t.palette(oklch(0.93 0.010 220)), t.palette(oklch(0.23 0.018 220))),
    primary:    $primary,
    danger:     t.light-dark(t.palette(oklch(0.55 0.20 25)),   t.palette(oklch(0.65 0.18 25))),
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
```

---

## Current Status

### ✅ Implemented in theme-concept/scss (to be migrated to theme-core)
- `_palette.scss` — config, define-palette, runtime color derivatives
- `_theme.scss` — full public SCSS API
- `_weights.scss`, `_overlay.scss`, `_typography.scss`, `_density.scss`
- `_shape.scss`, `_focus.scss`, `_motion.scss`, `_elevation.scss`
- `_variables.scss`, `_apply.scss`

### ⬛ Not started
- All TypeScript APIs (theme-core)
- Preset palette + theme maps
- Precompiled CSS outputs
- theme-angular (Angular signals)
- theme-material (Angular Material adapter)
- theme-m3 (plain M3 adapter)
- All demos

---

## Development Phases

### Phase 1 — Workspace scaffold ← current
- Root pnpm-workspace.yaml, package.json
- All package stubs (package.json only)
- Migrate SCSS from theme-concept into theme-core/scss

### Phase 2 — theme-core SCSS finalization
- Preset palettes (packages/theme-core/scss/presets/)
- Preset themes
- `_apply.scss` mixins for common usage patterns

### Phase 3 — theme-core TypeScript API
- `ThemeMode` enum, `ThemeDef` interface
- `setTheme`, `setMode`, `getMode`, `getPreferredMode`, `watchMode`
- MutationObserver for reactive DOM tracking

### Phase 4 — theme-core precompiled output
- Build pipeline (sass → dist/css/)
- One CSS file per preset theme

### Phase 5 — theme-angular
- `ThemeService` with Angular signals
- `[cpaTheme]` directive

### Phase 6 — theme-material
- SCSS adapter: `--pal-*` → `--mat-sys-*`
- `material-core()` mixin
- Typography + density wiring

### Phase 7 — demos
