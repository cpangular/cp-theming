# `@cpangular/cp-theming-core`

A CSS-variable-based theming system that is framework-agnostic at its core. Themes are defined in SCSS and compile to CSS custom properties. All color derivatives—tints, contrasts, light/dark modifiers—are computed at runtime by the browser using [oklch relative color syntax](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch); no compile-time color math is used.

## Design principles

- **Runtime color derivatives.** Contrasts, tints, and lightness modifiers resolve in the browser, not during compilation. Change a palette color at runtime and all derivatives update automatically.
- **oklch color space everywhere.** All palette colors must be `oklch(l c h)`. No `hsl`, `rgb`, or `hex`.
- **Single SCSS import.** One `@use` gives you the entire authoring API.
- **Typed sub-configs.** Use `t.palette()`, `t.weights()`, `t.density()` etc. — never raw maps.
- **`t.light-dark()` for mode variation.** The universal wrapper for any value that differs between light and dark modes.
- **Per-palette focus ring.** Focus color is derived independently per palette to stay visually distinct.

## Installation

```bash
npm install @cpangular/cp-theming-core
```

## Usage

Every theme authoring file starts with a single import:

```scss
@use '@cpangular/cp-theming-core/scss/theme' as t;
```

### Defining a theme

```scss
@use '@cpangular/cp-theming-core/scss/theme' as t;

$my-theme: t.theme(
  $brand: oklch(0.44 0.22 253),         // emits --color--brand; used by *-from-brand() helpers
  $palettes: (
    background: t.background-from-brand(),
    surface:    t.surface-from-brand(),
    primary:    t.palette-from-brand(),
    secondary:  t.light-dark(
      t.palette(oklch(0.46 0.27 264)),
      t.palette(oklch(0.71 0.21 264)),
    ),
    error:   t.light-dark(t.palette(oklch(0.52 0.22 27)), t.palette(oklch(0.70 0.20 27))),
    pass:    t.light-dark(t.palette(oklch(0.48 0.18 145)), t.palette(oklch(0.72 0.16 145))),
    caution: t.light-dark(t.palette(oklch(0.55 0.16 103)), t.palette(oklch(0.82 0.15 103))),
    warn:    t.light-dark(t.palette(oklch(0.55 0.18 55)),  t.palette(oklch(0.76 0.16 55))),
  ),
  $weights:    t.light-dark(t.weights($text-blend: 82%), t.weights($text-blend: 78%)),
  $typography: t.typography($plain-family: system-ui),
  $density:    t.density($scale: 0),
  $shape:      t.shape(),
  $focus:      t.focus($width: 3px, $offset: 2px),
  $motion:     t.motion(),
);
```

### Emitting a theme

```scss
@include t.define-theme('ocean', $my-theme, $default: true);
@include t.define-core-theme();
```

`define-theme` emits the theme under `[theme="ocean"]`. Passing `$default: true` also emits it on `body`. `define-core-theme()` emits all `@property` registrations for typed custom properties (enabling CSS transitions), `[container]`, `[palette]`, `[tone]`, `[elevated]` attribute rules, and density scope selectors.

`define-core-theme()` is completely theme-independent and can be used as a **pre-built CSS file** instead:

```html
<!-- Theme-specific CSS first -->
<link rel="stylesheet" href="my-theme.css">
<!-- Pre-built core after (load order ensures attribute rules cascade correctly) -->
<link rel="stylesheet" href="node_modules/@cpangular/cp-theming-core/dist/core.css">
```

### Applying in HTML

```html
<!-- Activate a theme (or let body use $default: true) -->
<body theme="ocean">
  <!-- Switch mode anywhere in the tree -->
  <div themeMode="dark">
    <!-- Activate a palette, then apply container styling -->
    <section palette="primary" container>...</section>
  </div>
</body>
```

### Using preset themes

Pre-built themes inspired by Angular Material M3 are available:

```scss
@use '@cpangular/cp-theming-core/scss/theme' as t;
@use '@cpangular/cp-theming-core/scss/presets' as presets;

@include t.define-theme('azure-blue', presets.$azure-blue, $default: true);
@include t.define-core-theme();
```

See [docs/presets.md](docs/presets.md) for the full list.

## Documentation

| File | Description |
|------|-------------|
| [docs/theme.md](docs/theme.md) | `t.theme()`, `t.define-theme()`, `t.define-core-theme()`, all sub-config functions |
| [docs/palettes.md](docs/palettes.md) | Palette system, brand-derived helpers, emitted CSS vars |
| [docs/apply.md](docs/apply.md) | `t.container()`, `t.radius()`, `t.padding()`, `t.stroke()` |
| [docs/css-variables.md](docs/css-variables.md) | Complete CSS custom property reference, `@property` / animation support |
| [docs/presets.md](docs/presets.md) | Built-in preset themes and palette variables |

## CSS variable naming conventions

`--` is the namespace separator (like `.` in OOP). `-` is the word separator within a segment.

```
--color--primary                   primary palette identity color
--color--primary--contrast         auto-derived contrast (black or white)
--color--primary--dark             lightness step down
--color--primary--bg               background role color
--color--primary--tint-1           10% opacity tint
--color--primary--focus            per-palette focus ring color
--space--md                        density-reactive spacing token
--shape--lg                        corner radius token
--container--padding               applied padding on a container element
```

## Browser requirements

Requires CSS relative color syntax (`oklch(from var(--x) …)`), which is supported in all modern browsers as of mid-2024. For older environments, polyfill or pre-compute colors via JavaScript.
