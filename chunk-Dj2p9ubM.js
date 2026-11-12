var a=`/* presets/azure-blue.css \u2014 the theme rule holds what its author passed:
   the light and the dark colour, and the token that joins them. */
:where([theme=azure-blue]):not(cp-theming-none), :where(:root) {
  --color--primary--mode-light: oklch(43% 0.19 253deg);
  --color--primary--mode-dark: oklch(72% 0.17 253deg);
  --color--primary: light-dark(var(--color--primary--mode-light), var(--color--primary--mode-dark));
}

/* core.css \u2014 1 (white text) when the colour's relative luminance is below
   0.179, else 0 (black text). r, g and b are the linear-sRGB channels. */
:where(:root) {
  --theme--_contrast-step: clamp(0, (0.179 - (0.2126 * clamp(0, r, 1) + 0.7152 * clamp(0, g, 1) + 0.0722 * clamp(0, b, 1))) * 1e6, 1);
}

/* core.css \u2014 every derivation, once for all themes. The browser computes
   each one from the theme's colour on the element that uses it. */
:where(:root, [theme]) {
  --color--primary--dark: oklch(from var(--color--primary) clamp(0, l - 0.12, 1) c h/1);
  --color--primary--light: oklch(from var(--color--primary) clamp(0, l + 0.12, 1) c h/1);
  --color--primary--high: light-dark(var(--color--primary--dark), var(--color--primary--light));
  --color--primary--contrast: oklch(from color(from var(--color--primary) srgb-linear var(--theme--_contrast-step) var(--theme--_contrast-step) var(--theme--_contrast-step)) l 0 0 / 1);

  --color--primary--bg--mode-light: oklch(from var(--color--primary--mode-light) 0.92 calc(c * var(--bg-chroma, 0.4)) h/1);
  --color--primary--bg--mode-dark: oklch(from var(--color--primary--mode-dark) 0.24 calc(c * var(--bg-chroma, 0.4)) h/1);
  --color--primary--stroke--mode-light: oklch(from var(--color--primary--mode-light) clamp(0.42, l, 0.6) c h/1);
  --color--primary--focus--mode-light: oklch(from var(--color--primary--mode-light) clamp(0.1, 1 - l, 0.9) c calc(h + 60)/1);

  --color--primary--tint-1: light-dark(oklch(from var(--color--primary) l c h/var(--weight--tint-1--mode-light, 10%)), oklch(from var(--color--primary) l c h/var(--weight--tint-1--mode-dark, 10%)));
}
`;var c=`@use "@cpangular/cp-theming-core/scss/theme" as t;

$my-theme: t.theme(
  // the brand colour: the \`brand\` palette, --color--brand, never adjusted
  $brand: #0b57d0,
  $palettes: (
    // primary, tertiary, background and surface are left out:
    // core generates them from the brand

    // a separate colour for light and for dark mode
    secondary: t.light-dark(
      t.palette(oklch(0.55 0.18 240)),   // light mode
      t.palette(oklch(0.72 0.16 240))    // dark mode
    ),

    // the same colour in both modes, in any CSS colour format
    error: t.palette(rgb(186 26 26)),

    // any other name is a custom palette, registered on demand
    accent: t.palette(hsl(150 60% 35%)),
  )
);

@include t.define-theme("my-theme", $my-theme);
`;var h=`@use "@cpangular/cp-theming-core/scss/theme" as t;

$my-theme: t.theme(
  $palettes: (
    // Override individual roles
    primary: t.palette(
      $base:   oklch(0.55 0.18 240),
      $color:  oklch(0.50 0.20 240),   // identity colour (defaults to $base)
      $bg:     oklch(0.88 0.06 240),   // tonal background role
      $stroke: oklch(0.45 0.16 240),   // border role
      $focus:  oklch(0.40 0.22 240)    // focus ring
    ),
  )
);

@include t.define-theme("my-theme", $my-theme);
`;export{a,c,h};