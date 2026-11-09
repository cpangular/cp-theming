# Session prompts and settings for PORT-PLAN.md

One session per row. Open a new chat in `/devcontainer/repos/cp-theming`, set the three controls at
the bottom of the prompt box, paste the prompt. Each session ends with a commit at the phase's
"Done when", so a bad session reverts as a unit.

**Standing rule for every session: when the Done-when holds, commit and push to
`feature/port-spike-findings` without asking.** A session that ends with uncommitted or unpushed work
is not done. The only things a session never does on its own are merging into `main`, merging a
release PR, and running `gitflow version`.

**Before session 2:** answer the questions at the end of [PORT-PLAN.md](PORT-PLAN.md). Session 1 needs
no answers. Sessions 2–3 need Q1, session 4 needs Q2, session 5 needs Q3, session 8 needs Q5. Each
prompt has a line for the answer; replace the text in angle brackets before pasting.

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
| 2 | Phase 9 cascade | Fable 5.1 | high | Auto |
| 3 | Phase 9 verification (ultracode) | Fable 5.1 | high | Auto |
| 4 | Phase 10 contrast and alpha | Fable 5.1 | medium | Auto |
| 5 | Phase 11 Material adapter | Fable 5.1 | high | Auto |
| 6 | Phase 12 startup | Fable 5.1 | medium | Auto |
| 7 | Phase 7 resumed: docs examples | Fable 5.1 | high | Auto |
| 8 | Phase 13 release | Fable 5.1 | medium | Auto |

Subagent models are chosen inside the workflow prompts: Opus at high effort for critique, Sonnet at
medium for reading and sweeps. You do not set these.

Every prompt assumes the session reads CLAUDE.md and .github/copilot-instructions.md first and
respects the non-negotiable design decisions there. cp-theming's names and API are the standard; do
not copy code from `/devcontainer/repos/ng-material-theme`.

---

## Session 1 — Phase 8 harness and CI

```
Work in /devcontainer/repos/cp-theming on branch feature/port-spike-findings. Read CLAUDE.md, .github/copilot-instructions.md, PLAN.md and PORT-PLAN.md, then execute Phase 8 of PORT-PLAN.md exactly as written. Run pnpm install first. Order: (1) the node --test CSS checks in packages/theme-core/test and packages/theme-ng-material/test, compiling through the Sass JS API, with each check that today's code fails marked todo and naming the phase that fixes it; (2) the fixture themes; (3) the first vitest tests for the TypeScript API; (4) packages/theme-core/test/render.ts with Playwright, static fixture pages only, one row per case in "Behaviour today" plus the extra mode, palette and nesting cases the phase lists; rows that work today assert today's values; (5) wireit test scripts, the github.actions.build and github.actions.test script names, and git-flow's test.yml from https://github.com/cpdevtools/git-flow-template (read its README; add only what the test workflow needs, no .publish/ and no release workflows yet); (6) the housekeeping bullets. All scripts are TypeScript run by Node 24; never .mjs, .cjs or .js. Do not change any Sass behaviour in this session beyond the two if() replacements. When the Done-when holds, update the README and PLAN.md status tables, commit with the render.ts output in the message, and push without asking. Then tell me whether the test workflow is green and fix anything red.
```

## Session 2 — Phase 9 cascade

```
Work in /devcontainer/repos/cp-theming on branch feature/port-spike-findings. Read CLAUDE.md, .github/copilot-instructions.md, PLAN.md and PORT-PLAN.md. My answer to Q1 is: <a, b or c>. If the answer is (a) or (b), execute Phase 9 as written. If it is (c), stop and tell me how the phase changes before touching code. Work in this order and run pnpm test and render.ts after each step: unregister the colour tokens and move the greyscale fallback to :where(:root) defaults; make the sub-config builders and t.theme() return only passed keys; move every derivation, the mode rules and the percentage pick into t.define-core-theme(); reduce t.define-theme() to one rule of what the author passed, with custom palette names and adaptor hooks emitted once at root level; fix the load-order comments; delete the workaround block in demos/docs/src/styles.scss and switch demo-core to t.define-core-theme(); write harness check 5 and remove the Phase 9 todos; correct the PLAN.md and packages/theme-core/docs text the phase names. Public Sass API and every variable name stay as they are. Build the docs app and screenshot the four themes in light and dark with Playwright. When the Done-when holds, update the README and PLAN.md status tables, commit with each preset's size before and after in the message, and push without asking. Then tell me what to open in Safari to confirm the browser baseline.
```

## Session 3 — Phase 9 verification (ultracode)

```
ultracode. Work in /devcontainer/repos/cp-theming on branch feature/port-spike-findings. Read PORT-PLAN.md Phase 9 and the Phase 9 diff (git log to find the Phase 8 commit, then git diff <that commit>..HEAD -- packages demos). Run a workflow with Opus critics at high effort, one per claim, each trying to refute the claim against the compiled CSS in a real browser (Playwright, Chromium and Firefox): (1) themeMode light, dark, auto and invert on an element with no theme attribute flips colours and weights for its subtree, including inside a [palette] scope and inside a nested theme; (2) a nested theme that sets only primary inherits every other value from the theme around it and does not inherit that theme's explicit $bg, $stroke or $focus; (3) with all four presets loaded in any order after core.css, <html theme="azure-blue"> shows azure-blue, and a user :root rule placed before the library wins; (4) a custom palette name, the *-from-brand helpers and a theme defined with $adaptor: mat.adaptor() still produce every variable they produced before the change; (5) mode combinations that worked before Phase 9 give the same computed values now. Report only confirmed defects with a reproduction, add a render.ts row for each, fix them, then commit and push without asking.
```

## Session 4 — Phase 10 contrast and alpha

```
Work in /devcontainer/repos/cp-theming on branch feature/port-spike-findings. Read CLAUDE.md, .github/copilot-instructions.md and PORT-PLAN.md. My answers to Q2 are: linear sRGB inside the step: <yes or no>; warn and caution text: <accept white, or raise their light-mode lightness>. If the first answer is no, stop and tell me what the oklch-only formula costs before touching code. Otherwise execute Phase 10 as written: the clamped luminance step in _role-derivatives kept as an oklch value, the comment replaced, alpha pinned to 1 everywhere except the tints, and the formula corrected in the two docs pages. Remove the Phase 10 todos from the contrast sweep and add the render.ts comparison of browser-computed --contrast against the sweep's prediction. Run pnpm test and render.ts. When the Done-when holds, update the README and PLAN.md status tables, commit with the sweep summary line and the list of preset colours whose text changed in the message, and push without asking.
```

## Session 5 — Phase 11 Material adapter

```
Work in /devcontainer/repos/cp-theming on branch feature/port-spike-findings. Read CLAUDE.md, .github/copilot-instructions.md and PORT-PLAN.md. My answer to Q3 is: <a or b>. Execute Phase 11 as written. First read @angular/material/core/tokens/m3/_md-sys-color.scss and md-sys-color-internal in node_modules so the palette map you pass has the shape the functions expect. Then: scss/_m3-tone.scss with m3-tone(); the table-driven colour tokens with the directly mapped roles written out; --mat-sys-neutral10 and --mat-sys-neutral-variant20; material-palette() generated from the same tables; core palette remaps emitted by the adapter's core mixin; the selector rules; typography from --text--* plus the font shorthand tokens. Write the harness checks (every --mat-sys-* name read by the installed Material component styles is declared; surface roles keep M3's lightness order in both modes) and remove the Phase 11 todos. Build the docs app, screenshot the showcase in light and dark for the four themes and a nested theme, then go through apply-material-overrides() patch by patch and delete the ones the new roles make unnecessary. Stop before committing and tell me what to look at. I will then send: "ultracode: run one Opus pass that tries to find a Material 22 component whose colours are wrong or unreadable in the showcase screenshots or whose --mat-sys-* reads are undeclared, fix what it confirms, update the README and PLAN.md status tables, then commit and push."
```

## Session 6 — Phase 12 startup

```
Work in /devcontainer/repos/cp-theming on branch feature/port-spike-findings. Read CLAUDE.md, .github/copilot-instructions.md and PORT-PLAN.md, then execute Phase 12 as written: make persistence in packages/theme-core/src/theme.ts lazy and guarded so importing the package with no localStorage does not throw; make provideTheme() and ThemeService skip browser-only work outside a browser; export the inline head snippet from theme-core, built from the same storage-key constants as theme.ts; document it in Getting Started with the CSP nonce note. Follow the TypeScript conventions in copilot-instructions.md (explicit element parameters, no global document assumptions). Add the vitest tests the phase lists. Verify the Done-when with a Playwright screenshot of the docs app taken before its bundle runs, with a saved dark non-default theme. When it holds, update the README and PLAN.md status tables, commit and push without asking.
```

## Session 7 — Phase 7 resumed: docs examples

```
Work in /devcontainer/repos/cp-theming on branch feature/port-spike-findings. Read CLAUDE.md, .github/copilot-instructions.md, PLAN.md phase 7 and PORT-PLAN.md "Phase 7 (resumed)". First confirm that the installed @angular/build imports files as text (with { loader: 'text' }) and tell me if it does not. Then move every Sass and attribute example in demos/docs/src/app/packages/pages into real files under demos/docs/src/examples/{page}/, import them as text, render attribute examples from the same .html, and extend the harness to compile every example with zero warnings and run the undefined-variable check on core + a preset + the example. Examples must be complete snippets; mark any fragment that cannot compile as display-only. Then do the manual correction pass the phase lists, add demos/docs/test/render.ts with the painted-contrast report over the built showcase, and rewrite PLAN.md phase 7 to describe the navigation the code has. Do not reorder pages and do not remove the custom Sass section from Getting Started. When the Done-when holds, update the README status tables, commit and push without asking, then tell me how to view the site locally and list every label render.ts reports below 4.5:1.
```

## Session 8 — Phase 13 release

```
Work in /devcontainer/repos/cp-theming on branch feature/port-spike-findings. Read CLAUDE.md, .github/copilot-instructions.md and PORT-PLAN.md Phase 13, then the READMEs of https://github.com/cpdevtools/git-flow-template and https://github.com/cpdevtools/git-flow. My answers to Q5 are: registry: <npmjs or GitHub Packages>; first version: <version>; docs hosting: <answer>; peers: <workspace:* or workspace:^>. Add only what git-flow needs, as the phase lists; keep the wireit root scripts; do not adopt the template's deps.yml, syncpack or devutil root scripts. Set up packaging for the three packages exactly as the phase describes and run gitflow pack; show me each tarball's file list and its package.json exports and peerDependencies. If docs hosting is decided, add the static-site artifact for demos/docs; otherwise leave pages.yml on manual trigger. Commit and push without asking, then tell me whether git-flow opened the draft release PR and whether the test workflow is green, and fix anything red. Do not merge into main, do not run gitflow version, and do not merge the release PR.
```
