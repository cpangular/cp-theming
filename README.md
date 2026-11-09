# cp-theming

> **Status: Early Development** — Core SCSS authoring API is functional. Most packages are stubs.

A modern CSS-variable-based theming system for Angular applications. All color derivatives are computed at **runtime by the browser** via CSS relative color syntax (`oklch(from ...)`). Angular Material is an optional adapter layer, not a core dependency.

---

## Packages

| Package | npm | Status |
|---|---|---|
| `packages/theme-core` | `@cpangular/cp-theming-core` | 🟡 In Progress — SCSS real, TS API real (Phase 3 done), harness in `test/` (Phase 8 done) |
| `packages/theme-ng-core` | `@cpangular/cp-theming-ng-core` | ✅ Done — `ThemeService`, `ThemeDirective`, `ThemeModeDirective` |
| `packages/theme-ng-material` | `@cpangular/cp-theming-ng-material` | ✅ Done — 166 `--mat-sys-*` token mappings, density scopes |
| `packages/theme-material` | `@cpangular/cp-theming-material` | ⬛ Stub |
| `packages/theme-m3` | `@cpangular/cp-theming-m3` | ⬛ Stub |

## Demos

| Demo | Description | Status |
|---|---|---|
| `demos/docs` | Angular 22 + Material 22 docs/showcase site | 🟡 In Progress — all pages scaffolded, theme + mode switching working; Pages deploy is manual-only until the repo is public |
| `demos/demo-core` | Vanilla TS + Vite | 🟡 In Progress — POC reimplemented |
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
| 7 | `demos/docs` — Documentation + showcase site | 🟡 In Progress — paused until Phase 9 |
| 8 | Test harness and CI (`node --test` CSS checks, vitest API tests, Playwright `render.ts`, git-flow `test.yml`) | ✅ Done |
| 9 | Cascade: a theme is one rule; core derives once | ⬛ Not started |
| 10 | Contrast and alpha | ⬛ Not started |
| 11 | Material adapter from Material's role tables | ⬛ Not started |
| 12 | Startup: no flash, safe import | ⬛ Not started |
| 13 | Release through cpdevtools/git-flow | ⬛ Not started |

Phases 8–13 are specified in [PORT-PLAN.md](PORT-PLAN.md).

---

## Getting Started

```bash
pnpm install
pnpm build         # builds all packages
pnpm build.core    # builds @cpangular/cp-theming-core only
pnpm test          # CSS checks (node --test) + TypeScript API tests (vitest) in both packages
pnpm fix           # format all files with prettier

# Browser check of the cascade (Playwright, Chromium + Firefox; local only)
pnpm --filter @cpangular/cp-theming-core render
```

---

## SCSS Usage (theme-core)

```scss
@use '@cpangular/cp-theming-core/scss/theme' as t;

$my-theme: t.theme(
  $palettes: (
    background: t.light-dark(t.palette(oklch(0.97 0.005 220)), t.palette(oklch(0.18 0.015 220))),
    primary:    t.light-dark(t.palette(oklch(0.55 0.18 240)),  t.palette(oklch(0.65 0.16 240))),
  ),
  $weights:    t.light-dark(t.weights(), t.weights($text-blend: 78%)),
  $typography: t.typography(),
  $density:    t.density(),
  $shape:      t.shape(),
);

:root {
  @include t.define-theme('my-theme', $my-theme, $default: true);
}
```

---

## Design Principles

- **Runtime derivatives** — `oklch(from var(--pal-primary--color) calc(l - 0.1) c h)`, not `darken($color, 10%)`
- **Any colour in, oklch out** — pass palette colours in any CSS format (oklch, hex, `rgb()`, `hsl()`); every derivative is computed in oklch, so steps stay perceptually uniform
- **Single SCSS import** — one `@use` gives the full authoring surface
- **Per-palette focus color** — focus ring is derived per palette, not global
- **Framework-agnostic core** — `theme-core` has zero Angular dependency
- **M3 only** — `theme-material` targets Angular Material 17+ (M3). No M2 support.

See [PLAN.md](PLAN.md) for the full architecture and CSS variable reference.
