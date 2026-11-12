import {K}from'./chunk-OyUYdTmh.js';import {D,I}from'./chunk-BIiBbc_z.js';import {r}from'./chunk-PDEPeMdV.js';import'./chunk-OfBABVD5.js';import {T as Td,p as pa,f as TS,A as Ad,x as xa,m as hv,z as zI}from'./main-PSPEVRAY.js';import'./chunk-jf2QdeWO.js';var u=`@use "@cpangular/cp-theming-core/scss/theme" as t;

// The outer theme passes a brand colour: all six palettes follow from it.
$harbour: t.theme(
  $brand: #1565c0,
);

// Three themes to nest inside it. Each passes one thing.
$ember: t.theme(
  $brand: #e65100,
);

$moss: t.theme(
  $palettes: (
    primary: t.palette(#2e7d32),
  )
);

$plum: t.theme(
  $palettes: (
    secondary: t.palette(#ad1457),
  )
);

// Core once, then every theme. They live side by side in one stylesheet.
@include t.define-core-theme();
@include t.define-theme("harbour", $harbour);
@include t.define-theme("ember", $ember);
@include t.define-theme("moss", $moss);
@include t.define-theme("plum", $plum);
`;var y=`<div theme="harbour" palette="background" bg class="page">
  <h4>theme="harbour" passes a brand colour</h4>
  <p class="chain">
    <span palette="brand" filled>brand</span>
    <span palette="primary" filled>primary</span>
    <span palette="secondary" filled>secondary</span>
    <span palette="tertiary" filled>tertiary</span>
    <span palette="surface" bg>surface</span>
  </p>

  <div class="inside">
    <!-- a brand: everything follows from it, so nothing is left to inherit -->
    <section theme="ember" palette="background" bg>
      <h4>theme="ember" passes a brand colour</h4>
      <p class="chain">
        <span palette="brand" filled>brand <em>passed</em></span>
        <span palette="primary" filled>primary <em>generated</em></span>
        <span palette="secondary" filled>secondary <em>generated</em></span>
        <span palette="tertiary" filled>tertiary <em>generated</em></span>
        <span palette="surface" bg>surface <em>generated</em></span>
      </p>
    </section>

    <!-- a primary: secondary and tertiary follow from it, background and surface do not -->
    <section theme="moss" palette="background" bg>
      <h4>theme="moss" passes a primary</h4>
      <p class="chain">
        <span palette="brand" filled>brand <em>its primary</em></span>
        <span palette="primary" filled>primary <em>passed</em></span>
        <span palette="secondary" filled>secondary <em>generated</em></span>
        <span palette="tertiary" filled>tertiary <em>generated</em></span>
        <span palette="surface" bg>surface <em>inherited</em></span>
      </p>
    </section>

    <!-- a secondary: nothing follows from it -->
    <section theme="plum" palette="background" bg>
      <h4>theme="plum" passes a secondary</h4>
      <p class="chain">
        <span palette="brand" filled>brand <em>inherited</em></span>
        <span palette="primary" filled>primary <em>inherited</em></span>
        <span palette="secondary" filled>secondary <em>passed</em></span>
        <span palette="tertiary" filled>tertiary <em>inherited</em></span>
        <span palette="surface" bg>surface <em>inherited</em></span>
      </p>
    </section>
  </div>
</div>
`;var b=`/* Layout only: every colour comes from the attributes in the HTML. */
.page {
  padding: 16px;
}
h4 {
  margin: 0 0 10px;
  font: 12px/1.4 ui-monospace, monospace;
}
.chain {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  margin: 0;
}
.chain span {
  padding: 22px 8px 8px;
  font-size: 12px;
}
.chain em {
  display: block;
  font-size: 11px;
}
.inside {
  display: grid;
  gap: 14px;
  margin-top: 16px;
}
section {
  padding: 14px;
}
`;var m=`@use "@cpangular/cp-theming-core/scss/theme" as t;

// The outer theme passes a brand colour: all six palettes follow from it.
$harbour: t.theme(
  $brand: #1565c0,
);

// Three themes to nest inside it. Each passes one thing.
$ember: t.theme(
  $brand: #e65100,
);

$moss: t.theme(
  $palettes: (
    primary: t.palette(#2e7d32),
  )
);

$plum: t.theme(
  $palettes: (
    secondary: t.palette(#ad1457),
  )
);

// $default: harbour also applies where no element names a theme.
@include t.define-core-theme();
@include t.define-theme("harbour", $harbour, $default: true);
@include t.define-theme("ember", $ember);
@include t.define-theme("moss", $moss);
@include t.define-theme("plum", $plum);
`;var g=`<!-- no theme attribute here: harbour is the default theme -->
<div palette="background" bg class="page">
  <h4>no theme attribute: harbour, the default</h4>
  <p class="chain">
    <span palette="brand" filled>brand</span>
    <span palette="primary" filled>primary</span>
    <span palette="secondary" filled>secondary</span>
    <span palette="tertiary" filled>tertiary</span>
    <span palette="surface" bg>surface</span>
  </p>

  <div class="inside">
    <!-- a brand: everything follows from it, so nothing is left to inherit -->
    <section theme="ember" palette="background" bg>
      <h4>theme="ember" passes a brand colour</h4>
      <p class="chain">
        <span palette="brand" filled>brand <em>passed</em></span>
        <span palette="primary" filled>primary <em>generated</em></span>
        <span palette="secondary" filled>secondary <em>generated</em></span>
        <span palette="tertiary" filled>tertiary <em>generated</em></span>
        <span palette="surface" bg>surface <em>generated</em></span>
      </p>
    </section>

    <!-- a primary: secondary and tertiary follow from it, background and surface do not -->
    <section theme="moss" palette="background" bg>
      <h4>theme="moss" passes a primary</h4>
      <p class="chain">
        <span palette="brand" filled>brand <em>its primary</em></span>
        <span palette="primary" filled>primary <em>passed</em></span>
        <span palette="secondary" filled>secondary <em>generated</em></span>
        <span palette="tertiary" filled>tertiary <em>generated</em></span>
        <span palette="surface" bg>surface <em>inherited</em></span>
      </p>
    </section>

    <!-- a secondary: nothing follows from it -->
    <section theme="plum" palette="background" bg>
      <h4>theme="plum" passes a secondary</h4>
      <p class="chain">
        <span palette="brand" filled>brand <em>inherited</em></span>
        <span palette="primary" filled>primary <em>inherited</em></span>
        <span palette="secondary" filled>secondary <em>passed</em></span>
        <span palette="tertiary" filled>tertiary <em>inherited</em></span>
        <span palette="surface" bg>surface <em>inherited</em></span>
      </p>
    </section>
  </div>
</div>
`;var x=`<!-- the same three themes, and harbour itself, inside ember -->
<div theme="ember" palette="background" bg class="page">
  <h4>theme="ember" passes a brand colour</h4>
  <p class="chain">
    <span palette="brand" filled>brand</span>
    <span palette="primary" filled>primary</span>
    <span palette="secondary" filled>secondary</span>
    <span palette="tertiary" filled>tertiary</span>
    <span palette="surface" bg>surface</span>
  </p>

  <div class="inside">
    <!-- a brand: everything follows from it, so nothing is left to inherit -->
    <section theme="harbour" palette="background" bg>
      <h4>theme="harbour" passes a brand colour</h4>
      <p class="chain">
        <span palette="brand" filled>brand <em>passed</em></span>
        <span palette="primary" filled>primary <em>generated</em></span>
        <span palette="secondary" filled>secondary <em>generated</em></span>
        <span palette="tertiary" filled>tertiary <em>generated</em></span>
        <span palette="surface" bg>surface <em>generated</em></span>
      </p>
    </section>

    <!-- a primary: secondary and tertiary follow from it, background and surface do not -->
    <section theme="moss" palette="background" bg>
      <h4>theme="moss" passes a primary</h4>
      <p class="chain">
        <span palette="brand" filled>brand <em>its primary</em></span>
        <span palette="primary" filled>primary <em>passed</em></span>
        <span palette="secondary" filled>secondary <em>generated</em></span>
        <span palette="tertiary" filled>tertiary <em>generated</em></span>
        <span palette="surface" bg>surface <em>inherited</em></span>
      </p>
    </section>

    <!-- a secondary: nothing follows from it -->
    <section theme="plum" palette="background" bg>
      <h4>theme="plum" passes a secondary</h4>
      <p class="chain">
        <span palette="brand" filled>brand <em>inherited</em></span>
        <span palette="primary" filled>primary <em>inherited</em></span>
        <span palette="secondary" filled>secondary <em>passed</em></span>
        <span palette="tertiary" filled>tertiary <em>inherited</em></span>
        <span palette="surface" bg>surface <em>inherited</em></span>
      </p>
    </section>
  </div>
</div>
`;var w=class p{files={"theme.scss":u,"example.html":y,"example.scss":b,"try-default.theme.scss":m,"try-default.html":g,"try-outer.html":x};defaultLines=m.slice(m.indexOf("// $default"));example=[{frame:"example",label:"Example"}];tryIt=[{frame:"try-default",label:"A default theme"},{frame:"try-outer",label:"Another theme outside"}];static \u0275fac=function(l){return new(l||p)};static \u0275cmp=Td({type:p,selectors:[["cpa-learn-nested"]],decls:98,vars:7,consts:[[3,"n"],["chapterExample",""],[1,"learn-lead"],["chapter","06-nested",3,"files","frames"],["chapterIdea",""],["name","theme"],["name","themeMode"],["chapterCode",""],["name","t.define-core-theme()"],["lang","scss",3,"code"],["name","theme","value","moss"],["name","theme","value","harbour"],["name","palette","value","background"],["name","bg"],["name","$default"],["name","t.define-theme()"],["chapterTry",""],["chapterNow",""]],template:function(l,r){l&1&&(pa(0,"cpa-chapter",0)(1,"div",1)(2,"p",2),TS(3," One theme with three others inside it. Each inner theme passes a single colour. The word under each swatch says where that colour comes from. The sixth palette, background, has no swatch: it is the fill of each box. "),Ad(),xa(4,"cpa-live-example",3),Ad(),pa(5,"div",4)(6,"p"),TS(7," Chapter 1 put two themes side by side. The "),xa(8,"cpa-ref",5),TS(9," attribute can also go on an element that is already inside a theme: a sidebar, one card, a preview pane. From that element inward the inner theme applies. But a theme passes only a few colours, and a page uses all six palettes, so the question is where the rest come from. "),Ad(),pa(10,"p"),TS(11,"There are three answers, and every palette of an inner theme gets one of them."),Ad(),pa(12,"ul")(13,"li")(14,"strong"),TS(15,"Passed."),Ad(),TS(16," What the inner theme passes is used as it was passed."),Ad(),pa(17,"li")(18,"strong"),TS(19,"Generated."),Ad(),TS(20," What follows from a passed colour in the chain of chapter 3 is generated again from it: secondary and tertiary from a primary, and everything else, background and surface included, from a brand. "),Ad(),pa(21,"li")(22,"strong"),TS(23,"Inherited."),Ad(),TS(24," Everything else keeps the value it has in the theme around it. "),Ad()(),pa(25,"p"),TS(26,"The three inner themes show one case each:"),Ad(),pa(27,"ul")(28,"li")(29,"em"),TS(30,"ember"),Ad(),TS(31," passes a brand colour. Everything follows from the brand, so all six palettes are new and nothing is inherited. Even the fill of its box, its background palette, is its own. "),Ad(),pa(32,"li")(33,"em"),TS(34,"moss"),Ad(),TS(35," passes a primary. Secondary and tertiary follow from a primary, so they are generated from the green. Background and surface come only from a brand, and moss passed none, so they are inherited: the green swatches sit on harbour's background. Its brand palette is the primary it passed, as chapter 3 said of any theme with a primary and no brand, so that swatch says "),pa(36,"em"),TS(37,"its primary"),Ad(),TS(38,". "),Ad(),pa(39,"li")(40,"em"),TS(41,"plum"),Ad(),TS(42," passes a secondary. Nothing follows from secondary. One palette changes and the other five are harbour's. "),Ad()(),pa(43,"p"),TS(44," Inherited works as inheritance does everywhere in CSS: the value comes from the element around this one, from whichever theme applies there. An inner theme never names the theme it sits in, and it does not fall back to some standard set of colours for what it leaves out. Move plum into another theme and five of its palettes change with the move. "),Ad(),pa(45,"p"),TS(46," That is why a theme can be small. A theme for one section of a site needs only the one colour that is different there. You never copy a whole theme to change a single colour, and never keep the copies in step afterwards. "),Ad(),pa(47,"p"),TS(48," Modes are a separate matter. A theme does not set a mode, so an inner theme is in the mode of the element around it unless it carries "),xa(49,"cpa-ref",6),TS(50," itself. The example does not show this. "),Ad()(),pa(51,"div",7)(52,"p"),TS(53," The stylesheet behind the example defines four themes, one after the other. They do not affect each other: a theme applies only where an element carries its name. "),xa(54,"cpa-ref",8),TS(55," is still included once, before all four. "),Ad(),xa(56,"cpa-code",9),pa(57,"p"),TS(58," The nesting is not in the stylesheet at all. It is in the HTML, "),pa(59,"em"),TS(60,"example.html"),Ad(),TS(61," beside the example: an element with "),xa(62,"cpa-ref",10),TS(63," inside the element with "),xa(64,"cpa-ref",11),TS(65,". Each box is also painted with its theme's background palette, by "),xa(66,"cpa-ref",12),TS(67," and "),xa(68,"cpa-ref",13),TS(69," from chapter 5. "),Ad(),pa(70,"p"),TS(71," With the stylesheet as it is, an element with no "),xa(72,"cpa-ref",5),TS(73," attribute on it or around it gets none of the four themes, only core's plain greys. To make one of them the page's own, pass "),xa(74,"cpa-ref",14),TS(75,", set to true, to "),xa(76,"cpa-ref",15),TS(77,". That theme then also applies wherever no element names a theme, and any "),xa(78,"cpa-ref",5),TS(79," attribute still replaces it from that element inward. The last lines of the stylesheet become: "),Ad(),xa(80,"cpa-code",9),Ad(),pa(81,"div",16)(82,"ul")(83,"li")(84,"strong"),TS(85,"A default theme."),Ad(),TS(86," The stylesheet with "),xa(87,"cpa-ref",14),TS(88,", and the HTML with the outer "),xa(89,"cpa-ref",5),TS(90," attribute taken off. The outer box is harbour all the same, though no element names it. "),Ad(),pa(91,"li")(92,"strong"),TS(93,"Another theme outside."),Ad(),TS(94," The outer element is now ember, with harbour as the first inner theme. Nothing in the stylesheet changed. Moss keeps the greens it passed and generated, on ember's page. Plum keeps its secondary, and its other five palettes are now ember's. "),Ad()(),xa(95,"cpa-live-example",3),Ad(),pa(96,"span",17),TS(97," put a theme inside another and say which of its colours are passed, generated or inherited, keep several themes in one stylesheet, and make one of them the theme of the whole page. "),Ad()()),l&2&&(hv("n",6),zI(4),hv("files",r.files)("frames",r.example),zI(52),hv("code",r.files["theme.scss"]),zI(24),hv("code",r.defaultLines),zI(15),hv("files",r.files)("frames",r.tryIt));},dependencies:[D,K,r,I],encapsulation:2})};
export{w as NestedChapterComponent};