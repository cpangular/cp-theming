# @cpangular/cp-theming-ng-material

The Angular Material adapter for [`@cpangular/cp-theming-core`](../theme-core/README.md). It maps a
cp-theming theme onto the tokens Angular Material 22 (M3) reads, so Material components take the
theme's colours, shape, type, motion and density, follow `themeMode`, and can be recoloured with the
`palette` attribute.

```scss
@use "@cpangular/cp-theming-core/scss/theme" as t;
@use "@cpangular/cp-theming-core/scss/presets/themes" as presets;
@use "@cpangular/cp-theming-ng-material/scss/material" as mat;

@include t.define-core-theme();
@include t.define-theme("azure-blue", presets.$azure-blue, $default: true);

@include mat.define-ng-material-core-theme();
@include mat.apply-material-overrides(); // optional component patches
@include mat.apply-material-density-scopes(); // optional [themeDensity] scopes
```

Load order: core, then themes, then the adapter. Without Sass, import
`@cpangular/cp-theming-ng-material/css/material-core` and `…/css/material-overrides` after core's
and a preset's CSS.

## What it declares

| Mixin | What | Where |
| --- | --- | --- |
| `define-ng-material-core-theme()` | Every `--mat-sys-*` token Material reads: the colour roles (from Material's own role tables), state layers, shape, elevation, motion, typography | `:root, :where([theme])` |
| | The roles Material derives from `primary`, for each accent palette | `[palette="name"]` |
| | The component tokens for an accent as text and as a line (below) | `:where(:root, [theme])`; the primary ones again on `[palette="name"]` |
| `apply-material-overrides()` | Component patches, each with its measured reason in the source: the slide toggle's selected icon, the container of the filled card and of the filled field, the text Material leaves to inherit, the grid tile scrim | the component |
| `apply-material-density-scopes()` | Material's size tokens per density step | `[themeDensity="-N"]` |
| `material-palette($name)` | What a `[palette]` scope declares, for a selector of your own | where you include it |
| `adaptor()` | Hooks for `t.define-theme($adaptor: mat.adaptor())`: the `[palette]` rule of a custom palette name | `[palette="name"]` |

## Material's colour roles in cp-theming

`define-ng-material-core-theme()` points each Material role below at the cp-theming variable beside
it, so the two are one colour. Style a panel of your own with the cp-theming variable and it matches
the Material component next to it.

| Material role | cp-theming variable | |
| --- | --- | --- |
| `--mat-sys-primary` | `--color--primary` |  |
| `--mat-sys-on-primary` | `--color--primary--contrast` |  |
| `--mat-sys-primary-container` | `--color--primary--bg` | In dark mode `--color--primary--bg--light`, one shade step lighter, so it shows on a dark surface. |
| `--mat-sys-on-primary-container` | `--color--primary--bg--contrast` | In dark mode the contrast of that step. |
| `--mat-sys-surface` | `--color--surface` |  |
| `--mat-sys-on-surface` | `--color--surface--contrast` |  |
| `--mat-sys-surface-container-lowest` | `--color--surface--container-lowest` |  |
| `--mat-sys-surface-container-low` | `--color--surface--container-low` |  |
| `--mat-sys-surface-container` | `--color--surface--container` |  |
| `--mat-sys-surface-container-high` | `--color--surface--container-high` |  |
| `--mat-sys-surface-container-highest` | `--color--surface--container-highest` |  |
| `--mat-sys-background` | `--color--background` |  |
| `--mat-sys-on-background` | `--color--background--contrast` |  |
| `--mat-sys-outline` | `--color--surface--stroke` | Pass the surface a `$stroke` to set every Material outline. |
| `--mat-sys-outline-variant` | `--color--surface--stroke--low` | Dividers. |
| `--mat-sys-scrim` | `--overlay--scrim` |  |
| `--mat-sys-shadow` | `--overlay--shadow` |  |

`secondary`, `tertiary` and `error` have the same four roles as `primary`, from the palette of the
same name. The five `--color--surface--container-*` are Material 3's surface containers, which core
derives from the surface at M3's distances (core's Palette page, "Surface containers").

Every other colour role (`surface-dim`, `surface-bright`, `surface-variant`, `on-surface-variant`,
the `inverse-*` and `*-fixed` roles) has no cp-theming variable of its own: the adapter derives it
from the theme's colours at the tone Material's own tables give it. Read the `--mat-sys-*` role.

## Accents as text and as lines

Angular Material paints some labels and some lines in `primary` or in `error`. A cp-theming accent
is the colour its author wrote, which is right for a fill and often too light for text. So the
adapter points those tokens at two roles of the palette:

- a **label** reads the text role, `--color--{name}--text`: the colour, no lighter than 0.40 in
  light mode and no darker than 0.82 in dark. 4.5:1 or more on the surfaces Material puts a label
  on, in every preset;
- a **line** reads the stroke role, `--color--{name}--stroke`: the colour itself wherever a line in
  it shows on the page (3:1, WCAG 1.4.11), moved only where it would not.

Your own coloured text can read the same variable, so a link and a button label are one colour.
A fill (a filled button, a checkbox, a slider) is `--color--{name}`, exactly.

| What | Tokens | Reads |
| --- | --- | --- |
| Labels in primary | `--mat-button-text-label-text-color`, `--mat-button-outlined-label-text-color`, `--mat-button-protected-label-text-color`, `--mat-form-field-filled-focus-label-text-color`, `--mat-form-field-outlined-focus-label-text-color` | `--color--primary--text` |
| Lines in primary | `--mat-form-field-filled-caret-color`, `--mat-form-field-filled-focus-active-indicator-color`, `--mat-form-field-outlined-caret-color`, `--mat-form-field-outlined-focus-outline-color`, `--mat-form-field-focus-select-arrow-color`, `--mat-select-focused-arrow-color` | `--color--primary--stroke` |
| Labels in error | `--mat-stepper-header-error-state-label-text-color`, `--mat-stepper-header-error-state-icon-foreground-color`, `--mat-form-field-error-text-color`, `--mat-form-field-error-trailing-icon-color`, `--mat-form-field-error-focus-trailing-icon-color`, `--mat-form-field-filled-error-label-text-color`, `--mat-form-field-filled-error-focus-label-text-color`, `--mat-form-field-outlined-error-label-text-color`, `--mat-form-field-outlined-error-focus-label-text-color` | `--color--error--text` |
| Lines in error | `--mat-form-field-filled-error-caret-color`, `--mat-form-field-filled-error-active-indicator-color`, `--mat-form-field-filled-error-focus-active-indicator-color`, `--mat-form-field-outlined-error-caret-color`, `--mat-form-field-outlined-error-outline-color`, `--mat-form-field-outlined-error-focus-outline-color`, `--mat-select-invalid-arrow-color` | `--color--error--stroke` |

**Where they are declared.** On `:root` and every `[theme]` element, at no specificity; the primary
ones again on every `[palette="name"]` scope, with that palette's roles. Not on the component. They
inherit like any custom property, so the nearest declaration wins:

```scss
// A header in the brand colour: its buttons take the header's text colour.
.app-header {
  --mat-button-text-label-text-color: var(--color--brand--contrast);
  --mat-button-outlined-label-text-color: var(--color--brand--contrast);
}
```

Angular Material's `mat.button-overrides()` on the same selector does the same. A rule of yours on
`html` or `:root` wins too, in any load order.

A `[theme]` or `[palette]` element between your wrapper and the component declares the tokens
again, as it does every `--mat-sys-*` colour: set them on that element or inside it. A `[palette]`
scope leaves the error tokens alone. The tokens read the cp-theming roles, not `--mat-sys-primary`:
to change a colour for both, set the palette (or pass `$text` / `$stroke` to `t.palette()`).

## Checks

`pnpm --filter @cpangular/cp-theming-ng-material test` compiles the adapter against core and the
installed Angular Material: every `--mat-sys-*` name Material's components read is declared, every
component token the adapter sets is one Material reads, and the accent tokens are on the selectors
above. In a browser, on the built docs site: `node demos/docs/test/render.ts` (the painted contrast
of every label and of every field's outline, indicator and arrow in the component gallery) and
`node demos/docs/test/material-tokens.ts` (a token set on a wrapper reaches the components inside
it).
