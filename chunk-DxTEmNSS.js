import {K}from'./chunk-OyUYdTmh.js';import {D,I}from'./chunk-BIiBbc_z.js';import {r}from'./chunk-PDEPeMdV.js';import'./chunk-OfBABVD5.js';import {T as Td,p as pa,f as TS,A as Ad,x as xa,m as hv,z as zI}from'./main-PSPEVRAY.js';import'./chunk-jf2QdeWO.js';var u=`@use "@cpangular/cp-theming-core/scss/theme" as t;

// One theme. Its primary has a colour for light and a colour for dark.
$ocean: t.theme(
  $palettes: (
    primary: t.light-dark(t.palette(#2456b8), t.palette(#9cc0ff)),
  )
);

@include t.define-core-theme();
@include t.define-theme("ocean", $ocean);
`;var g=`<div theme="ocean" class="pages">
  <section themeMode="light">
    <h4>themeMode="light"</h4>
    <div class="card">
      <strong>Invoice 1042</strong>
      <span>Due on Friday</span>
      <button>Pay</button>
    </div>

    <!-- the same card, dark, inside the light section -->
    <div class="card" themeMode="dark">
      <strong>Invoice 1042</strong>
      <span>Due on Friday</span>
      <button>Pay</button>
    </div>
  </section>

  <section themeMode="dark">
    <h4>themeMode="dark"</h4>
    <div class="card">
      <strong>Invoice 1042</strong>
      <span>Due on Friday</span>
      <button>Pay</button>
    </div>
  </section>

  <!-- auto: whatever the device is set to -->
  <section themeMode="auto">
    <h4>themeMode="auto"</h4>
    <div class="card">
      <strong>Invoice 1042</strong>
      <span>Due on Friday</span>
      <button>Pay</button>
    </div>
  </section>
</div>
`;var f=`/* One set of rules. Nothing here says "light" or "dark". */
section {
  background: var(--color--primary--bg);
  color: var(--color--primary--bg--contrast);
}

/* The card's fill is a high step: it stands out more, in either mode.
   Its border is a low step: it stands out less. */
.card {
  background: var(--color--primary--bg--high);
  color: var(--color--primary--bg--high--contrast);
  border: 1px solid var(--color--primary--stroke--low);
}

.card strong {
  color: var(--color--primary--high);
}

.card button {
  background: var(--color--primary);
  color: var(--color--primary--contrast);
}

/* Layout only. */
.pages {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
section {
  padding: 14px;
}
h4 {
  margin: 0;
  font: 12px/1.4 ui-monospace, monospace;
}
.card {
  display: grid;
  gap: 4px;
  margin-top: 12px;
  padding: 14px;
  border-radius: 8px;
}
.card button {
  justify-self: start;
  margin-top: 8px;
  padding: 6px 16px;
  border: 0;
  border-radius: 6px;
  font: inherit;
}
`;var x=`@use "@cpangular/cp-theming-core/scss/theme" as t;

// The primary without t.light-dark(): one colour, used in both modes.
$ocean: t.theme(
  $palettes: (
    primary: t.palette(#2456b8),
  )
);

@include t.define-core-theme();
@include t.define-theme("ocean", $ocean);
`;var y=`<div theme="ocean" class="pages">
  <!-- a dark section with a light card inside it -->
  <section themeMode="dark">
    <h4>themeMode="dark"</h4>
    <div class="card">
      <strong>Invoice 1042</strong>
      <span>Due on Friday</span>
      <button>Pay</button>
    </div>

    <div class="card" themeMode="light">
      <strong>Invoice 1042</strong>
      <span>Due on Friday</span>
      <button>Pay</button>
    </div>
  </section>

  <!-- a mode on one small element: only the button is dark -->
  <section themeMode="light">
    <h4>themeMode="light"</h4>
    <div class="card">
      <strong>Invoice 1042</strong>
      <span>Due on Friday</span>
      <button themeMode="dark">Pay</button>
    </div>
  </section>
</div>
`;var v=class l{files={"theme.scss":u,"example.html":g,"example.scss":f,"try-one-colour.theme.scss":x,"try-swapped.html":y};example=[{frame:"example",label:"Example"}];tryIt=[{frame:"try-one-colour",label:"One colour for both modes"},{frame:"try-swapped",label:"Modes swapped"}];static \u0275fac=function(r){return new(r||l)};static \u0275cmp=Td({type:l,selectors:[["cpa-learn-light-and-dark"]],decls:114,vars:6,consts:[[3,"n"],["chapterExample",""],[1,"learn-lead"],["chapter","02-light-and-dark",3,"files","frames"],["chapterIdea",""],["name","themeMode"],["name","--color--primary"],["name","--color--{name}--dark"],["name","--color--{name}--high"],["name","--color--{name}--low"],["chapterCode",""],["name","t.light-dark()"],["lang","scss",3,"code"],["name","themeMode","value","dark"],["name","themeMode","value","light"],["chapterTry",""],["chapterNow",""]],template:function(r,i){r&1&&(pa(0,"cpa-chapter",0)(1,"div",1)(2,"p",2),TS(3," Four copies of one card, in three sections. There is one theme, in "),pa(4,"em"),TS(5,"theme.scss"),Ad(),TS(6,", and one set of rules for the card, in "),pa(7,"em"),TS(8,"example.scss"),Ad(),TS(9,". "),Ad(),xa(10,"cpa-live-example",3),Ad(),pa(11,"div",4)(12,"p"),TS(13,' The four cards have the same markup and are styled by the same rules, and those rules never say "light" or "dark" (they are in '),pa(14,"em"),TS(15,"example.scss"),Ad(),TS(16,"). What differs is one attribute. "),xa(17,"cpa-ref",5),TS(18," puts an element and everything inside it in a mode: "),pa(19,"code"),TS(20,"light"),Ad(),TS(21,", "),pa(22,"code"),TS(23,"dark"),Ad(),TS(24,", or "),pa(25,"code"),TS(26,"auto"),Ad(),TS(27,", which follows the setting of the reader's device. An element without the attribute is in the mode of the element around it. (The auto section follows your device, not this site's light and dark switch: on a light device it stays light while this site is dark.) "),Ad(),pa(28,"p"),TS(29," So dark is not a second theme. Each colour variable of a theme holds two values, one for light and one for dark. When an element uses "),xa(30,"cpa-ref",6),TS(31,", the browser takes the value for the mode "),pa(32,"em"),TS(33,"that element"),Ad(),TS(34," is in. This is CSS's own "),pa(35,"code"),TS(36,"light-dark()"),Ad(),TS(37," at work: the variable holds both values, and "),xa(38,"cpa-ref",5),TS(39," sets the element's "),pa(40,"code"),TS(41,"color-scheme"),Ad(),TS(42,", which picks one. The choice is made where the colour is used, one element at a time, and not once for the page. That is how the second card can be dark inside a light section: it is one element whose mode is dark, reading the same variables as its neighbour. "),Ad(),pa(43,"p"),TS(44," The other colours worked out from a palette's colour follow the mode as well. The soft background (the variable ending in "),pa(45,"em"),TS(46,"bg"),Ad(),TS(47,", from chapter 1) is pale in light mode and deep in dark mode, and the text on it changes from black to white. "),Ad(),pa(48,"p"),TS(49," Modes need one more kind of step. The steps from chapter 1 point in a fixed direction: "),xa(50,"cpa-ref",7),TS(51,' is always darker. But "make this title stronger" means darker on a light page and lighter on a dark one. For that, every colour also has steps named by what they do: '),Ad(),pa(52,"ul")(53,"li"),xa(54,"cpa-ref",8),TS(55," stands out more from what is around it: one step darker in light mode, one step lighter in dark mode. The card's title is the high step of the palette's colour. The card's fill is the high step of the soft background, and its text is that step's contrast. "),Ad(),pa(56,"li"),xa(57,"cpa-ref",9),TS(58," stands out less: one step lighter in light mode, one step darker in dark mode. The card's border is the low step of the border colour (the variable ending in "),pa(59,"em"),TS(60,"stroke"),Ad(),TS(61,", from chapter 1): a quieter line than the border colour itself. "),Ad()(),pa(62,"p"),TS(63," As with dark, darker and darkest, there are three each way: high, higher and highest, and low, lower and lowest. Each has a contrast of its own, named as in chapter 1. The example uses high and low only. "),pa(64,"em"),TS(65,"example.scss"),Ad(),TS(66," shows how the names add up: the soft background, then "),pa(67,"em"),TS(68,"high"),Ad(),TS(69,", then "),pa(70,"em"),TS(71,"contrast"),Ad(),TS(72,". "),Ad(),pa(73,"p"),TS(74," So you need no dark stylesheet, no rules like "),pa(75,"code"),TS(76,".dark .card"),Ad(),TS(77," that repeat every colour, and no media queries for the device's setting in your own CSS. You write each rule once. "),Ad()(),pa(78,"div",10)(79,"p"),TS(80," A colour that reads on white is usually too dark on black, so you can give a palette two colours, one for each mode. "),xa(81,"cpa-ref",11),TS(82," takes the colour for light, then the colour for dark. The rest of the file is as in chapter 1: "),Ad(),xa(83,"cpa-code",12),pa(84,"p"),TS(85," A palette passed without "),xa(86,"cpa-ref",11),TS(87,", as in chapter 1, uses its one colour in both modes. "),Ad(),pa(88,"p"),TS(89," The mode is not in the stylesheet at all. It is set in the HTML, with "),xa(90,"cpa-ref",5),TS(91," on any element: see "),pa(92,"em"),TS(93,"example.html"),Ad(),TS(94," beside the example, where the second card is "),xa(95,"cpa-ref",13),TS(96," inside a section that is "),xa(97,"cpa-ref",14),TS(98,". "),Ad()(),pa(99,"div",15)(100,"ul")(101,"li")(102,"strong"),TS(103,"One colour for both modes."),Ad(),TS(104," The theme passes its primary without "),xa(105,"cpa-ref",11),TS(106,". The soft backgrounds and the text on them still follow the mode, because they are worked out per mode. The colour itself does not: the button is the same blue on every card, and the title, one step away from that blue, is hard to read on the dark cards. That is what the second colour is for. "),Ad(),pa(107,"li")(108,"strong"),TS(109,"Modes swapped."),Ad(),TS(110," A light card inside a dark section, and in the other section a mode on something as small as a button. "),Ad()(),xa(111,"cpa-live-example",3),Ad(),pa(112,"span",16),TS(113," give a palette a colour for light and a colour for dark, put any element in either mode, and write styles that are right in both by using the high and low steps. "),Ad()()),r&2&&(hv("n",2),zI(10),hv("files",i.files)("frames",i.example),zI(73),hv("code",i.files["theme.scss"]),zI(28),hv("files",i.files)("frames",i.tryIt));},dependencies:[D,K,r,I],encapsulation:2})};export{v as LightAndDarkChapterComponent};