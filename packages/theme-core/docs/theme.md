# Theme definition

A theme is a compiled SCSS configuration object that bundles palette colors, weights, typography, density, shape, focus, motion, and elevation settings. At build time, `t.define-theme()` compiles this into a CSS rule block scoped to a `[theme="name"]` attribute selector.

## `t.theme(…)`

Assembles all sub-configs into a theme object. Every parameter is optional except `$palettes`.

```scss
$my-theme: t.theme(
  $palettes:   (...),           // required — named palette map
  $brand:      null,            // optional oklch color — emits --color--brand
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

### `$palettes` — required

A map of palette name → palette config. Values can be:

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

An `oklch` color that is emitted as `--color--brand`. Used by `t.palette-from-brand()`, `t.background-from-brand()`, and `t.surface-from-brand()` to derive palettes at runtime from the brand hue. Setting `--color--brand` via JavaScript at runtime updates all derived palettes live.

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

---

## `@include t.define-theme($name, $theme, $default?, $dedupe?)`

Emits all CSS custom property declarations for a theme.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `$name` | — | Theme name. Applied via `[theme="name"]` attribute in HTML. |
| `$theme` | — | Theme object from `t.theme()`. |
| `$default` | `false` | Also emit on `body` so the theme is active without an explicit attribute. |
| `$dedupe` | `true` | Emit light/dark differences using CSS `light-dark()` instead of separate selectors. Slightly smaller output. |

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

**What it emits:**

- **`@property` registrations** for all typed custom properties (see below)
- **`[palette]`, `[container]`, `[filled]`, `[outlined]`** attribute rules
- **`[tone="…"]`** tone modifier attribute rules (8 modifiers)
- **`[elevated="N"]`** elevation box-shadow attribute rules (levels 0–5)
- **`[themeDensity="N"]`** density scope selectors (−5 to +5)

Must be called **after** any `define-theme()` calls in the same stylesheet due to CSS declaration order (the attribute rules share specificity with theme rules; being last wins):

```scss
@include t.define-theme('ocean', $ocean-theme, $default: true);
@include t.define-theme('ember', $ember-theme);
@include t.define-core-theme();
```

### Pre-built option

`define-core-theme()` is completely theme-independent and ships as a pre-built file: `dist/core.css`. Load it as a plain CSS file after your theme CSS:

```html
<link rel="stylesheet" href="my-theme.css">
<link rel="stylesheet" href="node_modules/@cpangular/cp-theming-core/dist/core.css">
```

Or via CSS import:
```css
@import "my-theme.css";
@import "@cpangular/cp-theming-core/dist/core.css";
```

The pre-built `dist/core.css` is identical to calling `@include t.define-core-theme()` inline — choose whichever fits your build pipeline.

---

## `@property` registrations and animation

`define-core-theme()` registers all system custom properties as typed CSS properties using `@property`. This unlocks:

- **CSS transitions on custom properties directly** — e.g. `transition: --palette-color 200ms`
- **`color-mix()` blend percentages animating** — hover/press state overlays can fade in/out
- **Typed interpolation in `@keyframes`** — animate spacing, radius, colors as proper values

`@property` rules are global to the document and must appear at stylesheet root level — which is exactly where `define-core-theme()` emits them.

### Which vars are registered and why

| Group | Count | Type | Why registration is needed |
|-------|-------|------|---------------------------|
| `--weight--*` | 13 | `<percentage>` | Used as `color-mix()` blend amount — browser can't interpolate without a type |
| `--space--*` | 7 | `<length>` | Density/spacing transitions |
| `--density-scale` | 1 | `<number>` | Drives `calc()` in space tokens |
| `--shape--*` | 8 | `<length>` | Radius transitions |
| `--color--{name}`, `--color--{name}--bg`, `--color--{name}--stroke`, `--color--{name}--focus` | 4 × 8 core palettes = 32 | `<color>` | Palette color transitions |
| `--palette-color`, `--palette-color--bg`, `--palette-color--stroke`, `--palette-color--focus` | 4 | `<color>` | Scope vars — animate palette switches |
| `--container--text`, `--container--text-emphasis`, `--container--text-deemphasis`, `--container--stroke` | 4 | `<color>` | Surface vars — animate mode/palette changes |
| `--color--brand` | 1 | `<color>` | Runtime brand color override |
| **Total** | **70** | | |

Derivative vars (`--contrast`, `--dark`, `--high`, etc.) are **not** registered — they are computed via `oklch(from var(…) …)` and update automatically when their base var transitions. No extra declarations needed.

### Core palette initial values

The 8 core palettes use print-suitable greyscale `initial-value` declarations — a safe, legible fallback when no theme is active:

| Palette | identity `initial-value` | bg `initial-value` |
|---------|--------------------------|---------------------|
| `background` | `oklch(0.97 0 0)` | `oklch(1.00 0 0)` |
| `surface` | `oklch(0.93 0 0)` | `oklch(0.95 0 0)` |
| `primary` | `oklch(0.20 0 0)` | `oklch(0.92 0 0)` |
| `secondary` | `oklch(0.40 0 0)` | `oklch(0.92 0 0)` |
| `error` | `oklch(0.15 0 0)` | `oklch(0.92 0 0)` |
| `warn` | `oklch(0.30 0 0)` | `oklch(0.92 0 0)` |
| `caution` | `oklch(0.50 0 0)` | `oklch(0.92 0 0)` |
| `pass` | `oklch(0.35 0 0)` | `oklch(0.92 0 0)` |

Non-core palette names (any name beyond the 8 above) are auto-registered the first time `define-palette()` encounters them, with `initial-value: transparent`.

### `initial-value` constraint

`initial-value` must be **computationally independent** — no `var()`, no `em`, no `calc()` referencing other custom properties. This is a hard spec requirement. Consequently:

- All token initial values are literal px/% values matching the defaults
- Palette initial values are literal `oklch(…)` colors (not relative color expressions)
- `transparent` is the safe fallback for scope/surface vars that have no meaningful default outside a theme context
