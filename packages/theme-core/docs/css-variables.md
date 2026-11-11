# CSS custom property reference

All CSS custom properties emitted by `@cpangular/cp-theming-core`. A theme rule (`:where([theme="name"]):not(cp-theming-none)`, specificity (0,0,1), plus `:where(:root)` when `$default: true`) declares only what its author passed: the registered light and dark colour of each role (`--color--{name}[--role]--mode-light` / `--mode-dark`) with its joined token (`$brand` is the `brand` palette), a reference to core's generated colour for each chain palette the theme left out that follows from one it passed, the passed sub-config keys and the light/dark pairs of mode-varying percentages. Every derivation below, and the generated colour of each chain palette (primary, secondary, tertiary, background, surface), is declared once by `define-core-theme()` on `:where(:root, [theme])`; the defaults on `:where(:root)`.

---

## Color — palette variables

Emitted once per named palette. Replace `{name}` with the palette name (e.g. `primary`, `surface`, `error`).

### Identity (color role)

The `color` role is the palette's primary identity. It has no role suffix in the variable name.

| Variable | Description |
|----------|-------------|
| `--color--{name}` | Base identity color |
| `--color--{name}--contrast` | Black or white — whichever contrasts more |
| `--color--{name}--dark` | Lightness − 0.12 |
| `--color--{name}--darker` | Lightness − 0.24 |
| `--color--{name}--light` | Lightness + 0.12 |
| `--color--{name}--lighter` | Lightness + 0.24 |
| `--color--{name}--dark--contrast` | Contrast on `--dark` |
| `--color--{name}--darker--contrast` | Contrast on `--darker` |
| `--color--{name}--light--contrast` | Contrast on `--light` |
| `--color--{name}--lighter--contrast` | Contrast on `--lighter` |
| `--color--{name}--high` | Mode-relative: darker in light mode, lighter in dark mode |
| `--color--{name}--higher` | More extreme mode-relative shift |
| `--color--{name}--low` | Mode-relative: lighter in light mode, darker in dark mode |
| `--color--{name}--lower` | More extreme mode-relative shift |
| `--color--{name}--high--contrast` | Contrast on `--high` |
| `--color--{name}--higher--contrast` | |
| `--color--{name}--low--contrast` | Contrast on `--low` |
| `--color--{name}--lower--contrast` | |

### Background role (`--bg` suffix)

Same full set of derivatives, prefixed with `--color--{name}--bg`:

```
--color--{name}--bg
--color--{name}--bg--contrast
--color--{name}--bg--dark
--color--{name}--bg--darker
--color--{name}--bg--light
--color--{name}--bg--lighter
... (all modifier and contrast combinations)
--color--{name}--bg--high / --higher / --low / --lower
--color--{name}--bg--high--contrast / etc.
```

### Stroke role (`--stroke` suffix)

Same full set of derivatives, prefixed with `--color--{name}--stroke`:

```
--color--{name}--stroke
--color--{name}--stroke--contrast
--color--{name}--stroke--dark  ... etc.
```

### Tints

Transparent versions of the identity color role. Opacity is the mode-varying `--weight--tint-N` weight. A tint reads the weight's `--weight--tint-N--mode-light` / `--mode-dark` pair inside `light-dark()`, so it follows a nested `themeMode`; override the pair, not the picked `--weight--tint-N` token, to change a tint's opacity.

| Variable | Default opacity |
|----------|----------------|
| `--color--{name}--tint-1` | 10% |
| `--color--{name}--tint-2` | 20% |
| `--color--{name}--tint-3` | 38% |
| `--color--{name}--tint-4` | 60% |
| `--color--{name}--tint-5` | 80% |

### Focus ring

| Variable | Description |
|----------|-------------|
| `--color--{name}--focus` | Per-palette focus ring color. Auto-derived as: inverted lightness + 60° hue shift from `--color--{name}`. Override via `$focus` in `t.palette()`. |

### Brand

| Variable | Description |
|----------|-------------|
| `--color--brand` | The `brand` palette's colour role: the brand colour exactly as `$brand` (or `brand: t.palette(…)`) gave it, never adjusted. `brand` is a core palette, so every variable in the tables above exists for it. It is the join of the registered pair `--color--brand--mode-light` / `--mode-dark`; set the pair at runtime to regenerate the primary, accents and neutrals a theme did not pass. The `*-from-brand()` helpers read `--color--brand` itself. |

---

## Palette-color — active palette scope

Set by `t.apply-palette($name)` or the `[palette="name"]` attribute. Point at the current palette's `--color--{name}--*` vars. All Layer 2 mixins read from here.

| Variable | Points to |
|----------|-----------|
| `--palette-color` | `--color--{name}` |
| `--palette-color--contrast` | `--color--{name}--contrast` |
| `--palette-color--dark` / `--light` / etc. | Full modifier set |
| `--palette-color--high` / `--low` / etc. | Mode-relative aliases |
| `--palette-color--bg` | `--color--{name}--bg` |
| `--palette-color--bg--contrast` / etc. | Full bg derivatives |
| `--palette-color--stroke` | `--color--{name}--stroke` |
| `--palette-color--stroke--contrast` / etc. | Full stroke derivatives |
| `--palette-color--tint-1` … `--tint-5` | Tint levels |
| `--palette-color--focus` | Focus ring color |

---

## Container — surface variables

Set by `t.container()`, `t.filled()`, or `t.outlined()`.

| Variable | Description |
|----------|-------------|
| `--container--text` | Blended body text color (`contrast × weight--text-blend`) |
| `--container--text-emphasis` | Pure contrast (white or black) |
| `--container--text-deemphasis` | De-emphasized text (`contrast × weight--text-deemphasis-blend`) |
| `--container--stroke` | Border color for the active surface |
| `--container--stroke-width` | Set by `t.stroke()` — resolves `--stroke-width` (default 1px) |

### Layout vars (set via `t.radius()` / `t.padding()`, or custom CSS)

| Variable | Description |
|----------|-------------|
| `--container--radius` | All corners (base fallback) |
| `--container--radius--top` | top-left + top-right |
| `--container--radius--bottom` | bottom-left + bottom-right |
| `--container--radius--left` | top-left + bottom-left |
| `--container--radius--right` | top-right + bottom-right |
| `--container--radius--tl` | top-left only |
| `--container--radius--tr` | top-right only |
| `--container--radius--br` | bottom-right only |
| `--container--radius--bl` | bottom-left only |
| `--container--padding` | All sides (base fallback — defaults to `--space--lg`) |
| `--container--padding-block` | top + bottom |
| `--container--padding-inline` | left + right |
| `--container--padding-block-start` | top only |
| `--container--padding-block-end` | bottom only |
| `--container--padding-inline-start` | left only |
| `--container--padding-inline-end` | right only |
| `--stroke-width` | Override the stroke border width (default 1px) |

### Computed internal vars (read-only)

| Variable | Description |
|----------|-------------|
| `--container--_radius-tl` / `--tr` / `--br` / `--bl` | Resolved per-corner radius after priority cascade |
| `--container--_padding-block-start` / `--block-end` / `--inline-start` / `--inline-end` | Resolved per-side padding including stroke compensation |

---

## Spacing — density-reactive tokens

Set by the theme's density config. Recalculated by `[themeDensity="N"]` scope overrides.

Formula: `base + scale × multiplier`

| Variable | Base | Multiplier | Scale 0 | Scale −2 | Scale +2 |
|----------|------|------------|---------|----------|----------|
| `--space--xxs` | 2px | 1px | 2px | 0px | 4px |
| `--space--xs` | 4px | 1px | 4px | 2px | 6px |
| `--space--sm` | 8px | 2px | 8px | 4px | 12px |
| `--space--md` | 16px | 4px | 16px | 8px | 24px |
| `--space--lg` | 24px | 4px | 24px | 16px | 32px |
| `--space--xl` | 32px | 4px | 32px | 24px | 40px |
| `--space--xxl` | 48px | 4px | 48px | 40px | 56px |

| Variable | Description |
|----------|-------------|
| `--density-scale` | Current scale integer (set by density config or `[themeDensity]`) |

Density can be overridden in a subtree using the `[themeDensity]` HTML attribute, independent of the theme:

```html
<section themeDensity="-2"><!-- compact --></section>
<aside   themeDensity="1"><!-- spacious --></aside>
```

---

## Shape — corner radius tokens

Set by the theme's shape config. Static — same in light and dark.

| Variable | Default |
|----------|---------|
| `--shape--xxs` | 2px |
| `--shape--xs` | 4px |
| `--shape--sm` | 8px |
| `--shape--md` | 12px |
| `--shape--lg` | 16px |
| `--shape--xl` | 28px |
| `--shape--xxl` | 48px |
| `--shape--full` | 9999px |

---

## Typography

Set by the theme's typography config.

| Variable | Description |
|----------|-------------|
| `--typography--plain-family` | Body text font family |
| `--typography--brand-family` | Display/brand font family |
| `--typography--bold-weight` | Bold font weight (default 700) |
| `--typography--medium-weight` | Medium font weight (default 500) |
| `--typography--regular-weight` | Regular font weight (default 400) |

---

## Weights — blend percentages

| Variable | Default | Description |
|----------|---------|-------------|
| `--weight--text-blend` | 82% | Body text opacity on container backgrounds |
| `--weight--text-emphasis-blend` | 96% | Emphasized text opacity |
| `--weight--text-deemphasis-blend` | 55% | De-emphasized text opacity |
| `--weight--text-primary-tint` | 0% | Hue tint toward primary palette |
| `--weight--state-hover` | 8% | Hover overlay opacity |
| `--weight--state-press` | 12% | Press/active overlay opacity |
| `--weight--state-focus` | 12% | Focus overlay opacity |
| `--weight--state-drag` | 16% | Drag overlay opacity |
| `--weight--tint-1` | 10% | Transparent tint level 1 |
| `--weight--tint-2` | 20% | |
| `--weight--tint-3` | 38% | |
| `--weight--tint-4` | 60% | |
| `--weight--tint-5` | 80% | |

---

## Overlay

| Variable | Description |
|----------|-------------|
| `--overlay--scrim` | Modal/dialog backdrop color (default `oklch(0 0 0 / 50%)`) |
| `--overlay--shadow` | Box shadow base color |

---

## Focus ring

| Variable | Default | Description |
|----------|---------|-------------|
| `--focus--width` | 3px | Focus ring stroke width |
| `--focus--offset` | 2px | Offset from element edge |
| `--focus--style` | solid | Border style |

Use with `--palette-color--focus` (set by `apply-palette`):

```css
:focus-visible {
  outline: var(--focus--style) var(--focus--width) var(--palette-color--focus);
  outline-offset: var(--focus--offset);
}
```

---

## Motion

| Variable | Default | Description |
|----------|---------|-------------|
| `--motion--duration-short` | 100ms | |
| `--motion--duration-medium` | 200ms | |
| `--motion--duration-long` | 300ms | |
| `--motion--duration-extra` | 500ms | |
| `--motion--easing-standard` | `cubic-bezier(0.2, 0, 0, 1)` | |
| `--motion--easing-emphasized` | `cubic-bezier(0.2, 0, 0, 1)` | |
| `--motion--easing-decelerate` | `cubic-bezier(0, 0, 0, 1)` | |
| `--motion--easing-accelerate` | `cubic-bezier(0.3, 0, 1, 1)` | |

---

## Elevation

6 levels (0–5). Each level has a shadow var and a tint var. A shadow's colour uses `light-dark()` — it adjusts automatically with `color-scheme`; its offsets and blur are the same in both modes. Tints are percentages and cannot use `light-dark()`.

| Variable | Level 0 | Level 1 | Level 5 |
|----------|---------|---------|---------|
| `--elevation-{N}--shadow` | none | 0 1px 2px light-dark(…) | 0 8px 16px light-dark(…) |
| `--elevation-{N}--tint` | 0% | 5% | 14% |

Use in component CSS:

```css
.card { box-shadow: var(--elevation-2--shadow); }
```

Or use the HTML attribute emitted by `define-core-theme()`:

```html
<div elevated="2">…</div>
```

---

## Animation and CSS transitions

`define-core-theme()` registers what animation needs and nothing derived: the light and dark colour of each core palette role (`--color--{name}[--bg|--stroke|--focus]--mode-light` / `--mode-dark`), for the ten core palettes (`brand` and `tertiary` included), and the scalars `--weight--*`, `--density-scale`, `--space--*`, `--shape--*` — 109 properties. The role tokens and every derivative are plain custom properties holding `light-dark()` and `oklch(from …)` expressions that resolve where they are used.

### Crossfading a theme switch

Transition the registered pairs on the element whose `theme` changes; everything derived from them follows (ladder steps, contrasts, nested themes, dark subtrees). Include a palette's `--bg`, `--stroke` and `--focus` pairs when either theme passes those roles explicitly — core derives the auto values into the same pairs, so the switch interpolates between two real colours:

```css
html {
  transition:
    --color--primary--mode-light 400ms,
    --color--primary--mode-dark 400ms,
    --color--surface--mode-light 400ms,
    --color--surface--mode-dark 400ms;
}
```

```js
document.documentElement.setAttribute('theme', 'rose-red'); // crossfades
```

A light/dark flip and a `palette` attribute change are instant at the variable level; elements that transition `background-color` or `color` still fade.

### Animating weights (hover/press state fades)

`--weight--*` vars are typed as `<percentage>`, which is required for `color-mix()` blend amounts to interpolate:

```css
.button {
  --weight--state-hover: 0%;
  background: color-mix(in oklch, var(--palette-color) var(--weight--state-hover), transparent);
  transition: --weight--state-hover 150ms ease;
}
.button:hover {
  --weight--state-hover: 8%;
}
```

### Animating spacing and radius

```css
.card {
  transition: padding 300ms ease, border-radius 300ms ease;
}
/* Change --space--lg or --shape--md and padding/radius animate automatically */
[themeDensity="-1"] .card {
  /* --space--lg drops from 24px to 20px → padding animates */
}
```

### Why derivatives are not registered

Derivative vars (`--contrast`, `--dark`, `--high`, etc.) are computed using CSS relative color syntax:
```css
--color--primary--dark: oklch(from var(--color--primary) clamp(0, calc(l - 0.12), 1) c h / 1);
```
and `--color--primary` is `light-dark(var(--color--primary--mode-light), var(--color--primary--mode-dark))`. Unregistered, both stay expressions until an element uses them, so a `themeMode` on any element flips them, and when the registered pair transitions the browser re-evaluates them on every frame. Registering them would freeze them to a colour on the element where they are declared.

### Reading a value from JavaScript

`getComputedStyle(el).getPropertyValue('--color--primary')` returns the expression, not a colour. To get the painted colour, read a real property of an element that uses it:

```js
const probe = document.createElement('span');
probe.style.color = 'var(--color--primary)';
el.appendChild(probe);
const colour = getComputedStyle(probe).color;
probe.remove();
```
