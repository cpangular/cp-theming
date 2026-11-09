# cp-theming — Port plan for the spike findings

_Written 2026-11-09 against `main` at `df8151e`. Companion: [PORT-SESSIONS.md](PORT-SESSIONS.md)._

## What this is

A spike on the old `ng-material-theme` repo (branch `feature/ng21`, 2026-11-07/08) produced nine
findings. This plan says which of them apply to cp-theming, where they land, and in what order.

Rules for everything below:

- cp-theming's API, grammar and concepts are the standard: `t.theme()`, `t.palette()`,
  `t.light-dark()`, `define-theme`, `define-core-theme`, `--color--{name}--{role}`, per-palette focus,
  weights, shape, motion, and the `theme` / `themeMode` / `palette` attributes.
- No spike code is copied. Every number here was measured on cp-theming's own code. "Do not copy
  patterns from the old ng-material-theme repo" stays in force; only findings cross over.
- The non-negotiable decisions in [.github/copilot-instructions.md](.github/copilot-instructions.md)
  are respected. Where a finding touched one, it was put to you as a question; the outcome is in
  [Your answers](#your-answers-2026-11-09).
- KISS. Each phase has a Done-when that a script or a browser check can decide.

The port list was attacked by eight Opus critics (one per item) and one cross-cutting critic, each
told to refute it against the code. Everything below is what survived. What they removed is listed in
[Dropped or changed by the critics](#dropped-or-changed-by-the-critics).

---

## What was measured on cp-theming

Compiled with Sass from the sources at `df8151e`; behaviour checked in Chromium 158, Firefox 159 and
WebKit 27.2. The probe pages and scripts were scratch files; Phase 8 rebuilds them as fixtures.

**Compiled CSS**

- `core.css` registers **70** `@property` rules: 41 colours (the four role tokens `--color--{name}`,
  `--bg`, `--stroke`, `--focus` of the eight core palettes, four `--palette-color*`, four
  `--container--*`, `--color--brand`) and 29 scalars (`--weight--*`, `--density-scale`, `--space--*`,
  `--shape--*`). PLAN.md:133 says every listed variable is registered;
  packages/theme-core/docs/theme.md:296-309 already lists exactly these 70.
- Each preset is 121 KB (9.6 KB gzipped) with 1356 declarations that differ from the next preset in
  about 40 literals, because every theme re-emits every derivation and every default.
- 75 variables are read and never declared: the Material adapter reads `--typescale--*`
  (packages/theme-ng-material/scss/_material.scss:165-169), core emits `--text--*`. Every Material
  typography token is invalid today.
- No relative-colour derivation pins alpha (0 of 366 per preset). No rule uses `:where()`.
- Sass prints `if()` deprecation warnings for packages/theme-core/scss/_palette.scss:269-270.

**Behaviour today**

| Case | Result |
|---|---|
| `<html theme="x" themeMode="dark">` | dark only because of the `, body` default selector; without `$default` it stays light |
| `<div themeMode="dark">` inside a theme, no `theme` attribute | **stays light** (PLAN.md:137-146 documents it as "forces dark in subtree") |
| Two shipped presets loaded, `<html theme="azure-blue">` | **rose-red** shows: the last-loaded `, body` rule wins. demos/docs/src/styles.scss:8-114 works around it |
| User `:root { --color--primary: … }` before or after a preset | loses both times |
| `--color--primary` or `--color--brand` set on a plain element or a `[theme]` without a rule | base changes, derivations do not follow (they exist only inside each named theme rule) |
| Parent sets `--shape--md`, nested preset theme | nested theme resets it to the default |
| `--mat-sys-*` mapped on `:root` only | does not follow a nested theme (`var()` is substituted where it is declared) |
| Theme switch or mode flip with an author-supplied `transition: --color--primary 1s` | crossfades, because the colour tokens are registered. The library itself emits no transition |

**Contrast**

- The shipped rule (packages/theme-core/scss/_palette.scss:147) is below 4.5:1 on 9.7 % of sRGB
  colours with lightness 0.30–0.80, worst 3.50:1. In the shipped presets, 46 of 1008 role/step
  colours fail.
- No single lightness threshold can pass every hue: black text fails up to L 0.600 (hue 312) while
  white text already fails from L 0.555 (hue 136).
- Picking black or white at relative luminance 0.179 (the point where both give equal contrast) never
  fails for an opaque colour, worst 4.58:1, provided the channels are clamped to what the screen
  paints.

**Prototype of the Phase 9 cascade** (scratch stylesheet, same results in all three engines)

With each role's light and dark colour registered as two plain colours, `--color--{name}` itself left
unregistered as `light-dark()` of the two, and derivations declared once on `:where(:root, [theme])`:
`themeMode` flips a plain element; a nested theme does not inherit the outer theme's explicit `$bg`;
a `[palette]` scope and a `--mat-sys-*` alias follow a nested `themeMode`; an inline `--color--brand`
re-derives; a theme switch crossfades the base, its ladder step, a nested theme and a dark subtree
(all mid-way at 0.5 s of 1 s). With nothing registered at all, a user `:root` rule placed before the
library wins, and a mode flip over 400 themed elements recalculates in 1–2 ms. Mode-varying
percentages picked arithmetically from a light and a dark value with an inherited 0/1 flag are
correct for seven nesting cases under both OS schemes.

**Repo and CI**

- No tests. vitest and jsdom are root devDependencies with no test files.
- The only workflow, `.github/workflows/pages.yml`, has failed on all six runs at "Install pnpm"
  (pnpm version given twice). The docs have never deployed. The org is on GitHub Free and the repo is
  private, so Pages is not available at all.

---

## The nine findings

| # | Spike finding | Verdict for cp-theming | Lands in |
|---|---|---|---|
| 1 | Contrast by WCAG luminance step in linear sRGB | **Applies.** Contrast stays automatic; the step reads linear sRGB internally | Phase 10, `_palette.scss:147-165` |
| 2a | Core under zero-specificity selectors | **Applies** to rules that only declare custom properties. Layers that set real properties and per-element attribute scopes keep attribute specificity | Phase 9 |
| 2b | Constants declared once, not per theme | **Applies** | Phase 9 |
| 2c | A theme declares only what its author passed, so nested themes inherit | **Applies** | Phase 9 |
| 2d | Alpha pinned to 1 in relative-colour derivations | **Applies**, tints excepted | Phase 10 |
| 2e | No `light-dark()`-valued variable as a relative-colour origin | **Does not apply.** It works in all three current engines. No guard is added | — |
| 3 | `@property` only for theme inputs | **Applies, as your rule "register what animation needs"**: each role's light and dark colour and the scalars are registered; everything derived is not | Phase 9 |
| 4 | Material adapter computed from Material's role tables | **Applies, adapted**: roles cp-theming already has map to its tokens | Phase 11, theme-ng-material only |
| 5 | Surface roles from Material tone numbers | **Applies inside the adapter only**, as offsets from `--color--surface`. Core gets no new tokens | Phase 11 |
| 6a | Head script against a flash of the wrong theme; import safe on a server | **Applies** | Phase 12 |
| 6b | Runtime theme definition through the CSSOM | **Not scheduled** | — |
| 7 | Test harness in TypeScript | **Applies in full** | Phase 8 |
| 8a | Docs examples are real files, checked at build time | **Applies** | Phase 7 (resumed) |
| 8b | Docs in strict dependency order with a build check | **Does not apply.** The docs are a reference grouped by module, not a tutorial | — |
| 9 | Release through cpdevtools/git-flow, scripts in TypeScript only | **Applies** | Phase 8 (CI half), Phase 13 |

---

## Phases

cp-theming's own phases 1–6 are done and phase 7 (docs and demos) is in progress. Phase 7 pauses
until Phase 9 has landed, because the cascade change deletes the docs workarounds and changes what the
examples show. New phases continue the numbering.

Order: **8 → 9 → 10 → 11 → 12 → 7 (resumed) → 13.** Phase 12 does not depend on 9–11 and can run any
time after 8. Your answers of 2026-11-09 are folded into the phases; see
[Your answers](#your-answers-2026-11-09) for what is still open.

Every session that finishes a phase also updates the status tables in README.md and "Current Status"
in PLAN.md, as the README maintenance rule requires.

### Phase 8 — Test harness and CI

Goal: the repo can tell on every push whether its CSS is sound. Needs no answers.

- **CSS checks** as `packages/theme-core/test/*.test.ts` and `packages/theme-ng-material/test/*.test.ts`,
  run by Node's built-in runner (`node --test`, Node 24 type stripping, TypeScript only). A check
  that today's code fails is marked `todo` with the phase that fixes it, so the run is green and each
  later phase removes its own `todo`.
  1. Every Sass entry named in the two packages' build commands compiles through the Sass JS API with
     zero deprecation warnings from cp-theming's own files (`quietDeps` for dependencies).
  2. Undefined-variable check on compiled CSS: every `var(--x)` without a fallback is declared or
     registered. Run on core + each preset, core + preset + adapter, and the docs app's full style
     list. _(todo: Phase 11, the 75 `--typescale--*` reads.)_
  3. Contrast sweep with colorjs.io. Inputs come from the compiled CSS and `$theme-step-1..3`, never
     hard-coded: every preset role and ladder step against its `--contrast`, plus a hue × lightness ×
     chroma grid including colours outside sRGB. _(todo: Phase 10.)_ Identity text on the auto `--bg`
     role is reported, not failed (see [Found on the way](#found-on-the-way-not-fixed-by-this-plan)).
  4. Size, `@property` count and the exact registered list of `core.css`, plus 4 names per custom
     palette in a theme stylesheet until Phase 9 removes them.
  5. Cascade shape. _(Written in Phase 9, when the shape exists.)_
- **Fixture themes** under `packages/theme-core/test/fixtures/` for what the presets never exercise:
  a custom palette name, `palette-from-brand` / `background-from-brand` / `surface-from-brand`,
  explicit `$bg` / `$stroke` / `$focus`, `t.light-dark()` weights and elevation, and in
  theme-ng-material a theme defined with `$adaptor: mat.adaptor()`. Checks 1, 2 and 4 run on them too.
- **TypeScript API tests** with the vitest and jsdom already installed, because Node type stripping
  cannot import `packages/theme-core/src` (the `ThemeMode` enum, `.js` specifiers). First tests:
  persistence and `getAvailableThemes`.
- **Browser check** `packages/theme-core/test/render.ts` (Playwright, local only, not in CI): static
  fixture pages built from compiled CSS, no Angular, asserting computed values in Chromium and
  Firefox for every row of "Behaviour today" above, plus `themeMode` auto and invert under both OS
  schemes, light inside dark, `themeMode` inside a `[palette]` scope and inside a nested theme, an
  explicit `$bg` in an outer theme with a nested theme that sets none, and `[palette]` + `[tone]`
  inside a nested theme. Rows for mode combinations that already work today (theme and `themeMode`
  on nested elements, auto, invert) assert today's values, so Phase 9 cannot change them unnoticed.
  It prints what passes and what does not; today most of the other rows fail by design.
- **Wiring**: a wireit `test` script in both packages; `colorjs.io` as a devDependency of theme-core,
  `playwright` at the root; the script names `github.actions.build` and `github.actions.test` in each
  package, and git-flow's `test.yml` so the harness runs on every push. Publishing pieces wait for
  Phase 13.
- **Housekeeping**: replace the two deprecated `if()` calls at `_palette.scss:269-270`; switch
  `pages.yml` to manual trigger only so `main` stops going red (Pages cannot work until the repo is public);
  record "scripts are TypeScript run by Node 24, never `.mjs` / `.cjs` / `.js`" in
  .github/copilot-instructions.md and CLAUDE.md; add phases 8–13 to the README and PLAN.md tables.

Done when: `pnpm test` in both packages exits 0 with the known failures listed as `todo`; the test
workflow is green on the pushed branch; `render.ts` runs and its output is pasted into the commit
message.

### Phase 9 — Cascade: a theme is one rule; core derives once

Goal: `themeMode` works on any element, themes nest and inherit, presets coexist, user overrides win,
and a theme switch can still crossfade.

- **Registration: what animation needs, nothing derived.** Each role's light and dark colour becomes
  a registered `<color>` of its own: `--color--{name}--mode-light` / `--mode-dark`, and
  `--color--{name}--{bg|stroke|focus}--mode-light` / `--mode-dark` (names are a proposal, see
  [Your answers](#your-answers-2026-11-09)). `--color--brand` and the 29 scalars stay registered.
  `--color--{name}` and the other role tokens are no longer registered: they are declared as
  `light-dark(var(…--mode-light), var(…--mode-dark))`, so they resolve wherever they are used. The
  eight alias registrations (`--palette-color*`, `--container--*`, `_apply.scss:490-530`) are removed
  so a palette scope follows a nested `themeMode`. The greyscale fallback moves to the initial values
  of the core palettes' colour-role pair, joined once on `:where(:root)`.
- **`t.define-core-theme()`** (the public one, `_theme.scss:556`) emits, once:
  - on `:where(:root)`: `color-scheme: light dark`, the greyscale palette defaults, and the default
    of every unregistered group (typography, motion, focus geometry, elevation, overlay);
  - the mode rules for `themeMode` light / dark / auto / invert with today's selector semantics
    (`_theme.scss:405-484`), wrapped in `:where()`, setting `color-scheme` and a private 0/1 mode flag;
  - one shared rule on `:where(:root, [theme])` with every derivation for the eight core palette
    names: the auto `--bg`, `--stroke` and `--focus` roles, the 7-step ladders, contrasts,
    mode-relative aliases and tints;
  - one rule on `:where(:root, [theme], [themeMode])` that picks each mode-varying percentage
    (weights, elevation tint) arithmetically from its light and dark value and the mode flag. CSS
    `light-dark()` is still never used for a percentage. Core declares default light and dark values
    for all of them;
  - the `[palette="name"]` selection rules for the core names, the apply layers, the density scopes.
- **`t.define-theme()`** emits one rule, `[theme="name"]` (plus `:where(:root)` when `$default`),
  holding only what the author passed to `t.theme()`: for each palette the light and dark colour of
  the colour role and of any explicit `$bg` / `$stroke` / `$focus`, each followed by its joined token;
  `--color--brand`; the passed keys of each sub-config; and the light and dark values of mode-varying
  percentages. No `color-scheme`, no `body`, no mode variants. Existing variable names keep their
  meaning; a hand-written rule that sets `--color--primary` directly still works, it just does not
  crossfade. A custom palette name gets its registrations, derivations and `[palette]` rule once, at
  root level, on the same shared selector (the existing `$_registered-palette-names` dedup). The
  `$adaptor` hooks are called at root level, once per palette name.
- **Sub-config builders return only passed keys.** `t.shape()`, `t.focus()`, `t.motion()`,
  `t.typography()`, `t.elevation()`, `t.density()` behave as `t.weights()` and `t.overlays()` already
  do; `t.theme()` stops filling in defaults (`_theme.scss:182-229`), and the wrapper defaults at
  `_theme.scss:93-113` become `null`. Display and headline fonts still follow `$plain-family` when no
  `$brand-family` is given. `$dedupe` stays accepted and has nothing left to do.
- **Specificity.** Rules that only declare custom properties are `:where()`. A named theme rule keeps
  `[theme="name"]`. Per-element attribute scopes (`[themeDensity]`, `[palette]` adaptor rules) and the
  apply layers keep attribute specificity so they beat a theme rule on the same element. The
  doubled-attribute selectors (`_apply.scss:538-574`) stay as they are.
- **Load order is core, then themes, then the adapter.** Fix the comments that say the opposite
  (`scss/core.scss:1-14`, `scss/presets/*.scss:3-7`, docs/theme.md:271).
- **Consumers.** Delete the workaround block in demos/docs/src/styles.scss:8-114. Switch
  demos/demo-core/src/scss/base.scss to `t.define-core-theme()`. Correct PLAN.md:28, :133, :137-146,
  docs/css-variables.md:298 and docs/theme.md:285-309 to the new registration and cascade.
- **Harness.** Write check 5 (variable rules are `:where()`; a theme rule holds only what was passed;
  no `body` selector; the registered list is exactly the role colour pairs, `--color--brand` and the
  29 scalars) and remove the Phase 9 `todo`s. Add a `render.ts` row for the theme-switch crossfade.

Consequences to state in the docs:

- A theme switch crossfades when the author transitions the registered light and dark colours on the
  element whose `theme` changes; the docs show the `transition-property` list. The library emits no
  transition itself.
- A light/dark flip is instant at the variable level, and so is a `palette` attribute change. Elements
  that transition `background-color` or `color` still fade. Making the variables themselves fade on a
  mode flip is what breaks `themeMode` on plain elements today.
- `getPropertyValue('--color--primary')` returns an expression, not a resolved colour.
- Plain `color-scheme` on an element flips colours but not weights, which follow `themeMode`.

Done when: `pnpm test` passes with no Phase 9 `todo`; every `render.ts` row passes in Chromium and
Firefox, including the crossfade row; each preset's size before and after is in the commit message; the docs app builds and shows
the four themes in both modes with the workaround block gone; the oldest Chrome, Firefox and Safari
versions that pass `render.ts` are recorded in README.md (Safari checked by hand).

### Phase 10 — Contrast and alpha

Goal: `--contrast` is chosen automatically and is readable on every opaque colour.

- In `_palette.scss` `_role-derivatives`, replace the `$cl` expression (:147) and the seven contrast
  declarations (:149, :160-165) with a step at relative luminance 0.179, each channel clamped to
  0–1 so the choice matches what is painted, kept as an oklch value:
  `oklch(from color(from var(--x) srgb-linear S S S) l 0 0 / 1)` with
  `S = clamp(0, (0.179 - (0.2126*clamp(0,r,1) + 0.7152*clamp(0,g,1) + 0.0722*clamp(0,b,1))) * 1e6, 1)`.
  Replace the comment at :142-146 with one that describes it. Token names do not change.
- Pin `/ 1` on ladder steps, the auto `--bg`, `--stroke` and `--focus` derivations and the
  `*-from-var` / `*-from-brand` helpers (:152-157, :247-248, :267, :302, :325-369). `--tint-1..5`
  keep their weight alpha.
- Correct the formula shown in demos/docs (palette.component.ts:71, guides.component.ts:73).

Visible change: 52 preset role/step colours switch from black to white text, none the other way,
including the `warn` and `caution` bases in light mode. That is the automatic choice doing its job:
black on them is below 4.5:1 today. The guarantee covers opaque colours; text on
an explicitly translucent `$bg` is still chosen as if it were opaque.

Done when: the contrast sweep passes with no `todo` (0 preset role/step colours and 0 grid points
below 4.5:1); `render.ts` shows the browser-computed `--contrast` equal to the sweep's prediction for
a sample of colours in Chromium and Firefox.

### Phase 11 — Material adapter from Material's role tables

Goal: `--mat-sys-*` colours come from Angular Material's own tables, verified against what its
components read. Depends on Phase 9.

- Replace the hand map `_color-tokens` (`_material.scss:34-98`) with a loop over
  `md-sys-color-values-light($palettes)` and `-dark($palettes)` from
  `@angular/material/core/tokens/m3/md-sys-color`, zipped into `--mat-sys-{role}: light-dark(l, d)`.
- New internal module `scss/_m3-tone.scss` with `m3-tone($origin, $tone)`, which returns
  `oklch(from $origin <L> calc(min(c, 0.27) * <k>) h / 1)`. L and k are plain numbers Sass computes
  from the M3 tone number: L = (T+16)/116 for T > 8, else cbrt(T/903.3); k = min(1, 4L(1−L)). The
  colour is still derived by the browser. The name avoids cp-theming's own `t.tone()` / `[tone]`.
- Roles cp-theming already has a token for map to it, each written out in the module: `primary`,
  `on-primary`, `primary-container`, `on-primary-container` (and the same four for secondary and
  error) to `--color--{name}`, `--contrast`, `--bg`, `--bg--contrast`; `surface`, `on-surface`,
  `background`, `on-background`, `outline`, `outline-variant`, `scrim`, `shadow` to today's tokens.
  Every other role comes from the tables. Tertiary keeps mapping to secondary (PLAN.md:239).
- Surface containers, dim and bright are offsets from `--color--surface`: the palette map passed to
  the light table and the one passed to the dark table each express a neutral tone as your surface
  colour moved by that tone's distance from M3's own surface tone (98 in light, 6 in dark). So
  `--mat-sys-surface` stays equal to `--color--surface` and M3's order holds around it.
- Also emit `--mat-sys-neutral10` and `--mat-sys-neutral-variant20`, which Material adds outside the
  tables and its components read.
- `material-palette()` (`_material-palette.scss:41-52`) is generated from the same tables with
  `--color--{name}` as the origin, so a `[palette]` scope agrees with the root. The adapter's own core
  mixin emits the remaps for the eight core palette names; `mat.adaptor()` hooks remain for custom
  names.
- Selectors: tokens that reference cp-theming variables go on `:root, :where([theme])`; literal
  constants stay on `:root` only. The root rule keeps `:root` specificity on purpose, because it must
  beat the `html { @include mat.theme() }` rule that `ng add @angular/material` generates.
- Typography reads `--text--*`, and the font shorthand tokens Material reads (`--mat-sys-body-large`
  and the rest) are emitted.
- Re-check every patch in `apply-material-overrides()` (`_material.scss:185-265`) against the new
  roles and delete the ones no longer needed.
- Harness: every `--mat-sys-*` name read by the installed Material component styles is declared; the
  surface roles keep M3's lightness order in both modes; remove the Phase 11 `todo`.

Risk: the Sass path is not in Material's `exports` map. It resolves under load paths and under Sass's
package importer; the risk is the file moving in a later Material major, which the harness catches.
Fallback: the public `mat.theme()` accepts a palette map of the same strings.

Done when: `pnpm test` passes in theme-ng-material with no `todo`; the docs showcase looks right in
light and dark across the four themes and a nested theme; the list of deleted override patches is in
the commit message.

### Phase 12 — Startup: no flash, safe import

Goal: the saved theme and mode apply before first paint, and importing the package on a server does
not throw. Independent of Phases 9–11.

- `packages/theme-core/src/theme.ts:20-21` reads `localStorage` when the module loads. Make
  persistence lazy and guarded, with try/catch. `provideTheme()` and `ThemeService`
  (packages/theme-ng-core) skip their browser-only work when not in a browser. No SSR app exists in
  the repo, so this is a guard, not a supported target.
- Export an inline head snippet from theme-core, built from the same key constants as
  `theme.ts:15-17`: read `cp-theming--persist`; if it is `local` or `session`, read
  `cp-theming--theme` and `cp-theming--mode` from that storage and set `theme` / `themeMode` on
  `<html>`, accepting only `auto` / `light` / `dark` / `invert`. Document it in Getting Started,
  including the CSP nonce it needs.
- vitest tests: the module imports with no `localStorage`; the snippet restores from both storages
  and ignores bad values.

Done when: the vitest tests pass and the docs app, reloaded with a saved dark non-default theme,
paints it on the first frame (checked with a Playwright screenshot taken before the bundle runs).

### Phase 7 (resumed) — Docs examples are real files

Goal: a code sample in the docs cannot disagree with the library. Depends on Phases 9–11.

- Each example lives in `demos/docs/src/examples/{page}/{name}.{html,scss}`. Pages import the files
  as text with Angular's built-in loader (`with { loader: 'text' }`) and show that text;
  `cpa-theme-example` renders attribute examples from the same `.html`. Sass examples are compiled
  and checked, not injected into the page.
- The harness compiles every `examples/**/*.scss` against the real packages with zero warnings and
  runs the undefined-variable check on core + a preset + the example. Examples are complete
  snippets; a fragment that cannot compile carries an explicit display-only marker.
- One manual correction pass for the prose the compile check cannot see: `define-core-theme($selector)`
  (theme.component.ts:150-163), the "Simplified output CSS" formulas (palette.component.ts:66-74),
  the "@property registry" wording (typescript-api.component.ts:79, api.component.ts:1088 and :1301),
  "resolved lazily" (guides.component.ts:319), and the `dist/…` style paths in Getting Started that
  are not in the packages' `exports`.
- `demos/docs/test/render.ts` (local): painted-contrast report over the built showcase in both modes.
- Rewrite PLAN.md phase 7 to describe the navigation the code actually has, then continue its
  pending demos as PLAN.md lists them.

Done when: no hand-written Sass sample remains in a page template; `pnpm test` compiles every
example; the correction list above is closed.

### Phase 13 — Release through cpdevtools/git-flow

Goal: versions, tags and publishing run through git-flow.

Settings: publish to GitHub Packages only; first version `0.1.0-alpha.0`; peers between the three
packages use a compatible range (`workspace:^`); docs deploy to GitHub Pages once the repo is public.

- Add only what git-flow needs: `0.0.0-MAIN` in every manifest, `.publish/versions.yml`,
  `.publish/registries.yml`, the `@cpdevtools` registry lines in `.npmrc`, the git-flow devDependencies
  and `gitflow` script, the remaining four template workflows, and per package a
  `release-artifacts.yml` and `github.actions.pack`. The wireit root scripts stay. The template's
  `deps.yml`, syncpack and `devutil` root scripts are not adopted; its `deps.yml` would pin TypeScript
  below what Angular 22 needs.
- Packaging:
  - theme-core: keep `exports["."]` for the workspace; add `publishConfig.exports` pointing at the
    built JS and types, and `files: ["dist", "scss"]`.
  - theme-ng-core: packed from its own directory with `publishConfig.directory` set to the
    ng-packagr output, so `workspace:` peers are rewritten (packing inside `dist/` fails on them).
  - theme-ng-material: published as a plain Sass/CSS package from its own directory while its
    TypeScript API is empty.
  - theme-m3 and the demos are not published.
- Docs deploy uses git-flow's `static-site` artifact with its `gh-pages` method, enabled once the
  repo is public; no hand-written release workflow. Until then `pages.yml` stays on manual trigger.
- README install notes say that GitHub Packages needs the `@cpangular` registry line and a token in
  the consumer's `.npmrc`, even for public packages.

Done when: a push to the feature branch opens a draft release PR with the test workflow green, and
`gitflow pack` produces three tarballs whose contents and `exports` are listed in the commit message.
Merging a release PR, merging into `main` and `gitflow version` stay manual.

---

## Decisions already made

So they are not reopened. Tell me if you want any reversed.

- A theme declares what its author passed and nothing else. A nested theme therefore inherits the
  rest from the theme around it. Presets keep passing what they pass today, and keep `$default: true`
  (now `:where(:root)`, so any `theme` attribute beats every loaded default).
- Core loads before themes; the adapter loads last.
- The adapter's root rule keeps `:root` specificity so it beats Material's own `html` rule.
- Computing an M3 tone's lightness number in Sass is not compile-time colour math: the colour is
  still `oklch(from var(…))` in the browser, like `$theme-step-1`.
- CSS checks use `node --test`; TypeScript API tests use the installed vitest and jsdom; Playwright
  checks are local, not in CI.
- Sass examples in the docs are compile-checked, not rendered live. Getting Started keeps its custom
  Sass section.
- `themeMode="invert"` keeps today's selector semantics, emitted once.
- All port work is pushed to `feature/port-spike-findings`; nothing merges to `main` without you.

## Dropped or changed by the critics

- **Docs dependency-order check: dropped.** The docs are a reference; five pages would fail on day
  one and none of the drift found has anything to do with order.
- **Runtime theme API: unscheduled.**
- **Guard against `light-dark()` origins: dropped.** The failure does not reproduce in any current engine.
- **"Presets stop shipping `$default`": dropped.** It would break link-only users for no gain.
- **Removing the doubled-attribute selectors: dropped.** Harmless, and not required by any finding.
- **"Register only inputs and origins": replaced** by your rule, register what animation needs.
- **Registered role tokens fed by unregistered variables: replaced** by the reverse (registered light
  and dark colours, unregistered role tokens), which removed four defects the critics found in the
  first design: an outer theme's `$bg` leaking into a nested theme, user overrides moving to new
  names, and `[palette]` scopes and Material remaps not following a nested `themeMode`.
- **Contrast step: changed** to clamp channels; unclamped it reached 2.75:1 on colours outside sRGB.
- **`tone()` and "surface ladder": renamed**; both words already mean something else in cp-theming.
- **Template `deps.yml`, syncpack, `devutil`: not adopted.** Packing from `dist/`: replaced.

## Found on the way, not fixed by this plan

- Identity text on the auto `--bg` role (what `t.bg()` paints) is below 4.5:1 for five preset
  palettes in light mode (3.77–4.29: error ×3, caution, warn). The harness reports it.
- `themeMode="invert"` inside an explicit light ancestor resolves to light today. Fixing it needs
  `@scope`, which would raise the Firefox baseline to 146.

---

## Your answers (2026-11-09)

| Question | Your answer | What the plan does with it |
|---|---|---|
| Colour tokens and `@property` | "Whatever is needed for animation should be registered" | Each role's light and dark colour is registered, so a theme switch crossfades. Derived tokens and the role tokens themselves are not, so `themeMode` works on any element (Phase 9) |
| Contrast | You want automatic contrast | The automatic choice stays and gets more accurate. `warn` and `caution` get white text in light mode because black fails on them (Phase 10) |
| Material surface roles | (a) | Offsets from `--color--surface` (Phase 11) |
| Runtime theme helper | Unclear what was asked; any colour system is fine | Not scheduled. If it is ever built it accepts any CSS colour |
| Registry | GitHub only for now | GitHub Packages (Phase 13) |
| First version | `0.1.0-alpha.0` | `.publish/versions.yml` (Phase 13) |
| Docs hosting | The repo will be public, docs on Pages | Pages through git-flow once the repo is public (Phase 13) |
| Peers between the packages | Not answered | Compatible range (`workspace:^`), decided for you |

How I read two of them:

- **"Any colour system is acceptable"** settles the contrast question too: the automatic contrast
  calculation reads linear sRGB internally, because that is how WCAG defines luminance. I have not
  changed the "oklch color space" rule in copilot-instructions.md for what theme authors write in
  Sass; say so if you meant to relax that as well.
- **"Register what animation needs"** covers theme switches. A light/dark flip and a `palette`
  attribute change stay instant at the variable level, because the registration that would fade them
  is exactly what stops `themeMode` working on plain elements today. Ordinary
  `transition: background-color` on elements still fades both.

### Still open

1. **Names for the registered light and dark colours.** Proposed: `--color--{name}--mode-light` and
   `--color--{name}--mode-dark` (and `--color--{name}--bg--mode-light`, and so on). `--light` and
   `--dark` are already the lightness steps. Phase 9 uses the proposal unless you give other names.
2. **Making the repo public** is yours to do; Pages and the docs deploy wait for it.
3. **If you want the variables themselves to fade on a light/dark flip**, tell me before Phase 9: it
   means keeping the role tokens registered, and `themeMode` then takes effect only on or above an
   element that has a `theme` attribute.

For reference, the runtime theme helper would have been a small TypeScript function that creates a
theme in the browser from data, for example colours a user picks or a row from a database. After
Phase 9 the same thing is a few lines of plain CSS (`[theme="x"] { --color--primary: … }`), which is
why it is not scheduled.
