# Apply mixins

The apply system is a composable set of SCSS mixins for attaching palette colors and container styling to elements. All mixins operate purely through CSS custom properties — no class names or JS required.

## Overview: the layered composition model

Apply mixins form a stack. Each layer builds on the previous:

```
Layer 0 — radius() + padding()   — optional layout overrides
Layer 1 — apply-palette(name)    — selects a palette, sets --palette-color* vars
Layer 1b — tone(modifier)        — optional: shifts the base palette step
Layer 2 — container() | filled() | outlined() — surface treatment, sets --container-* vars
Layer 3 — stroke()               — optional inset border
```

Always call `apply-palette` (or use the `[palette]` attribute) before any Layer 2 mixin.

---

## Single `@use` import

All mixins are accessible from the single entry-point import:

```scss
@use '@cpangular/cp-theming-core/scss/theme' as t;
```

---

## Layer 1: `t.apply-palette($name)`

Selects a named palette by forwarding all `--color--{name}--*` vars onto the `--palette-color--*` namespace on the current element. Also sets `color: var(--palette-color)`.

Downstream mixins (`container`, `filled`, etc.) are palette-agnostic — they always read `--palette-color--*`.

```scss
.my-card {
  @include t.apply-palette(primary);
  @include t.container();
}
```

The `[palette="name"]` HTML attribute does the same thing without writing any SCSS:

```html
<div palette="primary" container>…</div>
```

### `--palette-color--*` vars set by `apply-palette`

| CSS variable | Source |
|-------------|--------|
| `--palette-color` | `--color--{name}` (identity color) |
| `--palette-color--contrast` | `--color--{name}--contrast` |
| `--palette-color--dark` / `--light` / etc. | Full lightness step set |
| `--palette-color--high` / `--low` / etc. | Mode-relative aliases |
| `--palette-color--bg` | `--color--{name}--bg` |
| `--palette-color--bg--contrast` / `--dark` / etc. | Full bg derivatives |
| `--palette-color--stroke` | `--color--{name}--stroke` |
| `--palette-color--stroke--contrast` / etc. | Full stroke derivatives |
| `--palette-color--tint-1` … `--tint-5` | 10%–80% transparent tints |
| `--palette-color--focus` | Per-palette focus ring color |

---

## Layer 1b: `t.tone($modifier)`

Shifts the base `--palette-color` and `--palette-color--bg` variables to a lightness modifier step. All downstream layer 2 mixins then operate on the toned values automatically.

Must be called after `apply-palette`, before `container`/`filled`/`outlined`.

```scss
@include t.apply-palette(primary);
@include t.tone(low);              // use the "low" (lighter in light mode) step as base
@include t.container();
```

| `$modifier` | Description |
|-------------|-------------|
| `high` / `higher` | Mode-relative darker (light mode) / lighter (dark mode) |
| `low` / `lower` | Mode-relative lighter (light mode) / darker (dark mode) |
| `dark` / `darker` | Absolute lightness decrease |
| `light` / `lighter` | Absolute lightness increase |

The `[tone="modifier"]` HTML attribute works with `[palette]`:

```html
<div palette="primary" tone="low" container>…</div>
```

---

## Layer 2: surface mixins

These set `--container--text`, `--container--text-emphasis`, `--container--text-deemphasis`, `--container--stroke`, apply `background-color`, and call the geometry mixin internally.

### `t.container($modifier?)`

Uses the palette's `bg` role as background. Default surface treatment — use for cards, panels, dialogs.

```scss
@include t.container();
@include t.container(high);   // bg--high step as background
```

### `t.filled($modifier?)`

Uses the palette's `color` (identity) role as background. Use for primary action buttons, badges, chips.

```scss
@include t.filled();
@include t.filled(dark);      // identity--dark step as background
```

### `t.outlined()`

Transparent background with palette color text and stroke. Use for ghost buttons, outlined chips.

```scss
@include t.outlined();
```

### Container surface vars set by Layer 2

| CSS variable | Description |
|-------------|-------------|
| `--container--text` | Blended body text (contrast × `--weight--text-blend`) |
| `--container--text-emphasis` | Full contrast — white or black |
| `--container--text-deemphasis` | De-emphasized text (contrast × `--weight--text-deemphasis-blend`) |
| `--container--stroke` | Stroke border color for the active surface |

Use them in component styles:

```css
.card-title { color: var(--container--text-emphasis); }
.card-caption { color: var(--container--text-deemphasis); }
```

---

## Layer 3: `t.stroke()`

Renders an inset `::after` pseudo-element border using `--container--stroke`. The border sits inside the element bounds and shares the computed corner radii from the geometry layer.

Also sets `--container--stroke-width`, which the geometry layer adds to padding automatically so content is never displaced by the border.

```scss
@include t.apply-palette(primary);
@include t.outlined();
@include t.stroke();           // render the inset border
```

Override border width:

```css
.my-card { --stroke-width: 2px; }
```

---

## Layer 0a: `t.radius(…)`

Sets `--container--radius--*` variables on the current element. The geometry layer (called internally by all Layer 2 mixins) resolves per-corner radius from these with the priority:

```
individual corner > top/bottom side > left/right side > all
```

| Parameter | CSS variable set | Description |
|-----------|-----------------|-------------|
| `$all` | `--container--radius` | All corners |
| `$top` | `--container--radius--top` | top-left + top-right |
| `$bottom` | `--container--radius--bottom` | bottom-left + bottom-right |
| `$left` | `--container--radius--left` | top-left + bottom-left |
| `$right` | `--container--radius--right` | top-right + bottom-right |
| `$tl` | `--container--radius--tl` | top-left only |
| `$tr` | `--container--radius--tr` | top-right only |
| `$br` | `--container--radius--br` | bottom-right only |
| `$bl` | `--container--radius--bl` | bottom-left only |

```scss
// Full pill top, squared bottom
@include t.radius($top: var(--shape--full), $bottom: 0px);

// Override just one corner
@include t.radius($br: var(--shape--xl));
```

Use shape tokens from the active theme (`--shape--xxs` through `--shape--full`) or any static length.

---

## Layer 0b: `t.padding(…)`

Sets `--container--padding--*` variables on the current element. The geometry layer resolves per-side padding with the priority:

```
individual side > axis pair > all > --space--lg (density default)
```

Padding automatically adds `--container--stroke-width` (set by `stroke()`) so content is never displaced by an inset border.

| Parameter | CSS variable set | Description |
|-----------|-----------------|-------------|
| `$all` | `--container--padding` | All four sides |
| `$block` | `--container--padding-block` | top + bottom |
| `$inline` | `--container--padding-inline` | left + right |
| `$block-start` | `--container--padding-block-start` | top |
| `$block-end` | `--container--padding-block-end` | bottom |
| `$inline-start` | `--container--padding-inline-start` | left |
| `$inline-end` | `--container--padding-inline-end` | right |

```scss
@include t.padding($block: var(--space--sm), $inline: var(--space--md));
```

All values default to `--space--lg` when unset, which is density-reactive and scales with `--density-scale`.

---

## HTML attributes (emitted by `define-core-theme()`)

These attribute selectors are emitted by `@include t.define-core-theme()` in your root stylesheet.

| HTML | SCSS equivalent |
|------|----------------|
| `palette="primary"` | `@include t.apply-palette(primary)` |
| `palette="primary" container` | `apply-palette` + `container()` |
| `palette="primary" filled` | `apply-palette` + `filled()` |
| `palette="primary" outlined` | `apply-palette` + `outlined()` |
| `palette="primary" tone="low" container` | `apply-palette` + `tone(low)` + `container()` |
| `class="stroke"` | `@include t.stroke()` |
| `elevated="2"` | `box-shadow: var(--elevation-2--shadow)` |
| `themeDensity="-2"` | Override density scale to -2 on this subtree |

```html
<!-- A filled card with a border and reduced density -->
<article palette="surface" container themeDensity="-1">
  <header palette="primary" filled>…</header>
</article>
```
