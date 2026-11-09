# material-theming — Claude Instructions

See [.github/copilot-instructions.md](.github/copilot-instructions.md) for the full
project context, conventions, non-negotiable design decisions, and what is stub vs real.

See [PLAN.md](PLAN.md) for the full architecture, current status, and development phases, and
[PORT-PLAN.md](PORT-PLAN.md) for phases 8–13.

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
  rule holds only what was passed. Registered: the role colour pairs `--mode-light`/`--mode-dark`,
  `--color--brand`, the scalars. Load order: core, themes, adapter.
- Focus ring color is **per-palette**, auto-derived via CSS relative color.
- `cp-theming-core` has **zero Angular dependency**.
- Most packages are currently **stubs** — implement with `// TODO(phase-N):` comments.
- `cp-theming-material` targets **Angular Material M3 only** (Angular Material 17+). No M2 support.
- Do not use `@forward ... show X as Y` — invalid SCSS; use wrapper functions instead.
- Do not copy from the old `ng-material-theme` repo.
