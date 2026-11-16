# @acme/theme

The Acme theme for [cp-theming](../../README.md), as a package: one theme, the same in every app
Acme builds.

> This is an example. Acme does not exist and the package is never published (`private: true`).
> It is shaped exactly like a package a company would publish, and it is the worked example of
> the docs' Learn chapter 11, "Ship your theme as a package", and of the "Theme packages" guide.
> Copy the folder, change the name and the colours, and remove `private`.

## Install

The package does not contain cp-theming. Install both:

```sh
pnpm add @acme/theme @cpangular/cp-theming-core
```

## Use it with Sass

```scss
@use "@cpangular/cp-theming-core/scss/theme" as t;
@use "@acme/theme" as acme;

@include t.define-core-theme(); // core: once per app, before any theme
@include acme.define();
```

`acme.define()` writes the theme as `[theme="acme"]` and makes it the default of a page that names
no theme. In an app that has a default theme of its own, write `acme.define($default: false)`.

The theme is also there as a variable, `acme.$theme`, for an app that wants to read it.

## Use it without Sass

Load two compiled files, cp-theming's core first:

```css
@import "@cpangular/cp-theming-core/css/core";
@import "@acme/theme/css";
```

or, in a page with no build step:

```html
<link rel="stylesheet" href="node_modules/@cpangular/cp-theming-core/dist/core.css" />
<link rel="stylesheet" href="node_modules/@acme/theme/dist/acme.css" />
```

`dist/acme.css` is what `acme.define()` writes, compiled. It is always the default theme; an app
that needs `$default: false` uses Sass.

## In the HTML

```html
<main theme="acme">…</main>
```

That attribute is all an app's HTML needs. With the theme as the default, a page without the
attribute is Acme's too. Everything else is cp-theming's: `palette`, `bg`, `filled`, `outlined`,
`themeMode` and the `--color--*` variables work inside the theme as its docs describe.

## Change one palette in your app

The theme's rule gives way to any rule of your own. A palette's colour is a pair of custom
properties, its light value and its dark value. Set the pair, after the theme, in plain CSS:

```css
[theme="acme"] {
  --color--tertiary--mode-light: #b3261e;
  --color--tertiary--mode-dark: #ffb4ab;
}
```

The rule has to match the element that carries the theme: a pair set on `:root` does not reach
an element with `theme="acme"`, because the theme sets the pair on that element itself. If the
page also relies on the theme being the default (parts of it have no `theme` attribute), write
the rule for both: `:root, [theme="acme"] { … }`.

The palette's steps, contrasts and roles follow the pair. So do the palettes cp-theming generates
from that palette: set the primary and the secondary follows. A palette the package passes
itself, as it does the tertiary, stays as the package has it.

## What is in the package

`pnpm run pack:check` builds the CSS and lists these files, and nothing else:

```text
package.json
README.md
_index.scss
scss/_index.scss
scss/acme.scss
dist/acme.css
```

| File | What it is |
|---|---|
| `scss/_index.scss` | The theme: `$theme`, built with `t.theme()`, and the `define()` mixin |
| `_index.scss` | One line that passes `scss/_index.scss` on, so `@use "@acme/theme"` finds it in every Sass tool |
| `scss/acme.scss` | The entry that compiles to `dist/acme.css`: it includes `define()` |
| `dist/acme.css` | The compiled theme. Built by `pnpm run build`, not committed, published |

## Versions

cp-theming is a peer dependency: the app installs it and so decides its version, and there is
one copy of core in the app however many theme packages it uses.

- The peer range is a caret range on the cp-theming version this package was built and checked
  against. In this repository it is written `workspace:^`, which pnpm replaces with that range
  when it packs. In a package outside the repository, write the range itself, such as `^0.1.0`.
- While cp-theming is at `0.x`, a caret range covers patch releases only (`^0.1.0` is `0.1.x`).
  When cp-theming releases `0.2.0`, rebuild, check the theme in an app, widen the range and
  release this package. From `1.0.0` a caret range covers every release of that major.
- Version this package by what its apps see. A changed colour or corner is a minor release. A
  new peer range that drops a cp-theming version, a renamed theme or a removed palette is a major
  one.

## Build

```sh
pnpm run build        # scss/acme.scss -> dist/acme.css
pnpm run pack:check   # build, then list what would be published
```
