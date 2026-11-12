import {K}from'./chunk-OyUYdTmh.js';import {D,I}from'./chunk-BIiBbc_z.js';import {r}from'./chunk-PDEPeMdV.js';import'./chunk-OfBABVD5.js';import {T as Td,p as pa,f as TS,A as Ad,x as xa,m as hv,z as zI}from'./main-PSPEVRAY.js';import'./chunk-jf2QdeWO.js';var u=`@use "@cpangular/cp-theming-core/scss/theme" as t;

// A colour and nothing else. Spacing, corners, shadows, timing, weights and
// type are left out, so each has its default.
$studio: t.theme(
  $palettes: (
    primary: t.palette(#7a3fd1),
  )
);

@include t.define-core-theme();
@include t.define-theme("studio", $studio);
`;var f=`<div theme="studio" class="stage">
  <!-- container: padding.  shape: corners.  elevated: a shadow. -->
  <article palette="surface" filled container shape="md" elevated="2">
    <h4>Storage almost full</h4>
    <p>You have used 92% of your plan.</p>
    <p class="quiet">Renews on 1 March</p>

    <div class="actions">
      <button palette="primary" filled shape="full">Upgrade</button>
      <button palette="primary" outlined shape="full">Not now</button>
      <span class="status">Syncing</span>
    </div>
  </article>
</div>
`;var g=`/* Type: a title and body text from the theme's type scale. */
h4 {
  font-family: var(--text--title-large--font);
  font-size: var(--text--title-large--size);
  line-height: var(--text--title-large--line-height);
  font-weight: var(--text--title-large--weight);
}
p,
button,
.status {
  font-family: var(--text--body-medium--font);
  font-size: var(--text--body-medium--size);
  line-height: var(--text--body-medium--line-height);
}

/* Weights: how far a quieter line steps back is a number of the theme. */
.quiet {
  color: var(--container--text-deemphasis);
}

/* Spacing: every gap is a step of the theme's scale. */
h4,
p {
  margin: 0 0 var(--space--xs);
}
.actions {
  display: flex;
  align-items: center;
  gap: var(--space--sm);
  margin-top: var(--space--md);
}
button {
  padding: var(--space--xs) var(--space--md);
}

/* Motion: how long and along which curve. */
.status::before {
  content: "";
  display: inline-block;
  width: 0.6em;
  height: 0.6em;
  margin-right: var(--space--xs);
  border-radius: var(--shape--full);
  background: var(--color--primary);
  animation: pulse var(--motion--duration-extra) var(--motion--easing-standard) infinite
    alternate;
}
@keyframes pulse {
  to {
    opacity: 0.15;
    transform: scale(0.6);
  }
}

/* Layout only. */
.stage {
  padding: 12px 12px 28px;
}
article {
  max-width: 420px;
}
article + article {
  margin-top: 24px;
}
button {
  border: 0;
  background: none;
  cursor: pointer;
}
.status {
  margin-left: auto;
}
`;var y=`@use "@cpangular/cp-theming-core/scss/theme" as t;

// The same colour, and numbers of its own. Each kind has a function that
// takes only what you want to change.
$studio: t.theme(
  $palettes: (
    primary: t.palette(#7a3fd1),
  ),
  $density: t.density(-2),
  $shape: t.shape(
      $md: 4px,
      $full: 6px,
    ),
  $elevation: t.elevation(
      $shadow-color: oklch(0.45 0.2 300 / 45%),
    ),
  $motion: t.motion(
      $duration-extra: 1200ms,
    ),
  $weights: t.weights(
      $text-deemphasis-blend: 75%,
    ),
  $typography: t.typography(
      $plain-family: (
        Georgia,
        serif,
      ),
    ),
);

@include t.define-core-theme();
@include t.define-theme("studio", $studio);
`;var x=`<div theme="studio" class="stage">
  <article palette="surface" filled container shape="md" elevated="2">
    <h4>Storage almost full</h4>
    <p>You have used 92% of your plan.</p>
    <p class="quiet">Renews on 1 March</p>

    <div class="actions">
      <button palette="primary" filled shape="full">Upgrade</button>
      <button palette="primary" outlined shape="full">Not now</button>
      <span class="status">Syncing</span>
    </div>
  </article>

  <!-- the same card in a tighter density: every space inside it is smaller -->
  <article palette="surface" filled container shape="md" elevated="2" themeDensity="-2">
    <h4>Storage almost full</h4>
    <p>You have used 92% of your plan.</p>
    <p class="quiet">Renews on 1 March</p>

    <div class="actions">
      <button palette="primary" filled shape="full">Upgrade</button>
      <button palette="primary" outlined shape="full">Not now</button>
      <span class="status">Syncing</span>
    </div>
  </article>
</div>
`;var v=class l{files={"theme.scss":u,"example.html":f,"example.scss":g,"try-own.theme.scss":y,"try-scope.html":x};example=[{frame:"example",label:"Example"}];sliders=[{label:"Density",value:"0",range:{min:-5,max:5},target:"[theme]",attribute:"themeDensity"},{label:"Corners",value:"12",range:{min:0,max:32,unit:"px"},target:"[theme]",properties:["--shape--md"]},{label:"Shadow",value:"2",range:{min:0,max:5},target:"article",attribute:"elevated"},{label:"Pulse",value:"500",range:{min:100,max:2e3,step:100,unit:"ms"},target:"[theme]",properties:["--motion--duration-extra"]},{label:"Quiet text",value:"55",range:{min:20,max:100,unit:"%"},target:"[theme]",properties:["--weight--text-deemphasis-blend--mode-light","--weight--text-deemphasis-blend--mode-dark"]},{label:"Title size",value:"22",range:{min:14,max:28,unit:"px"},target:"[theme]",properties:["--text--title-large--size"]}];tryIt=[{frame:"try-own",label:"Numbers of its own"},{frame:"try-scope",label:"A density on one element"}];static \u0275fac=function(r){return new(r||l)};static \u0275cmp=Td({type:l,selectors:[["cpa-learn-everything-else"]],decls:120,vars:8,consts:[[3,"n"],["chapterExample",""],[1,"learn-lead"],["chapter","08-everything-else",3,"files","frames","controls"],["chapterIdea",""],["name","themeMode"],["name","--space--{size}"],["name","themeDensity"],["name","container"],["name","--shape--{size}"],["name","shape","value","md"],["name","--elevation-N--shadow"],["name","elevated","value","2"],["name","--motion--{name}"],["name","--weight--{name}"],["name","--container--text-deemphasis"],["name","--text--{role}--{property}"],["name","bg"],["name","filled"],["name","shape"],["name","palette"],["name","elevated"],["chapterCode",""],["name","t.theme()"],["name","t.density()"],["name","t.shape()"],["name","t.elevation()"],["name","t.motion()"],["name","t.weights()"],["name","t.typography()"],["lang","scss",3,"code"],["chapterTry",""],["name","themeDensity","value","-2"],["chapter","08-everything-else",3,"files","frames"],["chapterNow",""]],template:function(r,i){r&1&&(pa(0,"cpa-chapter",0)(1,"div",1)(2,"p",2),TS(3," A card and six sliders. Five of them change a value the theme carries, on the element with the theme. The Shadow slider sets how deep the card's shadow is. None of them changes a palette's colour, though Quiet text changes how two colours are mixed. "),Ad(),xa(4,"cpa-live-example",3),Ad(),pa(5,"div",4)(6,"p"),TS(7,' A design has more constants than its colours: how much room things have, how round the corners are, how deep a shadow is, how fast things move, how far a quiet line of text steps back, which sizes of type exist. In most stylesheets these are numbers typed where they are needed, 16px here and 8px there, and changing "the spacing" means finding them all. '),Ad(),pa(8,"p"),TS(9," A theme carries them the way it carries colours. Each is a CSS variable with a name and a default, set on the theme's element and inherited by everything inside it. A few also have an attribute that sets them for one element and what is inside it, as "),xa(10,"cpa-ref",5),TS(11," does for modes. What chapters 1 to 6 said about colours holds for all of them: a theme passes only the ones it changes, and a theme inside another inherits the rest. When a value changes, the browser works out again whatever depends on it. The sliders only change a value, and the browser does the rest. "),Ad(),pa(12,"ul")(13,"li")(14,"strong"),TS(15,"Spacing."),Ad(),xa(16,"cpa-ref",6),TS(17," is a scale of seven sizes: xxs, xs, sm, md, lg, xl and xxl. All seven follow one number, the "),pa(18,"strong"),TS(19,"density"),Ad(),TS(20,", which is 0 unless you change it. At 0 they run from 2px to 48px. Below 0 every space shrinks together, and above 0 every space grows. "),xa(21,"cpa-ref",7),TS(22," puts an element and everything inside it in a density from -5 to 5. The Density slider sets it on the theme's element. "),xa(23,"cpa-ref",8),TS(24," gives an element padding of the lg size, so the padding follows the density too. (This attribute is not the same thing as the variables of chapter 5 whose names start with container.) "),Ad(),pa(25,"li")(26,"strong"),TS(27,"Shape."),Ad(),xa(28,"cpa-ref",9),TS(29," is a scale of corner sizes with the same names, xxs to xxl, and "),pa(30,"em"),TS(31,"full"),Ad(),TS(32," for a pill. "),xa(33,"cpa-ref",10),TS(34," rounds an element with one of them. "),Ad(),pa(35,"li")(36,"strong"),TS(37,"Elevation."),Ad(),xa(38,"cpa-ref",11),TS(39," is a shadow, for N from 0 (none) to 5 (deepest). "),xa(40,"cpa-ref",12),TS(41," puts one on an element. The shadow is darker in dark mode, where a faint one would not show. "),Ad(),pa(42,"li")(43,"strong"),TS(44,"Motion."),Ad(),xa(45,"cpa-ref",13),TS(46,' holds four durations (duration-short, duration-medium, duration-long and duration-extra) and four easing curves (easing-standard, easing-emphasized, easing-decelerate and easing-accelerate), for your transitions and animations. The pulsing dot beside "Syncing" uses duration-extra and easing-standard, and the Pulse slider changes the duration. '),Ad(),pa(47,"li")(48,"strong"),TS(49,"Weights."),Ad(),xa(50,"cpa-ref",14),TS(51,' are percentages, not font weights. One sets how much of the text colour a quieter line keeps: the colour of "Renews on 1 March", '),xa(52,"cpa-ref",15),TS(53," from chapter 5, is the text colour mixed with the card's fill at that percentage. The Quiet text slider changes it. Others set how strong each of the five tints of chapter 4 is, and how strong the wash over a hovered or pressed element is. "),Ad(),pa(54,"li")(55,"strong"),TS(56,"Type."),Ad(),xa(57,"cpa-ref",16),TS(58," is a set of fifteen text styles: display, headline, title, body and label, each in large, medium and small. In the name, "),pa(59,"em"),TS(60,"role"),Ad(),TS(61," is the style, written as the kind and the size joined by a dash, such as title-large. Every style has a font, a size, a line height, a weight and a tracking (its letter spacing). The card's title is title-large and its other text is body-medium. "),Ad()(),pa(62,"p"),TS(63," Like "),xa(64,"cpa-ref",17),TS(65," and "),xa(66,"cpa-ref",18),TS(67," in chapter 5, "),xa(68,"cpa-ref",8),TS(69," and "),xa(70,"cpa-ref",19),TS(71," go on the same element as "),xa(72,"cpa-ref",20),TS(73,". "),xa(74,"cpa-ref",21),TS(75," and "),xa(76,"cpa-ref",7),TS(77," work on any element. "),Ad(),pa(78,"p"),TS(79,' So you no longer type numbers for spacing, corners and timing all through a stylesheet, or keep a second "compact" stylesheet for the dense parts of an application. A dense table is the same table inside a density. '),Ad()(),pa(80,"div",22)(81,"p"),TS(82," The example's theme passes a colour and nothing else, so every number is at its default. To change them, "),xa(83,"cpa-ref",23),TS(84," takes one argument for each kind, built by a function that accepts only the values you want to change: "),xa(85,"cpa-ref",24),TS(86,", "),xa(87,"cpa-ref",25),TS(88,", "),xa(89,"cpa-ref",26),TS(90,", "),xa(91,"cpa-ref",27),TS(92,", "),xa(93,"cpa-ref",28),TS(94," and "),xa(95,"cpa-ref",29),TS(96,". "),Ad(),xa(97,"cpa-code",30),pa(98,"p"),TS(99," From the top, this theme changes the density, two corner sizes, the colour of the shadows, the extra duration, the weight behind the quiet line, and the font of every text style (display and headline follow it unless the theme gives them a font of their own). A "),xa(100,"cpa-ref",7),TS(101," attribute inside this theme replaces its density from that element inward: the two do not add up. "),Ad(),pa(102,"p"),TS(103,` In your own CSS the variables are read like the colours. This is the example's stylesheet. Every font, gap, corner and duration above "Layout only" comes from the theme. The numbers under it only place the example on the page. `),Ad(),xa(104,"cpa-code",30),Ad(),pa(105,"div",31)(106,"ul")(107,"li")(108,"strong"),TS(109,"Numbers of its own."),Ad(),TS(110," The theme in the code above: tighter, squarer, a serif face, a violet shadow, a slower pulse and a quiet line that is less quiet. The HTML and the example's stylesheet are unchanged. "),Ad(),pa(111,"li")(112,"strong"),TS(113,"A density on one element."),Ad(),TS(114," The card twice. The second has "),xa(115,"cpa-ref",32),TS(116,", and every space inside it is smaller: its padding, the gaps between its lines, the padding of its buttons. "),Ad()(),xa(117,"cpa-live-example",33),Ad(),pa(118,"span",34),TS(119," take spacing, corners, shadows, timing, weights and type from the theme in place of typing numbers, change any of them for a whole theme, and tighten one part of a page with a density. "),Ad()()),r&2&&(hv("n",8),zI(4),hv("files",i.files)("frames",i.example)("controls",i.sliders),zI(93),hv("code",i.files["try-own.theme.scss"]),zI(7),hv("code",i.files["example.scss"]),zI(13),hv("files",i.files)("frames",i.tryIt));},dependencies:[D,K,r,I],encapsulation:2})};export{v as EverythingElseChapterComponent};