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

## Brand, accents and neutrals: pass what you have

Colours follow one chain:

**brand → primary → secondary, tertiary → background, surface**

A theme passes whichever of these it has. Core generates each one it leaves out, in the browser, from the nearest one it passed.

| Palette | When the theme leaves it out |
|---------|------------------------------|
| `brand` | Never generated, never adjusted. `$brand` in `t.theme()` is the colour from your guidelines; it becomes the `brand` palette (`palette="brand"`, `--color--brand`, `--color--brand--contrast`, …) exactly as written. With no brand passed it is a dark grey. |
| `primary` | The brand, moved into the lightness that reads on the page: 0.35–0.50 in light mode, 0.65–0.82 in dark mode, chroma at most 0.22 (dark mode: 0.9 × chroma first). The same numbers as `t.palette-from-brand()`. |
| `secondary` | Primary's hue and lightness, one third of its chroma. |
| `tertiary` | Primary's lightness, hue + 60°, half its chroma. |
| `background` | The brand's hue at lightness 0.97 / 0.17, chroma 0.006 at most. The same numbers as `t.background-from-brand()`. |
| `surface` | The brand's hue at lightness 0.93 / 0.22, chroma 0.01 at most. The same numbers as `t.surface-from-brand()`. |
| `error`, `warn`, `caution`, `pass` | Not part of the chain. Fixed defaults, the ones the presets pass: `oklch(0.52 0.22 27)` / `oklch(0.70 0.20 27)`, `oklch(0.55 0.18 55)` / `oklch(0.76 0.16 55)`, `oklch(0.55 0.16 103)` / `oklch(0.82 0.15 103)`, `oklch(0.48 0.18 145)` / `oklch(0.72 0.16 145)`. |

So:

```scss
// Only the brand: everything else is generated.
$a: t.theme($brand: #ff6a00);

// Only primary: secondary and tertiary are generated from it. No brand was
// passed, so background and surface are neutral greys.
$b: t.theme($palettes: (
  primary: t.light-dark(t.palette(oklch(0.45 0.18 300)), t.palette(oklch(0.75 0.15 300))),
));

// Primary and secondary: tertiary is generated. Pass all three and none is.
$c: t.theme($palettes: (
  primary:   t.light-dark(t.palette(oklch(0.45 0.18 300)), t.palette(oklch(0.75 0.15 300))),
  secondary: t.light-dark(t.palette(#00796b), t.palette(hsl(174 42% 65%))),
));
```

A palette you pass is used exactly as given. The brand colour is the only one that is both kept exact and the origin of others: a brand colour is often too light, too dark or too saturated to carry buttons and text, so the primary made from it is adjusted and the brand palette is not.

### Nested themes

A nested theme generates what follows from what it passes and inherits the rest:

- only `primary` → its own secondary and tertiary; the background, surface and semantic palettes of the theme around it;
- only `brand` → the whole chain;
- only `secondary` → that secondary; everything else from the theme around it;
- no colour at all (a shape, a density) → every colour of the theme around it.

On the root core generates every palette of the chain that no theme passes. With no theme at all the brand is its grey default and so is everything made from it.

### Beside a default theme

A default theme (`$default: true`, every preset) applies on `:where(:root)`. A theme on `<html theme="…">` beats it for everything the theme passes and everything generated from that. What the theme has nothing upstream of comes from the default, as it would from a theme around it: a theme with only `primary`, loaded beside a preset, shows the preset's background and surface.

### How it works

`define-core-theme()` declares each generated colour once, on the shared derivation selector, as a private variable, so it is worked out again on every `[theme]` element from the brand and primary in force there:

```css
:where(:root, [theme]) {
  --theme--_generated--primary--light: oklch(from var(--color--brand--mode-light) clamp(0.35,l,0.5) clamp(0,c,0.22) h / 1);
  --theme--_generated--secondary--light: oklch(from var(--color--primary--mode-light) l calc(c / 3) h / 1);
  /* … ten in all: primary, secondary, tertiary, background, surface × light, dark */
}
```

It sets no pair there. The pairs take a generated colour by reference, in two places:

```css
/* core: the root generates the whole chain */
:where(:root) {
  --color--primary--mode-light: var(--theme--_generated--primary--light);
  /* … every pair of the chain */
}

/* a theme that passes only primary: the two accents that follow from it */
:where([theme="my-theme"]):not(cp-theming-none) {
  --color--primary--mode-light: oklch(45% 0.18 300deg);
  --color--primary--mode-dark: oklch(75% 0.15 300deg);
  --color--secondary--mode-light: var(--theme--_generated--secondary--light);
  --color--secondary--mode-dark: var(--theme--_generated--secondary--dark);
  --color--tertiary--mode-light: var(--theme--_generated--tertiary--light);
  --color--tertiary--mode-dark: var(--theme--_generated--tertiary--dark);
  /* … and the joined tokens */
}
```

Nothing else declares a pair, so anywhere else it inherits: that is the "inherits the rest". A theme that passes the palette declares the pair itself.

A hand-written rule follows the same rules. On `:root`, setting a pair (`--color--brand--mode-light` / `--mode-dark`) regenerates everything made from it, because every pair of the chain is a reference there. On a nested `[theme]` element a hand-written pair re-derives that palette's own roles, ladder and contrasts, and not the palettes generated from it: set those pairs too, or define a theme with `define-theme()`.

## Runtime-derived palettes

These helpers derive palette configs from a CSS custom property at runtime, using CSS relative color syntax. The hue of the source variable is preserved; lightness and chroma are adjusted. Core uses the same expressions for the primary, background and surface it generates from the brand, so call a helper only to change the numbers, to read another variable, or to make another palette name follow the brand.

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

Convenience wrapper for `t.palette-from-var('--color--brand', …)`. Derives a palette from `--color--brand`, the brand palette's colour, which a theme sets by passing `$brand` to `t.theme()`. A theme that passes `$brand` and no `primary` gets this palette as its primary without calling it.

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

`$c-tint` is a ceiling (`min(c, $c-tint)`): a grey source has no hue to take, so it gives a grey neutral.

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

## Core palette names

The following ten names are registered and derived by `define-core-theme()`. Use them consistently so components and utilities can target them predictably. A theme does not have to pass all of them (see [pass what you have](#brand-accents-and-neutrals-pass-what-you-have)).

| Name | Meaning | Suggested hue |
|------|---------|---------------|
| `background` | Page/app background | Achromatic or brand-tinted |
| `surface` | Card/panel surfaces | Slightly elevated over background |
| `brand` | The brand colour exactly as given: logo strips, hero areas | The colour from the guidelines |
| `primary` | Primary actions, links | Brand hue, readable on the page |
| `secondary` | Secondary actions | Complementary or analogous hue |
| `tertiary` | A third accent | A neighbouring hue |
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
