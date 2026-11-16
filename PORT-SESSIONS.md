# Session prompts and settings for PORT-PLAN.md

One session per row. Open a new chat in `/devcontainer/repos/cp-theming`, set the three controls at
the bottom of the prompt box, paste the prompt. Each session ends with a commit at the phase's
"Done when", so a bad session reverts as a unit.

**Standing rule for every session: when the Done-when holds, commit and push to
`feature/port-spike-findings` without asking.** A session that ends with uncommitted or unpushed work
is not done. The only things a session never does on its own are merging into `main`, merging a
release PR, and running `gitflow version`.

Your answers of 2026-11-09 are folded into the plan and the prompts, so every prompt can be pasted
as it is. The only thing still yours is making the repo public before session 8 so the docs can
deploy to Pages.

How to set things in the VS Code extension (Claude Code chat panel):

- **New session**: Command Palette → "Claude Code: Open in New Tab".
- **Model and effort**: click the model name at the bottom of the prompt box. Pick Fable 5.1, then set
  the Effort row in the same picker.
- **Permission mode**: click the mode indicator at the bottom of the prompt box and pick **Auto** for
  every session. The prompts say where to stop and wait.
- **Ultracode**: nothing to toggle. The word `ultracode` is already in the prompts that need it.

| # | Session | Model | Effort | Permission mode |
|---|---------|-------|--------|-----------------|
| 1 | Phase 8 harness and CI | Fable 5.1 | high | Auto |
| 2 | Phase 9 cascade and registration | Fable 5.1 | high | Auto |
| 3 | Phase 9 verification (ultracode) | Fable 5.1 | high | Auto |
| 4 | Phase 10 contrast and alpha | Fable 5.1 | medium | Auto |
| 5 | Phase 11 Material adapter | Fable 5.1 | high | Auto |
| 6 | Phase 12 startup | Fable 5.1 | medium | Auto |
| 7 | Phase 7 resumed: docs examples | Fable 5.1 | high | Auto |
| 8 | Phase 14 brand and accent palettes | Fable 5.1 | high | Auto |
| 9 | Phase 14b follow-ups | Fable 5.1 | medium | Auto |
| 10 | Phase 14c generated colours in gamut | Fable 5.1 | medium | Auto |
| 11 | Phase 15 Material component gallery | Fable 5.1 | high | Auto |
| 12 | Phase 14d brand defaults to primary | Fable 5.1 | medium | Auto |
| 13 | Phase 13 release | Fable 5.1 | medium | Auto |
| 14 | Phase 16 wrap-up | Fable 5.1 | medium | Auto |
| 15 | Phase 17 Learn track: mechanics + chapters 1–5 | Fable 5.1 | high | Auto |
| 16 | Phase 17 Learn track: chapters 6–10 + reference | Fable 5.1 | high | Auto |
| 17 | Phase 17 review (ultracode) | Fable 5.1 | high | Auto |
| 18 | Phase 18 a theme as a package | Fable 5.1 | high | Auto |

Subagent models are chosen inside the workflow prompts: Opus at high effort for critique, Sonnet at
medium for reading and sweeps. You do not set these.

Every prompt assumes the session reads CLAUDE.md and .github/copilot-instructions.md first and
respects the non-negotiable design decisions there. cp-theming's names and API are the standard; do
not copy code from `/devcontainer/repos/ng-material-theme`.

---

## Session 1 — Phase 8 harness and CI

```
Work in /devcontainer/repos/cp-theming on branch feature/port-spike-findings. Read CLAUDE.md, .github/copilot-instructions.md, PLAN.md and PORT-PLAN.md, then execute Phase 8 of PORT-PLAN.md exactly as written. Run pnpm install first. Order: (1) the node --test CSS checks in packages/theme-core/test and packages/theme-ng-material/test, compiling through the Sass JS API, with each check that today's code fails marked todo and naming the phase that fixes it; (2) the fixture themes; (3) the first vitest tests for the TypeScript API; (4) packages/theme-core/test/render.ts with Playwright, static fixture pages only, one row per case in "Behaviour today" plus the extra mode, palette and nesting cases the phase lists; rows that work today assert today's values; (5) wireit test scripts, the github.actions.build and github.actions.test script names, and git-flow's test.yml from https://github.com/cpdevtools/git-flow-template (read its README; add only what the test workflow needs, no .publish/ and no release workflows yet); (6) the colour-formats bullet: withdraw the "oklch only" rule for authors in copilot-instructions.md, CLAUDE.md, PLAN.md and README.md (any CSS colour is accepted; derivation stays oklch) and add the hex/rgb()/hsl() fixture theme; (7) the housekeeping bullets. All scripts are TypeScript run by Node 24; never .mjs, .cjs or .js. Do not change any Sass behaviour in this session beyond the two if() replacements. When the Done-when holds, update the README and PLAN.md status tables, commit with the render.ts output in the message, and push without asking. Then tell me whether the test workflow is green and fix anything red.
```

## Session 2 — Phase 9 cascade

```
Work in /devcontainer/repos/cp-theming on branch feature/port-spike-findings. Read CLAUDE.md, .github/copilot-instructions.md, PLAN.md and PORT-PLAN.md. Execute Phase 9 as written; "Your answers" at the end of PORT-PLAN.md has the registration rule and the proposed variable names. Work in this order and run pnpm test and render.ts after each step: register each role's light and dark colour, make the role tokens unregistered light-dark() joins of them, remove the alias registrations and move the greyscale fallback to the initial values; make the sub-config builders and t.theme() return only passed keys; move every derivation, the mode rules and the percentage pick into t.define-core-theme(); reduce t.define-theme() to one rule of what the author passed, with custom palette names and adaptor hooks emitted once at root level; fix the load-order comments; delete the workaround block in demos/docs/src/styles.scss and switch demo-core to t.define-core-theme(); write harness check 5 and remove the Phase 9 todos; correct the PLAN.md and packages/theme-core/docs text the phase names. Public Sass API and every existing variable name stay as they are. Add the render.ts crossfade row: a theme switch with a transition on the registered colours must be mid-way at half time for the base colour, a ladder step, a nested theme and a dark subtree. Build the docs app and screenshot the four themes in light and dark with Playwright. When the Done-when holds, update the README and PLAN.md status tables, commit with each preset's size before and after in the message, and push without asking. Then tell me what to open in Safari to confirm the browser baseline.
```

## Session 3 — Phase 9 verification (ultracode)

```
ultracode. Work in /devcontainer/repos/cp-theming on branch feature/port-spike-findings. Read PORT-PLAN.md Phase 9 and the Phase 9 diff (git log to find the Phase 8 commit, then git diff <that commit>..HEAD -- packages demos). Run a workflow with Opus critics at high effort, one per claim, each trying to refute the claim against the compiled CSS in a real browser (Playwright, Chromium and Firefox): (1) themeMode light, dark, auto and invert on an element with no theme attribute flips colours and weights for its subtree, including inside a [palette] scope and inside a nested theme; (2) a nested theme that sets only primary inherits every other value from the theme around it and does not inherit that theme's explicit $bg, $stroke or $focus; (3) with all four presets loaded in any order after core.css, <html theme="azure-blue"> shows azure-blue, and a user :root rule placed before the library wins; (4) a custom palette name, the *-from-brand helpers and a theme defined with $adaptor: mat.adaptor() still produce every variable they produced before the change; (5) mode combinations that worked before Phase 9 give the same computed values now; (6) a theme switch crossfades when the registered light and dark colours are transitioned, in Chromium and Firefox, and nothing derived is registered. Report only confirmed defects with a reproduction, add a render.ts row for each, fix them, then commit and push without asking.
```

## Session 4 — Phase 10 contrast and alpha

```
Work in /devcontainer/repos/cp-theming on branch feature/port-spike-findings. Read CLAUDE.md, .github/copilot-instructions.md and PORT-PLAN.md. Execute Phase 10 as written (contrast stays automatic; the white text on warn and caution in light mode is accepted): the clamped luminance step in _role-derivatives kept as an oklch value, the comment replaced, alpha pinned to 1 everywhere except the tints, and the formula corrected in the two docs pages. Remove the Phase 10 todos from the contrast sweep and add the render.ts comparison of browser-computed --contrast against the sweep's prediction. Run pnpm test and render.ts. When the Done-when holds, update the README and PLAN.md status tables, commit with the sweep summary line and the list of preset colours whose text changed in the message, and push without asking.
```

## Session 5 — Phase 11 Material adapter

```
Work in /devcontainer/repos/cp-theming on branch feature/port-spike-findings. Read CLAUDE.md, .github/copilot-instructions.md and PORT-PLAN.md. Execute Phase 11 as written; the surface containers, dim and bright are offsets from --color--surface. First read @angular/material/core/tokens/m3/_md-sys-color.scss and md-sys-color-internal in node_modules so the palette map you pass has the shape the functions expect. Then: scss/_m3-tone.scss with m3-tone(); the table-driven colour tokens with the directly mapped roles written out; --mat-sys-neutral10 and --mat-sys-neutral-variant20; material-palette() generated from the same tables; core palette remaps emitted by the adapter's core mixin; the selector rules; typography from --text--* plus the font shorthand tokens. Write the harness checks (every --mat-sys-* name read by the installed Material component styles is declared; surface roles keep M3's lightness order in both modes) and remove the Phase 11 todos. Build the docs app, screenshot the showcase in light and dark for the four themes and a nested theme, then go through apply-material-overrides() patch by patch and delete the ones the new roles make unnecessary. Stop before committing and tell me what to look at. I will then send: "ultracode: run one Opus pass that tries to find a Material 22 component whose colours are wrong or unreadable in the showcase screenshots or whose --mat-sys-* reads are undeclared, fix what it confirms, update the README and PLAN.md status tables, then commit and push."
```

## Session 6 — Phase 12 startup

```
Work in /devcontainer/repos/cp-theming on branch feature/port-spike-findings. Read CLAUDE.md, .github/copilot-instructions.md and PORT-PLAN.md, then execute Phase 12 as written: make persistence in packages/theme-core/src/theme.ts lazy and guarded so importing the package with no localStorage does not throw; make provideTheme() and ThemeService skip browser-only work outside a browser; export the inline head snippet from theme-core, built from the same storage-key constants as theme.ts; document it in Getting Started with the CSP nonce note. Follow the TypeScript conventions in copilot-instructions.md (explicit element parameters, no global document assumptions). Add the vitest tests the phase lists. Verify the Done-when with a Playwright screenshot of the docs app taken before its bundle runs, with a saved dark non-default theme. When it holds, update the README and PLAN.md status tables, commit and push without asking.
```

## Session 7 — Phase 7 resumed: docs examples

```
Work in /devcontainer/repos/cp-theming on branch feature/port-spike-findings. Read CLAUDE.md, .github/copilot-instructions.md, PLAN.md phase 7 and PORT-PLAN.md "Phase 7 (resumed)". First confirm that the installed @angular/build imports files as text (with { loader: 'text' }) and tell me if it does not. Then move every Sass and attribute example in demos/docs/src/app/packages/pages into real files under demos/docs/src/examples/{page}/, import them as text, render attribute examples from the same .html, and extend the harness to compile every example with zero warnings and run the undefined-variable check on core + a preset + the example. Examples must be complete snippets; mark any fragment that cannot compile as display-only. Then do the manual correction pass the phase lists, add demos/docs/test/render.ts with the painted-contrast report over the built showcase, and rewrite PLAN.md phase 7 to describe the navigation the code has. Do not reorder pages and do not remove the custom Sass section from Getting Started. When the Done-when holds, update the README status tables, commit and push without asking, then tell me how to view the site locally and list every label render.ts reports below 4.5:1.
```

## Session 8 — Phase 14 brand and accent palettes

```
Work in /devcontainer/repos/cp-theming on branch feature/port-spike-findings. Read CLAUDE.md, .github/copilot-instructions.md, PLAN.md and PORT-PLAN.md Phase 14, then execute it as written: brand and tertiary become core palette names (--color--brand stays the brand palette's colour and is never adjusted); on the shared derivation selector core declares the registered pair of every palette a theme did not pass, along the chain brand → primary → secondary, tertiary → background, surface (primary from brand with the readability clamps palette-from-brand() uses; secondary: primary's hue, one third chroma; tertiary: primary's hue + 60°, half chroma; background and surface: tinted neutrals of the brand hue with the numbers the from-var helpers use); the semantic palettes get the presets' shared default colours as core defaults; the Material adapter reads --color--tertiary for the tertiary roles; the docs say "pass one, two or three accents" and the tertiary-equals-secondary paragraph goes; PLAN.md, README and the harness lists are updated. Verify in the browser before you trust the Sass: render.ts rows for a theme with only brand (primary is readable, the brand palette's own colour is exact, all generated palettes have the expected relation), a theme with only primary, a nested theme with only primary re-deriving its accents, and a theme that passes secondary keeping it. Run pnpm test, render.ts in Chromium and Firefox, and screenshot the showcase in all four presets in light and dark. When the Done-when holds, update the README and PLAN.md status tables, commit with the screenshots' findings in the message, and push without asking.
```

## Session 9 — Phase 14b follow-ups

```
Work in /devcontainer/repos/cp-theming on branch feature/port-spike-findings. Read CLAUDE.md, .github/copilot-instructions.md and PORT-PLAN.md Phase 14b, then do its six items in order, running pnpm test after each: chroma floors for the generated secondary and tertiary; the light-mode band top for the generated primary from 0.50 to 0.45 in the chain and in palette-from-brand(); t.bg() on background and surface setting readable text from the bg role's contrast; the docs note that themes come from t.define-theme(), with the one-line caveat for a nested rule written directly in CSS; the core.css size ceiling raised to 256 KiB; the Showcase entry back in the ng-material sidebar (its own nav list, not ng-core's). Update the chain test, the sweep and the render rows to the new numbers rather than loosening them. Run render.ts in Chromium and Firefox and screenshot the showcase on cyan-orange in both modes and the Getting Started example. When the Done-when holds, update the README and PLAN.md status tables, commit with the screenshots' findings in the message, and push without asking.
```

## Session 10 — Phase 14c generated colours in gamut

```
Work in /devcontainer/repos/cp-theming on branch feature/port-spike-findings. Read CLAUDE.md, .github/copilot-instructions.md and PORT-PLAN.md Phase 14c, then execute it as written: after the lightness clamp and chroma cap, every generated colour (primary from brand, secondary, tertiary) and the palette-from-var / palette-from-brand helpers get the four-pass gamut correction described there, built in Sass as a function that wraps an expression so it is written once. Prove it in the browser before you trust the Sass: render.ts rows for an orange (#ff6a00), a yellow and a blue brand in both modes, asserting the painted hue is within 6° of the brand hue and that the blue is unchanged; then the chain test's hue assertion over every preset, fixture and a hue-wheel sweep with colorjs.io. Run pnpm test and render.ts in Chromium and Firefox, build the docs and screenshot Getting Started in both modes. When the Done-when holds, update the README and PLAN.md status tables, commit with the before/after colours of the three brands in the message, and push without asking.
```

## Session 11 — Phase 15 Material component gallery

```
Work in /devcontainer/repos/cp-theming on branch feature/port-spike-findings. Read CLAUDE.md, .github/copilot-instructions.md, PLAN.md and PORT-PLAN.md Phase 15, then build the Components page in the ng-material section of demos/docs exactly as the phase lists: one live section per Angular Material 22 component family with the states that matter and the accent components repeated under palette="secondary", "tertiary", "error" and "brand"; every component as an example file under demos/docs/src/examples/components/ so the examples check covers it; an overlays section that shows menu, dialog, select, autocomplete, datepicker, snackbar, tooltip and bottom sheet inside a nested theme and a nested themeMode and states what each needs. Extend demos/docs/test/render.ts to screenshot the gallery per preset in light and dark with overlays open, and make a component label below 4.5:1 an error. Fix what the screenshots show is wrong, in the adapter or as a measured override patch, as Phase 11 did; never by hand-colouring the docs. Build the docs app and run render.ts in Chromium and Firefox. When the Done-when holds, update the README and PLAN.md status tables, commit with the per-preset findings in the message, and push without asking. Then tell me which components needed a fix and why.
```

## Session 12 — Phase 14d brand defaults to primary

```
Work in /devcontainer/repos/cp-theming on branch feature/port-spike-findings. Read CLAUDE.md, .github/copilot-instructions.md and PORT-PLAN.md Phase 14d, then execute it as written: a theme that passes no brand gets its primary as its brand palette, through the per-theme pointers Phase 14 already uses, with no cycle at the root. Prove it in the browser before you trust the Sass: render.ts rows for a theme with only primary (brand equals it in both modes, palette="brand" paints it), a theme with both (both kept), a theme with only brand (unchanged from today), a nested theme with only secondary (inherits the outer brand), and no theme (grey). Then the chain test rows, the gallery screenshots per preset in both modes with the painted-contrast report, and remove the gallery paragraph about near-black brand fills. Run pnpm test and render.ts in Chromium and Firefox. When the Done-when holds, update the README and PLAN.md status tables, commit with the brand fill colours per preset in the message, and push without asking.
```

## Session 13 — Phase 13 release

```
Work in /devcontainer/repos/cp-theming on branch feature/port-spike-findings. Read CLAUDE.md, .github/copilot-instructions.md and PORT-PLAN.md Phase 13, then the READMEs of https://github.com/cpdevtools/git-flow-template and https://github.com/cpdevtools/git-flow. Settings: publish to GitHub Packages only; first version 0.1.0-alpha.0 (work out from the git-flow docs how that maps onto .publish/versions.yml and a feature/ branch, and tell me if it cannot be expressed exactly); peers between the three packages use workspace:^; docs deploy to GitHub Pages. Add only what git-flow needs, as the phase lists; keep the wireit root scripts; do not adopt the template's deps.yml, syncpack or devutil root scripts. Set up packaging for the three packages exactly as the phase describes and run gitflow pack; show me each tarball's file list and its package.json exports and peerDependencies. Check with gh whether the repo is public yet: if it is, add the static-site artifact for demos/docs with the gh-pages method; if not, leave pages.yml on manual trigger and tell me. Commit and push without asking, then tell me whether git-flow opened the draft release PR and whether the test workflow is green, and fix anything red. Do not merge into main, do not run gitflow version, and do not merge the release PR.
```

## Session 14 — Phase 16 wrap-up

```
Work in /devcontainer/repos/cp-theming on branch feature/port-spike-findings. Read CLAUDE.md, .github/copilot-instructions.md and PORT-PLAN.md Phase 16, and the Deployment page of the cpdevtools/git-flow wiki for the static-site artifact (gh api repos/cpdevtools/git-flow/contents/wiki or the README's link; read-only). Do the four items: the static-site artifact for demos/docs with gh-pages deploy and pages.yml deleted; demos/demo-core building again through the public theme module with a github.actions.build script; the gallery demo hrefs as same-page anchors with the examples check refusing other relative hrefs; demo-core's build copied into the docs output under demos/demo-core/ and linked from the home page and the core Getting Started page, with a line about the three stub demos. Run pnpm build at the root, pnpm test, and the docs examples check. When the Done-when holds, update the README and PLAN.md status tables, commit and push without asking, then tell me whether the draft release PR lists the docs artifact and whether the test workflow is green; fix anything red. Do not merge any PR.
```

## Session 15 — Phase 17 Learn track: mechanics and chapters 1–5

```
Work in /devcontainer/repos/cp-theming on branch feature/port-spike-findings. Read CLAUDE.md, .github/copilot-instructions.md, PORT-PLAN.md Phase 17 and the existing demos/docs app. Build the Learn track's mechanics first: the Learn / Reference / Explore navigation with Learn first on the home page; the chapter page shape (question, live example, idea, minimal code, Try it, You can now); live examples as files under demos/docs/src/examples/learn/ rendered in an iframe built by the docs build (core + the chapter's compiled theme + the example's CSS) with the source shown beside it from the same file, Sass examples included; the order check with the pattern table, failing the build. Then write chapters 1 to 5 exactly as PORT-PLAN.md describes them: example first, then the idea in plain words for someone who knows CSS and has never seen cp-theming, then the smallest code, and nothing a later chapter introduces. Every function or variable named links to its Reference entry. Build the site, open each chapter in Playwright and screenshot it with its example rendered. When the Done-when for these chapters holds, commit and push without asking, then tell me how to view it and which chapter you are least sure reads clearly.
```

## Session 16 — Phase 17 Learn track: chapters 6–10 and the generated reference

```
Work in /devcontainer/repos/cp-theming on branch feature/port-spike-findings. Read CLAUDE.md, .github/copilot-instructions.md, PORT-PLAN.md Phase 17 and chapters 1 to 5 as written in demos/docs. Write chapters 6 to 10 the same way, each using only what the chapters before it introduced; chapter 10's live example comes from the Components gallery. Replace the hand-written CSS Variables reference page with one generated from the compiled core.css at build time: one live swatch per colour token, grouped by palette and role, with a theme and mode switch; keep the non-colour variables in generated tables. Run the order check, the examples check and pnpm test, build the site and screenshot every chapter. When the Done-when holds, commit and push without asking.
```

## Session 17 — Phase 17 review (ultracode)

```
ultracode. Work in /devcontainer/repos/cp-theming on branch feature/port-spike-findings. Read PORT-PLAN.md Phase 17 and the ten Learn chapters in demos/docs. Run a workflow: one Opus reader (high effort) per chapter, given only that chapter's text and examples and the "Introduces" lines of the chapters before it, told it knows CSS and has never seen cp-theming, asked to list every term, variable, mixin or attribute the chapter uses before teaching it, every sentence it had to read twice, every claim the live example does not actually show, and every place code appears before the idea it belongs to. Then one Opus synthesizer merges the lists into fixes. Apply the fixes, rebuild, re-run the order and examples checks, then commit and push without asking, and tell me the three weakest chapters after the fixes.
```

## Session 18 — Phase 18 a theme as a package

```
Work in /devcontainer/repos/cp-theming on branch main. Read CLAUDE.md, .github/copilot-instructions.md, PORT-PLAN.md Phase 18, the three packages' package.json files and chapters 1, 3 and 10 of the Learn track. Build the two example packages exactly as the phase lists them: @acme/theme in demos/demo-brand-core (Sass entry exporting $theme and define(), compiled CSS entry, exports, files, peer on cp-theming-core, pack:check, README with both consumption paths) and @acme/theme-material in demos/demo-brand-material; wire demo-core to consume the CSS path and the docs app the Sass path so the theme switcher offers acme; write Learn chapter 11 "Ship your theme as a package" in the same shape as the others, its live example showing both consumption paths; add the Theme packages guide to the core Guides page. Run pnpm build at the root, pnpm test, the order and examples checks, pnpm pack --dry-run in both packages, and render.ts; screenshot chapter 11 and the showcase under acme. When the Done-when holds, update the README and PLAN.md status tables, commit and push without asking, and tell me how to view chapter 11.
```
