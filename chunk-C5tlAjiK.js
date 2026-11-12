import {K}from'./chunk-OyUYdTmh.js';import {D,I}from'./chunk-BIiBbc_z.js';import {r}from'./chunk-PDEPeMdV.js';import'./chunk-OfBABVD5.js';import {T as Td,p as pa,f as TS,A as Ad,x as xa,m as hv,z as zI}from'./main-PSPEVRAY.js';import'./chunk-jf2QdeWO.js';var u=`@use "@cpangular/cp-theming-core/scss/theme" as t;

// One colour passed; secondary and tertiary are generated from it.
$studio: t.theme(
  $palettes: (
    primary: t.palette(#7a3fd1),
  )
);

@include t.define-core-theme();
@include t.define-theme("studio", $studio);
`;var f=`<div theme="studio" class="row">
  <article class="notice primary">
    <h4>primary</h4>
    <p>The fill is bg. The border is stroke. This text is the contrast of bg.</p>
    <span class="tag">tint-2</span>
    <button>contrast</button>
    <button class="focused">focus</button>
  </article>

  <article class="notice secondary">
    <h4>secondary</h4>
    <p>The fill is bg. The border is stroke. This text is the contrast of bg.</p>
    <span class="tag">tint-2</span>
    <button>contrast</button>
    <button class="focused">focus</button>
  </article>

  <article class="notice tertiary">
    <h4>tertiary</h4>
    <p>The fill is bg. The border is stroke. This text is the contrast of bg.</p>
    <span class="tag">tint-2</span>
    <button>contrast</button>
    <button class="focused">focus</button>
  </article>
</div>
`;var b=`// One component, written once, for three palettes. Sass repeats the rule
// with each name in place of #{$name}.
@each $name in primary, secondary, tertiary {
  .notice.#{$name} {
    // bg: a fill.  stroke: a border on it.  bg--contrast: text on it.
    background: var(--color--#{$name}--bg);
    border: 1px solid var(--color--#{$name}--stroke);
    color: var(--color--#{$name}--bg--contrast);

    // The colour itself, for the one part that should stand out\u2026
    button {
      background: var(--color--#{$name});
      // \u2026with contrast as the text on it.
      color: var(--color--#{$name}--contrast);
    }

    // focus: a ring that shows against this palette. The class .focused
    // draws it without the keyboard, so the example can show it.
    button:focus-visible,
    button.focused {
      outline: 3px solid var(--color--#{$name}--focus);
    }

    // tint-2: the colour at 20% strength, a wash over whatever is behind.
    .tag {
      background: var(--color--#{$name}--tint-2);
    }
  }
}

// Layout only.
.row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.notice {
  padding: 14px;
  border-radius: 8px;
}
.notice h4 {
  margin: 0;
}
.notice p {
  margin: 6px 0 12px;
  font-size: 13px;
}
.notice .tag {
  display: table;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 12px;
}
.notice button {
  margin: 12px 8px 0 0;
  padding: 6px 14px;
  border: 0;
  border-radius: 6px;
  font: inherit;
  outline-offset: 2px;
}
`;var g=`@use "@cpangular/cp-theming-core/scss/theme" as t;

// A much lighter primary. The component's stylesheet is unchanged.
$studio: t.theme(
  $palettes: (
    primary: t.palette(#ffd54a),
  )
);

@include t.define-core-theme();
@include t.define-theme("studio", $studio);
`;var x=`@use "@cpangular/cp-theming-core/scss/theme" as t;

// The same much lighter primary as the tab before.
$studio: t.theme(
  $palettes: (
    primary: t.palette(#ffd54a),
  )
);

@include t.define-core-theme();
@include t.define-theme("studio", $studio);
`;var w=`// The same component written with shades instead of roles: "a bit lighter"
// for the fill, "a bit darker" for the border, the colour itself for text.
@each $name in primary, secondary, tertiary {
  .notice.#{$name} {
    background: var(--color--#{$name}--lightest);
    border: 1px solid var(--color--#{$name}--dark);
    color: var(--color--#{$name});

    button {
      background: var(--color--#{$name});
      color: white;
    }

    button:focus-visible,
    button.focused {
      outline: 3px solid var(--color--#{$name}--darker);
    }

    .tag {
      background: var(--color--#{$name}--lighter);
    }
  }
}

// Layout only.
.row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.notice {
  padding: 14px;
  border-radius: 8px;
}
.notice h4 {
  margin: 0;
}
.notice p {
  margin: 6px 0 12px;
  font-size: 13px;
}
.notice .tag {
  display: table;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 12px;
}
.notice button {
  margin: 12px 8px 0 0;
  padding: 6px 14px;
  border: 0;
  border-radius: 6px;
  font: inherit;
  outline-offset: 2px;
}
`;var y=class l{files={"theme.scss":u,"example.html":f,"example.scss":b,"try-pale.theme.scss":g,"try-shades.theme.scss":x,"try-shades.scss":w};example=[{frame:"example",label:"Example"}];tryIt=[{frame:"try-pale",label:"A pale primary"},{frame:"try-shades",label:"Written with shades"}];static \u0275fac=function(n){return new(n||l)};static \u0275cmp=Td({type:l,selectors:[["cpa-learn-roles"]],decls:79,vars:6,consts:[[3,"n"],["chapterExample",""],[1,"learn-lead"],["chapter","04-roles",3,"files","frames"],["chapterIdea",""],["name","--color--{name}--bg"],["name","--color--{name}--bg--contrast"],["name","--color--{name}--stroke"],["name","--color--{name}"],["name","--color--{name}--contrast"],["name","--color--{name}--focus"],["name","--color--{name}--tint-N"],["chapterCode",""],["lang","scss",3,"code"],["chapterTry",""],["chapterNow",""]],template:function(n,r){n&1&&(pa(0,"cpa-chapter",0)(1,"div",1)(2,"p",2),TS(3," One small component, shown in three palettes. The heading names the palette. The other words name, by the last word of its variable, what colours each part. The button marked "),pa(4,"em"),TS(5,"contrast"),Ad(),TS(6," is filled with the palette's colour and written in its contrast. "),Ad(),xa(7,"cpa-live-example",3),Ad(),pa(8,"div",4)(9,"p"),TS(10," A palette gives you its colour and six steps, from darkest to lightest. Which of them is right for a border? You could choose by eye: the lightest step for the fill, a darker one for the border, the colour itself for text, white on the button. Picking a colour by how light it looks like this is choosing a "),pa(11,"strong"),TS(12,"shade"),Ad(),TS(13,". It works for the colour you were looking at. But a step is the colour made lighter or darker by a fixed amount, so what it looks like depends on where the colour starts. The lightest step of a deep violet is a pale violet. A yellow is nearly as light as a colour gets, so its lighter steps have no room left and stay a strong yellow: yellow text cannot be read on them, and white text cannot be read on the yellow. In dark mode a pale fill is the wrong thing altogether. "),Ad(),pa(14,"p"),TS(15," So a palette also has "),pa(16,"strong"),TS(17,"roles"),Ad(),TS(18,": variables named after a job. Each is worked out so that it does that job whatever the colour and whatever the mode. "),Ad(),pa(19,"ul")(20,"li"),xa(21,"cpa-ref",5),TS(22," is a "),pa(23,"strong"),TS(24,"fill"),Ad(),TS(25,": a soft version of the colour to put behind content. It is pale in light mode and deep in dark mode. The text for it is "),xa(26,"cpa-ref",6),TS(27,". "),Ad(),pa(28,"li"),xa(29,"cpa-ref",7),TS(30," is a "),pa(31,"strong"),TS(32,"border"),Ad(),TS(33," or a dividing line: the colour kept in a middle range of lightness, so the line shows on a light fill and on a dark one. "),Ad(),pa(34,"li"),TS(35," The palette's colour, "),xa(36,"cpa-ref",8),TS(37,", counts as a role too: it is for the part that should be unmistakably this palette, such as the button here, with "),xa(38,"cpa-ref",9),TS(39," as the text on it. "),Ad(),pa(40,"li"),xa(41,"cpa-ref",10),TS(42," is the "),pa(43,"strong"),TS(44,"focus ring"),Ad(),TS(45," shown around the control the keyboard is on. Each palette has its own. Its lightness is the opposite of the palette's and its hue is turned part of the way round the colour wheel, because a ring in the button's own colour would not show next to the button. (The example draws it on the buttons marked "),pa(46,"em"),TS(47,"focus"),Ad(),TS(48," without the keyboard.) "),Ad(),pa(49,"li"),xa(50,"cpa-ref",11),TS(51,", with N from 1 to 5, is the colour made see-through, from faint to nearly solid. A tint is a wash over whatever is already there, for a hovered row or a selected item. The pill in the example is tint 2, a wash over the card's fill. "),Ad()(),pa(52,"p"),TS(53," Three of these are the soft background, border and focus ring of chapter 1, whose names end in bg, stroke and focus. A role has steps like a colour, each with its contrast: the card in chapter 2 was filled with the high step of bg, and its text was that step's contrast. "),Ad(),pa(54,"p"),TS(55," This divides the work. The component decides the job of each part: this is a fill, that is a border. The theme decides which colour does the job, because every role is worked out from its palette's colour. A component written with roles goes on working when the palette, the theme or the mode changes; one written with shades works for the colour it was drawn with. "),Ad()(),pa(56,"div",12)(57,"p"),TS(58," The component's stylesheet from the example. It is written once: Sass's "),pa(59,"code"),TS(60,"@each"),Ad(),TS(61," repeats the rule for each of the three palette names, putting the name where "),pa(62,"code"),TS(63,"#{$name}"),Ad(),TS(64,' is. The rules under "Layout only" set no colour. '),Ad(),xa(65,"cpa-code",13),Ad(),pa(66,"div",14)(67,"ul")(68,"li")(69,"strong"),TS(70,"A pale primary."),Ad(),TS(71," The theme passes a light yellow in place of the violet; the component's stylesheet is untouched. The fill is still a fill, the border still shows, and the text on the button has turned black. One role does less well here: the focus ring of a pale colour is nearly black, so in dark mode it is hard to see against the dark fill. "),Ad(),pa(72,"li")(73,"strong"),TS(74,"Written with shades."),Ad(),TS(75," The same pale theme, with the component written by eye the way the first paragraph describes: the lightest step for the fill, a darker step for the border and the focus ring, a lighter step for the pill, the colour for the text, white on the button. On the yellow the text in the colour and the white text cannot be read, and the pill cannot be seen: it is the same yellow as the fill. (The words in the boxes are unchanged, so they still name the roles, but this stylesheet no longer uses the role variables.) "),Ad()(),xa(76,"cpa-live-example",3),Ad(),pa(77,"span",15),TS(78," colour a component by the job of each part (fill, border, text, focus ring, wash) and expect it to hold in any palette, theme or mode. "),Ad()()),n&2&&(hv("n",4),zI(7),hv("files",r.files)("frames",r.example),zI(58),hv("code",r.files["example.scss"]),zI(11),hv("files",r.files)("frames",r.tryIt));},dependencies:[D,K,r,I],encapsulation:2})};export{y as RolesChapterComponent};