import {L}from'./chunk-ClipQGTq.js';import {a}from'./chunk-OfBABVD5.js';import {g,T as Td,E as Ec,p as pa,f as TS,A as Ad,x as xa,z as zI,m as hv}from'./main-PSPEVRAY.js';var x=`<span palette="primary" bg>Primary</span>
<span palette="secondary" bg>Secondary</span>
<span palette="error" bg>Error</span>
`;var f=`<span class="chip-primary">Primary</span>
<span class="chip-secondary">Secondary</span>
<span class="chip-error">Error</span>
`;var b=`@use "@cpangular/cp-theming-core/scss/theme" as t;

.chip-primary {
  @include t.apply-palette("primary");
  @include t.bg();
}

.chip-secondary {
  @include t.apply-palette("secondary");
  @include t.bg();
}

.chip-error {
  @include t.apply-palette("error");
  @include t.bg();
}
`;var h=`<span palette="primary" filled>Primary</span>
<span palette="secondary" filled>Secondary</span>
<span palette="error" filled>Error</span>
`;var u=`<span class="btn-primary">Primary</span>
<span class="btn-secondary">Secondary</span>
<span class="btn-error">Error</span>
`;var y=`@use "@cpangular/cp-theming-core/scss/theme" as t;

.btn-primary {
  @include t.apply-palette("primary");
  @include t.filled();
}

.btn-secondary {
  @include t.apply-palette("secondary");
  @include t.filled();
}

.btn-error {
  @include t.apply-palette("error");
  @include t.filled();
}
`;var C=`<span palette="primary" outlined>Primary</span>
<span palette="secondary" outlined>Secondary</span>
<span palette="error" outlined>Error</span>
`;var M=`<span class="ghost-primary">Primary</span>
<span class="ghost-secondary">Secondary</span>
<span class="ghost-error">Error</span>
`;var P=`@use "@cpangular/cp-theming-core/scss/theme" as t;

.ghost-primary {
  @include t.apply-palette("primary");
  @include t.outlined();
}

.ghost-secondary {
  @include t.apply-palette("secondary");
  @include t.outlined();
}

.ghost-error {
  @include t.apply-palette("error");
  @include t.outlined();
}
`;var _=`<!-- soft chip: tonal fill and a matching border -->
<span palette="primary" bg outlined>Soft</span>

<!-- solid chip: solid fill and a crisp edge -->
<span palette="primary" filled outlined>Filled</span>
`;var O=`<span class="chip-soft">Soft</span>
<span class="chip-filled">Filled</span>
`;var w=`@use "@cpangular/cp-theming-core/scss/theme" as t;

.chip-soft {
  @include t.apply-palette("primary");
  @include t.bg();
  @include t.outlined();
}

.chip-filled {
  @include t.apply-palette("primary");
  @include t.filled();
  @include t.outlined();
}
`;var S=class p{ex={bgHtml:x,bgClassesHtml:f,bgScss:b,filledHtml:h,filledClassesHtml:u,filledScss:y,outlinedHtml:C,outlinedClassesHtml:M,outlinedScss:P,composeHtml:_,composeClassesHtml:O,composeScss:w};constructor(){g(a).set([{label:"Overview",anchor:"overview"},{label:"bg",anchor:"bg"},{label:"filled",anchor:"filled"},{label:"outlined",anchor:"outlined"},{label:"Composing layers",anchor:"composition"},{label:"Comparison",anchor:"comparison"}]);}static \u0275fac=function(l){return new(l||p)};static \u0275cmp=Td({type:p,selectors:[["cpa-apply-surfaces-page"]],decls:109,vars:12,consts:[[1,"doc-page"],[1,"page-header"],[1,"subtitle"],["id","overview",1,"page-section"],[1,"intro"],["routerLink","../apply-palette"],["id","bg",1,"page-section"],["title","bg surface",3,"attrsHtml","scssHtml","scssScss"],["id","filled",1,"page-section"],["title","filled surface",3,"attrsHtml","scssHtml","scssScss"],["id","outlined",1,"page-section"],["title","outlined surface",3,"attrsHtml","scssHtml","scssScss"],["id","composition",1,"page-section"],["title","composed surfaces",3,"attrsHtml","scssHtml","scssScss"],["id","comparison",1,"page-section"],[1,"demo-row"],["palette","primary","bg","",1,"demo-swatch"],[1,"demo-tag"],[1,"demo-name"],["palette","primary","filled","",1,"demo-swatch"],["palette","primary","outlined","","shape","sm",1,"demo-swatch"]],template:function(l,o){l&1&&(pa(0,"article",0)(1,"header",1)(2,"h1"),TS(3,"Surface Types"),Ad(),pa(4,"p",2),TS(5,"Theming \u2022 @cpangular/cp-theming-core"),Ad()(),pa(6,"section",3)(7,"p",4),TS(8," Surfaces are built from "),pa(9,"strong"),TS(10,"atomic, composable layers"),Ad(),TS(11,". Each attribute does one thing, and they stack on top of a "),pa(12,"a",5),TS(13,"palette scope"),Ad(),TS(14,". Start with a palette (which colors the text), then add a fill \u2014 "),pa(15,"code"),TS(16,"bg"),Ad(),TS(17," for a subtle tonal surface or "),pa(18,"code"),TS(19,"filled"),Ad(),TS(20," for an intense one \u2014 and optionally "),pa(21,"code"),TS(22,"outlined"),Ad(),TS(23," for a border, "),pa(24,"code"),TS(25,"shape"),Ad(),TS(26," for corners, and "),pa(27,"code"),TS(28,"container"),Ad(),TS(29," for padding. "),Ad(),pa(30,"p"),TS(31," Every layer requires a palette on the same element (or an ancestor) to supply its colors. "),Ad()(),pa(32,"section",6)(33,"h2"),TS(34,"bg"),Ad(),pa(35,"p"),TS(36," The subtle fill. Lays down a low-intensity, "),pa(37,"strong"),TS(38,"same-hue tint of the palette color"),Ad(),TS(39," \u2014 derived at runtime so it always sits lighter than the text \u2014 and "),pa(40,"strong"),TS(41,"keeps the palette's identity color for text"),Ad(),TS(42,": colored text on a tonal surface (the chip / pill look). "),Ad(),pa(43,"p")(44,"code"),TS(45,"background"),Ad(),TS(46," and "),pa(47,"code"),TS(48,"surface"),Ad(),TS(49," are the exception: their color is the fill itself, so on those two palettes "),pa(50,"code"),TS(51,"bg"),Ad(),TS(52," sets the text to the fill's contrast color (black or white), as "),pa(53,"code"),TS(54,"filled"),Ad(),TS(55," does. "),Ad(),xa(56,"cpa-theme-example",7),Ad(),pa(57,"section",8)(58,"h2"),TS(59,"filled"),Ad(),pa(60,"p"),TS(61," The intense fill. Uses the palette color directly as the background and switches text to the palette's contrast color. The punchy variant for filled buttons, badges, and chips. "),Ad(),xa(62,"cpa-theme-example",9),Ad(),pa(63,"section",10)(64,"h2"),TS(65,"outlined"),Ad(),pa(66,"p"),TS(67," The border layer. Draws an inset border in the palette's stroke color as a "),pa(68,"code"),TS(69,"::after"),Ad(),TS(70," pseudo-element, so it sits inside the bounds and tracks the corner radius from "),pa(71,"code"),TS(72,"shape"),Ad(),TS(73,". With just a palette (no fill) it gives a transparent, ghost-style surface. "),Ad(),xa(74,"cpa-theme-example",11),Ad(),pa(75,"section",12)(76,"h2"),TS(77,"Composing layers"),Ad(),pa(78,"p"),TS(79," Stack the layers to build richer surfaces. Add "),pa(80,"code"),TS(81,"outlined"),Ad(),TS(82," over a "),pa(83,"code"),TS(84,"bg"),Ad(),TS(85," fill for a soft chip with a matching border, or over "),pa(86,"code"),TS(87,"filled"),Ad(),TS(88," for a solid chip with a crisp edge. "),Ad(),xa(89,"cpa-theme-example",13),Ad(),pa(90,"section",14)(91,"h2"),TS(92,"Side-by-side comparison"),Ad(),pa(93,"div",15)(94,"div",16)(95,"span",17),TS(96,"bg"),Ad(),pa(97,"span",18),TS(98,"Tonal fill"),Ad()(),pa(99,"div",19)(100,"span",17),TS(101,"filled"),Ad(),pa(102,"span",18),TS(103,"Intense fill"),Ad()(),pa(104,"div",20)(105,"span",17),TS(106,"outlined"),Ad(),pa(107,"span",18),TS(108,"Border only"),Ad()()()()()),l&2&&(zI(56),hv("attrsHtml",o.ex.bgHtml)("scssHtml",o.ex.bgClassesHtml)("scssScss",o.ex.bgScss),zI(6),hv("attrsHtml",o.ex.filledHtml)("scssHtml",o.ex.filledClassesHtml)("scssScss",o.ex.filledScss),zI(12),hv("attrsHtml",o.ex.outlinedHtml)("scssHtml",o.ex.outlinedClassesHtml)("scssScss",o.ex.outlinedScss),zI(15),hv("attrsHtml",o.ex.composeHtml)("scssHtml",o.ex.composeClassesHtml)("scssScss",o.ex.composeScss));},dependencies:[L,Ec],styles:[".doc-page[_ngcontent-%COMP%]{max-width:880px;animation:_ngcontent-%COMP%_doc-fade-in .25s ease}@keyframes _ngcontent-%COMP%_doc-fade-in{0%{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}.page-header[_ngcontent-%COMP%]{margin-bottom:44px;padding-bottom:24px;border-bottom:1px solid var(--color--surface--stroke, rgba(0, 0, 0, .1))}.page-header[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%]{font-size:40px;font-weight:300;margin:0 0 10px;color:var(--color--primary);letter-spacing:-.02em;line-height:1.1}.page-header[_ngcontent-%COMP%]   .subtitle[_ngcontent-%COMP%]{display:inline-block;font-size:12.5px;margin:0;padding:3px 10px;border-radius:999px;font-family:Roboto Mono,monospace;color:var(--color--primary);background:var(--color--primary--tint-1, rgba(0, 0, 0, .05))}.page-section[_ngcontent-%COMP%]{margin-bottom:48px}.page-section[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{font-size:24px;font-weight:400;margin:0 0 18px;color:var(--color--primary);letter-spacing:-.01em}.page-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{font-size:17px;font-weight:500;margin:24px 0 12px}.page-section[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], .page-section[_ngcontent-%COMP%]   .intro[_ngcontent-%COMP%]{font-size:15px;line-height:1.75;color:var(--color--background--contrast, rgba(0, 0, 0, .8));max-width:720px}.page-section[_ngcontent-%COMP%]   .intro[_ngcontent-%COMP%]{font-size:16.5px;line-height:1.7;opacity:.92}.feature-list[_ngcontent-%COMP%]{padding-left:24px;line-height:1.9;font-size:14px;max-width:720px}.feature-list[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]{margin-bottom:4px}.install-block[_ngcontent-%COMP%]{display:flex;align-items:center;gap:16px;margin:16px 0}.install-block[_ngcontent-%COMP%]   pre[_ngcontent-%COMP%]{flex:1;margin:0}.api-table[_ngcontent-%COMP%]{width:100%;border-collapse:collapse;font-size:14px;margin:16px 0}.api-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]{text-align:left;padding:10px 16px;background:var(--color--surface--bg, rgba(0, 0, 0, .04));font-weight:500;border-bottom:2px solid var(--color--surface--stroke, rgba(0, 0, 0, .12))}.api-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{padding:10px 16px;border-bottom:1px solid var(--color--surface--stroke, rgba(0, 0, 0, .08));vertical-align:top;line-height:1.6}.api-table[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:last-child   td[_ngcontent-%COMP%]{border-bottom:none}.api-table[_ngcontent-%COMP%]   .symbol[_ngcontent-%COMP%]{font-family:Roboto Mono,monospace;font-size:13px;color:var(--color--primary)}.api-table[_ngcontent-%COMP%]   .type[_ngcontent-%COMP%]{font-family:Roboto Mono,monospace;font-size:12px;opacity:.65}.api-import-line[_ngcontent-%COMP%]{margin:-8px 0 40px}.api-import-line[_ngcontent-%COMP%]   code[_ngcontent-%COMP%]{display:block;padding:12px 18px;background:var(--color--surface--bg, rgba(0, 0, 0, .03));border:1px solid var(--color--surface--stroke, rgba(0, 0, 0, .1));border-radius:4px;font-family:Roboto Mono,monospace;font-size:13px;color:var(--color--primary)}.api-section-heading[_ngcontent-%COMP%]{font-size:26px;font-weight:400;margin:8px 0 10px;color:inherit}.api-section-rule[_ngcontent-%COMP%]{border:none;border-top:1px solid var(--color--surface--stroke, rgba(0, 0, 0, .12));margin:0 0 28px}.api-symbol[_ngcontent-%COMP%]{margin-bottom:48px}.api-symbol-name[_ngcontent-%COMP%]{font-size:20px;font-weight:700;margin:0 0 8px;font-family:inherit;color:inherit}.api-symbol-selector[_ngcontent-%COMP%]{font-size:13px;margin:0 0 10px;opacity:.75}.api-symbol-selector[_ngcontent-%COMP%]   code[_ngcontent-%COMP%]{font-family:Roboto Mono,monospace}.api-symbol-desc[_ngcontent-%COMP%]{font-size:14px;line-height:1.75;color:var(--color--background--contrast, rgba(0, 0, 0, .8));max-width:720px;margin:0 0 18px}.api-sub-heading[_ngcontent-%COMP%]{font-size:15px;font-weight:600;margin:20px 0 10px;color:inherit}.api-member-card[_ngcontent-%COMP%]{border:1px solid var(--color--surface--stroke, rgba(0, 0, 0, .12));border-radius:10px;margin-bottom:16px;overflow:hidden;box-shadow:0 1px 2px #0000000a}.api-signature-row[_ngcontent-%COMP%]{display:block;padding:14px 20px;background:var(--color--surface--bg, rgba(0, 0, 0, .025));border-bottom:1px solid var(--color--surface--stroke, rgba(0, 0, 0, .08));font-family:Roboto Mono,monospace;font-size:13px;line-height:1.7;word-break:break-word}.api-signature-row[_ngcontent-%COMP%]   .api-sig-kw[_ngcontent-%COMP%]{opacity:.45}.api-signature-row[_ngcontent-%COMP%]   .api-sig-name[_ngcontent-%COMP%]{color:var(--color--primary);font-weight:600}.api-signature-row[_ngcontent-%COMP%]   .api-sig-param[_ngcontent-%COMP%]{color:var(--color--primary);opacity:.9}.api-signature-row[_ngcontent-%COMP%]   .api-sig-default[_ngcontent-%COMP%]{opacity:.55}.api-signature-row[_ngcontent-%COMP%]   .api-sig-type[_ngcontent-%COMP%]{color:var(--color--secondary, var(--color--primary));opacity:.8}.api-signature-row[_ngcontent-%COMP%]   .api-sig-punct[_ngcontent-%COMP%]{opacity:.6}.api-signature-row[_ngcontent-%COMP%]   .api-sig-return[_ngcontent-%COMP%]{color:var(--color--secondary, var(--color--primary));font-style:italic}.api-member-body[_ngcontent-%COMP%]{padding:16px 20px 20px}.demo-row[_ngcontent-%COMP%]{display:flex;gap:12px;flex-wrap:wrap;margin:20px 0 28px}.demo-grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin:20px 0 28px}.demo-swatch[_ngcontent-%COMP%]{padding:18px 20px 14px;border-radius:8px;min-height:72px;display:flex;flex-direction:column;justify-content:flex-end;gap:2px}.demo-swatch[_ngcontent-%COMP%]   .demo-name[_ngcontent-%COMP%]{font-size:13px;font-weight:600;line-height:1.2}.demo-swatch[_ngcontent-%COMP%]   .demo-tag[_ngcontent-%COMP%]{font-size:10px;font-family:Roboto Mono,monospace;opacity:.65;letter-spacing:.04em}.demo-split[_ngcontent-%COMP%]{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start;margin:20px 0 28px}@media(max-width:640px){.demo-split[_ngcontent-%COMP%]{grid-template-columns:1fr}}.demo-label[_ngcontent-%COMP%]{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;opacity:.5;margin:0 0 8px}.api-member-desc[_ngcontent-%COMP%]{font-size:14px;line-height:1.75;margin:0 0 4px;max-width:680px;color:var(--color--background--contrast, rgba(0, 0, 0, .8))}.api-member-desc[_ngcontent-%COMP%]:last-child{margin-bottom:0}.api-params-heading[_ngcontent-%COMP%], .api-returns-heading[_ngcontent-%COMP%]{font-size:13px;font-weight:600;margin:18px 0 4px;letter-spacing:.01em}.api-param-row[_ngcontent-%COMP%]{display:grid;grid-template-columns:230px 1fr;gap:16px;padding:12px 0;border-top:1px solid var(--color--surface--stroke, rgba(0, 0, 0, .06));font-size:13px;line-height:1.6;transition:background .12s ease}.api-param-row[_ngcontent-%COMP%]:hover{background:var(--color--surface--bg, rgba(0, 0, 0, .02))}.api-param-name[_ngcontent-%COMP%]{font-family:Roboto Mono,monospace;font-size:13px;font-weight:500;display:block}.api-param-type[_ngcontent-%COMP%]{font-family:Roboto Mono,monospace;font-size:12px;color:var(--color--primary);opacity:.85;display:block;margin-top:2px}.api-param-default[_ngcontent-%COMP%]{font-family:Roboto Mono,monospace;font-size:11px;opacity:.5;display:block}.api-param-desc[_ngcontent-%COMP%]{color:var(--color--background--contrast, rgba(0, 0, 0, .8));padding-top:2px}.api-props-table[_ngcontent-%COMP%]{width:100%;border-collapse:collapse;font-size:13px;margin:8px 0 0;border:1px solid var(--color--surface--stroke, rgba(0, 0, 0, .1));border-radius:10px;overflow:hidden}.api-props-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]{text-align:left;padding:11px 18px;background:var(--color--surface--bg, rgba(0, 0, 0, .03));font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.06em;opacity:.7;border-bottom:1px solid var(--color--surface--stroke, rgba(0, 0, 0, .12))}.api-props-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{padding:11px 18px;border-bottom:1px solid var(--color--surface--stroke, rgba(0, 0, 0, .07));vertical-align:top;line-height:1.65}.api-props-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]{transition:background .12s ease}.api-props-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:hover{background:var(--color--surface--bg, rgba(0, 0, 0, .02))}.api-props-table[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:last-child   td[_ngcontent-%COMP%]{border-bottom:none}.api-props-table[_ngcontent-%COMP%]   .prop-decorator[_ngcontent-%COMP%]{font-family:Roboto Mono,monospace;font-size:11px;opacity:.55;display:block;margin-bottom:2px}.api-props-table[_ngcontent-%COMP%]   .prop-name[_ngcontent-%COMP%]{font-family:Roboto Mono,monospace;font-size:13px;font-weight:500;color:var(--color--primary)}.api-props-table[_ngcontent-%COMP%]   .prop-type[_ngcontent-%COMP%]{font-family:Roboto Mono,monospace;font-size:12px;opacity:.65;display:block;margin-top:2px}"]})};export{S as ApplySurfacesPageComponent};