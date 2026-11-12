var d=`@use "@cpangular/cp-theming-core/scss/theme" as t;

$my-theme: t.theme(
  $palettes: (
    primary: t.light-dark(
      t.palette(oklch(0.55 0.18 240)),   // light
      t.palette(oklch(0.72 0.16 240))    // dark
    ),
  ),
  $weights: t.light-dark(
    t.weights($text-blend: 82%),         // light
    t.weights($text-blend: 78%)          // dark
  )
);

@include t.define-theme("my-theme", $my-theme);
`;var p=`<div themeMode="light" palette="primary" bg container shape="md">
  themeMode="light"
</div>

<div themeMode="dark" palette="primary" bg container shape="md">
  themeMode="dark"
</div>

<!-- the opposite of the mode around it -->
<div themeMode="invert" palette="primary" bg container shape="md">
  themeMode="invert"
</div>
`;var h=`<div theme="azure-blue" palette="primary" bg container shape="md">
  azure-blue

  <!-- from here down, rose-red's variables -->
  <div theme="rose-red" palette="primary" bg container shape="md">
    rose-red
  </div>
</div>
`;var s=`<!-- subtle tonal fill; the text keeps the palette's colour (chip, pill) -->
<span palette="primary" bg>bg</span>

<!-- solid fill in the palette's colour, text in its contrast colour -->
<span palette="secondary" filled>filled</span>

<!-- inset border in the palette's stroke colour -->
<span palette="error" outlined shape="sm">outlined</span>

<!-- corners and padding -->
<div palette="primary" bg shape="md" container>bg + shape + container</div>
`;export{d,h,p,s};