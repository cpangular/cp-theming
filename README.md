# cp-theming

> **Status: Early Development** — Core SCSS authoring API is functional. Most packages are stubs.

A modern CSS-variable-based theming system for Angular applications. All color derivatives are computed at **runtime by the browser** via CSS relative color syntax (`oklch(from ...)`). Angular Material is an optional adapter layer, not a core dependency.

---

## Packages

| Package | npm | Status |
|---|---|---|
| `packages/theme-core` | `@cpangular/cp-theming-core` | 🟡 In Progress — SCSS real, TS API real (Phase 3 done), harness in `test/` (Phase 8 done), cascade: core derives once, a theme is one rule (Phase 9 done), contrast by luminance step (Phase 10 done), palette chain: `brand` and `tertiary` are core palettes and a theme passes only the colours it has (Phase 14 done) |
| `packages/theme-ng-core` | `@cpangular/cp-theming-ng-core` | ✅ Done — `ThemeService`, `ThemeDirective`, `ThemeModeDirective` |
| `packages/theme-ng-material` | `@cpangular/cp-theming-ng-material` | ✅ Done — every `--mat-sys-*` token Angular Material 22 reads (186 declared), colour roles from Material's own role tables (Phase 11 done), tertiary roles from `--color--tertiary` (Phase 14 done), `[palette]` scopes for the eight accent palettes, two component patches, density scopes |
| `packages/theme-material` | `@cpangular/cp-theming-material` | ⬛ Stub |
| `packages/theme-m3` | `@cpangular/cp-theming-m3` | ⬛ Stub |

## Demos

| Demo | Description | Status |
|---|---|---|
| `demos/docs` | Angular 22 + Material 22 docs/showcase site | 🟡 In Progress — all pages built; every Sass, CSS and attribute sample is a real file under `demos/docs/src/examples/`, compiled and checked by `pnpm test` and rendered live from the same file; theme + mode switching working, saved theme and mode painted on the first frame (`node demos/docs/test/startup.ts`), painted-contrast report over the showcase (`node demos/docs/test/render.ts`), pixel check of the palette chain on Getting Started and the showcase (`node demos/docs/test/chain.ts`); TypeScript, shell and JSON samples are still hand-written; Pages deploy is manual-only until the repo is public |
| `demos/demo-core` | Vanilla TS + Vite | 🔴 Broken — POC reimplemented, loads core first via `t.define-core-theme()`, but `pnpm build` fails: `src/scss/components.scss` calls `a.container(high)` and the mixin takes no argument |
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
| 13 | Release through cpdevtools/git-flow | ⬛ Not started |
| 14 | Brand and accent palettes: pass what you have, the rest are generated (`brand` and `tertiary` core palettes; the chain brand → primary → secondary, tertiary → background, surface; semantic defaults; Material tertiary from `--color--tertiary`) | ✅ Done |
| 14b | Follow-ups from the Phase 14 review: chroma floors for the generated secondary and tertiary, the generated primary readable on the generated background in every hue, `bg` on `background` and `surface` with readable text, Showcase back in the ng-material sidebar | ✅ Done |
| 15 | Material component gallery in the ng-material docs | ⬛ Not started |

Phases 8–15 are specified in [PORT-PLAN.md](PORT-PLAN.md); 14 and 14b were done before 13.

### Browser baseline

`packages/theme-core/test/render.ts` (207 rows: `themeMode` on any element, nested themes, coexisting
presets, user overrides, the theme-switch crossfade, the eight defects the Phase 9 critique
confirmed, the browser-computed `--contrast` against the contrast sweep's prediction for a
sample of colours, the Material roles, state layers and shadows of Phase 11, and the palette
chain of Phase 14: what is generated for a theme with only a brand, only a primary, a nested
theme, a theme beside a loaded default, and what a nested theme inherits; and the text colour of
`bg` on the neutral palettes, Phase 14b) passes 207 of 207 in the Playwright builds
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
pnpm build         # builds all packages
pnpm build.core    # builds @cpangular/cp-theming-core only
pnpm test          # CSS checks (node --test) + TypeScript API tests (vitest) in both packages, and the docs examples
pnpm fix           # format all files with prettier

# Browser check of the cascade (Playwright, Chromium + Firefox; local only)
pnpm --filter @cpangular/cp-theming-core render

# Browser check of startup: saved theme and mode painted before the docs bundle runs (local only)
npx ng build docs && node demos/docs/test/startup.ts

# Painted-contrast report over the built showcase, light and dark (local only)
npx ng build docs && node demos/docs/test/render.ts

# Pixel check of the palette chain on the built docs: the brand swatch, three accents per preset (local only)
npx ng build docs && node demos/docs/test/chain.ts
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
brand's hue. Pass one, two or three accents; `error`, `warn`, `caution` and `pass` have defaults.

---

## Design Principles

- **Runtime derivatives** — `oklch(from var(--pal-primary--color) calc(l - 0.1) c h)`, not `darken($color, 10%)`
- **Any colour in, oklch out** — pass palette colours in any CSS format (oklch, hex, `rgb()`, `hsl()`); every derivative is computed in oklch, so steps stay perceptually uniform
- **Single SCSS import** — one `@use` gives the full authoring surface
- **Pass what you have** — the brand colour is kept exact; the primary, accents and neutrals a theme leaves out are generated from the nearest colour it passed
- **Per-palette focus color** — focus ring is derived per palette, not global
- **Framework-agnostic core** — `theme-core` has zero Angular dependency
- **M3 only** — `theme-material` targets Angular Material 17+ (M3). No M2 support.

See [PLAN.md](PLAN.md) for the full architecture and CSS variable reference.
