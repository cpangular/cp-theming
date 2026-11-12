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

Order: **8 → 9 → 10 → 11 → 12 → 7 (resumed) → 14 → 13.** Everything but 13 is done (14b and 14c followed 14). Phase 12 does not depend on 9–11 and can run any
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
- **Colour formats**: replace the "oklch color space" rule in .github/copilot-instructions.md,
  CLAUDE.md, PLAN.md and README.md with: authors may pass any CSS colour; the library derives in
  oklch. Add a fixture theme written in hex, `rgb()` and `hsl()` and run every check on it.
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
- **Amended after the Phase 9 critique (2026-11-10).** Six Opus critics tried to refute the six
  Phase 9 claims against the compiled CSS in Chromium and Firefox; eight defects were confirmed by
  three independent verifiers each, and each has a `render.ts` row. What changed from the text above:
  the theme rule is `:where([theme="name"]):not(cp-theming-none)`, specificity (0,0,1), so an
  author's `:root` rule wins on `<html theme="…">` too (a plain `[theme="name"]` tied with `:root`
  and won on source order). Core derives the auto `--bg`, `--stroke` and `--focus` into their
  registered pairs, from the colour pair, and joins them, so a switch between an auto and an
  explicit role crossfades instead of jumping or flashing through the greyscale initial value; a
  hand-written `--color--x` therefore re-derives the ladder, contrasts and tints but not those
  three roles (set the pair). `background` / `surface` always carry their bg pair (the base) in the
  theme rule and core only joins it, so a nested theme inherits the outer base, not an outer
  `$color`. The tints and the `[filled]` de-emphasis text read each mode's weight pair inside
  `light-dark()` (a substituted percentage froze at the declaring element). A custom palette's
  derivations sit on `:where([theme])` and a `$default` theme derives the name inside its own rule,
  so separately compiled stylesheets sharing a name cannot override a default's explicit roles on
  `:root`. The adapter's `[theme]` re-declaration is `:where([theme])` so the adaptor's `[palette]`
  remap wins on an element with both attributes, and its state-layer opacities are re-declared on
  `:where([theme], [themeMode])`.

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
versions that pass `render.ts` are recorded in README.md (Safari: Playwright's WebKit build stands in,
no Mac being available; `render.ts --html` writes a page for a hand check later).

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
- **As landed (2026-11-11).** `S` is declared once on `:where(:root)` as the private variable
  `--theme--_contrast-step` and each `--contrast` substitutes it; written out three times in each of
  the 168 contrast declarations it added 52 KB to core.css and broke the size check. The browser
  resolves the same expression. The six slide-toggle handle tints in the adapter's overrides
  (`_material.scss:263-274`) are pinned too, and a harness check now fails any relative-colour
  derivation without `/ 1` other than a tint. The harness reads a custom palette's derivations from
  `:where([theme])`, which the `todo` had hidden. Measured on this code the visible change is 68
  colours, not 52 (the sweep covers 1344 colours; the 52 was counted over 1008 at `df8151e`): 59
  were below 4.5:1, and 9 passed with black at 4.53–4.55 and now carry white at 4.62–4.64.

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

- **As landed (2026-11-11).** The tables live in the new internal `scss/_roles.scss`; it passes
  them every whole tone 0–100 of each palette, so a role Material adds later resolves without a
  change here, and a role or tone it cannot resolve is a Sass `@error`. A role whose light and dark
  value are the same expression is emitted once, without `light-dark()`. `neutral-variant` uses the
  same surface offsets as `neutral` (cp-theming has one surface colour), and `--mat-sys-neutral10`
  / `--mat-sys-neutral-variant20` are those tones of the two palette maps in `light-dark()`.
  Everything that reads a cp-theming variable (colours, state layers, shape, elevation, motion,
  typography) is on `:root, :where([theme])`; only `corner-none` and `easing-linear` are on `:root`
  alone. `mat.adaptor()` now emits `[palette]` rules for custom names only; the adapter's core mixin
  emits the six core accent names. The build command gained `--load-path=node_modules` for the
  Material import. Override patches removed: the select-panel option checkmark (Material's default
  is 14–17:1; the patch fell to 1.2–1.7:1 on a theme with one primary for both modes), the
  slide-toggle track outline (the patch was the token `--mat-sys-outline` already maps to), the
  selected hover/focus/pressed handle tints (`primary-container` is now the same colour), and nine
  declarations for tokens Material 22 never reads (`*-hover/focus/pressed-icon-color`,
  `*-hover/focus/pressed-track-outline-color`), and, once `outline` came from the tables (below),
  the unselected track and icon (the handle on Material's own track is then 3.7:1 light and 2.9:1
  dark, Material's stock 2.9:1). Kept: the selected icon, now `--mat-sys-primary` so it follows a
  `[palette]` scope (Material's default is the same black or white as the handle on a theme whose
  primary is light in light mode or dark in dark mode).
- **Amended after the Phase 11 critique (2026-11-11).** Three Opus critics (painted pixels in the
  built showcase, undeclared or invalid reads, the showcase components' token maps in every state)
  reported six findings and two known weak spots were put to verifiers directly; each of the eight
  went to its own Opus skeptic, all were confirmed, and they are five defects. What changed from
  the text above:
  - **State-layer opacities are numbers.** `--mat-sys-*-state-layer-opacity` is
    `calc(var(--weight--state-*) / 100%)`. Material builds `calc(x * 100%)` from it for
    `color-mix()`; with a percentage that was invalid, so options and menu items had no hover or
    keyboard-focus layer and buttons no ripple, in every theme.
  - **`outline` comes from the tables** (neutral-variant 50 / 60 as an offset from
    `--color--surface`), no longer `--color--surface--stroke`: 2:1 on the surface in dark mode
    became 6.2:1, and 3.2:1 in light became 4.6:1 (Material's stock: 5.8 and 4.3).
    `outline-variant` still maps to `--color--surface--stroke--low`.
  - **Containers are one ladder step lighter in dark mode.** `{primary,secondary,tertiary,error}-container`
    is `light-dark(--bg, --bg--light)` and the on-role its contrast. The dark `--bg` tint sits at
    the lightness of a dark surface, so a selected or activated fill was 1.00–1.07:1 on it; now 1.5:1
    (Material's stock 2.0:1). Light mode is unchanged.
  - **Filled form field patch** in `apply-material-overrides()`: container
    `surface-container-high`, and the primary and error accents painted on it held to lightness
    ≤ 0.44 in light mode and ≥ 0.82 in dark mode. Focused and error labels were 2.3–3.5:1 in dark
    mode and the error label under 4.5:1 in light; every preset is now at 4.75:1 or better.
  - **`--elevation-N--shadow` (core) is a valid box-shadow.** It was `light-dark()` around the whole
    shadow, which is invalid, so core's `[elevated]` rules and every Material elevation computed to
    `none`. It is now `<geometry> light-dark(<light colour>, <dark colour>)`. A level's light and
    dark shadow may differ in their colours only; a `$levels` shadow passed for one mode with its
    own geometry applies to both, and two different geometries are a Sass `@error`.
  - The docs toolbar's theme select set six token names Material 22 does not read (the pre-v19
    `--mdc-*` names), so its outline and arrow were primary on the primary toolbar when focused;
    they are the v22 names now.
  - Harness: the state-layer opacities must be the weight divided by 100%; every component token
    the adapter sets must be one the installed Material reads; every `light-dark()` argument must
    be a single value. `render.ts` has 104 rows (state layer inside Material's own `color-mix()`,
    shadow tokens as `box-shadow`, `outline`, a dark-mode container), all passing in Chromium,
    Firefox and WebKit.
  - Noticed by the critics, not verified and not changed: `outline-variant` (dividers) is about
    1.2:1 on the surface in dark mode (Material's stock 2.0:1); text in the `warn` and `caution`
    preset colours on the surface in light mode is 3.8–4.2:1, and cyan-orange `error` 4.49:1; a
    theme whose primary is light in light mode or dark in dark mode gets unreadable primary text
    and outlines, because `--mat-sys-primary` is the author's colour as written; the typed
    `calc(% / 100%)` division needs a current browser (Chromium 158, Firefox 159 and WebKit 27.2
    evaluate it; an older engine shows no state layers, as before the fix).

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

Found while checking (2026-11-11): Angular's production default inlines critical CSS and loads the
full stylesheet without blocking rendering. The inlined rules contain no theme rule, so the first
frame had no theme at all, with or without the snippet. The docs production build sets
`optimization.styles.inlineCritical: false`, and Getting Started tells Angular users to do the same.
The check is `demos/docs/test/startup.ts`.

### Phase 7 (resumed) — Docs examples are real files

Goal: a code sample in the docs cannot disagree with the library. Depends on Phases 9–11.

- Each example lives in `demos/docs/src/examples/{page}/{name}.{html,scss}`. Pages import the files
  as text with Angular's built-in loader (`with { loader: 'text' }`) and show that text;
  `cpa-theme-example` renders attribute examples from the same `.html`. Sass examples are compiled
  and checked, not injected into the page.
- The harness compiles every `examples/**/*.scss` against the real packages with zero warnings and
  runs the undefined-variable check on core + a preset + the example. Examples are complete
  snippets; a fragment that cannot compile carries an explicit display-only marker.
- The Palette and Getting Started pages say that any CSS colour format is accepted and that oklch is
  recommended for predictable lightness steps.
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

Done 2026-11-11 (the pending demos are not part of this Done-when). Found on the way:

- The installed `@angular/build` (22.0.3) imports any file as text with `with { loader: 'text' }`;
  a probe build confirmed it for `.scss` and `.html`.
- The `styles` array of `angular.json` cannot name the packages' stylesheets at all: a `dist/…`
  path is not in `exports` and fails to resolve, and an exported `…/css/core` path is rejected by
  the schema, which wants a stylesheet extension. Getting Started now loads them from the app's own
  stylesheet (`@use "@cpangular/cp-theming-core/css/core"` in Sass, `@import` in CSS), which a
  probe build of the docs app confirmed for core, a preset and both adapter files.
- A root theme that leaves a palette out gets core's greyscale default, the same in both modes,
  so the old "unspecified palettes use built-in defaults" sample had a white page in dark mode.
  The Getting Started theme now passes every palette.
- Not done: the parameter defaults and descriptions in the API reference tables were corrected
  only where this phase lists them or an example touched them (focus width and hue shift,
  `$levels`, `$dedupe`, `$default`). `variables.component.ts` and `api.component.ts` still state
  defaults nothing checks (shape, focus and weight values among them).

### Phase 14 — Brand and accent palettes: pass what you have, the rest are generated

Goal: the chain **brand → primary → secondary, tertiary → background, surface**. A theme passes
whichever of these it has; everything it leaves out is generated from the nearest thing it passed.
The brand colour is the exact colour from the guidelines, kept unchanged and usable as a palette of
its own; it is often too light, dark or saturated to be the primary, so the primary generated from
it is adjusted for readability. Only `primary` passed → `secondary` and `tertiary` are generated;
`primary` and `secondary` passed → `tertiary` is generated; only `brand` passed → all of them. Added 2026-11-11: cp-theming had
decided in June that there is no third accent palette and that Material's tertiary maps to
secondary; that contradicts the brand-colour idea and was never the intent. Depends on Phase 9
(a theme declares only what it passes; core supplies the rest), so this is small now.

- **`brand` and `tertiary` are core palette names**, with the same registered pair, derivations
  and `[palette="…"]` rule as the others (`$core-palette-names` in `_palette.scss`).
  `--color--brand` stays the name of the brand palette's colour (the colour role has no suffix),
  so `$brand` in `t.theme()`, the `*-from-brand()` helpers and an inline `--color--brand` keep
  working; the single `--color--brand` registration becomes the palette's pair. The brand colour is
  never adjusted. Registered count rises by 15; the harness list and docs follow.
- **Generated primary.** `primary` not passed is derived from the brand pair with the readability
  adjustment `palette-from-brand()` already applies (lightness clamped into 0.35–0.50 light /
  0.65–0.82 dark, chroma capped at 0.22), declared on the shared derivation selector like the
  accents below. A theme that passes `primary` uses it as given.
- **Generated accents.** On the shared derivation selector, core declares the registered pair of
  each accent a theme did not pass, derived from the primary pair, so a nested theme that passes
  only `primary` re-derives its own accents (a theme that passes the accent beats these
  zero-specificity declarations on its own element, as explicit roles already do):
  - `secondary`: primary's hue, one third of its chroma, same lightness;
  - `tertiary`: primary's hue + 60°, half its chroma, same lightness.
  Written as `oklch(from var(--color--primary--mode-light) l calc(c / 3) h / 1)` and the dark
  twin, like every other derivation; Sass does no colour maths.
- **Generated neutrals.** `background` and `surface` not passed are tinted neutrals of the brand hue,
  with the lightness and chroma the `background-from-var` / `surface-from-var` helpers already use
  (`_palette.scss`), so the two paths agree.
- **Semantic palettes** (`error`, `warn`, `caution`, `pass`) not passed get the fixed colours the
  presets already share (`$default-error` and friends in `presets/_palettes.scss`) as core defaults;
  they do not derive from brand or primary. With no theme loaded at all, the greyscale initial
  values of the brand and primary pairs still make everything derived from them grey, so the print
  fallback holds for the accents and neutrals.
- **Material adapter:** `tertiary` roles read `--color--tertiary`; the "tertiary = secondary" rule
  and the docs paragraph that explains it go away. Presets pass no `tertiary`, so theirs is
  generated and visible in the showcase.
- **Docs:** the Palette and Theme pages explain the chain and that the brand colour is kept exact
  while the primary made from it is adjusted; compiled example themes with only `brand`, and with
  only `primary`, are among the example files. PLAN.md:239-245 and the README row are
  corrected.
- **Harness:** `render.ts` rows for a theme with only `brand` (primary is the brand hue inside the
  readable band, the brand palette's own colour is unchanged, all generated palettes have the
  expected relation), a theme with only `primary`, a nested theme with only `primary` re-deriving
  its accents, and a theme that passes `secondary` keeping it; the contrast sweep and the Material
  surface-order check run over the generated palettes of every preset and fixture.

Done when: `pnpm test` passes with the new rows and checks; the showcase shows a distinct tertiary
on every preset in both modes (Playwright screenshots in the commit message); the docs Getting
Started theme passes only `brand` and the page looks right, with a `[palette="brand"]` element
showing the exact brand colour.

Done 2026-11-11.

- **As landed.** Ten core palette names; 109 registered properties (80 colour pairs + 29 scalars;
  `--color--brand` is now the unregistered join of the brand palette's pair). core.css went from
  178 KB to 221 KB (12.4 KB to 15.2 KB gzipped; the size check's ceiling is 224 KiB): two more
  names at about 20 KB each. A preset is 3.3 KB. `t.theme()` takes `$palettes` as optional, so
  `t.theme($brand: #ff6a00)` is a theme; `$brand` is the `brand` palette, and passing it both ways
  is a Sass `@error`. The semantic defaults are the registered initial values of their colour
  pairs (one per mode); `presets/_palettes.scss` builds `$default-error` and friends from the same
  map in `_palette.scss`. The adapter's accent names are `brand`, `primary`, `secondary`,
  `tertiary`, `error`, `warn`, `caution`, `pass`, so `palette="brand"` and `palette="tertiary"`
  recolour Material components too.
- **Changed from the text above: the shared selector holds the generated colours, not the pairs.**
  The text declares the generated *pair* of every palette a theme did not pass on the shared
  selector. Tried in the browser first, that fails in three ways:
  - a nested theme that passes no `primary`, inside a theme that passes no `brand` (every preset),
    gets a grey primary, generated from the brand's initial value;
  - every nested theme, even one that passes only a shape, re-derives secondary, tertiary,
    background and surface and so loses the outer theme's explicit ones, which contradicts "a
    nested theme inherits the rest" (Decisions already made) and the Phase 9 critique row for the
    inherited background base;
  - on `<html theme="my-brand">`, with a preset loaded beside it, the preset's own primary,
    secondary and background win: a default theme is `:where(:root)`, the same zero specificity as
    the shared selector, and loads later. A theme with only a brand showed azure-blue.
  What landed: core declares each generated *colour* once on the shared selector, as a private
  variable (`--theme--_generated--{name}--light` / `--dark`), and sets no pair there.
  `:where(:root)` points every pair of the chain at its variable. A theme rule points a pair at it
  for each palette the theme left out that is downstream of something it passed (brand → primary,
  background, surface; brand or primary → secondary, tertiary), followed by the joined token like
  every pair a theme declares. So:
  - the root generates the whole chain, and a theme on `<html>` takes what it generates at its own
    specificity (0,0,1), above every loaded default;
  - a nested theme generates what is downstream of what it passed (only `primary` → secondary and
    tertiary; only `brand` → all of it); nothing else declares a pair, so the rest inherits, and a
    nested theme that passes no colour keeps every colour;
  - beside a loaded default, what a root theme has nothing upstream of comes from that default
    (a theme with only `primary` shows the default's background), as in a nested theme.
  The four cases the text asks for behave as it says. A theme rule therefore holds what was
  passed plus one reference per generated pair: a preset gained three lines for tertiary. A first
  attempt kept the pairs on the shared selector behind a private flag the theme rule set
  (an invalid declaration on a registered pair inherits, in all three engines); it fixed nesting
  and not the loaded default, and was replaced. The cost of what landed: a hand-written pair on a
  nested `[theme]` element (no `define-theme()`) re-derives that palette's own roles and not the
  palettes downstream of it. On `:root` a hand-written brand pair regenerates everything.
- **Also decided on the way.**
  - The generated palettes read the brand's registered *pair*, as the text says. The
    `*-from-brand()` helpers still read `--color--brand` (the join), so an inline `--color--brand`
    re-derives what a helper made, and the pair is what a brand picker sets.
  - The neutrals' chroma is a ceiling, `min(c, 0.006)` / `min(c, 0.01)`, in the helpers and in the
    generated pairs (one function). With the fixed number a grey brand gave a tint of whatever hue
    the browser reports for grey; now a grey brand gives grey neutrals, which is what makes the
    no-theme fallback grey. Any brand with more chroma than the tint is unchanged.
  - With no theme at all the root still generates from the grey brand default (`oklch(0.2 0 0)`):
    primary, secondary and tertiary are `oklch(0.35 0 0)` (`0.65` under a dark OS scheme),
    background `0.97` / `0.17`, surface `0.93` / `0.22`. Before, primary was `oklch(0.2 0 0)` and
    the fallback was the same in both modes (a white page under a dark OS scheme). The semantic
    palettes are their default colours, not grey.
  - Docs: the Getting Started theme is `t.theme($brand: #ff6a00)` and the page renders it
    (`examples/getting-started/brand-chain.html`). The docs app cannot load the example file
    itself (it includes core and is a default theme), so `demos/docs/src/styles.scss` defines the
    same theme and a check fails if the two theme rules differ; `angular.json` names the app's
    `node_modules` as a Sass include path so the stylesheet can name the package.
- **Harness.** `test/css/chain.test.ts` (new): the exact generated expressions; the root takes
  every one and a theme rule exactly the ones downstream of what it passed; the relation of every
  palette a preset or fixture did not pass to its origin, as numbers; the brand
  never adjusted over a 1680-case grid; the semantic defaults equal the presets'. The contrast
  sweep and the Material surface-order check now cover all ten palettes of every preset and
  fixture (1680 preset role/step colours, 0 below 4.5:1), with two new fixtures (only `brand`,
  only `primary`). `render.ts` has 190 rows, 84 of them `chain/`, all passing in Chromium, Firefox
  and WebKit; the expectations are worked out by hand from the numbers above. Replaced:
  `nested-theme/inherits-unpassed-palette` (a nested theme with only `primary` now re-derives
  secondary) and `no-theme/greyscale-fallback` (primary is `0.35`, not `0.2`).
  `demos/docs/test/chain.ts` (new, local) reads pixels on the built docs.
- **Measured.** The primary generated from a brand reaches 3.73:1 or better on the generated
  background and surface over the grid, and 4.5:1 for 3244 of 3360 cases. The 116 below are
  brands whose primary lands on the light edge of the light-mode band (L 0.5) in cyan and green
  hues outside sRGB, on the surface. The band is `palette-from-brand()`'s, unchanged.

### Phase 14b — Follow-ups from the Phase 14 review (decided 2026-11-11)

1. **Chroma floors for generated accents.** A ratio of the primary's chroma vanishes on a
   low-chroma primary (cyan-orange's generated tertiary is a slate grey). Generated secondary
   chroma becomes `max(c / 3, 0.04)` and tertiary `max(c / 2, 0.08)`, hue rules unchanged. The
   chain test's expected relations and the render rows follow.
2. **Generated primary stays readable on the generated background.** The light-mode band's top
   moves from 0.50 to 0.45 (dark band unchanged) in the chain and in `palette-from-brand()`, which
   share the numbers. Done when the "116 of 3360" cases in "Found on the way" are 0.
3. **`t.bg()` on `background` and `surface` gets readable text.** The `bg` layer keeps the
   palette's own colour as text; for the two neutral palettes that colour is the fill. For those
   two, `bg()` sets `color` to the bg role's `--contrast` (blended through `--weight--text-blend`
   like `filled()` does). The Getting Started example goes back to `bg` where it meant `bg`.
4. **Docs: themes come from `t.define-theme()`.** Themes are not meant to be typed as CSS by hand.
   Where the docs mention a `[theme="x"]` rule written directly (Theme page, TypeScript API page),
   say that, and add one note: such a rule on a nested element regenerates only that palette's own
   roles, not the palettes downstream of it.
5. **Size ceiling.** Raise the `core.css` ceiling in the size check to 256 KiB and record the
   current size next to it; the gzipped size (15 KB) is the one that matters and is also printed.
6. **Showcase back in the nav.** Commit `df8151e` (2026-06-29) rebuilt the sidebar and dropped the
   Showcase entry; the route and the page survived. Add `{ path: 'showcase', label: 'Showcase' }`
   to the ng-material section's nav in `packages-layout.component.ts` (the page has content for
   ng-material only), and give ng-material its own nav list instead of sharing ng-core's.

Done when: `pnpm test` passes with the chain test, sweep and render rows updated; the showcase
screenshot shows a coloured tertiary on cyan-orange in both modes; the docs Getting Started surface
swatch uses `bg` with readable text.

Done 2026-11-11.

- **Item 1, changed from the text above: the floor does not exceed the primary's chroma.** The
  expressions are `min(c, max(c / 3, 0.04))` and `min(c, max(c / 2, 0.08))`. With the bare
  `max()` a grey primary would get accents of chroma 0.04 and 0.08 in whatever hue the browser
  reports for grey, and the no-theme fallback (everything grey, Phase 14) would turn pink. The
  same reasoning made the neutrals' chroma a ceiling in Phase 14. Any primary with chroma 0.08 or
  more gets exactly the floors as written. cyan-orange's tertiary is `#2e557d` light and
  `#91bce9` dark (painted, both engines).
- **Item 2.** 0 of 3360 below 4.5:1, lowest 4.60:1 (`oklch(0.5 0.25 195)` on the surface, light);
  the chain test now asserts 0, not 3:1. `palette-from-var()` shares the default, so it moved too.
- **Item 3: `bg()` hands the colour over, the palette rule takes it.** `bg()` cannot know which
  palette it is on, and a `color` declared by `[palette][bg]` (0,2,0) would start beating
  authors' own class rules on every palette. So `bg()` sets the private
  `--container--_bg-text` to the contrast of the step it paints (`bg(high)` → the high step's),
  and `apply-palette()` for `background` and `surface` reads it:
  `color: var(--container--_bg-text, var(--palette-color))`, after clearing it so an outer
  `bg` does not reach a palette scope without one. Consequences: in a rule of one's own,
  `apply-palette()` goes before `bg()`; `bg()` on a child without its own `apply-palette()`
  still inherits its text colour, as before. The text is the pure contrast colour: `filled()`
  does not blend its text through `--weight--text-blend` either (it sets the contrast colour and
  a de-emphasis tier), so "like `filled()` does" is what landed and the blend is not. `bg()` does
  not set `--container--text` and its siblings: it cannot do so for the neutrals only.
- **Seen in the screenshots, not fixed.** The Getting Started brand `#ff6a00` gives a light-mode
  primary of `oklch(0.45 0.2 45)`, which is outside sRGB; the browsers paint it `#a60000`, a red
  (hue 29°, not 45°). At 0.50 it was `#b72200` (hue 33°), so the shift was there before and is a
  little larger now. The chroma cap of 0.22 is above what sRGB holds at this lightness for most
  hues; lowering chroma to fit the gamut would keep the hue.
- The docs contrast report is unchanged in kind: 224 labels, 40 below 4.5:1 in each engine, all
  docs captions (swatch labels and `code` in section text), none on a component.

### Phase 14c — Generated colours stay inside the screen's gamut (added 2026-11-11)

Found by session 9: an orange brand (`#ff6a00`) gets a **red** primary in light mode. The
generated primary asks for more colourfulness than sRGB can show at that lightness
(`oklch(0.45 0.2 45)` is outside sRGB), and browsers clip each channel, which drags the hue from
orange (45°) to red (29°). The same can happen to any generated colour and to the
`*-from-brand()` helpers.

- The generated primary, secondary, tertiary and the from-var/from-brand helpers get a gamut
  correction, in CSS, after the lightness clamp and chroma cap: a pass reads the candidate's sRGB
  channels, measures how far they overshoot 0–1, carries `1 − 2·overshoot` in the alpha channel of a
  `color(from … srgb r g b / …)` and scales the chroma by it; four passes, nested. Verified as CSS
  in Chromium 158, Firefox 159 and WebKit 27.2: the orange brand's light primary keeps hue 45° at
  chroma 0.13 instead of clipping to red; a blue already inside sRGB is untouched; a grey stays grey.
  Over the hue wheel at every band lightness the worst hue drift after clipping is under 6°
  (46° before), mean painted chroma 0.114 against 0.167 clipped.
- The chain test asserts the painted hue of every generated colour is within 6° of the hue asked
  for, for every preset, fixture and a hue-wheel sweep; `render.ts` gets rows for the orange, a
  yellow and a blue brand in both modes.
- Phase 14's chain numbers (bands, caps, floors) stay; the correction runs after them.

Done when: the chain test passes with the hue assertion; the docs Getting Started primary from
`#ff6a00` is painted an orange-brown, not a red, in both modes (screenshot in the commit).

Done 2026-11-11.

- **As landed.** `_in-gamut($colour)` in `_palette.scss` wraps a colour expression in four nested
  passes; one pass is
  `oklch(from color(from <colour> srgb r g b / <factor>) l calc(c * alpha) h / 1)`, so the
  expression is written once however many passes there are. It wraps the generated primary (both
  modes), secondary and tertiary, and what `palette-from-var()` / `palette-from-brand()` return
  (the helpers and the generated primary share `_readable-light()` / `_readable-dark()`). The
  neutrals are not wrapped: at lightness 0.97 / 0.17 and 0.93 / 0.22 sRGB holds their 0.006 /
  0.01 of chroma at every hue. core.css went from 221,168 to 224,536 bytes (15,211 to 15,316
  gzipped).
- **Changed from the text above: the overshoot counts up to 0.25.** The factor is
  `1 − 2 × clamp(0, overshoot, 0.25)`, so one pass halves the chroma at most. As written
  (`1 − 2·overshoot`, which the alpha channel clamps at 0) a colour whose worst channel is 0.5 or
  more outside sRGB loses all of its chroma in the first pass and stays grey: a teal brand,
  `oklch(0.65 0.3 181)`, got a grey dark-mode primary where sRGB holds chroma 0.117. Over the hue
  wheel at the band lightnesses and chroma 0.22, 489 of 2520 colours kept less than half of the
  chroma sRGB holds. With the limit none do (lowest 55%), the mean painted chroma is 0.132
  instead of 0.114 (0.146 is the edge of sRGB, 0.169 what clipping paints), and the worst hue
  drift is the same, 0.7°. Four passes and the factor 2 are as written.
- **Before and after**, as painted (Chromium, Firefox and WebKit agree):

  | Brand | Light primary | Dark primary |
  | --- | --- | --- |
  | `#ff6a00` | `#a60000` (hue 29°, 15.5° off) → `#8d3700` (hue 45°) | `#f7722b`, unchanged |
  | `#ffd400` | `#764d00` (hue 74°, 20° off) → `#65540a` (hue 94°) | `#e7c11e`, unchanged |
  | `#1a56c4` | `#0e4bb8`, unchanged | `#538cf2`, unchanged |

  The orange's light primary is `oklch(0.45 0.129 45)`, as the text above predicts. The blue of
  the rows is `#1a56c4` and not a more saturated one because the "unchanged" assertion needs a
  primary inside sRGB in both modes: `#1d4ed8` gives a dark primary just outside it, which the
  correction moves from `#5186ff` to `#5487ff`.
- **Harness.** Proved as hand-written CSS in the three engines before the Sass was written.
  `render.ts` has 230 rows, 23 of them `gamut/`: the primary from the orange, the yellow and the
  blue brand in both modes (generated, and through `palette-from-brand()`), each with the brand
  palette's own colour unchanged; a teal that keeps its colour; a grey that stays grey; the
  secondary and tertiary of a passed primary that is itself outside sRGB (used as given). A row
  can now carry `hue`: the colour as painted must be within that many degrees of a hue. The
  expectations are the four passes worked out apart from the Sass. All 230 pass in Chromium 158,
  Firefox 159 and WebKit 27.2. `chain.test.ts` asserts the exact wrapped expressions, the
  corrected chroma of every palette a preset or fixture did not pass (the passes as plain
  arithmetic), and the painted hue within 6° of the hue asked for: 24 generated colours of the
  presets and fixtures, and a hue-wheel sweep of 10,800 (worst 0.70°; 46.7° uncorrected), where
  it also asserts that more than half of the chroma sRGB holds is left. The test evaluator now
  clamps an alpha to 0–1, as the browsers do. `demos/docs/test/chain.ts` asserts the Getting
  Started primary's painted hue: 0.1° from the brand's in light mode, 0.0° in dark, both engines.
- **Seen on the way, not fixed.**
  - Four passes reach the edge of sRGB between lightness 0.35 and 0.85, which covers both bands.
    Outside that the overshoot of a colour near black or white is small, the steps are short and
    four are not enough: at chroma up to 0.22 the worst painted drift is 8° at lightness 0.30,
    26° at 0.25 and 19° at 0.95 (53°, 59° and 49° uncorrected). Only the secondary and tertiary
    of a very dark or very light primary of one's own, or a helper called with other lightness
    limits, can land there. A factor of 4 instead of 2 would cover 0.25–0.90 and cost chroma in
    the bands.
  - Chromium reports no hue (`none`, read as 0) for an origin colour that is not already in
    oklch when its chroma is below about 0.02; Firefox and WebKit keep it. That was already so
    for a near-grey hex brand. Every pass goes through sRGB, so in Chromium a corrected colour
    that faint is painted at hue 0. With the 0.25 limit a colour only gets that faint where sRGB
    holds almost no chroma at all.
  - The contrast of the generated primary on its page rose a little with the lower chroma: the
    lowest over the 3360-case grid is 4.79:1 (was 4.60:1).

### Phase 15 — Material component gallery (added 2026-11-11)

Goal: the ng-material docs show every Angular Material 22 component under the adapter, so a
wrong colour is seen, not inferred. Today the showcase has buttons, chips, one form field and one
slide toggle.

- A **Components** page in the ng-material section (`demos/docs`), one section per Material
  component family, each rendered live in the page's current theme and mode: buttons (all five
  variants, icon, FAB, extended FAB, toggle group), chips (input, filter, selected, disabled),
  form field (filled and outlined; label, hint, error, disabled, prefix/suffix icons, textarea),
  select and autocomplete, checkbox, radio, slide toggle, slider (single and range), datepicker,
  tabs, card (elevated, outlined, filled), list and selection list, menu, dialog, bottom sheet,
  snackbar, tooltip, badge, progress bar and spinner, table with sort and paginator, expansion
  panel, stepper, sidenav and toolbar, tree, grid list, divider, ripple. Each section shows the
  states that matter (hover, focus, selected, disabled, error) and, for the accent components, the
  same component under `palette="secondary"`, `"tertiary"`, `"error"` and `"brand"`.
- **Overlays.** Menu, dialog, select panel, autocomplete, datepicker, snackbar, tooltip and bottom
  sheet render outside the themed subtree. The page states what the adapter needs for each (a
  `theme` / `themeMode` attribute on the overlay panel, how to set it through the component's
  panel class or the overlay container) and shows it working in a nested theme and a nested
  `themeMode`. What cannot follow a nested scope is said plainly.
- Every component in the gallery is an example file like the others (`demos/docs/src/examples/
  components/…`), so the examples check covers it.
- **Harness.** `demos/docs/test/render.ts` runs over the gallery too: screenshots per preset in
  light and dark and the painted-contrast report; a failing label on a component (not a docs
  caption) is an error, not a report. Overlays are opened for the screenshot.
- Anything a component paints wrongly becomes either an adapter fix or an `apply-material-overrides()`
  patch with the measured reason, the way Phase 11 did it.
- PLAN.md's `demo-material` (a separate app) stays as listed; this gallery lives in the docs.

Done when: every component family listed is on the page and in the examples check; the
painted-contrast report has no component label below 4.5:1 in any preset in either mode; the
overlay section shows each overlay correct inside a nested theme and a nested `themeMode` (or
says why it cannot be); the README row for `demos/docs` lists the gallery.

- **As landed (2026-11-11).** The page is `demos/docs/src/app/packages/pages/components.component.ts`
  (route `packages/ng-material/components`, in the ng-material sidebar): 27 family sections, an
  overview and the overlays section. 34 `.ng.html` and 2 `.ts.txt` example files in
  `demos/docs/src/examples/components/`; each template is the `templateUrl` of a component in
  `pages/components/gallery.components.ts`. Two new kinds in the examples check: `name.ng.html`
  (every element and static attribute is HTML's, Material's or the library's; no `style`; layout
  classes only; no component stylesheet but `gallery-layout.scss`) and `name.ts.txt` (the text is
  in a source file of the docs app, verbatim). 115 examples, 267 tests.
- **Harness as landed.** `render.ts` takes engines and `--only=showcase|gallery`, `--preset=`,
  `--mode=`, `--section=a,b`, `--jobs=N`, `--fonts`. Per preset and mode it measures 2,390 labels
  (1,692 on components): as loaded, hovered, focused, and with each overlay open; it asserts that
  an overlay resolves its opener's theme and mode. A full gallery run is about 14 minutes in
  Chromium and 23 in Firefox with eight jobs. Output: `dist/docs-render/gallery-{engine}.txt|json`
  and a PNG per section and per open overlay.
- **Findings, per preset** (component labels below 4.5:1; Chromium unless said):
  - As Material has it, in every preset: a focused text button on the filled card 3.3–4.4:1 in
    all eight preset modes; every accent label, hint, list subheader, tab body and step content
    under `palette="brand"` in dark mode 1.04–1.11:1; a grid tile header 3.2:1 over a light tile.
  - After the first round of patches (labels held at 0.44 / 0.82): azure-blue light 1, dark 0;
    rose-red light 6, dark 2; cyan-orange light 2, dark 0; magenta-violet light 2, dark 1. All
    were the text button on the filled card, hovered or focused (3.87–4.45:1), except four in
    rose-red light: the elevated button and the stepper's Back button with keyboard focus under
    `palette="error"` (4.37:1) and `"secondary"` (4.44:1).
  - As landed: 0 in every preset in both modes, in both engines. Lowest, light / dark, Chromium:
    azure-blue 5.12 / 5.01, rose-red 4.80 / 4.77, cyan-orange 4.73 / 5.01, magenta-violet
    4.74 / 5.01. Firefox: 5.16 / 5.01, 4.80 / 4.73, 4.68 / 5.01, 4.71 / 5.01.
- **Patches as landed** (`apply-material-overrides()`, six with the slide-toggle icon):
  - accents as labels held to lightness ≤ 0.40 (light) and ≥ 0.82 (dark), hue and chroma kept:
    `--mat-button-text-label-text-color`, `--mat-button-outlined-label-text-color`,
    `--mat-button-protected-label-text-color`, the stepper's error label and icon, and the form
    field's focus and error tokens (filled and outlined). The Phase 11 limit of 0.44 for the
    filled field became 0.40 for all of them: the presets' light surface is near tone 91, not
    M3's 98;
  - `--mat-card-filled-container-color: surface-container-high`. On
    `surface-container-highest` the dark limit would have to be 0.89 for the theme's own primary
    (rose-red: 4.46:1 at 0.88);
  - `--mat-form-field-filled-container-color: surface-container-high` (Phase 11, unchanged);
  - `.mat-mdc-form-field-hint-wrapper`, `.mat-mdc-subheader` → `on-surface-variant`;
    `.mat-mdc-tab-body-content`, `.mat-stepper-horizontal`, `.mat-stepper-vertical` →
    `on-surface`;
  - grid tile header and footer scrim 38% → 60% black (Material writes it as a literal).
- **Judgment calls, yours to revisit.**
  1. The label limit changes how text, outlined and elevated button labels and focused field
     labels look in every theme whose accent is lighter than 0.40 in light mode or darker than
     0.82 in dark mode. Fills are untouched.
  2. The button and field tokens are declared on the component element (`:where()`, no
     specificity) so they resolve in the `[theme]` and `[palette]` the component is in. A value
     for one of those tokens set on an ancestor no longer reaches the component; set on the
     component it wins.
  3. Hints, subheaders, tab bodies and step content no longer take a `[palette]` scope's identity
     colour: they are surface text, as in M3.
  4. The grid tile scrim is darker than Material's.
  5. `cpaOverlayScope` is a directive of the docs app, shown as source. The adapter package has
     no overlay helper; the phase did not ask for one.
  6. Brand in dark mode: see "Found on the way".
- **Corrected in the examples and the harness while reading the screenshots** (not adapter
  changes): the list's activated item, the sidenav, the tree (a node needs
  `isExpandable` before `isExpanded` does anything), the grid list header covering its tile's
  label, badges covering the text beside them; the harness pressed Escape with focus inside the
  sidenav and measured an autocomplete panel while it was opening.

### Phase 14d — A theme without a brand uses its primary as the brand (decided 2026-11-11)

Found by Phase 15: the presets pass no `brand`, so `palette="brand"` is core's grey in both modes
and brand-coloured fills are near-black on a dark page. "The brand is never adjusted" holds only
for a brand that was given.

- When a theme passes no `brand`, its brand palette is its primary, exactly as that primary is
  (passed or generated): the brand pair points at the primary pair. The direction per theme is
  decided as Phase 14's pointers already do it: a theme that passes `brand` and no `primary`
  points primary at the generated-from-brand; a theme that passes `primary` and no `brand` points
  brand at primary; one that passes both points nothing; one that passes neither inherits both.
  At the root with nothing loaded, brand keeps its grey initial value and primary follows it, so
  there is no cycle and the no-theme fallback is unchanged.
- The `*-from-brand()` helpers keep reading `--color--brand`; with brand = primary they produce
  the same colours as the `*-from-var("--color--primary")` form.
- The gallery's "brand fills are near-black in dark mode" paragraph goes; `palette="brand"` on
  every preset shows that preset's primary. The brand rows in the chain test and `render.ts`
  gain: a theme with only `primary` has `--color--brand` equal to it in both modes; a theme with
  both keeps both; a nested theme with only `secondary` inherits the outer brand.

Done when: the chain test and `render.ts` pass with the new rows; the gallery screenshots show
`palette="brand"` fills in each preset's primary in both modes, and the painted-contrast report
stays at 0 component labels below 4.5:1.

**Done 2026-11-11.** As landed:

- `define-theme()` emits, for a theme that passes `primary` and no `brand`,
  `--color--brand--mode-{light,dark}: var(--color--primary--mode-{light,dark})` and the join
  (`emit-brand-from-primary`, `_palette.scss`). The root rule is untouched, so with no theme the
  brand is `oklch(0.2 0 0)` and primary follows it.
- Proved first as hand-written CSS over the built core.css in Chromium, Firefox and WebKit, then
  in Sass.
- Brand fill (a filled button under `palette="brand"`), light / dark, the same in Chromium and
  Firefox and equal to the preset's primary: azure-blue `#004ab3` / `#4ca7ff`, rose-red
  `#b20072` / `#fe69bb`, cyan-orange `#006360` / `#6ccac5`, magenta-violet `#9d00be` / `#e365ff`.
  Before: near-black in every preset and mode.
- Judgment calls, not in the text above:
  1. Roles too. If the primary sets `bg`, `stroke` or `focus` itself, the brand's same role
     points at it, so `palette="brand"` and no palette paint the same in every role. Roles the
     primary leaves out are derived from the brand colour as before, which gives the same result.
  2. Neutrals follow. A theme on `<html>` that passes only a primary and no background now gets
     the root's generated background and surface in the primary's hue (they are generated from
     the brand in force) instead of grey. The presets pass their own background and surface, so
     they are unchanged. A nested primary-only theme keeps the outer background, as before.
  3. A nested theme with only a primary takes its own primary as its brand, not the outer
     theme's brand; one with only a secondary inherits the outer brand.

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

As done (2026-11-11):

- `0.1.0-alpha.0` is the value in `.publish/versions.yml`, and is the published version only on
  `main`. git-flow inserts the name of any branch with a slash, so this branch resolves to
  `0.1.0-feature.port-spike-findings.alpha.0`; no setting changes that.
- theme-ng-core's ng-packagr build did not compile: the root tsconfig maps core to its source,
  which lies outside the library's rootDir. Its production tsconfig now maps core to
  `packages/theme-core/dist/index.d.ts`; core is a peer, so git-flow builds it first.
- theme-core's `files` also excludes `dist/render.html` (the 6.6 MB page `render.ts --html`
  writes). theme-ng-material lost `sideEffects: false`: it ships CSS, which a bundler may drop
  from a package that declares no side effects.
- The repo is still private, so there is no `static-site` artifact and `pages.yml` stays on
  manual trigger. Its install step now passes `GITHUB_TOKEN`, which the `@cpdevtools` registry
  lines in `.npmrc` need.
- theme-ng-core's `publishConfig` also has `linkDirectory: false`. Without it pnpm links the
  workspace copy to `dist/theme-ng-core`, which does not exist before a build; with it the demos
  and tests keep resolving the source. The lockfile records the publish directory
  (`publishDirectory`), and a frozen install fails if it does not.
- The first push created `release/feature/port-spike-findings` at the same commit, so there was
  nothing to compare; the draft release PR (#1) opened on the second push. The test workflow is
  green and builds theme-ng-core with ng-packagr.

---

### Phase 16 — Wrap-up: docs deploy, demo-core, gallery hrefs (added 2026-11-11)

The repo is public since 2026-11-11. Three leftovers, none of them a spike finding:

1. **Docs deploy.** Add git-flow's `static-site` artifact for `demos/docs` (directory `../..`,
   packDir `dist/docs/browser`, `deploy: [gh-pages]`, `pagesRoot: true` so the production
   `baseHref` `/cp-theming/` stays valid), with the docs build as its `github.actions.build`.
   Delete `pages.yml`. Record in the README where the docs are served from and that a release
   PR merge deploys them.
2. **`demos/demo-core` builds again.** `src/scss/components.scss` calls `a.container(high)` and
   `a.container(low)`; the mixin takes no argument since June. Use `t.container()` with
   `t.tone(high)` / `t.tone(low)`, through the public `theme` module like `base.scss` does. Give it
   `github.actions.build` so CI builds it, and move its README row from Broken to In Progress.
3. **Gallery demo hrefs.** `demos/docs/src/examples/components/sidenav.ng.html` and the list
   example carry `href="packages/ng-material/components#…"`, which a direct request resolves
   under the current page. Use `href="#sidenav"` / `href="#list"` (same-page anchors), and let the
   examples check refuse an `href` that is neither a fragment, an absolute path nor a URL.

4. **The demos are reachable.** Nothing links to the demos today and none is hosted. The docs
   build copies `demo-core`'s Vite output to `dist/docs/browser/demos/demo-core/` (its own
   `base`), and the home page and the core Getting Started page link to it as "Live demo: vanilla
   TypeScript + Vite". The three Angular demos are stubs; they get a line on the home page saying
   so, no link, until they exist.

Done when: a push opens or refreshes the draft release PR with the docs artifact listed; `pnpm
build` at the root builds demo-core and the docs build includes it; the home page links to it and
the link works on the deployed site; the examples check passes with the href rule; the README
rows are updated.

### Phase 17 — Docs that teach (added 2026-11-12)

The site today is reference material: pages grouped by module, prose followed by code blocks that
say which function to call. Decided 2026-11-12: it gets a **Learn** track, read in order, in the
manner of the best software docs (the React, Svelte and Stripe guides): each chapter is built
around one idea, shows it working before it names anything, explains the idea in plain words, gives
the smallest code that produces what was shown, and ends with what the reader can now do. The
existing pages become the **Reference** track underneath it. The spike's rule applies again, with
the order coming from the teaching: a chapter uses only what earlier chapters taught, and the
build fails otherwise.

**Site structure**

- Top navigation: **Learn**, **Reference** (the current core / ng-core / ng-material sections), and
  the Components gallery and Showcase as **Explore**. The home page leads with Learn.
- A Learn chapter is a page with: the question it answers (one sentence under the title), a live
  example rendered in the page, the idea in plain words (what problem it solves, how to think
  about it, what it rules out), the minimal code, a "Try it" variation the reader can switch in
  the live example, and "You can now…" as the last line. No API tables on Learn pages; every
  function or variable named links to its Reference entry.
- Prose is written for someone who knows CSS and has never seen cp-theming. No sentence may
  depend on a term the chapter has not introduced. One idea per chapter; if a chapter needs two,
  it is two chapters.

**Chapters** (order is the dependency order; each line is the question the chapter answers)

1. **One colour, a whole palette.** What does cp-theming do with a colour I give it? Live: a
   colour picker driving `--color--primary` on a `[theme]` element; the ladder, contrast text,
   bg, stroke and focus ring update as it moves. Idea: the browser derives everything, at runtime,
   so a theme is a few inputs and nested themes or runtime changes just work. Rules out Sass
   colour math and pre-computed shades. Code: `t.theme($palettes: (primary: t.palette(…)))`
   with `define-core-theme` and `define-theme`. Introduces: theme, palette, the `--color--{name}`
   tokens, `--contrast`.
2. **Light and dark are one theme.** Why don't I write a dark theme? Live: the same card under
   `themeMode` light / dark / auto on different elements, including a dark card inside a light
   page. Idea: every value resolves where it is used, so a mode is a property of an element, not
   of the page. Code: `t.light-dark()`, `themeMode`. Introduces: modes, `--high` / `--low`.
3. **Pass what you have, the rest is generated.** I only have a brand colour; what happens?
   Live: a brand swatch and the primary, secondary, tertiary, background and surface generated
   from it, with the brand too bright to read as text and the primary readable. Idea: the chain
   brand → primary → accents → neutrals, what is adjusted and what never is, how to override one
   link. Code: `t.theme($brand: …)`, passing `secondary` explicitly. Introduces: brand, the
   generation chain.
4. **Roles, not shades.** Why `bg`, `stroke`, `contrast` instead of "a bit lighter"? Live: one
   component on three palettes, each role labelled. Idea: a role names a job (fill, border, text
   on it); the theme decides the colour, the component decides the job. Introduces: the role
   tokens, `--tint-N`, focus per palette.
5. **Scopes and surfaces.** How do I colour a piece of the page? Live: `palette=` selecting a
   palette, `bg` / `filled` / `outlined` painting it, `tone=` sliding it, composed. Idea: the
   attribute layers and what text colour each gives you and why. Code: the same in Sass with
   `t.apply-palette()`, `t.bg()`, `t.filled()`, `t.outlined()`, `t.tone()`. Introduces:
   `--palette-color*`, `--container--*`.
6. **Themes inside themes.** What does a nested theme inherit? Live: three nested themes side by
   side — passes only primary, passes only brand, passes nothing — inside an outer theme. Idea:
   a theme declares only what it passes; what follows from that is regenerated, the rest is
   inherited. Introduces: nesting, `$default`, coexisting themes.
7. **Readable by construction.** Who chooses black or white text? Live: a lightness slider across
   the contrast step, with the ratio shown. Idea: the step at the WCAG crossover, what it
   guarantees (every opaque colour reads at 4.5:1 or better) and what it doesn't (translucent
   fills, the `warn`/`caution` presets on the surface). Introduces: the guarantee, where it ends.
8. **Everything else a theme carries.** Spacing, shape, motion, elevation, weights, typography:
   one live panel with sliders. Idea: these are inputs like colours, with the same inheritance.
   Introduces: `--space--*`, `--shape--*`, density scopes, `--elevation-N--shadow`, `--weight--*`.
9. **Switching at runtime.** How does a user pick a theme or mode? Live: a switcher with
   persistence and a reload. Idea: it is an attribute on an element plus a saved value; the head
   snippet applies it before first paint. Code: the TypeScript API, `provideTheme()`, the
   `ThemeService` signals. Introduces: the TS and Angular APIs.
10. **Angular Material.** How do Material components get these colours? Live: the gallery's
    buttons under two nested themes and a `[palette]` scope, with a Material role and the
    cp-theming token it comes from shown on hover. Idea: Material reads `--mat-sys-*`; the
    adapter computes those from Material's own role tables and your tokens, so nothing is
    hand-mapped and nested scopes follow. Introduces: the adapter, overlays, override patches.

**Mechanics**

- Every live example, Sass ones included, is a file under `demos/docs/src/examples/learn/NN-…/`
  (`.html` plus optional `.scss`) rendered inside an `<iframe>` built by the docs build with core,
  the chapter's own compiled theme and the example's CSS, and its source shown beside it from the
  same file. "Try it" variations are alternative files for the same frame. The examples check
  (Phase 7 resumed) runs over them.
- The order check: a pattern table next to the chapter list (`themeMode` → 2, `$brand` → 3,
  `palette=` / `t.bg()` → 5, nested `theme=` → 6, `--space--` / `--shape--` → 8, `<script` /
  `ThemeService` → 9, `mat-` / `--mat-sys` → 10, and so on). An example of chapter N that
  matches a later chapter's pattern fails the build; so does prose that names a Reference entry
  before its chapter.
- The Reference's CSS Variables page is generated from the compiled `core.css`, one live swatch
  per colour token, with a theme and mode switch, instead of the hand-written table.
- Review: once written, one Opus reader per chapter, given only that chapter and the "Introduces"
  lines of the chapters before it, lists every term, variable, mixin or attribute used before it
  was taught and every explanation that is not plain; a second pass fixes the list.

Done when: the ten chapters are written and pass the order check; every live example renders in
the page with its source beside it; the Reference variables page is generated; the readers' lists
are closed; a reader who starts at chapter 1 meets no term before it is explained (the review
pass is the test).

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
- Palettes a theme does not pass are generated along the chain brand → primary → secondary,
  tertiary → background, surface (Phase 14). The brand colour is kept exact; the primary made from
  it is adjusted for readability. The June decision that cp-theming has no third accent palette is
  reversed on your instruction of 2026-11-11.
- Authors may write palette colours in any CSS colour format (your instruction of 2026-11-09, which
  withdraws the former "oklch only" rule for inputs). Derivation stays in oklch.
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

- The readable band `palette-from-brand()` and the generated primary share (lightness 0.35–0.50 in
  light mode) leaves some cyan and green brands at 3.7–4.5:1 on the generated surface (Phase 14,
  "Measured"). Tightening the light band to about 0.46 would close it and darken every generated
  primary a little.

- Identity text on the auto `--bg` role (what `t.bg()` paints) is below 4.5:1 for five preset
  palettes in light mode (3.77–4.29: error ×3, caution, warn). The harness reports it.
- `themeMode="invert"` inside an explicit light ancestor resolves to light today. Fixing it needs
  `@scope`, which would raise the Firefox baseline to 146.
- Brand fills in dark mode (Phase 15). The presets pass no brand, so `--color--brand` is core's
  default, a near-black, in both modes. Under `palette="brand"` in dark mode a filled button, a
  checked checkbox, a radio, a slider and a progress bar are dark on a dark page. Labels are held
  readable by the adapter; fills are the brand exactly, by design. A per-mode default brand, or
  no default, would change it. The Components page says so.
- A focused text button under `palette="error"` on `surface-container-high` (a dialog, the filled
  card) is 4.0–4.4:1 in rose-red light and in dark mode in three presets (Phase 15, measured by
  probe; the gallery has no such case). A light limit of 0.37 and a dark limit of 0.89 would
  close it and make every held label visibly darker or paler.
- Angular Material's components resolve their font to `system-ui` in the docs, not to the docs'
  web font (seen in the Phase 15 screenshots; not looked into).
- The root `pnpm build` builds core only. The docs app reads the adapter's built CSS, so an
  adapter change needs `pnpm --filter @cpangular/cp-theming-ng-material build` first (README and
  CLAUDE.md now say so).

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
| Names for the registered light and dark colours | `--mode-light` / `--mode-dark` accepted | Phase 9 |
| Repo visibility | You will make it public | Pages and the docs deploy follow in Phase 13 |
| Colour formats | "I want the author to be able to provide whatever colours" | The "oklch only" rule for authors is withdrawn (your instruction, 2026-11-09). Any CSS colour is accepted as a palette, brand or override colour; the library still derives everything in oklch. Phase 8 changes the rule text and adds a fixture theme written in hex, rgb() and hsl(); Phase 7 (resumed) says so in the docs |

How I read two of them:

- **"Any colour system is acceptable"** also settles the contrast question: the automatic contrast
  calculation reads linear sRGB internally, because that is how WCAG defines luminance.
- **"Register what animation needs"** covers theme switches. A light/dark flip and a `palette`
  attribute change stay instant at the variable level, because the registration that would fade them
  is exactly what stops `themeMode` working on plain elements today. Ordinary
  `transition: background-color` on elements still fades both.

### Still open

Nothing blocks any session. One standing offer: if you ever want the variables themselves to fade on
a light/dark flip, say so before Phase 9 starts; it means keeping the role tokens registered, and
`themeMode` then takes effect only on or above an element that has a `theme` attribute.

For reference, the runtime theme helper would have been a small TypeScript function that creates a
theme in the browser from data, for example colours a user picks or a row from a database. After
Phase 9 the same thing is a few lines of plain CSS (`[theme="x"] { --color--primary: … }`), which is
why it is not scheduled.
