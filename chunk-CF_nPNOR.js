import {K}from'./chunk-OyUYdTmh.js';import {D,I}from'./chunk-BIiBbc_z.js';import'./chunk-OfBABVD5.js';import {T as Td,p as pa,f as TS,A as Ad,x as xa,m as hv,z as zI}from'./main-PSPEVRAY.js';import'./chunk-jf2QdeWO.js';var h=`@use "@cpangular/cp-theming-core/scss/theme" as t;

$studio: t.theme(
  $palettes: (
    primary: t.palette(#7a3fd1),
  )
);

@include t.define-core-theme();
@include t.define-theme("studio", $studio);
`;var f=`<div theme="studio">
  <!-- palette picks a palette for an element and what is inside it -->
  <p palette="primary">palette="primary" gives text in the palette's colour.</p>

  <!-- three ways to paint it, alone and together -->
  <p>
    <span palette="primary" bg>bg</span>
    <span palette="primary" filled>filled</span>
    <span palette="primary" outlined>outlined</span>
    <span palette="primary" bg outlined>bg outlined</span>
    <span palette="primary" filled outlined>filled outlined</span>
  </p>

  <!-- tone slides the whole palette one step: high stands out more, low less -->
  <p>
    <span palette="primary" filled tone="low">tone="low"</span>
    <span palette="primary" filled>no tone</span>
    <span palette="primary" filled tone="high">tone="high"</span>
  </p>

  <!-- composed: a scope inside a scope, and an element of our own -->
  <div palette="secondary" bg class="panel">
    <strong>secondary, bg</strong>
    <span palette="tertiary" filled>tertiary, filled</span>
    <span class="count">3</span>
  </div>

  <div palette="tertiary" filled class="panel">
    <strong>tertiary, filled</strong>
    <span class="quiet">a quieter line</span>
  </div>
</div>
`;var u=`/* An element of our own. It names no palette: it reads the one it is in. */
.count {
  background: var(--palette-color);
  color: var(--palette-color--contrast);
}

/* Text that steps back, on whatever filled puts behind it. */
.quiet {
  color: var(--container--text-deemphasis);
}

/* Layout only. */
p {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 0 0 18px;
}
.panel {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0 5px 14px;
  padding: 14px;
}
.count {
  margin-left: auto;
  padding: 0 9px;
  border-radius: 99px;
}
`;var x=`<div theme="studio">
  <p class="note">A class that applies the primary palette.</p>

  <p>
    <span class="soft">bg</span>
    <span class="solid">filled</span>
    <span class="line">outlined</span>
    <span class="soft line">bg outlined</span>
    <span class="solid line">filled outlined</span>
  </p>

  <p>
    <span class="solid low">tone low</span>
    <span class="solid">no tone</span>
    <span class="solid high">tone high</span>
  </p>

  <div class="panel muted">
    <strong>secondary, bg</strong>
    <span class="accent">tertiary, filled</span>
    <span class="count">3</span>
  </div>

  <div class="panel accent">
    <strong>tertiary, filled</strong>
    <span class="quiet">a quieter line</span>
  </div>
</div>
`;var g=`@use "@cpangular/cp-theming-core/scss/theme" as t;

// palette="primary"
.note,
.soft,
.solid,
.line {
  @include t.apply-palette("primary");
}

// tone, after the palette and before the fill
.low {
  @include t.tone(low);
}
.high {
  @include t.tone(high);
}

// bg, filled, outlined
.soft {
  @include t.bg();
}
.solid {
  @include t.filled();
}
.line {
  @include t.outlined();
}

// palette="secondary" bg
.muted {
  @include t.apply-palette("secondary");
  @include t.bg();
}

// palette="tertiary" filled
.accent {
  @include t.apply-palette("tertiary");
  @include t.filled();
}

// The rest is the example's own stylesheet, unchanged.
.count {
  background: var(--palette-color);
  color: var(--palette-color--contrast);
}
.quiet {
  color: var(--container--text-deemphasis);
}

p {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 0 0 18px;
}
.panel {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0 5px 14px;
  padding: 14px;
}
.count {
  margin-left: auto;
  padding: 0 9px;
  border-radius: 99px;
}
`;var y=`<div theme="studio">
  <!-- every palette="primary" is now palette="tertiary" -->
  <p palette="tertiary">palette="tertiary" gives text in the palette's colour.</p>

  <p>
    <span palette="tertiary" bg>bg</span>
    <span palette="tertiary" filled>filled</span>
    <span palette="tertiary" outlined>outlined</span>
    <span palette="tertiary" bg outlined>bg outlined</span>
    <span palette="tertiary" filled outlined>filled outlined</span>
  </p>

  <p>
    <span palette="tertiary" filled tone="low">tone="low"</span>
    <span palette="tertiary" filled>no tone</span>
    <span palette="tertiary" filled tone="high">tone="high"</span>
  </p>

  <!-- the panels trade palettes; the badge follows without being told -->
  <div palette="primary" bg class="panel">
    <strong>primary, bg</strong>
    <span palette="secondary" filled>secondary, filled</span>
    <span class="count">3</span>
  </div>

  <div palette="secondary" filled class="panel">
    <strong>secondary, filled</strong>
    <span class="quiet">a quieter line</span>
  </div>
</div>
`;var w=class o{files={"theme.scss":h,"example.html":f,"example.scss":u,"classes.html":x,"classes.scss":g,"try-swapped.html":y};example=[{frame:"example",label:"Example"}];classes=[{frame:"classes",label:"With classes"}];tryIt=[{frame:"example",label:"As above"},{frame:"try-swapped",label:"Palettes swapped"}];static \u0275fac=function(s){return new(s||o)};static \u0275cmp=Td({type:o,selectors:[["cpa-learn-scopes"]],decls:116,vars:7,consts:[[3,"n"],["chapterExample",""],[1,"learn-lead"],["chapter","05-scopes",3,"files","frames"],["chapterIdea",""],["name","palette"],["name","--palette-color"],["name","--palette-color--contrast"],["name","--palette-color--bg"],["name","--palette-color--stroke"],["name","bg"],["name","filled"],["name","outlined"],["name","tone"],["name","--container--text"],["name","--container--text-deemphasis"],["name","--container--stroke"],["chapterCode",""],["name","t.apply-palette()"],["name","t.bg()"],["name","t.filled()"],["name","t.outlined()"],["name","t.tone()"],["chapterTry",""],["chapterNow",""]],template:function(s,n){s&1&&(pa(0,"cpa-chapter",0)(1,"div",1)(2,"p",2),TS(3," Only the round badge and the quieter line are coloured by the example's stylesheet. The attributes in the HTML colour everything else. "),Ad(),xa(4,"cpa-live-example",3),Ad(),pa(5,"div",4)(6,"p"),TS(7," The component in chapter 4 named its palette in every rule, so it needed Sass's "),pa(8,"code"),TS(9,"@each"),Ad(),TS(10," to write each rule again for every palette. Most of the time a piece of a page should not know which palette it is in. cp-theming's attributes split the question in two: which palette, and what to paint with it. "),Ad(),pa(11,"p"),xa(12,"cpa-ref",5),TS(13,` answers the first. Putting an element in a palette does two things to it and to everything inside it. The text takes the palette's colour. And a set of variables is filled in that mean "the palette I am in": `),xa(14,"cpa-ref",6),TS(15,", "),xa(16,"cpa-ref",7),TS(17,", and one for each role of chapter 4, such as "),xa(18,"cpa-ref",8),TS(19," and "),xa(20,"cpa-ref",9),TS(21,". An element with "),xa(22,"cpa-ref",5),TS(23,", together with everything inside it, is called a "),pa(24,"strong"),TS(25,"scope"),Ad(),TS(26,". The round badge in the example reads "),xa(27,"cpa-ref",6),TS(28," and names no palette, so it takes the colour of the scope it is in: secondary here, and primary in the Try it below. "),Ad(),pa(29,"p"),TS(30," Three more attributes paint. These are the "),pa(31,"strong"),TS(32,"surfaces"),Ad(),TS(33," of the chapter's title. Each goes on the same element as "),xa(34,"cpa-ref",5),TS(35," and paints with that palette: "),Ad(),pa(36,"ul")(37,"li"),xa(38,"cpa-ref",10),TS(39," paints the soft background, the bg role of chapter 4: pale in light mode, deep in dark mode. The text keeps the palette's colour. "),Ad(),pa(40,"li"),xa(41,"cpa-ref",11),TS(42," paints the palette's colour itself. The text becomes its contrast, black or white, because the palette's colour is now behind the text and cannot also be the text. "),Ad(),pa(43,"li"),xa(44,"cpa-ref",12),TS(45," draws a border in the stroke role and leaves the text alone. On its own it gives an outline with nothing inside. With "),xa(46,"cpa-ref",10),TS(47," it adds an edge to the fill. With "),xa(48,"cpa-ref",11),TS(49," the edge is drawn in the soft background colour, a faint line around the fill. "),Ad()(),pa(50,"p"),TS(51," One exception concerns background and surface, the palettes of chapter 3 that pages and cards are painted with. Their colour and their soft background are the same colour, so "),xa(52,"cpa-ref",10),TS(53," on those two makes the text the contrast, as "),xa(54,"cpa-ref",11),TS(55," does. This example does not use them. Chapter 6 does. "),Ad(),pa(56,"p"),xa(57,"cpa-ref",13),TS(58," slides the scope along the steps from chapter 2. With "),pa(59,"code"),TS(60,'tone="high"'),Ad(),TS(61," the scope's colour becomes its high step, darker in light mode and lighter in dark mode. With "),pa(62,"code"),TS(63,'tone="low"'),Ad(),TS(64," it becomes the low step. Whatever is painted from the scope moves with it: the fill, and the text colour that goes with it. "),Ad(),pa(65,"p"),xa(66,"cpa-ref",11),TS(67," also tells what is inside it which text colours read on its fill, in variables whose names start with "),pa(68,"em"),TS(69,"container"),Ad(),TS(70,". "),xa(71,"cpa-ref",14),TS(72," is the contrast, and "),xa(73,"cpa-ref",15),TS(74,' is a quieter version for a secondary line: "a quieter line" in the example uses it. '),xa(75,"cpa-ref",10),TS(76," does not set them. One more, "),xa(77,"cpa-ref",16),TS(78,", is the colour "),xa(79,"cpa-ref",12),TS(80," draws with. "),xa(81,"cpa-ref",5),TS(82," sets it to the stroke role, and "),xa(83,"cpa-ref",11),TS(84," changes it to the soft background. "),Ad(),pa(85,"p"),TS(86," Scopes go inside scopes, and the nearest one wins. The tertiary chip sits in the secondary panel and stays tertiary. The badge beside it has no palette of its own, so it takes the panel's secondary. "),Ad()(),pa(87,"div",17)(88,"p"),TS(89," The attributes are a shorthand. Each has a Sass mixin that does the same in a class of your own: "),xa(90,"cpa-ref",18),TS(91,", "),xa(92,"cpa-ref",19),TS(93,", "),xa(94,"cpa-ref",20),TS(95,", "),xa(96,"cpa-ref",21),TS(97," and "),xa(98,"cpa-ref",22),TS(99,". This is the example again with classes in the HTML and the mixins in the stylesheet. Include the palette first, then the tone, then the fill, even when they are in separate rules as here: where two of them set the same property, the later rule wins. "),Ad(),xa(100,"cpa-live-example",3),Ad(),pa(101,"div",23)(102,"ul")(103,"li")(104,"strong"),TS(105,"Palettes swapped."),Ad(),TS(106," Every "),pa(107,"code"),TS(108,"primary"),Ad(),TS(109," in the HTML is now "),pa(110,"code"),TS(111,"tertiary"),Ad(),TS(112,", and the two panels have other palettes. No stylesheet changed. The fills, borders, text colours and the badge all follow. "),Ad()(),xa(113,"cpa-live-example",3),Ad(),pa(114,"span",24),TS(115," colour any piece of a page with attributes alone, know which text colour each fill gives and why, and write an element of your own that takes its colours from the scope it is put in. "),Ad()()),s&2&&(hv("n",5),zI(4),hv("files",n.files)("frames",n.example),zI(96),hv("files",n.files)("frames",n.classes),zI(13),hv("files",n.files)("frames",n.tryIt));},dependencies:[D,K,I],encapsulation:2})};export{w as ScopesChapterComponent};