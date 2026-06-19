# material-theming — AI Assistant Instructions

## Project Purpose
A modern CSS-variable-based theming system. The SCSS API lives in
`packages/theme-core`. Angular and Angular Material support are separate
optional adapter packages. See [PLAN.md](../PLAN.md) for full architecture,
current status, and development phases.

## Architecture

```
packages/theme-core/      @cpangular/cp-theming-core      — SCSS API + vanilla TS
packages/theme-angular/   @cpangular/cp-theming-angular   — Angular signals adapter
packages/theme-material/  @cpangular/cp-theming-material  — Angular Material adapter
packages/theme-m3/        @cpangular/cp-theming-m3        — Plain M3 adapter (stub)
demos/demo-core/                                           — Vite + vanilla demo
demos/demo-material/                                       — Angular demo
demos/demo-brand-core/                                     — Example brand pack
demos/demo-brand-material/                                 — Example brand+material pack
```

## Non-Negotiable Design Decisions

**Do not reverse these without explicit instruction.**

- **Runtime color derivatives only.** All `--pal-*--dark/light/contrast` vars are computed
  by the browser using CSS relative color syntax: `oklch(from var(--x) ...)`.
  Never use Sass `darken()`, `mix()`, `adjust-color()`, or any compile-time color math.

- **oklch color space.** All palette colors must be in `oklch(l c h / alpha)`.
  Not `hsl`, not `rgb`, not `hex`.

- **Single SCSS entry point.** Everything the user needs for authoring is in
  `_theme.scss`. One `@use '@cpangular/cp-theming-core/scss/theme' as t;` import.

- **Typed sub-configs, never raw maps.** Use `t.palette()`, `t.weights()`,
  `t.overlays()`, etc. Never `(key: value, ...)` as a theme argument.

- **t.light-dark() for mode variation.** The universal wrapper for any value
  that differs between light and dark. Does NOT use CSS `light-dark()` for
  percentage values (only valid for `<color>` type in CSS).

- **Focus color is per-palette.** `--pal-{name}--focus` is derived per palette,
  not a global. A matching-hue focus ring on a same-hue surface is invisible.

- **theme-core has no Angular dependency.** Zero. Angular belongs in
  theme-angular.

## SCSS Conventions

- `@use`/`@forward` only — never `@import`
- Internal modules prefixed with `_` (e.g. `_palette.scss`)
- `@forward` cannot rename individual members — use wrapper functions instead
- All modules use `@use 'sass:map'` etc, never global builtins
- Deprecated `if()` → use `@if` block before `@return`
- Deprecated `str-slice()` → use `string.slice()` from `sass:string`

## CSS Variable Naming
`--` = namespace separator (like `.` in OOP). `-` = word separator within a segment.
```
--pal-primary--color              ✓
--pal-primary-color               ✗ (ambiguous depth)
--pal-primary--color--dark        ✓
```

## TypeScript Conventions (theme-core/src)
- Vanilla TS, no framework
- `ThemeMode` enum: `AUTO`, `LIGHT`, `DARK`
- All DOM interaction goes through explicit element parameters (no global `document` assumptions)
- Use `MutationObserver` for reactive watching, not polling
- Public API: `getTheme`, `setTheme`, `getMode`, `setMode`, `getPreferredMode`, `watchMode`

## TypeScript Conventions (cp-theming-angular/src)
- Angular 19+, standalone components/directives/services
- `ThemeService` uses Angular `signal()` and `computed()` — no RxJS Subjects
- Inject `ThemeService` via `inject()`, not constructor
- `[cpaTheme]` directive is structural, not attribute

## What Is Stub vs Real
Packages that are **stub only** (package.json + empty/commented src files):
- `cp-theming-angular`, `cp-theming-material`, `cp-theming-m3`, all demos

`cp-theming-core` SCSS is **real** — migrated from `theme-concept/scss`.
`cp-theming-core` TypeScript is **stub** until Phase 3.

When editing a stub, add a `// TODO(phase-N):` comment explaining what belongs there.

## Build Commands
```bash
# From workspace root
pnpm install

# theme-core only
cd packages/theme-core && pnpm build   # compiles SCSS → dist/css/

# All packages
pnpm -r build
```

## Key Files
- [PLAN.md](../PLAN.md) — full plan, status, phases
- [packages/theme-core/scss/_theme.scss](../packages/theme-core/scss/_theme.scss) — public SCSS API (`@cpangular/cp-theming-core`)
- [packages/theme-core/scss/_palette.scss](../packages/theme-core/scss/_palette.scss) — palette system

## What NOT To Do
- Do not use `@import` in any SCSS file
- Do not use Sass color functions (`darken`, `mix`, `adjust-color`, etc.)
- Do not add Angular dependencies to `cp-theming-core`
- Do not use `@forward ... show X as Y` — it is invalid SCSS syntax; use wrapper functions
- Do not copy patterns from the old `ng-material-theme` repo — this is a rewrite
- Do not use RxJS in `cp-theming-angular` where Angular signals are sufficient
- Do not add features beyond what is asked — implement stubs with clear TODOs
- Do not add Angular Material M2 support — `cp-theming-material` targets M3 only (Angular Material 17+)
