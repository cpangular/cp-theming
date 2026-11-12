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
  / `--mode-dark`, ten palettes) and the scalars. `--color--brand` is the join
  of the brand palette's pair, not a registration of its own. The role tokens and every
  derivative stay unregistered `light-dark()` / `oklch(from …)` expressions so
  they resolve where they are used and `themeMode` works on any element.

- **Core derives once; a theme is one rule.** `define-core-theme()` declares
  every default and derivation on `:where(:root)` / `:where(:root, [theme])`;
  `define-theme()` emits `[theme="name"]` holding only what was passed (plus,
  for a palette of the chain the theme left out, a reference to the colour
  core generates). Load
  order is core, then themes, then the adapter. Variable-only rules are `:where()`.

- **Pass what you have; the rest is generated.** Colours follow the chain
  brand → primary → secondary, tertiary → background, surface. A theme passes
  whichever it has (one, two or three accents, with or without `$brand`) and
  core generates each one it left out, at runtime, on the shared derivation
  selector. A theme that passes a primary and no `$brand` has that primary as
  its brand palette (its rule points the brand pair at the primary pair, Phase
  14d); the root never does, so with no theme the brand is grey. Generated:
  primary from the brand with
  `palette-from-brand()`'s readability clamps (lightness 0.35–0.45 light /
  0.65–0.82 dark, chroma 0.22 at most), secondary (primary's hue, a third of
  its chroma, 0.04 at least) and tertiary (hue + 60°, half its chroma, 0.08 at
  least; neither floor exceeds the primary's own chroma) from primary,
  background and surface as neutrals of the brand hue. The three accents and
  `palette-from-var()` / `palette-from-brand()` then give up chroma until sRGB
  can show them (`_in-gamut()`, four nested passes, the expression written
  once), so the browser paints the hue that was asked for instead of clipping
  to another one; keep new generated accents inside that wrapper. The brand colour is
  never adjusted: `--color--brand` is exactly what was passed. `error`, `warn`,
  `caution` and `pass` are fixed defaults, not derived. The root generates the
  whole chain; a nested theme generates only what is downstream of what it
  passed and inherits the rest. The mechanism: core declares each generated
  colour as a private variable (`--theme--_generated--{name}--{mode}`) on the
  shared selector and never sets a pair there; `:where(:root)` and each theme
  rule point the pairs at those variables. Do not declare a generated pair on
  the shared selector itself: a nested theme that passed no colour would then
  re-derive from inherited inputs and lose the colours around it, and a
  default theme loaded beside the theme on `<html>` would beat it. Do not go
  back to "tertiary = secondary" in the Material adapter.

- **Contrast is automatic, by luminance.** Every `--contrast` is black or white, chosen by a
  step at WCAG relative luminance 0.179 read from linear sRGB with each channel clamped to 0–1
  (`_palette.scss`, "Contrast"). The step is declared once as the private
  `--theme--_contrast-step`. Do not go back to a lightness threshold: no single one passes
  every hue.

- **Derivations are opaque.** Every relative-colour derivation ends `/ 1`, so a translucent
  input cannot make ladder steps, auto roles or text translucent. Only `--tint-1..5` carry an
  alpha. The contrast check fails a derivation without it.

- **`bg()` on `background` and `surface` sets contrast text.** The bg layer keeps the
  palette's colour as text; for the two neutral palettes that colour is the fill, so their
  `[palette]` rule reads the bg role's contrast from a private variable `bg()` sets
  (`--container--_bg-text`, cleared by those two rules so it does not inherit into a palette
  scope without `bg`). `bg()` itself declares no `color`. In a rule of your own, include
  `apply-palette()` before `bg()`.

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
  in Chromium and Firefox since Phase 9; `--html` writes a self-contained page for Safari. The
  `chain/` rows (Phase 14) and `gamut/` rows (Phase 14c) carry expectations worked out by hand;
  keep them that way. A row with `hue` also asserts the hue of the colour as painted.
- Chain check on the built docs: `demos/docs/test/chain.ts` (Playwright, local only), after
  `npx ng build docs`: the Getting Started `palette="brand"` swatch is the example's `$brand` in
  both modes, and every preset column of the showcase shows three different accents.
- Startup check: `demos/docs/test/startup.ts` (Playwright, all three engines, local only), run
  after `npx ng build docs`: the saved theme and mode are painted before the bundle runs.
- Docs examples: `demos/docs/test/examples.test.ts` (`pnpm --filter docs test`, part of
  `pnpm test` and of CI). Every Sass, CSS and attribute sample the docs show is a file in
  `demos/docs/src/examples/{page}/` that pages import as text. `.scss` compiles through the
  packages' `exports` with zero warnings and passes the undefined-variable check with core + a
  preset; `.output.css` is compiled output verbatim; `.html` uses only attributes the library's
  CSS selects on and is what `cpa-theme-example` renders; `*.display.*` marks a fragment that
  cannot be checked. Do not write such a sample in a page template.
- Contrast report: `demos/docs/test/render.ts` (Playwright, Chromium by default, local only), run
  after `npx ng build docs`: the painted contrast of every label on the showcase in light and dark,
  and the component gallery (Phase 15) per preset and mode: every section screenshotted, as
  loaded, hovered, focused and with every overlay open. A component label below 4.5:1 fails the
  run; a disabled control and a docs caption are reported. `--only=gallery|showcase`,
  `--preset=`, `--mode=`, `--section=a,b`, `--jobs=N`; engines as arguments (`chromium firefox`).
- Component gallery examples: `demos/docs/src/examples/components/*.ng.html` are Angular
  templates, each the `templateUrl` of a component in
  `demos/docs/src/app/packages/pages/components/gallery.components.ts`. The examples check allows
  HTML, Angular Material and library elements and attributes only, no `style`, and layout classes
  only (`gallery-layout.scss` may not declare a colour). `*.ts.txt` is TypeScript the docs show,
  verbatim from a source file of the docs app. Never colour a gallery example: fix the adapter or
  add a measured patch to `apply-material-overrides()`.
- The docs read the adapter's built CSS (`packages/theme-ng-material/dist/*.css`): after a change
  in its `scss/`, run `pnpm --filter @cpangular/cp-theming-ng-material build` before
  `npx ng build docs`. Root `pnpm build` builds core and `demos/demo-core`, not the adapter.
- The deployed site is `pnpm --filter docs build`: core, the adapter and demo-core, the production
  `ng build`, then `demos/docs/scripts/assemble.ts` (demo-core copied to `demos/demo-core/`,
  `404.html`). An example's `href` is a fragment, an absolute path or a URL; the docs layout keeps
  a fragment link on the page, because the site's `<base href>` would otherwise send it to the root.
- Fixture themes live in `packages/theme-core/test/fixtures/` and `packages/theme-ng-material/test/fixtures/`.
- CI: `.github/workflows/test.yml` (cpdevtools/git-flow) runs `github.actions.build` then
  `github.actions.test` in every package that defines them.
- Releases (Phase 13) run through cpdevtools/git-flow. Every `package.json` carries the placeholder
  `0.0.0-MAIN`; never write a real version into a manifest. The real version is
  `.publish/versions.yml`, changed only by `pnpm gitflow version`, which the user runs. A push
  updates a draft release PR into `release/<branch>`; merging it publishes the three packages to
  GitHub Packages (`.publish/registries.yml`). Never merge a release PR or merge into `main`.
  `demos/docs` is a `static-site` artifact (`deploy: [gh-pages]`, `pagesRoot`): a merge attaches
  the built site to the release, and `pnpm gitflow deploy` (the user runs it) puts it on the
  `gh-pages` branch through `.github/workflows/deploy-production.yml`. A merge never deploys.
  Each published package has `release-artifacts.yml` and `github.actions.pack`: theme-core packs
  with `publishConfig.exports`, theme-ng-core with `publishConfig.directory` (the ng-packagr
  output), theme-ng-material as plain Sass/CSS. Peers between them are `workspace:^`.

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
- Public API: `getTheme`, `setTheme`, `getMode`, `setMode`, `getPreferredMode`, `watchMode`,
  `themeHeadSnippet` (the one place that reads the global `document`: it is pasted into `<head>`)
- Nothing runs at import. Storage is read on first use and every access is guarded with
  try/catch, so the package imports on a server and works where storage is blocked
- Storage keys and attribute names live in `storage-keys.ts`; `theme.ts` and `head-snippet.ts`
  both import them. Change `demos/docs/src/index.html` when the snippet changes (a test fails
  until you do)

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
- [PORT-PLAN.md](../PORT-PLAN.md) — phases 8–14 (harness, cascade, contrast, Material adapter, startup, release, palette chain)
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

