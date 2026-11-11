# material-theming — AI Assistant Instructions

## Project Purpose
A modern CSS-variable-based theming system. The SCSS API lives in
`packages/theme-core`. Angular and Angular Material support are separate
optional adapter packages. See [PLAN.md](../PLAN.md) for full architecture,
current status, and development phases.

## Architecture

```
packages/theme-core/      @cpangular/cp-theming-core      — SCSS API + vanilla TS
packages/theme-ng-core/   @cpangular/cp-theming-ng-core   — Angular signals adapter
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

- **Any CSS colour in, oklch out.** Authors may write palette, brand and override colours in
  any CSS colour format — `oklch()`, hex, `rgb()`, `hsl()`, named colours. The library derives
  every variant in oklch (`oklch(from var(--x) …)`), so lightness steps stay perceptual whatever
  the input. oklch inputs are recommended for predictable steps, never required.
  (Withdrew the former "oklch only" rule for inputs on 2026-11-09.)

- **Single SCSS entry point.** Everything the user needs for authoring is in
  `_theme.scss`. One `@use '@cpangular/cp-theming-core/scss/theme' as t;` import.

- **Typed sub-configs, never raw maps.** Use `t.palette()`, `t.weights()`,
  `t.overlays()`, etc. Never `(key: value, ...)` as a theme argument.

- **t.light-dark() for mode variation.** The universal wrapper for any value
  that differs between light and dark. Does NOT use CSS `light-dark()` for
  percentage values (only valid for `<color>` type in CSS): percentages are a
  `--mode-light` / `--mode-dark` pair picked with the private mode flag.

- **Register what animation needs, nothing derived.** `@property` is for each
  core palette role's light and dark colour (`--color--{name}[--role]--mode-light`
  / `--mode-dark`), `--color--brand` and the scalars. The role tokens and every
  derivative stay unregistered `light-dark()` / `oklch(from …)` expressions so
  they resolve where they are used and `themeMode` works on any element.

- **Core derives once; a theme is one rule.** `define-core-theme()` declares
  every default and derivation on `:where(:root)` / `:where(:root, [theme])`;
  `define-theme()` emits `[theme="name"]` holding only what was passed. Load
  order is core, then themes, then the adapter. Variable-only rules are `:where()`.

- **Contrast is automatic, by luminance.** Every `--contrast` is black or white, chosen by a
  step at WCAG relative luminance 0.179 read from linear sRGB with each channel clamped to 0–1
  (`_palette.scss`, "Contrast"). The step is declared once as the private
  `--theme--_contrast-step`. Do not go back to a lightness threshold: no single one passes
  every hue.

- **Derivations are opaque.** Every relative-colour derivation ends `/ 1`, so a translucent
  input cannot make ladder steps, auto roles or text translucent. Only `--tint-1..5` carry an
  alpha. The contrast check fails a derivation without it.

- **Focus color is per-palette.** `--pal-{name}--focus` is derived per palette,
  not a global. A matching-hue focus ring on a same-hue surface is invisible.

- **theme-core has no Angular dependency.** Zero. Angular belongs in
  theme-ng-core.

## SCSS Conventions

- `@use`/`@forward` only — never `@import`
- Internal modules prefixed with `_` (e.g. `_palette.scss`)
- `@forward` cannot rename individual members — use wrapper functions instead
- All modules use `@use 'sass:map'` etc, never global builtins
- Deprecated `if()` → use `@if` block before `@return`
- Deprecated `str-slice()` → use `string.slice()` from `sass:string`

## Scripts and Tests
- Every script and test is **TypeScript run by Node 24** (type stripping). Never `.mjs`, `.cjs`
  or `.js`. Files Node runs directly use only erasable syntax (no enums, namespaces or
  parameter properties); files vitest runs may import anything from `src/`.
- CSS checks: `packages/theme-core/test/css/*.test.ts` and `packages/theme-ng-material/test/css/*.test.ts`,
  run by `node --test`. They compile the Sass through the JS API; a check today's code fails is
  marked `todo` naming the phase that fixes it, so the run stays green and each phase removes
  its own `todo`.
- TypeScript API tests: `packages/theme-core/test/api/*.spec.ts`, run by vitest with jsdom.
- Browser check: `packages/theme-core/test/render.ts` (Playwright, Chromium + Firefox; `webkit`
  as an argument), local only: `pnpm --filter @cpangular/cp-theming-core render`. Every row passes
  in Chromium and Firefox since Phase 9; `--html` writes a self-contained page for Safari.
- Fixture themes live in `packages/theme-core/test/fixtures/` and `packages/theme-ng-material/test/fixtures/`.
- CI: `.github/workflows/test.yml` (cpdevtools/git-flow) runs `github.actions.build` then
  `github.actions.test` in every package that defines them.

## CSS Variable Naming
`--` = namespace separator (like `.` in OOP). `-` = word separator within a segment.
The `color` role is the palette's primary identity — it becomes the namespace prefix with no trailing segment.
```
--color--primary                      ✓  (primary color role — no suffix)
--color--primary--contrast            ✓  (primary color contrast)
--color--primary--dark                ✓  (primary color dark modifier)
--color--primary--dark--contrast      ✓  (primary color dark contrast)
--color--primary--bg                  ✓  (primary bg role)
--color--primary--bg--dark            ✓  (primary bg dark modifier)
--color--primary--tint-1              ✓  (primary tint)
--color--primary--focus               ✓  (primary focus ring)
--pal-primary--color                  ✗  (old naming — do not use)
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

# Tests (CSS checks + TypeScript API tests)
pnpm test                                   # both packages, through wireit
pnpm --filter @cpangular/cp-theming-core test
pnpm --filter @cpangular/cp-theming-ng-material test
pnpm --filter @cpangular/cp-theming-core render   # browser check, local only
```

## Key Files
- [PLAN.md](../PLAN.md) — full plan, status, phases
- [PORT-PLAN.md](../PORT-PLAN.md) — phases 8–13 (harness, cascade, contrast, Material adapter, startup, release)
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

## README Maintenance

**Always keep READMEs in sync with the actual state of the code.**

Rules:
- The root [README.md](../README.md) has a **Packages**, **Demos**, and **Development Phases** status table. Update these whenever a phase completes, a package moves from stub to real, or a new item is added.
- Status indicators:
  - `✅ Done` — fully implemented and building cleanly
  - `🟡 In Progress` — partially implemented; add a short note on what's real vs stub
  - `⬛ Stub` — package.json + empty/placeholder src only, no real implementation
  - `🔴 Broken` — exists but currently not building or has known issues
- When completing any phase or milestone, update the phase table row from `⬛ Not started` → `🟡 In Progress` → `✅ Done`.
- When a package transitions from stub to real (even partially), update its row and add a parenthetical noting what is and isn't implemented yet.
- If you add a new package, demo, or phase, add it to the README tables at the same time.
- Do not remove "not started" or "stub" entries — they are intentional and help communicate project scope.

