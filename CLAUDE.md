# material-theming — Claude Instructions

See [.github/copilot-instructions.md](.github/copilot-instructions.md) for the full
project context, conventions, non-negotiable design decisions, and what is stub vs real.

See [PLAN.md](PLAN.md) for the full architecture, current status, and development phases, and
[PORT-PLAN.md](PORT-PLAN.md) for phases 8–14.

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
  loaded beside it. Semantic palettes default to their registered initial values. Checks:
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
- Contrast (Phase 10): `--contrast` is black or white by a step at relative luminance 0.179 in
  clamped linear sRGB; the step is declared once as `--theme--_contrast-step`. Every relative-colour
  derivation ends `/ 1` (only the tints carry an alpha); a harness check enforces it.
- Material adapter (Phase 11): the `--mat-sys-*` colour roles come from Angular Material's own
  role tables (`theme-ng-material/scss/_roles.scss`); roles cp-theming has a token for map to it
  (containers are `--bg`, one ladder step lighter in dark mode), the rest are `m3-tone()` of the
  theme colour, and the neutral roles (surface containers, dim, bright, `outline`) are offsets
  from `--color--surface`. Tokens that read a cp-theming variable sit on `:root, :where([theme])`.
  State-layer opacities are numbers (`calc(weight / 100%)`), as Material expects. Harness checks
  fail any `--mat-sys-*` name the installed Material reads that the adapter does not declare, and
  any component token the adapter sets that Material does not read.
- Startup (Phase 12): `theme-core/src` touches no storage at import; every storage access is
  guarded. `themeHeadSnippet` (inline `<head>` script, built from `src/storage-keys.ts`) applies the
  saved theme and mode before first paint; `demos/docs/src/index.html` carries a copy that a vitest
  check compares with the export. Browser check: `node demos/docs/test/startup.ts` (needs
  `npx ng build docs`). The docs build keeps critical-CSS inlining off: it drops the theme rules
  from the first frame.
- Docs examples (Phase 7 resumed): every Sass, CSS and attribute sample the docs show is a file
  in `demos/docs/src/examples/{page}/`, imported as text (`with { loader: 'text' }`) and shown by
  `cpa-code` / `cpa-theme-example` (which renders an attribute example from the same `.html`).
  `demos/docs/test/examples.test.ts` compiles every `.scss` through the packages' `exports` with
  zero warnings and runs the undefined-variable check on core + a preset + the example; a
  fragment that cannot be checked is named `*.display.*`. Never write such a sample in a page
  template (a check fails). The examples are in `.prettierignore`: their layout is part of the
  sample. Contrast report over the built showcase: `node demos/docs/test/render.ts`.
- A box-shadow token cannot be wrapped in `light-dark()` (colours only): `--elevation-N--shadow`
  is `<geometry> light-dark(<colour>, <colour>)`; a harness check fails a list inside `light-dark()`.
- Focus ring color is **per-palette**, auto-derived via CSS relative color.
- `cp-theming-core` has **zero Angular dependency**.
- Most packages are currently **stubs** — implement with `// TODO(phase-N):` comments.
- `cp-theming-material` targets **Angular Material M3 only** (Angular Material 17+). No M2 support.
- Do not use `@forward ... show X as Y` — invalid SCSS; use wrapper functions instead.
- Do not copy from the old `ng-material-theme` repo.
