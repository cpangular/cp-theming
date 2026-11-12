import {K}from'./chunk-OyUYdTmh.js';import {D,I}from'./chunk-BIiBbc_z.js';import {r}from'./chunk-PDEPeMdV.js';import'./chunk-OfBABVD5.js';import {T as Td,p as pa,f as TS,A as Ad,x as xa,m as hv,z as zI,N as LS}from'./main-PSPEVRAY.js';import'./chunk-jf2QdeWO.js';var f=`@use "@cpangular/cp-theming-core/scss/theme" as t;

// A theme that passes one colour. Any CSS colour works: hex, rgb(), hsl(),
// oklch(), a named colour.
$ocean: t.theme(
  $palettes: (
    primary: t.palette(#2f6fde),
  )
);

// Core, the part every theme shares, once. Then the theme.
@include t.define-core-theme();
@include t.define-theme("ocean", $ocean);
`;var x=`<div theme="ocean">
  <!-- the colour the theme was given, with text that reads on it -->
  <p class="given">--color--primary</p>

  <!-- worked out from it: three darker steps (--color--primary--dark and on)
       and three lighter ones (--color--primary--light and on) -->
  <div class="steps">
    <p class="darkest">darkest</p>
    <p class="darker">darker</p>
    <p class="dark">dark</p>
    <p class="light">light</p>
    <p class="lighter">lighter</p>
    <p class="lightest">lightest</p>
  </div>

  <!-- also worked out from it: a soft background, a border, a focus ring -->
  <div class="uses">
    <p class="soft">soft background</p>
    <p class="border">border</p>
    <p class="ring">focus ring</p>
  </div>
</div>
`;var g=`/* The colour itself. Its text is its contrast: black or white, whichever reads. */
.given {
  background: var(--color--primary);
  color: var(--color--primary--contrast);
}

/* Each step has a contrast of its own. */
.darkest {
  background: var(--color--primary--darkest);
  color: var(--color--primary--darkest--contrast);
}
.darker {
  background: var(--color--primary--darker);
  color: var(--color--primary--darker--contrast);
}
.dark {
  background: var(--color--primary--dark);
  color: var(--color--primary--dark--contrast);
}
.light {
  background: var(--color--primary--light);
  color: var(--color--primary--light--contrast);
}
.lighter {
  background: var(--color--primary--lighter);
  color: var(--color--primary--lighter--contrast);
}
.lightest {
  background: var(--color--primary--lightest);
  color: var(--color--primary--lightest--contrast);
}

/* The soft background (bg), with a contrast of its own. */
.soft {
  background: var(--color--primary--bg);
  color: var(--color--primary--bg--contrast);
}
/* The border colour (stroke). */
.border {
  border: 2px solid var(--color--primary--stroke);
}
/* The focus ring (focus). Its lightness is the opposite of the colour's and its
   hue is turned part of the way round, so it shows against the colour. That is
   why it is drawn on the colour here. */
.ring {
  background: var(--color--primary);
  color: var(--color--primary--contrast);
  outline: 3px solid var(--color--primary--focus);
  outline-offset: -8px;
}

/* Layout only. */
p {
  margin: 0;
  padding: 14px 8px;
  font: 12px/1.4 ui-monospace, monospace;
}
.given {
  padding-block: 30px;
}
.steps {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
}
.uses {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 12px;
}
`;var y=`@use "@cpangular/cp-theming-core/scss/theme" as t;

// The same theme with another colour, written as a CSS colour name.
$ocean: t.theme(
  $palettes: (
    primary: t.palette(gold),
  )
);

@include t.define-core-theme();
@include t.define-theme("ocean", $ocean);
`;var w=`@use "@cpangular/cp-theming-core/scss/theme" as t;

// Two themes in one stylesheet. Core is still included once.
$ocean: t.theme(
  $palettes: (
    primary: t.palette(#2f6fde),
  )
);

$forest: t.theme(
  $palettes: (
    primary: t.palette(#2e7d4f),
  )
);

@include t.define-core-theme();
@include t.define-theme("ocean", $ocean);
@include t.define-theme("forest", $forest);
`;var v=`<!-- the same markup twice; only the theme attribute differs -->
<div theme="ocean">
  <p class="given">--color--primary</p>
  <div class="steps">
    <p class="darkest">darkest</p>
    <p class="darker">darker</p>
    <p class="dark">dark</p>
    <p class="light">light</p>
    <p class="lighter">lighter</p>
    <p class="lightest">lightest</p>
  </div>
</div>

<div theme="forest">
  <p class="given">--color--primary</p>
  <div class="steps">
    <p class="darkest">darkest</p>
    <p class="darker">darker</p>
    <p class="dark">dark</p>
    <p class="light">light</p>
    <p class="lighter">lighter</p>
    <p class="lightest">lightest</p>
  </div>
</div>
`;var A=n=>[n],k=class n{files={"theme.scss":f,"example.html":x,"example.scss":g,"try-named.theme.scss":y,"try-two.theme.scss":w,"try-two.html":v};example=[{frame:"example",label:"Example"}];picker={label:"The colour this theme is given",value:"#2f6fde",target:"[theme]",properties:["--color--primary--mode-light","--color--primary--mode-dark"]};tryIt=[{frame:"try-named",label:"A colour by name"},{frame:"try-two",label:"Two themes"}];static \u0275fac=function(s){return new(s||n)};static \u0275cmp=Td({type:n,selectors:[["cpa-learn-one-colour"]],decls:164,vars:9,consts:[[3,"n"],["chapterExample",""],[1,"learn-lead"],["chapter","01-one-colour",3,"files","frames","controls"],["chapterIdea",""],["name","--color--primary"],["name","--color--{name}"],["name","--color--{name}--dark"],["name","--color--{name}--light"],["name","theme","value","ocean"],["name","--color--{name}--contrast"],["chapterCode",""],["lang","scss",3,"code"],["name","t.palette()"],["name","t.theme()"],["name","$palettes"],["name","t.define-core-theme()"],["name","t.define-theme()"],["name","theme"],["chapterTry",""],["chapter","01-one-colour",3,"files","frames"],["chapterNow",""]],template:function(s,o){s&1&&(pa(0,"cpa-chapter",0)(1,"div",1)(2,"p",2),TS(3,"Pick a colour. Every box below it is worked out from that one."),Ad(),xa(4,"cpa-live-example",3),Ad(),pa(5,"div",4)(6,"p"),TS(7," You chose one colour and the example shows ten: your colour, six "),pa(8,"strong"),TS(9,"steps"),Ad(),TS(10,", and a soft background, a border and a focus ring. A step is your colour made darker or lighter by a fixed amount, three steps each way. On every box filled with one of these colours there is also text, in black or in white, whichever can be read there. Watch the text while you drag the picker from a dark colour to a light one: it flips. "),Ad(),pa(11,"p"),TS(12,' Only your colour is written down. The other nine are not: each is a CSS variable whose value is a formula over your colour, such as "the same colour, a little darker". The browser works the formulas out, and works them out again whenever the colour changes. That is why everything moved with the picker. The picker only hands the theme a new colour: nothing was rebuilt, and no script worked out the other nine. (If this site is dark, the soft background is deep instead of pale. Chapter 2 is about that.) '),Ad(),pa(13,"p"),TS(14,"Two words name what you are looking at."),Ad(),pa(15,"ul")(16,"li"),TS(17," A "),pa(18,"strong"),TS(19,"palette"),Ad(),TS(20," is one colour with a name, together with everything worked out from it. This palette is named "),pa(21,"em"),TS(22,"primary"),Ad(),TS(23," in the theme file below, so its colour is the variable "),xa(24,"cpa-ref",5),TS(25,". For any palette that variable is "),xa(26,"cpa-ref",6),TS(27,", where "),pa(28,"em"),TS(29,"name"),Ad(),TS(30," stands for the palette's name. Everything worked out from the colour adds a word to that variable. The steps add the step's name: "),xa(31,"cpa-ref",7),TS(32," and "),xa(33,"cpa-ref",8),TS(34,", and in the same way darker, darkest, lighter and lightest. The soft background, the border and the focus ring add "),pa(35,"em"),TS(36,"bg"),Ad(),TS(37,", "),pa(38,"em"),TS(39,"stroke"),Ad(),TS(40," and "),pa(41,"em"),TS(42,"focus"),Ad(),TS(43,". Chapter 4 is about those three. "),Ad(),pa(44,"li"),TS(45," A "),pa(46,"strong"),TS(47,"theme"),Ad(),TS(48," is a set of palettes with a name of its own. This theme is called "),pa(49,"em"),TS(50,"ocean"),Ad(),TS(51,", a name the theme file gives it, and has one palette. It applies to the element that carries "),xa(52,"cpa-ref",9),TS(53," and to everything inside that element. "),Ad()(),pa(54,"p"),TS(55," The text colour has a variable too: "),xa(56,"cpa-ref",10),TS(57," is black or white, whichever reads on the palette's colour. Each step has one of its own, named by adding "),pa(58,"em"),TS(59,"contrast"),Ad(),TS(60," to the step's variable, and so has the soft background. "),pa(61,"em"),TS(62,"example.scss"),Ad(),TS(63," beside the example spells out every one. So when you fill something with a palette colour you do not choose the text colour: you use the contrast that belongs to the fill. "),Ad(),pa(64,"p"),TS(65," The browser works the colours out, so you can drop two habits. You do not compute shades ahead of time with Sass functions such as "),pa(66,"code"),TS(67,"darken()"),Ad(),TS(68,", and you do not keep a list of shades, 100 to 900, for every colour. A theme holds the few colours you chose. Because the rest is worked out in the browser, a colour can change while the page is open and everything that depends on it follows. "),Ad()(),pa(69,"div",11)(70,"p"),TS(71," cp-theming is a library of Sass functions and mixins that write CSS variables, so a theme is written in Sass. This is the whole stylesheet behind the example: "),Ad(),xa(72,"cpa-code",12),pa(73,"p"),TS(74," If Sass is new to you, a few things need a word. "),pa(75,"code"),TS(76,"@use"),Ad(),TS(77," loads cp-theming from its package, "),pa(78,"code"),TS(79,"@cpangular/cp-theming-core"),Ad(),TS(80,", and calls it "),pa(81,"code"),TS(82,"t"),Ad(),TS(83," for short. A name that starts with "),pa(84,"code"),TS(85,"$"),Ad(),TS(86," is a Sass variable: it holds a value while the stylesheet is compiled. "),pa(87,"code"),TS(88,"( key: value )"),Ad(),TS(89," is a Sass map, a list of values by name. "),pa(90,"code"),TS(91,"@include"),Ad(),TS(92," runs a mixin, which is a named piece of Sass that writes CSS into your stylesheet. "),Ad(),pa(93,"ul")(94,"li"),xa(95,"cpa-ref",13),TS(96," makes a palette from a colour. "),xa(97,"cpa-ref",14),TS(98," makes a theme from palettes. Its "),xa(99,"cpa-ref",15),TS(100," argument is a map from each palette's name to the palette: the key "),pa(101,"em"),TS(102,"primary"),Ad(),TS(103," is what puts "),pa(104,"em"),TS(105,"primary"),Ad(),TS(106," into "),xa(107,"cpa-ref",5),TS(108,". "),Ad(),pa(109,"li"),xa(110,"cpa-ref",16),TS(111," is a mixin. It writes the part every theme shares, called "),pa(112,"strong"),TS(113,"core"),Ad(),TS(114,": the formulas that work the steps, the contrasts and the rest out of a palette's colour. Include it once in a site, before any theme. "),Ad(),pa(115,"li"),xa(116,"cpa-ref",17),TS(117," is the other mixin. Its first argument is the name, in quotes, and that name is the value the "),xa(118,"cpa-ref",18),TS(119," attribute takes. The Sass variable that holds the theme can be called anything. All this mixin adds to the CSS is one rule, for the elements with "),xa(120,"cpa-ref",9),TS(121,", that holds the colour you passed. "),Ad()(),pa(122,"p"),TS(123," Using the result takes no Sass. Put "),xa(124,"cpa-ref",9),TS(125," on an element, and inside it read the variables with "),pa(126,"code"),TS(127,"var()"),Ad(),TS(128," like any others. The example's own stylesheet, "),pa(129,"em"),TS(130,"example.scss"),Ad(),TS(131," beside the example, is plain CSS that does only that. "),Ad()(),pa(132,"div",19)(133,"p"),TS(134,"Each tab swaps one or two of the example's files. The swapped file is marked."),Ad(),pa(135,"ul")(136,"li")(137,"strong"),TS(138,"A colour by name."),Ad(),TS(139," The theme passes "),pa(140,"code"),TS(141,"gold"),Ad(),TS(142,", a CSS colour name. Any CSS colour will do: a hex value, "),pa(143,"code"),TS(144,"rgb()"),Ad(),TS(145,", "),pa(146,"code"),TS(147,"hsl()"),Ad(),TS(148,", "),pa(149,"code"),TS(150,"oklch()"),Ad(),TS(151," or a name (the examples use a hex value and a name). On this light colour the text has turned black. The three lighter steps have run out of room: there is no lighter version of this yellow, so all three are the same bright yellow. "),Ad(),pa(152,"li")(153,"strong"),TS(154,"Two themes."),Ad(),TS(155," A second theme, "),pa(156,"em"),TS(157,"forest"),Ad(),TS(158,", in the same stylesheet, and the same markup under each. The only difference between the two halves is the value of "),xa(159,"cpa-ref",18),TS(160,". To keep it short, this tab leaves out the soft background, the border and the focus ring. "),Ad()(),xa(161,"cpa-live-example",20),Ad(),pa(162,"span",21),TS(163," write a theme that passes one colour, apply it to an element, and use that colour, its lighter and darker steps and the text colour for each in your own CSS. "),Ad()()),s&2&&(hv("n",1),zI(4),hv("files",o.files)("frames",o.example)("controls",LS(7,A,o.picker)),zI(68),hv("code",o.files["theme.scss"]),zI(89),hv("files",o.files)("frames",o.tryIt));},dependencies:[D,K,r,I],encapsulation:2})};export{k as OneColourChapterComponent};