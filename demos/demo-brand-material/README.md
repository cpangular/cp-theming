# @acme/theme-material

The Acme theme for apps that use Angular Material: [`@acme/theme`](../demo-brand-core/README.md)
together with cp-theming's Material adapter and Acme's own component patches, behind one include.

> This is an example. Acme does not exist and the package is never published (`private: true`).
> It is the second worked example of the docs' "Theme packages" guide: what a company adds when
> its apps use Angular Material.

## Install

```sh
pnpm add @acme/theme-material @cpangular/cp-theming-core @cpangular/cp-theming-ng-material
```

`@acme/theme` comes with it. cp-theming and its adapter are peer dependencies; Angular Material
is the adapter's.

## Use it with Sass

```scss
@use "@cpangular/cp-theming-core/scss/theme" as t;
@use "@acme/theme-material" as acme;

@include t.define-core-theme(); // core: once per app, before any theme
@include acme.define();
```

`acme.define()` includes, in cp-theming's load order:

1. the theme, `[theme="acme"]`, from `@acme/theme` (the default theme unless you pass
   `$default: false`);
2. the adapter, `define-ng-material-core-theme()`: every `--mat-sys-*` variable Angular Material
   reads, from the theme's variables;
3. the adapter's patches, `apply-material-overrides()`, and its density scopes;
4. Acme's own patches, `overrides()`: Acme's buttons are rounded rectangles with the theme's
   medium corner, not Material's pills.

Do not include `@acme/theme` or the adapter's mixins beside it: they are in it.

## Use it without Sass

Load two compiled files, cp-theming's core first:

```css
@import "@cpangular/cp-theming-core/css/core";
@import "@acme/theme-material/css";
```

`dist/acme-material.css` takes the place of `@acme/theme`'s `acme.css` and of the adapter's
`material-core.css` and `material-overrides.css`. Load none of them beside it.

## In the HTML

```html
<main theme="acme">…</main>
```

Material's components inside it take the theme's colours, in light and dark, and follow a
`palette` scope, as the adapter's docs describe. To change one palette in your app, see
[`@acme/theme`](../demo-brand-core/README.md#change-one-palette-in-your-app).

## What is in the package

`pnpm run pack:check` builds the CSS and lists these files, and nothing else:

```text
package.json
README.md
_index.scss
scss/_index.scss
scss/acme-material.scss
dist/acme-material.css
```

| File | What it is |
|---|---|
| `scss/_index.scss` | `define()` and Acme's `overrides()`; passes on `$theme` from `@acme/theme` |
| `_index.scss` | One line that passes `scss/_index.scss` on, so `@use "@acme/theme-material"` finds it in every Sass tool |
| `scss/acme-material.scss` | The entry that compiles to `dist/acme-material.css`: it includes `define()` |
| `dist/acme-material.css` | The compiled theme and Material mapping. Built by `pnpm run build`, not committed, published |

## Versions

`@acme/theme` is a dependency and is released together with this package.
`@cpangular/cp-theming-core` and `@cpangular/cp-theming-ng-material` are peer dependencies, with
the caret ranges and the release rule described in
[`@acme/theme`](../demo-brand-core/README.md#versions). The adapter states which Angular Material
it works with; a new Angular Material major means a new adapter, then a new release of this
package.

Building this package needs `@angular/material` installed (a dev dependency here), because the
adapter's Sass reads Angular Material's own role tables.

## Build

```sh
pnpm run build        # scss/acme-material.scss -> dist/acme-material.css
pnpm run pack:check   # build, then list what would be published
```
