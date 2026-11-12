import {K}from'./chunk-OyUYdTmh.js';import {D,I}from'./chunk-BIiBbc_z.js';import {r as r$1}from'./chunk-PDEPeMdV.js';import'./chunk-OfBABVD5.js';import {V as s,r,T as Td,p as pa,f as TS,A as Ad,x as xa,m as hv,z as zI,N as LS}from'./main-PSPEVRAY.js';import'./chunk-jf2QdeWO.js';var x=`@use "@cpangular/cp-theming-core/scss/theme" as t;

// One colour. oklch() is lightness, then strength of colour, then hue; the
// slider above the example changes the first number and nothing else.
$dial: t.theme(
  $palettes: (
    primary: t.palette(oklch(45% 0.13 250)),
  )
);

@include t.define-core-theme();
@include t.define-theme("dial", $dial);
`;var w=`<div theme="dial">
  <!-- inside the guarantee: text on a fill, in that fill's contrast -->
  <p class="fill">Text on the colour, in its contrast</p>
  <div class="steps">
    <p class="darkest">darkest</p>
    <p class="darker">darker</p>
    <p class="dark">dark</p>
    <p class="light">light</p>
    <p class="lighter">lighter</p>
    <p class="lightest">lightest</p>
  </div>

  <!-- outside it: the colour is not behind this text, or not all of it is -->
  <p class="wash">The page's text on a see-through tint of the colour</p>
  <p class="words">The colour itself, used as text on the page</p>
</div>
`;var y=`/* A fill and the text that belongs on it: black or white, chosen for you. */
.fill {
  background: var(--color--primary);
  color: var(--color--primary--contrast);
}

/* The same for every step. */
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

/* A tint lets the page show through, so what is behind this text is a mix.
   The text is the page's own: the contrast of the background palette. */
.wash {
  background: var(--color--primary--tint-4);
  color: var(--color--background--contrast);
}

/* No fill at all: the colour is the text, and the page is behind it. */
.words {
  color: var(--color--primary);
}

/* Layout only. */
p {
  margin: 0 0 12px;
  padding: 14px 12px;
  font-weight: 500;
}
.fill {
  margin-bottom: 0;
  padding-block: 26px;
}
.steps {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  margin-bottom: 12px;
}
.steps p {
  margin: 0;
  font: 12px/1.4 ui-monospace, monospace;
}
.words {
  margin: 0;
}
`;var b=`@use "@cpangular/cp-theming-core/scss/theme" as t;

// A yellow, written in hsl(): hue, saturation, lightness. The slider changes
// the lightness.
$dial: t.theme(
  $palettes: (
    primary: t.palette(hsl(60 100% 45%)),
  )
);

@include t.define-core-theme();
@include t.define-theme("dial", $dial);
`;var k=`@use "@cpangular/cp-theming-core/scss/theme" as t;

// A blue with the same saturation and lightness as the yellow.
$dial: t.theme(
  $palettes: (
    primary: t.palette(hsl(240 100% 45%)),
  )
);

@include t.define-core-theme();
@include t.define-theme("dial", $dial);
`;var v=`<div theme="dial" class="fixed">
  <!-- inside the guarantee: each of the four as a fill, with its contrast -->
  <p class="fill error">error</p>
  <p class="fill warn">warn</p>
  <p class="fill caution">caution</p>
  <p class="fill pass">pass</p>

  <!-- outside it: each of the four as text on the surface -->
  <p class="words error">error as text</p>
  <p class="words warn">warn as text</p>
  <p class="words caution">caution as text</p>
  <p class="words pass">pass as text</p>
</div>
`;var T=`// The four palettes every theme has without passing them.
@each $name in error, warn, caution, pass {
  .fill.#{$name} {
    background: var(--color--#{$name});
    color: var(--color--#{$name}--contrast);
  }

  // The colour as text, on the surface palette.
  .words.#{$name} {
    background: var(--color--surface);
    color: var(--color--#{$name});
  }
}

// Layout only.
.fixed {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
p {
  margin: 0;
  padding: 18px 12px;
  font-weight: 500;
}
`;var q=i=>[i],E=class i{files={"theme.scss":x,"example.html":w,"example.scss":y,"try-yellow.theme.scss":b,"try-blue.theme.scss":k,"try-fixed.html":v,"try-fixed.scss":T};example=[{frame:"example",label:"Example"}];lightness={label:"Lightness",value:"45",range:{min:5,max:95,unit:"%"},target:"[theme]",properties:["--color--primary--mode-light","--color--primary--mode-dark"],format:"oklch({}% 0.13 250)"};measures=[{label:"Text on the colour",selector:".fill"},{label:"Lowest of the six steps",selector:".steps p"},{label:"Page text on the tint",selector:".wash"},{label:"The colour as text",selector:".words"}];tryIt=[{frame:"try-yellow",label:"A yellow",controls:[s(r({},this.lightness),{format:"hsl(60 100% {}%)"})],measures:this.measures},{frame:"try-blue",label:"A blue",controls:[s(r({},this.lightness),{format:"hsl(240 100% {}%)"})],measures:this.measures},{frame:"try-fixed",label:"The four fixed palettes",measures:[{label:"Lowest of the four fills",selector:".fill"},{label:"error as text",selector:".words.error"},{label:"warn as text",selector:".words.warn"},{label:"caution as text",selector:".words.caution"},{label:"pass as text",selector:".words.pass"}]}];static \u0275fac=function(l){return new(l||i)};static \u0275cmp=Td({type:i,selectors:[["cpa-learn-contrast"]],decls:77,vars:10,consts:[[3,"n"],["chapterExample",""],[1,"learn-lead"],["chapter","07-contrast",3,"files","frames","controls","measures"],["chapterIdea",""],["name","--color--{name}--contrast"],["name","--color--{name}--tint-N"],["chapterCode",""],["lang","scss",3,"code"],["name","palette"],["name","filled"],["name","bg"],["chapterTry",""],["chapter","07-contrast",3,"files","frames"],["chapterNow",""]],template:function(l,o){l&1&&(pa(0,"cpa-chapter",0)(1,"div",1)(2,"p",2),TS(3," Drag the slider. It changes how light the one colour this theme passes is, its primary, and nothing else about it. Near the light end a screen cannot show a blue this strong, so the colour turns towards cyan. The four numbers are contrast ratios, measured in the example while it runs. "),Ad(),xa(4,"cpa-live-example",3),Ad(),pa(5,"div",4)(6,"p"),TS(7,' Text can be read when it differs enough in brightness from what is behind it. The Web Content Accessibility Guidelines, WCAG for short, put a number on "enough". The contrast ratio of two colours runs from 1:1, the same colour twice, to 21:1, black on white. For ordinary text the guidelines ask for 4.5:1 or more. '),Ad(),pa(8,"p"),TS(9," For text on a fill there are two candidates, black and white. On a dark fill white has the higher ratio; on a light fill black has. Make the fill lighter a little at a time and white's ratio falls while black's rises. At one brightness the two are equal, and there both are about 4.6:1. "),Ad(),pa(10,"p"),TS(11," That crossing is where cp-theming switches. A fill darker than the crossing gets white text, and a fill lighter than it gets black. So the ratio between a fill and its contrast colour is lowest exactly at the switch, and even there it is above 4.5:1. Watch the first number while you drag: it is lowest where the text flips, and it never goes under 4.5. "),Ad(),pa(12,"p"),TS(13," No check runs on the colours afterwards, and there is no setting to get wrong: the result follows from where the switch is. It holds for every contrast colour, "),xa(14,"cpa-ref",5),TS(15," and the ones named like it: on the colour of any palette, on each of its steps, and on its bg and stroke roles and their steps. The mode, the theme and the colour you pass make no difference. The second number is the lowest of the six steps in the example. "),Ad(),pa(16,"p"),TS(17," This guarantee covers one case exactly: "),pa(18,"strong"),TS(19,"text on an opaque fill, written in that fill's contrast colour"),Ad(),TS(20,". Two things in the example are outside it, and their numbers can go under 4.5. On a light page the colour as text goes under as the colour gets light, and the tint goes under at the dark end. If this site is dark it is the other way round, and the colour as text is under from the start. "),Ad(),pa(21,"ul")(22,"li")(23,"strong"),TS(24,"A tint."),Ad(),TS(25," A tint ("),xa(26,"cpa-ref",6),TS(27,") is see-through, so what is behind the text is a mix of the tint and whatever is under it. No contrast variable can know that mix. The example puts the page's own text on the tint: the contrast of the background palette of chapter 3. Keep tints for washes over places where the text could already be read, such as a hovered row. "),Ad(),pa(28,"li")(29,"strong"),TS(30,"The colour used as text."),Ad(),TS(31," Here the colour is not behind the text, it is the text, and the page is behind it. Whether that can be read depends on the colour against the page. The primary that chapter 3 generates from a brand colour is made dark enough in light mode and light enough in dark mode for exactly this use. A colour you pass yourself, like this example's, is used as you passed it. "),Ad()(),pa(32,"p"),TS(33,' So you no longer choose a text colour for each fill by hand, or keep a table of "text on" colours beside the palette that has to be revisited whenever a colour changes. '),Ad()(),pa(34,"div",7)(35,"p"),TS(36," There is no function to call. The guarantee is in using the pair: a fill, and the contrast of that same fill. This is the example's stylesheet; the first rule is all it takes. "),Ad(),xa(37,"cpa-code",8),pa(38,"p"),TS(39," On an element with "),xa(40,"cpa-ref",9),TS(41,", the "),xa(42,"cpa-ref",10),TS(43," attribute from chapter 5 sets that pair for you, and so does "),xa(44,"cpa-ref",11),TS(45," on the background and surface palettes. "),Ad()(),pa(46,"div",12)(47,"ul")(48,"li")(49,"strong"),TS(50,"A yellow, then a blue."),Ad(),TS(51," Two themes whose colour is written in "),pa(52,"code"),TS(53,"hsl()"),Ad(),TS(54,", which has a lightness number of its own. Here the slider changes that number. The two colours start at the same lightness, and the yellow has black text where the blue has white. Drag each: the yellow keeps black text until it is quite dark, and the blue keeps white text until it is quite light. The switch does not go by a lightness number. It goes by how bright the colour is on the screen, and a yellow is far brighter than a blue. (The lightness of "),pa(55,"code"),TS(56,"oklch()"),Ad(),TS(57,", in the main example, follows brightness closely, so there the text flips at about the same lightness for any hue.) In both, the first number stays above 4.5. "),Ad(),pa(58,"li")(59,"strong"),TS(60,"The four fixed palettes."),Ad(),TS(61," Every theme also has four palettes that chapter 3 did not list: "),pa(62,"em"),TS(63,"error"),Ad(),TS(64,", "),pa(65,"em"),TS(66,"warn"),Ad(),TS(67,", "),pa(68,"em"),TS(69,"caution"),Ad(),TS(70," and "),pa(71,"em"),TS(72,"pass"),Ad(),TS(73,". Nothing generates them. Each has a default colour for light and for dark that you can replace by passing your own (this tab keeps the defaults), and each is a palette like any other, with steps, roles and a contrast. As fills, with their contrast colour on them, they are inside the guarantee. As text on the surface palette, the default warn and caution fall a little short in light mode: they are bright colours on a bright surface. For a warning in words, put the words on the fill. "),Ad()(),xa(74,"cpa-live-example",13),Ad(),pa(75,"span",14),TS(76," say which text is readable without checking it (anything on an opaque fill, in that fill's contrast) and which text you still have to look at yourself: text on a tint, and a colour used as text. "),Ad()()),l&2&&(hv("n",7),zI(4),hv("files",o.files)("frames",o.example)("controls",LS(8,q,o.lightness))("measures",o.measures),zI(33),hv("code",o.files["example.scss"]),zI(37),hv("files",o.files)("frames",o.tryIt));},dependencies:[D,K,r$1,I],encapsulation:2})};export{E as ContrastChapterComponent};