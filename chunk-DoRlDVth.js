import {K}from'./chunk-OyUYdTmh.js';import {D,I}from'./chunk-BIiBbc_z.js';import {r}from'./chunk-PDEPeMdV.js';import'./chunk-OfBABVD5.js';import {T as Td,p as pa,f as TS,A as Ad,x as xa,m as hv,z as zI}from'./main-PSPEVRAY.js';import'./chunk-jf2QdeWO.js';var u=`@use "@cpangular/cp-theming-core/scss/theme" as t;

// All this theme passes is the brand colour.
$sunny: t.theme(
  $brand: #ffb300,
);

@include t.define-core-theme();
@include t.define-theme("sunny", $sunny);
`;var y=`<div theme="sunny" themeMode="light" class="page">
  <p class="in-brand">This sentence is in the brand colour.</p>
  <p class="in-primary">This sentence is in the primary.</p>

  <div class="chain">
    <span class="brand">brand</span>
    <span class="primary">primary</span>
    <span class="secondary">secondary</span>
    <span class="tertiary">tertiary</span>
    <span class="background">background</span>
    <span class="surface">surface</span>
  </div>
</div>
`;var f=`.page {
  background: var(--color--background);
  color: var(--color--background--contrast);
}

.in-brand {
  color: var(--color--brand);
}
.in-primary {
  color: var(--color--primary);
}

/* Each palette's colour, with the text that reads on it. */
.brand {
  background: var(--color--brand);
  color: var(--color--brand--contrast);
}
.primary {
  background: var(--color--primary);
  color: var(--color--primary--contrast);
}
.secondary {
  background: var(--color--secondary);
  color: var(--color--secondary--contrast);
}
.tertiary {
  background: var(--color--tertiary);
  color: var(--color--tertiary--contrast);
}
.background {
  background: var(--color--background);
  color: var(--color--background--contrast);
}
.surface {
  background: var(--color--surface);
  color: var(--color--surface--contrast);
}

/* Layout only. */
.page {
  padding: 20px;
}
p {
  margin: 0 0 6px;
  font-size: 17px;
  font-weight: 500;
}
.chain {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  margin-top: 16px;
  border: 1px solid var(--color--surface--stroke);
}
.chain span {
  padding: 26px 10px 10px;
  font: 12px/1.4 ui-monospace, monospace;
}
`;var g=`<div theme="sunny" themeMode="dark" class="page">
  <p class="in-brand">This sentence is in the brand colour.</p>
  <p class="in-primary">This sentence is in the primary.</p>

  <div class="chain">
    <span class="brand">brand</span>
    <span class="primary">primary</span>
    <span class="secondary">secondary</span>
    <span class="tertiary">tertiary</span>
    <span class="background">background</span>
    <span class="surface">surface</span>
  </div>
</div>
`;var b=`@use "@cpangular/cp-theming-core/scss/theme" as t;

// The brand colour, and a secondary of our own. The rest is still generated.
$sunny: t.theme(
  $brand: #ffb300,
  $palettes: (
    secondary: t.palette(#00695c),
  ),
);

@include t.define-core-theme();
@include t.define-theme("sunny", $sunny);
`;var x=`@use "@cpangular/cp-theming-core/scss/theme" as t;

// No brand: a primary of our own. The brand palette is that primary, and
// secondary and tertiary are generated from it.
$sunny: t.theme(
  $palettes: (
    primary: t.palette(#00695c),
  )
);

@include t.define-core-theme();
@include t.define-theme("sunny", $sunny);
`;var w=class d{files={"theme.scss":u,"example.html":y,"example.scss":f,"try-dark.html":g,"try-secondary.theme.scss":b,"try-primary.theme.scss":x};example=[{frame:"example",label:"Example"}];tryIt=[{frame:"try-dark",label:"Dark"},{frame:"try-secondary",label:"Own secondary"},{frame:"try-primary",label:"Primary, no brand"}];static \u0275fac=function(i){return new(i||d)};static \u0275cmp=Td({type:d,selectors:[["cpa-learn-generated"]],decls:91,vars:7,consts:[[3,"n"],["chapterExample",""],[1,"learn-lead"],["chapter","03-generated",3,"files","frames"],["chapterIdea",""],["name","--color--brand"],[1,"learn-chain"],["name","--color--{name}--contrast"],["chapterCode",""],["name","$palettes"],["name","t.theme()"],["name","$brand"],["lang","scss",3,"code"],["chapterTry",""],["name","themeMode","value","dark"],["chapterNow",""]],template:function(i,n){i&1&&(pa(0,"cpa-chapter",0)(1,"div",1)(2,"p",2),TS(3," This theme was given one colour, a bright amber, as its brand colour. It has six palettes, shown as six swatches under the two sentences. "),Ad(),xa(4,"cpa-live-example",3),Ad(),pa(5,"div",4)(6,"p"),TS(7," A brand colour is chosen to be recognised, not to be read. The first sentence of the example is written in this amber and is hard to read on a light page. A theme that used it as its main colour would have links and buttons nobody can read. "),Ad(),pa(8,"p"),TS(9," So the brand colour is passed on its own, apart from the palettes, and treated differently. It becomes a palette named "),pa(10,"em"),TS(11,"brand"),Ad(),TS(12,". That palette's colour, "),xa(13,"cpa-ref",5),TS(14,", is exactly the colour you passed, in light mode and in dark mode. It is never adjusted. Use it where the colour has to be exact, such as a logo or a banner. "),Ad(),pa(15,"p"),TS(16," The other palettes are generated from it in a fixed order, a chain. Primary comes from the brand. Secondary and tertiary come from primary. Background and surface come from the brand: "),Ad(),pa(17,"p",6),TS(18,"brand \u2192 primary \u2192 secondary and tertiary"),Ad(),pa(19,"p",6),TS(20,"brand \u2192 background and surface"),Ad(),pa(21,"ul")(22,"li")(23,"strong"),TS(24,"primary"),Ad(),TS(25," is the brand colour made dark or light enough to read. It keeps the hue, which is the kind of colour it is (amber stays amber), and is made darker for light mode and lighter for dark mode. The second sentence of the example is in it. This is the palette for links, buttons and anything that should look like the brand and still be readable. "),Ad(),pa(26,"li")(27,"strong"),TS(28,"secondary"),Ad(),TS(29," is the primary with most of its colour taken out: a quiet companion. "),pa(30,"strong"),TS(31,"tertiary"),Ad(),TS(32," is the primary with its hue moved part of the way round the colour wheel, here from amber to green: a second colour that goes with the first. "),Ad(),pa(33,"li")(34,"strong"),TS(35,"background"),Ad(),TS(36," and "),pa(37,"strong"),TS(38,"surface"),Ad(),TS(39," are nearly white in light mode and nearly black in dark mode, with a trace of the brand's hue. Background is for the page; surface is for what sits on the page, such as a card. The example shows only their swatches. "),Ad()(),pa(40,"p"),TS(41," All six are palettes like the one in chapter 1. Each has its steps, its contrasts, its soft background and its border colour under its own name: with "),pa(42,"em"),TS(43,"secondary"),Ad(),TS(44," as the name, "),xa(45,"cpa-ref",7),TS(46," is the text on the secondary swatch. The generated colours are formulas too, worked out by the browser like the steps. "),Ad(),pa(47,"p"),TS(48," The rule is: "),pa(49,"strong"),TS(50,"pass what you have"),Ad(),TS(51,". A palette you pass is used exactly as you passed it, in both modes. A palette you leave out is generated from the palette before it in the chain, whether you passed that one or it was generated too. Nothing is generated from secondary, so passing your own secondary changes that palette and nothing else. "),Ad(),pa(52,"p"),TS(53," If you pass a primary and no brand, as chapters 1 and 2 did, the brand palette is that primary, and secondary and tertiary are generated from it. Background and surface come only from a brand you pass, so this theme does not generate them. It takes them from around it: in this chapter's examples, the plain neutrals of a page with no theme. Chapter 6 is about what a theme takes from around it. (A theme on the "),pa(54,"code"),TS(55,"<html>"),Ad(),TS(56," element has nothing around it. There background and surface take a trace of the primary's hue.) "),Ad()(),pa(57,"div",8)(58,"p"),TS(59," The brand colour is not one of the palettes in "),xa(60,"cpa-ref",9),TS(61,". It has an argument of "),xa(62,"cpa-ref",10),TS(63," to itself, "),xa(64,"cpa-ref",11),TS(65,": "),Ad(),xa(66,"cpa-code",12),pa(67,"p"),TS(68," To replace one generated palette, pass it by name in "),xa(69,"cpa-ref",9),TS(70,", the way chapter 1 passed primary. Here the theme has its own secondary and keeps the rest: "),Ad(),xa(71,"cpa-code",12),Ad(),pa(72,"div",13)(73,"ul")(74,"li")(75,"strong"),TS(76,"Dark."),Ad(),TS(77," The example's HTML with "),xa(78,"cpa-ref",14),TS(79,". The brand swatch is the same amber. The primary is now a lighter amber, generated for dark mode. On a dark page the brand colour happens to be readable too; that is luck of this colour, not something to rely on. "),Ad(),pa(80,"li")(81,"strong"),TS(82,"Own secondary."),Ad(),TS(83," The second stylesheet in the code above. Only the secondary swatch changes. "),Ad(),pa(84,"li")(85,"strong"),TS(86,"Primary, no brand."),Ad(),TS(87," The theme passes a green primary and nothing else. Secondary and tertiary now come from the green, and the brand swatch shows the same green, so both sentences are readable. Background and surface are the plain neutrals, with no trace of green. "),Ad()(),xa(88,"cpa-live-example",3),Ad(),pa(89,"span",15),TS(90," start a theme from a brand colour alone, say which of its six palettes are exact and which are generated, and replace any one of them with a colour of your own. "),Ad()()),i&2&&(hv("n",3),zI(4),hv("files",n.files)("frames",n.example),zI(62),hv("code",n.files["theme.scss"]),zI(5),hv("code",n.files["try-secondary.theme.scss"]),zI(17),hv("files",n.files)("frames",n.tryIt));},dependencies:[D,K,r,I],encapsulation:2})};export{w as GeneratedChapterComponent};