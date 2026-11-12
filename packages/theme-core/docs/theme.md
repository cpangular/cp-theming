# Theme definition

A theme is a compiled SCSS configuration object that bundles palette colors, weights, typography, density, shape, focus, motion, and elevation settings. At build time, `t.define-theme()` compiles this into a CSS rule block scoped to a `[theme="name"]` attribute selector.

## `t.theme(…)`

Assembles all sub-configs into a theme object. Every parameter is optional: pass `$brand`, some palettes, or both, and core generates the palettes you leave out.

```scss
$my-theme: t.theme(
  $palettes:   (),              // named palette map — pass what you have
  $brand:      null,            // the brand colour, kept exactly as written
  $weights:    null,            // t.weights() or t.light-dark(t.weights(), t.weights())
  $overlay:    null,            // t.overlays() or t.light-dark(...)
  $typography: null,            // t.typography()
  $density:    null,            // t.density()
  $shape:      null,            // t.shape()
  $focus:      null,            // t.focus()
  $motion:     null,            // t.motion()
  $elevation:  null,            // t.elevation() or t.light-dark(...)
);
```

### `$palettes`

A map of palette name → palette config. Colours follow the chain **brand → primary → secondary, tertiary → background, surface**: a palette the theme leaves out is generated from the nearest one it passed, and `error`, `warn`, `caution` and `pass` have fixed defaults. [palettes.md](palettes.md#brand-accents-and-neutrals-pass-what-you-have) has the numbers and what a nested theme inherits. Values can be:

- A single `t.palette(…)` call (same in light and dark)
- A `t.light-dark(t.palette(…), t.palette(…))` pair
- A `t.palette-from-brand()` / `t.background-from-brand()` / `t.surface-from-brand()` call

```scss
$palettes: (
  background: t.background-from-brand(),
  surface:    t.surface-from-brand(),
  primary:    t.palette-from-brand(),
  secondary:  t.light-dark(
    t.palette(oklch(0.46 0.27 264)),
    t.palette(oklch(0.71 0.21 264)),
  ),
  error: t.light-dark(
    t.palette(oklch(0.52 0.22 27)),
    t.palette(oklch(0.70 0.20 27)),
  ),
)
```

### `$brand` — optional

The brand colour, in any CSS colour format, exactly as the guidelines give it. It becomes the `brand` palette (`--color--brand`, `palette="brand"`) and is never adjusted; passing `brand: t.palette(…)` in `$palettes` is the same thing, and passing both is an error. A `primary`, `background` and `surface` the theme leaves out are generated from it, and `t.palette-from-brand()`, `t.background-from-brand()` and `t.surface-from-brand()` read it. To change the brand at runtime set the registered pair, `--color--brand--mode-light` and `--color--brand--mode-dark`: everything generated from it follows. (`--color--brand` itself is the join of that pair; the three helpers read it, the generated palettes read the pair.)

```scss
$brand: oklch(0.44 0.22 253)
```

---

## Sub-config functions

### `t.weights(…)`

Controls blend percentages for text and interactive state overlays.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `$text-blend` | `82%` | Normal body text opacity on containers |
| `$text-emphasis-blend` | `96%` | Emphasized text opacity |
| `$text-deemphasis-blend` | `55%` | De-emphasized / caption text opacity |
| `$text-primary-tint` | `0%` | Hue tinting toward the primary palette |
| `$state-hover` | `8%` | Hover overlay opacity |
| `$state-press` | `12%` | Press/active overlay opacity |
| `$state-focus` | `12%` | Focus state overlay opacity |
| `$state-drag` | `16%` | Drag state overlay opacity |
| `$tints` | `(10%, 20%, 38%, 60%, 80%)` | Transparent tint levels 1–5 |

```scss
$weights: t.light-dark(
  t.weights($text-blend: 82%, $text-primary-tint: 10%),
  t.weights($text-blend: 78%, $text-primary-tint: 12%),
)
```

All parameters are optional. Omitted values use the defaults listed above. Wrap in `t.light-dark()` to provide different values per mode; if mode variation is not needed, pass a single `t.weights()` call directly.

---

### `t.overlays($scrim?, $shadow?)`

Sets global overlay colors.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `$scrim` | `oklch(0 0 0 / 50%)` | Modal/dialog backdrop color |
| `$shadow` | `oklch(0.2 0.02 0 / 25%)` | Box shadow base color (light) |

```scss
$overlay: t.light-dark(
  t.overlays($scrim: oklch(0 0 0 / 50%),  $shadow: oklch(0.2 0.02 0 / 25%)),
  t.overlays($scrim: oklch(0 0 0 / 65%),  $shadow: oklch(0 0 0 / 50%)),
)
```

---

### `t.typography(…)`

| Parameter | Default | Description |
|-----------|---------|-------------|
| `$plain-family` | `system-ui` | Font family for body text |
| `$brand-family` | `null` | Font family for display/brand text. Falls back to `$plain-family`. |
| `$bold-weight` | `700` | Font weight for bold text |
| `$medium-weight` | `500` | Font weight for medium text |
| `$regular-weight` | `400` | Font weight for regular text |
| `$scale-overrides` | `null` | Map of type scale overrides |

```scss
$typography: t.typography($plain-family: 'Roboto, system-ui')
```

---

### `t.density($scale?)`

| Parameter | Default | Description |
|-----------|---------|-------------|
| `$scale` | `0` | Density scale integer. `0` = default, `-1` to `-5` = progressively more compact. Positive values expand spacing. |

```scss
$density: t.density($scale: 0)
```

Density is **not** light/dark varying. The `[themeDensity="N"]` HTML attribute overrides density in a subtree at any level in the DOM, independent of the theme.

Emits `--space--*` tokens. See [css-variables.md](css-variables.md#spacing).

---

### `t.shape(…)`

M3 corner radius scale. Static — not light/dark varying, not density-affected.

| Parameter | Default |
|-----------|---------|
| `$xxs` | `2px` |
| `$xs` | `4px` |
| `$sm` | `8px` |
| `$md` | `12px` |
| `$lg` | `16px` |
| `$xl` | `28px` |
| `$xxl` | `48px` |
| `$full` | `9999px` |

```scss
$shape: t.shape($md: 10px, $lg: 20px)
```

---

### `t.focus($width?, $offset?, $style?)`

| Parameter | Default | Description |
|-----------|---------|-------------|
| `$width` | `3px` | Focus ring stroke width |
| `$offset` | `2px` | Offset from the element edge |
| `$style` | `solid` | Border style |

```scss
$focus: t.focus($width: 3px, $offset: 2px)
```

---

### `t.motion(…)`

M3 animation defaults. Static — not light/dark varying.

| Parameter | Default |
|-----------|---------|
| `$duration-short` | `100ms` |
| `$duration-medium` | `200ms` |
| `$duration-long` | `300ms` |
| `$duration-extra` | `500ms` |
| `$easing-standard` | `cubic-bezier(0.2, 0, 0, 1)` |
| `$easing-emphasized` | `cubic-bezier(0.2, 0, 0, 1)` |
| `$easing-decelerate` | `cubic-bezier(0, 0, 0, 1)` |
| `$easing-accelerate` | `cubic-bezier(0.3, 0, 1, 1)` |

---

### `t.elevation($shadow-color?, $levels?)`

Controls box shadow levels (0–5). The shadow color defaults to `oklch(0.2 0.02 0 / 25%)` for light mode and `oklch(0 0 0 / 50%)` for dark mode — theme() applies these defaults automatically unless you override them.

```scss
$elevation: t.light-dark(
  t.elevation(),
  t.elevation($shadow-color: oklch(0 0 0 / 60%)),
)
```

A level's light and dark shadow may differ in their colours only: `light-dark()` switches a colour, not an offset or a blur, so each shadow is emitted as `<geometry> light-dark(<light colour>, <dark colour>)`. A `$levels` shadow passed for one mode with its own geometry applies to both modes; different geometries for the two modes are a compile error.

---

## `@include t.define-theme($name, $theme, $default?, $dedupe?)`

Emits all CSS custom property declarations for a theme.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `$name` | — | Theme name. Applied via `[theme="name"]` attribute in HTML. |
| `$theme` | — | Theme object from `t.theme()`. |
| `$default` | `false` | Also apply on `:where(:root)` so the theme is active without a `theme` attribute. Zero specificity: any `theme` attribute and any author `:root` rule beat it, so several default themes can be loaded at once. |
| `$dedupe` | `true` | Accepted for compatibility; nothing is left to dedupe. |

The rule holds **only what the author passed** to `t.theme()`: for each palette the light and dark colour of the colour role and of any explicit `$bg` / `$stroke` / `$focus` (`--color--{name}[--role]--mode-light` / `--mode-dark`, each followed by its joined token; `$brand` is the `brand` palette), for each palette of the chain the theme left out that follows from one it passed, the pair pointed at the colour core generates (`var(--theme--_generated--{name}--{mode})`, see [palettes.md](palettes.md#how-it-works)), the passed keys of each sub-config, and the light and dark values of the mode-varying percentages (`--weight--*--mode-light` / `--mode-dark`, `--elevation-N--tint--mode-light` / `--mode-dark`). `background` and `surface` always carry their bg pair, which is their base (even under a `$color` override): core only joins it. Everything else — every derivation, every default, the mode rules — is declared once by `define-core-theme()`. A theme nested inside another therefore inherits whatever it did not pass and nothing upstream of it generates (a nested theme that passes only `primary` gets its own secondary and tertiary; see [palettes.md](palettes.md#nested-themes)), including an outer `background` / `surface` base as those palettes' bg role, and does not inherit the outer theme's explicit `$bg` / `$stroke` / `$focus` on any other palette (core re-derives those on every `[theme]` element). A `$default` theme that uses a custom palette name also derives that name inside its own rule, ahead of its explicit roles (see [custom palette names](#core-palette-initial-values)).

```scss
@include t.define-theme('ocean', $ocean-theme, $default: true);
```

---

## Mode system

The active color scheme is driven by a combination of `color-scheme` and `[themeMode]` HTML attributes.

| `[themeMode]` value | Behavior |
|--------------------|---------|
| _(absent)_ | Auto — follows `prefers-color-scheme` |
| `light` | Force light mode |
| `dark` | Force dark mode |
| `auto` | Explicitly auto — follows `prefers-color-scheme` |
| `invert` | Inverts the parent mode (light→dark, dark→light) |

Attributes can be placed on `<html>`, `<body>`, or any element. They cascade downward, so you can force dark mode on the page but have a specific panel in light mode.

```html
<html themeMode="dark">          <!-- Force dark for entire page -->
  <body theme="ocean">
    <aside themeMode="light">    <!-- Force this panel to light mode -->
      ...
    </aside>
    <section themeMode="invert"> <!-- This panel flips to light (dark→invert = light) -->
      ...
    </section>
  </body>
</html>
```

---

## `@include t.define-core-theme()`

Emits everything that is theme-independent and shared across all themes. Call once in your root stylesheet.

**What it emits, once:**

- **`@property` registrations** for the typed custom properties (see below)
- **`:where(:root)`** — `color-scheme: light dark`, the mode flag, the contrast step (a private variable every `--contrast` reads), every pair of the palette chain pointed at its generated colour (so the root generates the whole chain), and the default of every unregistered group (weight and elevation-tint pairs, overlay, elevation shadows, typography, focus geometry, motion). The palette fallback lives in the registered colours' `initial-value`s: a grey brand, from which the root generates grey accents and neutrals, and the semantic palettes' default colours.
- **The `themeMode` rules** for `light`, `dark`, `auto` and `invert`, each wrapped in `:where()`, setting `color-scheme` and a private 0/1 mode flag. They match the `[themeMode]` element itself, so a mode works on any element.
- **`:where(:root, [theme])`** — the generated colour of each palette of the chain, as a private variable (primary from the brand; secondary and tertiary from primary; background and surface from the brand), which the root and each theme rule take by reference for the palettes a theme left out, and every derivation for the ten core palette names (the auto `--bg`, `--stroke` and `--focus` roles, derived into their registered pairs from the colour pair and then joined; the 7-step ladders, contrasts, mode-relative aliases and tints) and the typography role fonts.
- **`:where(:root, [theme], [themeMode])`** — every mode-varying percentage (weights, elevation tints) picked arithmetically from its light and dark value and the mode flag. CSS `light-dark()` is never used for a percentage.
- **`[palette="name"]`** selection rules for the core names, and the **`[container]`, `[filled]`, `[outlined]`, `[tone="…"]`, `[elevated="N"]`** attribute rules
- **`[themeDensity="N"]`** density scope selectors (−5 to +5)

Rules that only declare custom properties have zero specificity (`:where()`). A named theme's rule is `:where([theme="name"]):not(cp-theming-none)` — specificity (0,0,1), from the `:not()` of a type selector no element has — so it beats every default in any load order and still loses to an author's own `:root { --color--primary: … }` wherever that is placed, including on the element that carries the `theme` attribute (a plain `[theme="name"]` would tie with `:root` there and win on source order). Per-element attribute scopes (`[palette]`, `[themeDensity]`) and the apply layers keep attribute specificity so they beat a theme rule on the same element. An author's `:root` rule cannot beat a theme set on a *descendant* element: the descendant's own declaration always wins over an inherited value.

Load order is **core, then themes, then an adapter**. Call it before any `define-theme()` in the same stylesheet:

```scss
@include t.define-core-theme();
@include t.define-theme('ocean', $ocean-theme, $default: true);
@include t.define-theme('ember', $ember-theme);
```

### Pre-built option

`define-core-theme()` is completely theme-independent and ships as a pre-built file, `css/core`. Load it as a plain CSS file before your theme CSS:

```html
<link rel="stylesheet" href="node_modules/@cpangular/cp-theming-core/dist/core.css">
<link rel="stylesheet" href="my-theme.css">
```

Or via CSS import:
```css
@import "@cpangular/cp-theming-core/css/core";
@import "my-theme.css";
```

The pre-built `dist/core.css` is identical to calling `@include t.define-core-theme()` inline — choose whichever fits your build pipeline.

---

## `@property` registrations and animation

`define-core-theme()` registers **what animation needs, and nothing derived**:

| Group | Count | Type | Why registration is needed |
|-------|-------|------|---------------------------|
| `--color--{name}--mode-light` / `--mode-dark`, and the same for `--bg`, `--stroke`, `--focus` | 4 roles × 2 modes × 10 core palettes = 80 | `<color>` | The light and dark colour of each role, `brand` and `tertiary` included. These are what a theme switch transitions. Core derives the auto `--bg`, `--stroke` and `--focus` into these pairs, and generates the colour pair of a palette the theme did not pass into them, so a switch between an auto or generated colour and an explicit one crossfades too |
| `--weight--*` | 13 | `<percentage>` | Used as `color-mix()` blend amount — browser can't interpolate without a type |
| `--density-scale` | 1 | `<number>` | Drives `calc()` in space tokens |
| `--space--*` | 7 | `<length>` | Density/spacing transitions |
| `--shape--*` | 8 | `<length>` | Radius transitions |
| **Total** | **109** | | |

Not registered: the role tokens themselves (`--color--{name}`, `--bg`, `--stroke`, `--focus`), every derivative (`--contrast`, `--dark`, `--high`, `--tint-*`, …), the `--palette-color*` scope vars and the `--container--*` surface vars. A role token is declared as `light-dark(var(--…--mode-light), var(--…--mode-dark))` and a derivative as `oklch(from var(--…) …)`, so they resolve **where they are used**, against the `color-scheme` of that element. That is what makes `themeMode` work on a plain element, inside a `[palette]` scope and inside a nested theme. A derivative that embeds a mode-varying weight — the tints, and the `[filled]` layer's `--container--text-deemphasis` — reads that weight's `--mode-light` / `--mode-dark` pair inside `light-dark()` for the same reason: a percentage substituted at the declaring element would not follow a nested `themeMode`.

### Crossfading a theme switch

A theme switch crossfades when the author transitions the registered light and dark colours on the element whose `theme` attribute changes. The library itself emits no transition. Transition every pair the switch may change: the colour pair of each palette the two themes differ in, and the `--bg`, `--stroke` and `--focus` pairs of a palette when either theme passes those roles explicitly. Core derives the auto values into the same pairs, so an auto role follows its colour pair's transition on its own, and a switch between an auto and an explicit role interpolates between two real colours:

```css
html {
  transition-property:
    --color--primary--mode-light, --color--primary--mode-dark,
    --color--primary--bg--mode-light, --color--primary--bg--mode-dark,
    --color--primary--stroke--mode-light, --color--primary--stroke--mode-dark,
    --color--primary--focus--mode-light, --color--primary--focus--mode-dark,
    --color--secondary--mode-light, --color--secondary--mode-dark,
    --color--background--mode-light, --color--background--mode-dark,
    --color--surface--mode-light, --color--surface--mode-dark;
  /* …and the same for brand, tertiary, error, warn, caution and pass if the themes differ there */
  transition-duration: 400ms;
}
```

A generated palette is an expression of the pair it comes from, so it follows that pair's transition without being listed: a tertiary generated in both themes is mid-way whenever primary is. List its own pair when one of the two themes passes it and the other leaves it to core.

Every derivative follows: the ladder steps, the contrasts, nested themes and dark subtrees are all mid-way at half time, because each is an expression of the registered pairs. Chromium interpolates the pair in Oklab, Firefox in sRGB.

Consequences:

- A light/dark flip is **instant at the variable level**, and so is a `palette` attribute change. Elements that transition `background-color` or `color` still fade. Making the variables themselves fade on a mode flip is exactly what would stop `themeMode` working on plain elements.
- `getPropertyValue('--color--primary')` returns an expression (`light-dark(…)`), not a resolved colour. Read a painted property (`color`, `background-color`) to get a colour.
- Plain `color-scheme` on an element flips colours but not weights; weights follow `themeMode`.
- A hand-written rule that sets `--color--primary` directly (for example `[theme="x"] { --color--primary: red }`) re-derives the ladder, the contrasts and the tints, but not the auto `--bg`, `--stroke` and `--focus`, which derive from the registered pair, and it does not crossfade. Set the pair instead — `[theme="x"] { --color--primary--mode-light: …; --color--primary--mode-dark: … }` — to re-derive every role and keep the crossfade.
- A weight override goes on the pair too: `--weight--tint-N--mode-light` / `--mode-dark` for the tints, `--weight--text-deemphasis-blend--mode-light` / `--mode-dark` for the `[filled]` de-emphasis text. The picked `--weight--*` token is what components read for their own `color-mix()`.
- Removing a nested element's `theme` attribute switches it instantly to the inherited theme (nothing re-joins the pairs on an element that matches no `[theme]`). Set the attribute to the parent's name or to `""` to crossfade.

### Core palette initial values

A registered colour's `initial-value` is what the pair holds when nothing declares it. On the root core always generates primary, the accents and the neutrals from the brand pair, so with no theme loaded the grey brand below makes all of them grey: primary, secondary and tertiary `oklch(0.35 0 0)` (`oklch(0.65 0 0)` in dark mode), background `oklch(0.97 0 0)` / `oklch(0.17 0 0)`, surface `oklch(0.93 0 0)` / `oklch(0.22 0 0)`. A legible black-on-white fallback for print, and a readable page under a dark OS scheme. The semantic palettes are the exception: their initial value is their default colour, one per mode.

| Palette | colour role (light / dark) | bg | stroke | focus |
|---------|----------------------------|----|--------|-------|
| `background` | `oklch(0.97 0 0)` | `oklch(0.97 0 0)` | `oklch(0.65 0 0)` | `oklch(0.20 0 0)` |
| `surface` | `oklch(0.93 0 0)` | `oklch(0.93 0 0)` | `oklch(0.60 0 0)` | `oklch(0.20 0 0)` |
| `brand` | `oklch(0.20 0 0)` | `oklch(0.92 0 0)` | `oklch(0.20 0 0)` | `oklch(0.50 0 0)` |
| `primary` | `oklch(0.20 0 0)` | `oklch(0.92 0 0)` | `oklch(0.20 0 0)` | `oklch(0.50 0 0)` |
| `secondary` | `oklch(0.40 0 0)` | `oklch(0.92 0 0)` | `oklch(0.40 0 0)` | `oklch(0.65 0 0)` |
| `tertiary` | `oklch(0.45 0 0)` | `oklch(0.92 0 0)` | `oklch(0.45 0 0)` | `oklch(0.68 0 0)` |
| `error` | `oklch(0.52 0.22 27)` / `oklch(0.70 0.20 27)` | `oklch(0.92 0 0)` | `oklch(0.15 0 0)` | `oklch(0.45 0 0)` |
| `warn` | `oklch(0.55 0.18 55)` / `oklch(0.76 0.16 55)` | `oklch(0.92 0 0)` | `oklch(0.30 0 0)` | `oklch(0.55 0 0)` |
| `caution` | `oklch(0.55 0.16 103)` / `oklch(0.82 0.15 103)` | `oklch(0.92 0 0)` | `oklch(0.50 0 0)` | `oklch(0.68 0 0)` |
| `pass` | `oklch(0.48 0.18 145)` / `oklch(0.72 0.16 145)` | `oklch(0.92 0 0)` | `oklch(0.35 0 0)` | `oklch(0.60 0 0)` |

Only the colour roles of `brand` and of the semantic palettes are ever seen: every other value in the table is replaced on the root, by the generated pair or by the bg, stroke and focus core derives from the colour role.

A custom palette name (any name beyond the 10 above) gets its eight registrations, its derivations on `:where([theme])` and its `[palette="name"]` rule once per compiled stylesheet, at root level, from the first `define-theme()` that uses it, with `initial-value: transparent` (focus: `oklch(0.3 0 0)`). The derivations do not match `:root`: a second, separately compiled stylesheet that uses the same name repeats them later in the cascade, and on `:root` that copy would beat a default theme's explicit `$bg` / `$stroke` / `$focus`. A `$default` theme therefore derives its custom names inside its own rule, ahead of its explicit roles.

### `initial-value` constraint

`initial-value` must be **computationally independent** — no `var()`, no `em`, no `calc()` referencing other custom properties. This is a hard spec requirement. Consequently:

- All token initial values are literal px/% values matching the defaults
- Palette initial values are literal `oklch(…)` colors (not relative color expressions)
- `transparent` is the safe fallback for scope/surface vars that have no meaningful default outside a theme context
