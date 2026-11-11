# Palette system

Palettes are the foundation of every theme. Each named palette emits a family of CSS custom properties that components consume. All color derivatives are computed at runtime by the browser using oklch relative color syntax — there is no compile-time color math.

## Defining a palette

### `t.palette($base, $color?, $bg?, $stroke?, $focus?)`

Builds a single-variation palette config. Pass inside `t.light-dark()` to provide separate light and dark values.

| Parameter | Type | Description |
|-----------|------|-------------|
| `$base` | `oklch` color | Identity color for this variation. Used as the default for all roles. |
| `$color` | `oklch` color | Override for the `color` role. Defaults to `$base`. |
| `$bg` | `oklch` color | Override for the `bg` (background) role. Defaults to `$base`. |
| `$stroke` | `oklch` color | Override for the `stroke` role. Defaults to `$base`. |
| `$focus` | `oklch` color | Override for the focus ring color. Auto-derived when null. |

```scss
// Single static palette
t.palette(oklch(0.43 0.19 253))

// Mode-varying palette
t.light-dark(
  t.palette(oklch(0.43 0.19 253)),           // light mode
  t.palette(oklch(0.72 0.17 253)),           // dark mode
)

// Override roles individually
t.palette(
  oklch(0.43 0.19 253),
  $bg: oklch(0.93 0.01 253),                // lighter tinted surface for bg
)
```

## Light/dark variation

### `t.light-dark($light, $dark?)`

Wraps any config value in a `(light: ..., dark: ...)` map. The theme system resolves the correct variation based on the active color scheme. If `$dark` is omitted, the `$light` value is used for both modes.

```scss
$palettes: (
  primary: t.light-dark(
    t.palette(oklch(0.43 0.19 253)),
    t.palette(oklch(0.72 0.17 253)),
  ),
);
```

## Runtime-derived palettes

These helpers derive palette configs from a CSS custom property at runtime, using CSS relative color syntax. The hue of the source variable is preserved; lightness and chroma are adjusted.

### `t.palette-from-var($var, $light-l-min?, $light-l-max?, $dark-l-min?, $dark-l-max?, $c-max?)`

Derives a contrast-safe palette from any CSS custom property. Lightness is clamped to a contrast-safe range. Default clamp ranges:

| Mode | Lightness range | Notes |
|------|----------------|-------|
| Light | 0.35 – 0.50 | Safe contrast on `oklch(0.97 …)` backgrounds |
| Dark | 0.65 – 0.82 | Safe contrast on `oklch(0.18 …)` backgrounds |
| Chroma cap | 0.22 | Prevents over-saturation |

```scss
primary: t.palette-from-var('--color--brand')

// Adjusted ranges for a softer variant
tertiary: t.palette-from-var('--color--brand', $c-max: 0.14)
```

### `t.palette-from-brand(...)`

Convenience wrapper for `t.palette-from-var('--color--brand', …)`. Derives a palette from the `--color--brand` CSS variable, which is emitted when you pass `$brand` to `t.theme()`.

```scss
primary: t.palette-from-brand()
primary: t.palette-from-brand($c-max: 0.18)   // reduced chroma
```

> **Note:** Hues around 75°–125° (yellow range) are a rough edge in oklch. For production accuracy on arbitrary brand colors, compute via JavaScript (HCT) and pass a literal value.

## Brand-tinted neutral helpers

These helpers derive neutral background and surface palettes from a CSS variable. The hue of the source color is preserved, but chroma is crushed near zero, producing a neutral that feels harmonious with the brand without appearing colored.

### `t.background-from-var($var, $c-tint?)`
### `t.background-from-brand($c-tint?)`

Very near white/black — subtle warmth only.

| Mode | Lightness | Default chroma |
|------|-----------|----------------|
| Light | 0.97 | 0.006 |
| Dark | 0.17 | 0.006 |

```scss
background: t.background-from-brand()
background: t.background-from-brand($c-tint: 0.012)  // slightly more tinted
```

### `t.surface-from-var($var, $c-tint?)`
### `t.surface-from-brand($c-tint?)`

Slightly more chroma than background — sits visually above it on the Z-axis.

| Mode | Lightness | Default chroma |
|------|-----------|----------------|
| Light | 0.93 | 0.010 |
| Dark | 0.22 | 0.010 |

```scss
surface: t.surface-from-brand()
```

### Chroma guide

| `$c-tint` | Effect |
|-----------|--------|
| `0.006` | Barely perceptible — looks effectively neutral |
| `0.010` | Subtle warmth visible on close inspection |
| `0.015` | Clearly tinted but still reads as a neutral |
| `> 0.020` | Noticeably colored — no longer a neutral |

## Semantic palette names

The following palette names have well-established semantic meaning. Use them consistently so components and utilities can target them predictably.

| Name | Meaning | Suggested hue |
|------|---------|---------------|
| `background` | Page/app background | Achromatic or brand-tinted |
| `surface` | Card/panel surfaces | Slightly elevated over background |
| `primary` | Brand identity, primary actions | Brand hue |
| `secondary` | Secondary actions | Complementary or analogous hue |
| `error` | Failure, destructive actions | Red (~27°) |
| `warn` | Warning, degraded state | Orange (~55°) |
| `caution` | Advisory, needs attention | Amber-gold (~103°) |
| `pass` | Success, confirmation | Green (~145°) |

## Emitted CSS custom properties

For every palette named `{name}`, the following CSS custom properties are emitted on the theme root element:

### Color role (primary identity)

```
--color--{name}             identity color (the base color)
--color--{name}--contrast   black or white — whichever contrasts more
--color--{name}--dark       lightness - 0.12
--color--{name}--darker     lightness - 0.24
--color--{name}--light      lightness + 0.12
--color--{name}--lighter    lightness + 0.24
--color--{name}--dark--contrast
--color--{name}--darker--contrast
--color--{name}--light--contrast
--color--{name}--lighter--contrast
--color--{name}--high       mode-relative: darker in light, lighter in dark
--color--{name}--higher
--color--{name}--low        mode-relative: lighter in light, darker in dark
--color--{name}--lower
--color--{name}--high--contrast
--color--{name}--higher--contrast
--color--{name}--low--contrast
--color--{name}--lower--contrast
```

#### How `--contrast` is chosen

Every `--contrast` is black or white, chosen by the browser from the colour it sits on: white when that colour's WCAG relative luminance is below 0.179, black when it is above. At 0.179 black and white give the same contrast, so the text reaches at least 4.5:1 on every opaque colour, whatever its hue and whatever format it was written in. Luminance is read from the linear-sRGB channels, each clamped to 0–1, so a colour outside sRGB gets the text that suits the clipped colour the screen paints.

```css
/* S = clamp(0, (0.179 - (0.2126*R + 0.7152*G + 0.0722*B)) * 1e6, 1), with R, G, B clamped to 0–1 */
--color--primary--contrast: oklch(from color(from var(--color--primary) srgb-linear S S S) l 0 0 / 1);
```

Core declares `S` once, as the private variable `--theme--_contrast-step`, and each `--contrast` reads it.

Every derived colour — ladder steps, the auto `--bg`, `--stroke` and `--focus`, the contrasts, and the `*-from-var()` / `*-from-brand()` palettes — has alpha 1, even when the colour it derives from is translucent. Only the tints carry an alpha. The 4.5:1 guarantee is for opaque colours: text on a `$bg` you pass with an alpha is chosen as if that colour were opaque.

### Background role

Same set of modifiers under `--color--{name}--bg`:

```
--color--{name}--bg
--color--{name}--bg--contrast
--color--{name}--bg--dark       etc.
```

### Stroke role

```
--color--{name}--stroke
--color--{name}--stroke--contrast
--color--{name}--stroke--dark    etc.
```

### Tints

Transparent versions of the color role:

```
--color--{name}--tint-1   10% opacity  (controlled by --weight--tint-1)
--color--{name}--tint-2   20%
--color--{name}--tint-3   38%
--color--{name}--tint-4   60%
--color--{name}--tint-5   80%
```

### Focus ring

```
--color--{name}--focus    auto-derived: inverted lightness + 60° hue shift
                          override with $focus in t.palette()
```

## Lightness step configuration

The `dark`/`light` lightness steps are controlled by SCSS variables in `_variables.scss`. Override before importing if needed:

```scss
@use '@cpangular/cp-theming-core/scss/variables' with (
  $theme-step-1: 0.10,  // default 0.12  — dark / light
  $theme-step-2: 0.20,  // default 0.24  — darker / lighter
);
@use '@cpangular/cp-theming-core/scss/theme' as t;
```
