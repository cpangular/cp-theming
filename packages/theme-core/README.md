# `@cpangular/cp-theming-core`

A CSS-variable-based theming system. Themes are defined in SCSS and compile to CSS custom properties. All color derivatives (contrast, tints, light/dark steps) are computed at **runtime by the browser** using [oklch relative color syntax](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch) — no compile-time color math.

---

## Getting Started

The package is published to GitHub Packages, which needs the scope's registry line and a token in
your `.npmrc`, even for a public package:

```ini
@cpangular:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```bash
npm install @cpangular/cp-theming-core
```

```scss
@use '@cpangular/cp-theming-core/scss/theme' as t;
@use '@cpangular/cp-theming-core/scss/presets' as presets;

// Core first (registrations, defaults, every derivation — once), then the theme
@include t.define-core-theme();
@include t.define-theme('azure-blue', presets.$azure-blue, $default: true);
```

```html
<body>
  <section palette="primary" container>Primary surface</section>
  <button palette="warn">Warning action</button>
</body>
```

That's it. Mode switching, palette scoping, contrast, tints, and focus rings all work automatically from here.

---

## Presets

Pre-built themes matching the Angular Material M3 palette system:

```scss
@use '@cpangular/cp-theming-core/scss/presets' as presets;

// Available: $azure-blue, $rose-red, $cyan-orange, $magenta-violet
@include t.define-theme('my-theme', presets.$rose-red, $default: true);
```

Or via pre-compiled CSS (no SCSS required):

```html
<link rel="stylesheet" href="node_modules/@cpangular/cp-theming-core/dist/core.css">
<link rel="stylesheet" href="node_modules/@cpangular/cp-theming-core/dist/presets/azure-blue.css">
```

---

## Defining a Custom Theme

Every theme is built with `t.theme()` and emitted with `t.define-theme()`.

```scss
@use '@cpangular/cp-theming-core/scss/theme' as t;

$my-theme: t.theme(
  $brand:   oklch(0.44 0.22 253),        // the brand colour, kept exact: the `brand` palette
  $palettes: (
    // primary, tertiary, background and surface are left out: core generates
    // them from the brand. Everything below is optional too.
    secondary:  t.light-dark(
                  t.palette(oklch(0.46 0.27 264)),
                  t.palette(oklch(0.71 0.21 264)),
                ),
    error:   t.light-dark(t.palette(oklch(0.52 0.22 27)),  t.palette(oklch(0.70 0.20 27))),
    warn:    t.light-dark(t.palette(oklch(0.55 0.18 55)),   t.palette(oklch(0.76 0.16 55))),
    caution: t.light-dark(t.palette(oklch(0.55 0.16 103)),  t.palette(oklch(0.82 0.15 103))),
    pass:    t.light-dark(t.palette(oklch(0.48 0.18 145)),  t.palette(oklch(0.72 0.16 145))),
  ),
  $weights:    t.light-dark(t.weights($text-blend: 82%), t.weights($text-blend: 78%)),
  $typography: t.typography($plain-family: system-ui),
  $density:    t.density($scale: 0),
  $shape:      t.shape(),
  $focus:      t.focus($width: 3px, $offset: 2px),
  $motion:     t.motion(),
);

// Core: @property registrations, defaults, mode rules and every derivation — once, first
@include t.define-core-theme();

// The theme: one rule, [theme="my-theme"] (plus :where(:root) for $default: true),
// holding only what was passed above
@include t.define-theme('my-theme', $my-theme, $default: true);
```

`define-core-theme()` is theme-independent — load the pre-built `dist/core.css` before your theme CSS instead of calling it if preferred. A theme declares only what its author passed, so a nested theme inherits the rest from the theme around it.

### Style the page

Core declares the variables and styles no element with them. To give `<body>` the theme's background, text colour and font family, opt in once:

```scss
@include t.define-core-theme();
@include t.define-theme('my-theme', $my-theme, $default: true);
@include t.apply-document-base();
```

Without Sass, load `dist/base.css` (`@import "@cpangular/cp-theming-core/css/base";`) after core. The rule is `:where(body)`, at zero specificity, so a `body` rule of your own wins wherever it loads. It sets `background-color`, `color` and `font-family` only. Without it the page keeps the browser's default font (apps coming from `ng-material-theme`, whose `core.css` styled the page, need this line).

### Multiple themes

```scss
@include t.define-core-theme();
@include t.define-theme('light-theme', $light-theme, $default: true);
@include t.define-theme('dark-theme', $dark-theme);
```

```html
<body>                                 <!-- light-theme (default) -->
  <div theme="dark-theme">...</div>   <!-- scoped dark theme -->
</body>
```

---

## Palettes

Palettes are the color identity of a theme. Each palette emits a family of `--color--{name}--*` CSS variables — all derivatives are computed at runtime by the browser.

### Defining palettes

```scss
// Simple — same color for light and dark mode
primary: t.palette(oklch(0.55 0.18 240)),

// Light/dark variant
primary: t.light-dark(
  t.palette(oklch(0.55 0.18 240)),   // light mode
  t.palette(oklch(0.72 0.16 240)),   // dark mode
),

// Brand-derived with your own numbers (core generates these three from
// $brand by itself when the theme leaves them out)
primary:    t.palette-from-brand($light-l-max: 0.42),
background: t.background-from-brand($c-tint: 0.012),
surface:    t.surface-from-brand($c-tint: 0.02),
```

### Pass what you have

Colours follow the chain **brand → primary → secondary, tertiary → background, surface**. A theme passes whichever it has and core generates the rest, in the browser, from the nearest one it passed:

- only `$brand` → primary (the brand, moved into the lightness that reads on the page), secondary, tertiary, background and surface are all generated; the `brand` palette stays the exact colour;
- only `primary` → secondary (same hue, a third of the chroma, 0.04 at least) and tertiary (hue + 60°, half the chroma, 0.08 at least) are generated;
- `primary` and `secondary` → tertiary is generated; pass all three and none is.

`error`, `warn`, `caution` and `pass` have fixed defaults. A nested theme generates what follows from what it passes and inherits the rest. Details: [docs/palettes.md](docs/palettes.md#brand-accents-and-neutrals-pass-what-you-have).

### Text colour on a palette

`--color--{name}--contrast` is black or white by luminance, at 4.5:1 or more. When the brand's rule is "this colour takes white", say so:

```scss
$brand: t.palette(#e65151, $contrast: prefer-white),
```

The palette's colour and its ladder steps then take white wherever white reaches 3:1 (large text and icons), black elsewhere. `prefer-black` is the mirror. Details: [docs/palettes.md](docs/palettes.md#a-palette-that-prefers-white-or-black-text).

### Custom palette roles

Override individual roles within a palette:

```scss
primary: t.palette(
  $base:   oklch(0.55 0.18 240),
  $color:  oklch(0.50 0.20 240),   // identity color (default: $base)
  $bg:     oklch(0.88 0.06 240),   // container/bg role
  $stroke: oklch(0.45 0.16 240),   // border role
  $focus:  oklch(0.40 0.22 240),   // focus ring
  $text:   oklch(0.38 0.16 240),   // the colour as text
),
```

### Core palette names

These names are registered and derived once by `define-core-theme()`: `brand`, `primary`, `secondary`, `tertiary`, `error`, `warn`, `caution`, `pass`, `surface`, `background`. Any additional name in your `$palettes` map gets its registrations, derivations (on `:where([theme])`) and `[palette]` rule once per compiled stylesheet, at root level, from the first `define-theme()` that uses it; a `$default` theme also derives the name inside its own rule.

### Emitted CSS variables (per palette)

| Variable | Description |
|---|---|
| `--color--{name}` | Identity color |
| `--color--{name}--contrast` | Black or white — whichever contrasts best |
| `--color--{name}--dark` / `--light` | Lightness step (±0.12) |
| `--color--{name}--darker` / `--lighter` | Lightness step (±0.24) |
| `--color--{name}--high` / `--low` | Mode-relative aliases (flips direction in dark mode) |
| `--color--{name}--bg` | Background/container role |
| `--color--{name}--bg--contrast` | Contrast against bg role |
| `--color--{name}--bg--high` / `--low` | Bg lightness modifiers |
| `--color--{name}--stroke` | Border/outline role. Default: the colour with its lightness kept between 0.42 and 0.55 in light mode and at 0.65 or more in dark mode, inside sRGB, so a mid-tone accent is its own stroke; for `background` and `surface`, a boundary 4.5:1 or more against the palette's own colour in either mode (above WCAG 1.4.11's 3:1). `$stroke` replaces it. The Material adapter's `--mat-sys-outline` is the surface's stroke; a focused field's outline is the accent's |
| `--color--{name}--stroke--low` | Quieter stroke for a divider (the adapter's `--mat-sys-outline-variant`); may be under 3:1 |
| `--color--{name}--focus` | Focus ring color |
| `--color--{name}--text` | The colour as text (a link, a heading, a price): no lighter than 0.40 in light mode, no darker than 0.82 in dark, same hue, inside sRGB. Accent palettes only; `background` and `surface` have none. `$text` replaces it. `--palette-color--text` in a `[palette]` scope |
| `--color--{name}--tint-1` … `--tint-5` | 10%/20%/38%/60%/80% opacity tints |
| `--container--text`, `--container--text-emphasis`, `--container--text-deemphasis` | Not per palette: the text colours for where an element is. On every theme element they are the page's (the background's contrast, and for `-deemphasis` that contrast mixed with the background at `--weight--text-deemphasis-blend`); inside a `filled` element they are that fill's. `var(--container--text-deemphasis)` is muted text anywhere |
| `--color--surface--container-lowest`, `-low`, `--color--surface--container`, `-high`, `-highest` | The surface only: Material 3's five surface containers, at M3's distance from the surface in each mode (light: +0.017, −0.017, −0.035, −0.052, −0.069 in oklch lightness; dark: −0.024, +0.036, +0.053, +0.097, +0.140), each with a `--contrast`. For a card, a panel, a toolbar. The Material adapter's `--mat-sys-surface-container-*` read them. Not the shade steps (`--high`, `--low`: ±0.12 per step) |

---

## Applying in HTML

### Theme scope

```html
<body theme="my-theme">          <!-- activates theme on body -->
  <div theme="other-theme">...</div>  <!-- nested theme scope -->
</body>
```

### Palette scope

```html
<div palette="primary">...</div>   <!-- sets --palette-color--* vars in scope -->
<div palette="warn">...</div>
```

Palette scopes work independently of theme scopes. A `[palette]` attribute activates the named palette's `--color--*` vars for all descendants.

### Surface styling

These attributes require a `[palette]` on the same element:

```html
<!-- bg from palette bg role, text auto-contrasted -->
<section palette="primary" container>...</section>

<!-- solid fill from palette identity color -->
<div palette="secondary" filled>...</div>

<!-- transparent bg, inset border from palette stroke role -->
<div palette="primary" outlined>...</div>
```

CSS vars set by surface attributes:

| Variable | Description |
|---|---|
| `--container--text` | Blended body text color |
| `--container--text-emphasis` | Full-contrast text |
| `--container--text-deemphasis` | Reduced-emphasis text |
| `--container--stroke` | Border color |
| `--container--padding` | Density-reactive padding |
| `--container--radius` | Corner radius |

### Tone modifiers

Lighten or darken the active palette within a scope:

```html
<div palette="primary" tone="high">...</div>   <!-- darker in light / lighter in dark -->
<div palette="primary" tone="low">...</div>    <!-- lighter in light / darker in dark -->
<div palette="primary" tone="dark">...</div>   <!-- always darker -->
<div palette="primary" tone="light">...</div>  <!-- always lighter -->
```

### Elevation

```html
<div elevated="0">...</div>   <!-- no shadow -->
<div elevated="1">...</div>   <!-- slight raise -->
<div elevated="3">...</div>   <!-- floating panel -->
<div elevated="5">...</div>   <!-- modal-level -->
```

### Light/dark mode

```html
<html themeMode="auto">    <!-- follows system preference (default) -->
<html themeMode="light">   <!-- force light -->
<html themeMode="dark">    <!-- force dark -->
<div  themeMode="invert">  <!-- flip mode for this subtree -->
```

### Density scopes

```html
<div themeDensity="-2">...</div>   <!-- compact (-5 most compact, 0 default, +5 spacious) -->
```

---

## Sub-configs

All sub-configs are passed to `t.theme()`. Light/dark variants use `t.light-dark()`.

### `t.weights()`

Controls text blend opacity and interaction state opacities. Usually only `$text-blend` differs between light and dark.

```scss
$weights: t.light-dark(
  t.weights($text-blend: 82%),   // light mode
  t.weights($text-blend: 78%),   // dark mode
)
```

| Parameter | Default | Description |
|---|---|---|
| `$text-blend` | `82%` | Body text opacity (color-mixed against surface) |
| `$text-emphasis-blend` | `96%` | Emphasis text opacity |
| `$text-deemphasis-blend` | `63%` light, `93%` dark | How much of the text colour muted text keeps. The default is where Angular Material has `on-surface-variant` |
| `$state-hover` | `8%` | Hover state layer opacity |
| `$state-press` | `12%` | Press state layer opacity |
| `$state-focus` | `12%` | Focus state layer opacity |
| `$state-drag` | `16%` | Drag state layer opacity |

### `t.typography()`

M3 type scale. Static — not light/dark varying.

```scss
$typography: t.typography(
  $plain-family: system-ui,
  $brand-family: 'Roboto',
  $bold-weight:    700,
  $medium-weight:  500,
  $regular-weight: 400,
)
```

Emits `--text--{role}-{size}--{font|size|line-height|weight|tracking}` for all 15 M3 scales (`display-large` … `label-small`).

### `t.density()`

Sets the base density scale for the theme. Static — not light/dark varying. Override locally with `[themeDensity]`.

```scss
$density: t.density($scale: 0)   // 0 = default, -5 = most compact
```

Emits `--density-scale` and `--space--{xxs|xs|sm|md|lg|xl|xxl}`.

### `t.shape()`

M3 corner radius scale. Static — not light/dark varying.

```scss
$shape: t.shape(
  $xs: 4px, $sm: 8px, $md: 12px, $lg: 16px, $xl: 28px, $full: 9999px,
)
```

Emits `--shape--{xxs|xs|sm|md|lg|xl|xxl|full}`.

### `t.focus()`

Focus ring appearance. Static — not light/dark varying.

```scss
$focus: t.focus($width: 3px, $offset: 2px)
```

### `t.motion()`

Easing curves and duration steps.

```scss
$motion: t.motion()   // M3 defaults
```

---

## CSS Variable Naming

`--` separates namespace segments (like `.` in OOP). `-` separates words within a segment.

```
--color--primary                   palette identity color
--color--primary--contrast         auto-contrast (black or white)
--color--primary--dark             lightness step down
--color--primary--bg               container/bg role color
--color--primary--bg--contrast     contrast against bg role
--color--primary--tint-1           10% opacity tint
--color--primary--focus            per-palette focus ring color
--color--primary--text             the colour as text (links, headings)
--space--md                        density-reactive spacing
--shape--lg                        corner radius
--container--text                  blended body text on a surface
--container--padding               density-reactive container padding
```

---

## Adaptor Hooks

Third-party packages (e.g. `theme-ng-material`) can hook into `define-theme()` without coupling to core:

```scss
@use '@cpangular/cp-theming-core/scss/theme' as t;
@use '@cpangular/cp-theming-ng-material/scss/material' as mat;

@include t.define-theme('my-theme', $my-theme, $adaptor: mat.adaptor());
```

The adaptor map supports four optional hook mixins:

| Key | Signature | Called |
|---|---|---|
| `define-theme-before` | `($name)` | Before theme vars are emitted |
| `define-theme-after` | `($name)` | After all theme vars are emitted |
| `define-palette-before` | `($palette-name)` | Before each palette is registered |
| `define-palette-after` | `($palette-name)` | After each palette is registered |

---

## Browser Requirements

Requires CSS relative color syntax (`oklch(from var(--x) …)`), supported in all modern browsers since mid-2024. Not supported in IE11 or older Safari.
