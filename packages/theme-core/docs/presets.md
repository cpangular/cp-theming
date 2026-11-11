# Preset themes

`@cpangular/cp-theming-core` ships four ready-to-use themes inspired by Angular Material's M3 prebuilt themes. They are implemented with literal oklch values (no `$brand`) and are designed for direct use or as a starting point for customization.

## Importing presets

```scss
@use '@cpangular/cp-theming-core/scss/theme' as t;
@use '@cpangular/cp-theming-core/scss/presets' as presets;

// Core first, then a preset as the default theme
@include t.define-core-theme();
@include t.define-theme('azure-blue', presets.$azure-blue, $default: true);
```

Or import only palettes for use in a custom theme:

```scss
@use '@cpangular/cp-theming-core/scss/presets/palettes' as p;
```

## Available themes

| Variable | Primary | Secondary | Character |
|----------|---------|-----------|-----------|
| `presets.$azure-blue` | Azure (253°) | Blue (264°) | Professional, trustworthy |
| `presets.$rose-red` | Rose (349°) | Red (27°) | Bold, energetic |
| `presets.$cyan-orange` | Cyan (191°) | Orange (55°) | Fresh, productive |
| `presets.$magenta-violet` | Magenta (320°) | Violet (295°) | Creative, vibrant |

### Shared defaults

All four themes use these settings:

```scss
$_weights-light: t.weights($text-blend: 82%, $text-primary-tint: 10%);
$_weights-dark:  t.weights($text-blend: 78%, $text-primary-tint: 12%);
$_overlay-light: t.overlays($scrim: oklch(0 0 0 / 50%), $shadow: oklch(0.2 0.02 0 / 25%));
$_overlay-dark:  t.overlays($scrim: oklch(0 0 0 / 65%), $shadow: oklch(0 0 0 / 50%));
$focus:      t.focus($width: 3px, $offset: 2px)
$density:    t.density($scale: 0)
$typography: t.typography($plain-family: system-ui)
$motion:     t.motion()
```

All four pass: `background`, `surface`, `primary`, `secondary`, `error`, `pass`, `caution`, `warn`. None passes `tertiary` or `brand`, so each preset's tertiary is the one core generates from its primary (the same lightness, half the chroma, hue + 60°).

---

## Preset palette variables

Import from `presets/palettes` to mix and match:

```scss
@use '@cpangular/cp-theming-core/scss/presets/palettes' as p;

$my-theme: t.theme(
  $palettes: (
    background: p.$azure-blue-background,
    surface:    p.$azure-blue-surface,
    primary:    p.$azure-blue-primary,
    secondary:  p.$rose-red-primary,    // borrow from another theme
    error:      p.$default-error,
    pass:       p.$default-pass,
    caution:    p.$default-caution,
    warn:       p.$default-warn,
  ),
  ...
);
```

### Neutral defaults

These use near-zero chroma (achromatic) and work well as a base for any accent palette.

| Variable | Light | Dark |
|----------|-------|------|
| `p.$default-background` | `oklch(0.97 0.002 0)` | `oklch(0.18 0.004 0)` |
| `p.$default-surface` | `oklch(0.93 0.003 0)` | `oklch(0.23 0.005 0)` |

### Semantic defaults

Tuned for legibility on the neutral background/surface above.

| Variable | Hue | Meaning |
|----------|-----|---------|
| `p.$default-pass` | 145° green | Success, confirmation |
| `p.$default-caution` | 103° amber-gold | Advisory, needs attention |
| `p.$default-warn` | 55° orange | Warning, degraded state |
| `p.$default-error` | 27° red | Failure, destructive action |

### azure-blue palettes

| Variable | Light oklch | Dark oklch |
|----------|------------|-----------|
| `p.$azure-blue-background` | `0.97 0.004 253` | `0.18 0.014 253` |
| `p.$azure-blue-surface` | `0.93 0.008 253` | `0.24 0.018 253` |
| `p.$azure-blue-primary` | `0.43 0.19 253` | `0.72 0.17 253` |
| `p.$azure-blue-secondary` | `0.46 0.27 264` | `0.71 0.21 264` |
| `p.$azure-blue-error` | `0.54 0.22 27` | `0.67 0.20 27` |

### rose-red palettes

| Variable | Light oklch | Dark oklch |
|----------|------------|-----------|
| `p.$rose-red-background` | `0.97 0.005 349` | `0.18 0.015 349` |
| `p.$rose-red-surface` | `0.93 0.010 349` | `0.23 0.020 349` |
| `p.$rose-red-primary` | `0.48 0.24 349` | `0.73 0.20 349` |
| `p.$rose-red-secondary` | `0.44 0.26 27` | `0.70 0.22 27` |
| `p.$rose-red-error` | `0.50 0.27 27` | `0.68 0.24 27` |

### cyan-orange palettes

| Variable | Light oklch | Dark oklch |
|----------|------------|-----------|
| `p.$cyan-orange-background` | `0.97 0.004 191` | `0.17 0.014 191` |
| `p.$cyan-orange-surface` | `0.92 0.008 191` | `0.22 0.018 191` |
| `p.$cyan-orange-primary` | `0.44 0.10 191` | `0.78 0.09 191` |
| `p.$cyan-orange-secondary` | `0.50 0.16 55` | `0.74 0.14 55` |
| `p.$cyan-orange-error` | `0.54 0.22 27` | `0.67 0.20 27` |

### magenta-violet palettes

| Variable | Light oklch | Dark oklch |
|----------|------------|-----------|
| `p.$magenta-violet-background` | `0.97 0.005 320` | `0.18 0.016 320` |
| `p.$magenta-violet-surface` | `0.93 0.010 320` | `0.23 0.020 320` |
| `p.$magenta-violet-primary` | `0.48 0.29 320` | `0.72 0.24 320` |
| `p.$magenta-violet-secondary` | `0.47 0.31 295` | `0.70 0.26 295` |
| `p.$magenta-violet-error` | `0.54 0.22 27` | `0.67 0.20 27` |

---

## Customizing a preset

Override individual properties by building a custom theme using preset palettes as a starting point:

```scss
@use '@cpangular/cp-theming-core/scss/theme' as t;
@use '@cpangular/cp-theming-core/scss/presets/palettes' as p;

$ocean: t.theme(
  $palettes: (
    background: p.$azure-blue-background,
    surface:    p.$azure-blue-surface,
    primary:    p.$azure-blue-primary,
    secondary:  p.$azure-blue-secondary,
    error:      p.$default-error,
    pass:       p.$default-pass,
    caution:    p.$default-caution,
    warn:       p.$default-warn,
  ),
  $weights: t.light-dark(
    t.weights($text-blend: 85%),
    t.weights($text-blend: 80%),
  ),
  $typography: t.typography($plain-family: '"Roboto", system-ui'),
  $density: t.density($scale: -1),     // slightly more compact
  $shape:   t.shape($md: 10px),
  $focus:   t.focus($width: 3px, $offset: 2px),
  $motion:  t.motion(),
);
```

## Using brand-derived themes

Instead of literal colors, pass the brand colour and let core generate the rest: primary, tertiary, background and surface below come from `$brand`. Setting the pair `--color--brand--mode-light` / `--color--brand--mode-dark` at runtime recolours all of them:

```scss
$brand-theme: t.theme(
  $brand: oklch(0.44 0.22 253),        // the brand palette, --color--brand
  $palettes: (
    // a helper is only needed for numbers other than core's
    secondary:  t.palette-from-brand($c-max: 0.16),
    error:      p.$default-error,
    pass:       p.$default-pass,
    caution:    p.$default-caution,
    warn:       p.$default-warn,
  ),
  ...
);
```

Set the brand's registered pair at runtime to recolor everything made from it, generated or from a helper:

```js
const el = document.querySelector('[theme="brand-theme"]');
el.style.setProperty('--color--brand--mode-light', 'oklch(0.48 0.24 349)');
el.style.setProperty('--color--brand--mode-dark', 'oklch(0.48 0.24 349)');
```

See [palettes.md](palettes.md#runtime-derived-palettes) for the full `*-from-brand()` API.
