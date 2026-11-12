import {L}from'./chunk-ClipQGTq.js';import {a}from'./chunk-OfBABVD5.js';import {g as g$1,T as Td,p as pa,f as TS,A as Ad,x as xa,z as zI,m as hv}from'./main-PSPEVRAY.js';var g=`<div palette="primary" bg container shape="xs">shape="xs"</div>
<div palette="primary" bg container shape="md">shape="md"</div>
<div palette="primary" bg container shape="xl">shape="xl"</div>
<div palette="primary" bg container shape="full">shape="full"</div>
`;var x=`@use "@cpangular/cp-theming-core/scss/theme" as t;

.my-card {
  @include t.apply-palette("primary");
  @include t.bg();
  @include t.container();
  @include t.shape("md");
}
`;var b=`<div palette="primary" bg container
     style="--container--radius: 0px">
  radius: 0px
</div>

<div palette="primary" bg container
     style="--container--radius: 20px">
  radius: 20px
</div>

<div palette="primary" bg container
     style="--container--radius--top: 20px">
  radius--top: 20px
</div>
`;var h=`@use "@cpangular/cp-theming-core/scss/theme" as t;

.my-card {
  @include t.apply-palette("primary");
  @include t.bg();
  @include t.radius(20px);
  @include t.container();
}

// Per-corner control
.my-sheet {
  @include t.apply-palette("primary");
  @include t.bg();
  @include t.radius($top: 20px);
  @include t.container();
}
`;var f=`<div palette="primary" bg container
     style="--container--padding: 8px">
  padding: 8px
</div>

<div palette="primary" bg container
     style="--container--padding: 16px">
  padding: 16px
</div>

<div palette="primary" bg container
     style="--container--padding: 32px">
  padding: 32px
</div>
`;var u=`@use "@cpangular/cp-theming-core/scss/theme" as t;

.my-card {
  @include t.apply-palette("primary");
  @include t.bg();
  @include t.padding(24px);
  @include t.container();
}

// A different padding per axis
.my-chip {
  @include t.apply-palette("primary");
  @include t.bg();
  @include t.padding($block: 6px, $inline: 16px);
  @include t.container();
}
`;var y=`@use "@cpangular/cp-theming-core/scss/theme" as t;

.card {
  @include t.apply-palette("primary");
  @include t.bg();
  @include t.shape("lg");
  @include t.padding(24px);
  @include t.container();
}

.chip {
  @include t.apply-palette("secondary");
  @include t.filled();
  @include t.shape("full");
  @include t.padding($block: 6px, $inline: 16px);
  @include t.container();
}
`;var M=`<div palette="primary" bg shape="lg" container
     style="--container--padding: 24px">
  card: shape="lg", 24px padding
</div>

<span palette="secondary" filled shape="full" container
      style="--container--padding-block: 6px; --container--padding-inline: 16px">
  chip: shape="full"
</span>
`;var C=class c{ex={shapeHtml:g,shapeScss:x,radiusHtml:b,radiusScss:h,paddingHtml:f,paddingScss:u,combinedScss:y,combinedHtml:M};constructor(){g$1(a).set([{label:"Overview",anchor:"overview"},{label:"Shape scale",anchor:"shape"},{label:"Custom radius",anchor:"radius"},{label:"Padding",anchor:"padding"},{label:"Combined geometry",anchor:"combined"}]);}static \u0275fac=function(p){return new(p||c)};static \u0275cmp=Td({type:c,selectors:[["cpa-apply-geometry-page"]],decls:96,vars:8,consts:[[1,"doc-page"],[1,"page-header"],[1,"subtitle"],["id","overview",1,"page-section"],[1,"intro"],["id","shape",1,"page-section"],["title","Shape scale",3,"attrsHtml","scssScss"],["id","radius",1,"page-section"],["title","Custom radius",3,"attrsHtml","scssScss"],["id","padding",1,"page-section"],["title","Padding scale",3,"attrsHtml","scssScss"],["id","combined",1,"page-section"],["title","Card vs chip geometry",3,"attrsHtml","scssScss"]],template:function(p,o){p&1&&(pa(0,"article",0)(1,"header",1)(2,"h1"),TS(3,"Geometry"),Ad(),pa(4,"p",2),TS(5,"Theming \u2022 @cpangular/cp-theming-core"),Ad()(),pa(6,"section",3)(7,"p",4),TS(8," Geometry layers control the shape and spacing of themed elements. They are intentionally separate from color so the same geometry can apply across all palettes. Use "),pa(9,"code"),TS(10,"shape"),Ad(),TS(11," for corner rounding and "),pa(12,"code"),TS(13,"container"),Ad(),TS(14," for padding. "),Ad()(),pa(15,"section",5)(16,"h2"),TS(17,"Shape scale"),Ad(),pa(18,"p"),TS(19," The "),pa(20,"code"),TS(21,"shape"),Ad(),TS(22," attribute rounds corners using the M3 "),pa(23,"code"),TS(24,"--shape--*"),Ad(),TS(25," scale: "),pa(26,"code"),TS(27,"xxs"),Ad(),TS(28,", "),pa(29,"code"),TS(30,"xs"),Ad(),TS(31,", "),pa(32,"code"),TS(33,"sm"),Ad(),TS(34,", "),pa(35,"code"),TS(36,"md"),Ad(),TS(37,", "),pa(38,"code"),TS(39,"lg"),Ad(),TS(40,", "),pa(41,"code"),TS(42,"xl"),Ad(),TS(43,", "),pa(44,"code"),TS(45,"xxl"),Ad(),TS(46,", and "),pa(47,"code"),TS(48,"full"),Ad(),TS(49,". It sets "),pa(50,"code"),TS(51,"--container--radius"),Ad(),TS(52," from the scale and applies it to the element (and any inset "),pa(53,"code"),TS(54,"outlined"),Ad(),TS(55," border). "),Ad(),xa(56,"cpa-theme-example",6),Ad(),pa(57,"section",7)(58,"h2"),TS(59,"Custom corner radius"),Ad(),pa(60,"p"),TS(61," For values outside the scale, set "),pa(62,"code"),TS(63,"--container--radius"),Ad(),TS(64," directly or use "),pa(65,"code"),TS(66,"t.radius()"),Ad(),TS(67," for per-corner control. A "),pa(68,"code"),TS(69,"container"),Ad(),TS(70," (or "),pa(71,"code"),TS(72,"shape"),Ad(),TS(73,") resolves the override onto the element. "),Ad(),xa(74,"cpa-theme-example",8),Ad(),pa(75,"section",9)(76,"h2"),TS(77,"Padding"),Ad(),pa(78,"p"),TS(79," The "),pa(80,"code"),TS(81,"container"),Ad(),TS(82," layer adds density-reactive padding. Set "),pa(83,"code"),TS(84,"--container--padding"),Ad(),TS(85," or use "),pa(86,"code"),TS(87,"t.padding()"),Ad(),TS(88," to override the internal spacing. "),Ad(),xa(89,"cpa-theme-example",10),Ad(),pa(90,"section",11)(91,"h2"),TS(92,"Combined geometry"),Ad(),pa(93,"p"),TS(94,' Shape, padding, and a fill compose into familiar shapes. A common pattern is a larger shape with proportional padding for "card" shapes, and a tight scale for compact elements like chips or badges. '),Ad(),xa(95,"cpa-theme-example",12),Ad()()),p&2&&(zI(56),hv("attrsHtml",o.ex.shapeHtml)("scssScss",o.ex.shapeScss),zI(18),hv("attrsHtml",o.ex.radiusHtml)("scssScss",o.ex.radiusScss),zI(15),hv("attrsHtml",o.ex.paddingHtml)("scssScss",o.ex.paddingScss),zI(6),hv("attrsHtml",o.ex.combinedHtml)("scssScss",o.ex.combinedScss));},dependencies:[L],styles:[".doc-page[_ngcontent-%COMP%]{max-width:880px;animation:_ngcontent-%COMP%_doc-fade-in .25s ease}@keyframes _ngcontent-%COMP%_doc-fade-in{0%{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}.page-header[_ngcontent-%COMP%]{margin-bottom:44px;padding-bottom:24px;border-bottom:1px solid var(--color--surface--stroke, rgba(0, 0, 0, .1))}.page-header[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%]{font-size:40px;font-weight:300;margin:0 0 10px;color:var(--color--primary);letter-spacing:-.02em;line-height:1.1}.page-header[_ngcontent-%COMP%]   .subtitle[_ngcontent-%COMP%]{display:inline-block;font-size:12.5px;margin:0;padding:3px 10px;border-radius:999px;font-family:Roboto Mono,monospace;color:var(--color--primary);background:var(--color--primary--tint-1, rgba(0, 0, 0, .05))}.page-section[_ngcontent-%COMP%]{margin-bottom:48px}.page-section[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{font-size:24px;font-weight:400;margin:0 0 18px;color:var(--color--primary);letter-spacing:-.01em}.page-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{font-size:17px;font-weight:500;margin:24px 0 12px}.page-section[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], .page-section[_ngcontent-%COMP%]   .intro[_ngcontent-%COMP%]{font-size:15px;line-height:1.75;color:var(--color--background--contrast, rgba(0, 0, 0, .8));max-width:720px}.page-section[_ngcontent-%COMP%]   .intro[_ngcontent-%COMP%]{font-size:16.5px;line-height:1.7;opacity:.92}.feature-list[_ngcontent-%COMP%]{padding-left:24px;line-height:1.9;font-size:14px;max-width:720px}.feature-list[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]{margin-bottom:4px}.install-block[_ngcontent-%COMP%]{display:flex;align-items:center;gap:16px;margin:16px 0}.install-block[_ngcontent-%COMP%]   pre[_ngcontent-%COMP%]{flex:1;margin:0}.api-table[_ngcontent-%COMP%]{width:100%;border-collapse:collapse;font-size:14px;margin:16px 0}.api-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]{text-align:left;padding:10px 16px;background:var(--color--surface--bg, rgba(0, 0, 0, .04));font-weight:500;border-bottom:2px solid var(--color--surface--stroke, rgba(0, 0, 0, .12))}.api-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{padding:10px 16px;border-bottom:1px solid var(--color--surface--stroke, rgba(0, 0, 0, .08));vertical-align:top;line-height:1.6}.api-table[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:last-child   td[_ngcontent-%COMP%]{border-bottom:none}.api-table[_ngcontent-%COMP%]   .symbol[_ngcontent-%COMP%]{font-family:Roboto Mono,monospace;font-size:13px;color:var(--color--primary)}.api-table[_ngcontent-%COMP%]   .type[_ngcontent-%COMP%]{font-family:Roboto Mono,monospace;font-size:12px;opacity:.65}.api-import-line[_ngcontent-%COMP%]{margin:-8px 0 40px}.api-import-line[_ngcontent-%COMP%]   code[_ngcontent-%COMP%]{display:block;padding:12px 18px;background:var(--color--surface--bg, rgba(0, 0, 0, .03));border:1px solid var(--color--surface--stroke, rgba(0, 0, 0, .1));border-radius:4px;font-family:Roboto Mono,monospace;font-size:13px;color:var(--color--primary)}.api-section-heading[_ngcontent-%COMP%]{font-size:26px;font-weight:400;margin:8px 0 10px;color:inherit}.api-section-rule[_ngcontent-%COMP%]{border:none;border-top:1px solid var(--color--surface--stroke, rgba(0, 0, 0, .12));margin:0 0 28px}.api-symbol[_ngcontent-%COMP%]{margin-bottom:48px}.api-symbol-name[_ngcontent-%COMP%]{font-size:20px;font-weight:700;margin:0 0 8px;font-family:inherit;color:inherit}.api-symbol-selector[_ngcontent-%COMP%]{font-size:13px;margin:0 0 10px;opacity:.75}.api-symbol-selector[_ngcontent-%COMP%]   code[_ngcontent-%COMP%]{font-family:Roboto Mono,monospace}.api-symbol-desc[_ngcontent-%COMP%]{font-size:14px;line-height:1.75;color:var(--color--background--contrast, rgba(0, 0, 0, .8));max-width:720px;margin:0 0 18px}.api-sub-heading[_ngcontent-%COMP%]{font-size:15px;font-weight:600;margin:20px 0 10px;color:inherit}.api-member-card[_ngcontent-%COMP%]{border:1px solid var(--color--surface--stroke, rgba(0, 0, 0, .12));border-radius:10px;margin-bottom:16px;overflow:hidden;box-shadow:0 1px 2px #0000000a}.api-signature-row[_ngcontent-%COMP%]{display:block;padding:14px 20px;background:var(--color--surface--bg, rgba(0, 0, 0, .025));border-bottom:1px solid var(--color--surface--stroke, rgba(0, 0, 0, .08));font-family:Roboto Mono,monospace;font-size:13px;line-height:1.7;word-break:break-word}.api-signature-row[_ngcontent-%COMP%]   .api-sig-kw[_ngcontent-%COMP%]{opacity:.45}.api-signature-row[_ngcontent-%COMP%]   .api-sig-name[_ngcontent-%COMP%]{color:var(--color--primary);font-weight:600}.api-signature-row[_ngcontent-%COMP%]   .api-sig-param[_ngcontent-%COMP%]{color:var(--color--primary);opacity:.9}.api-signature-row[_ngcontent-%COMP%]   .api-sig-default[_ngcontent-%COMP%]{opacity:.55}.api-signature-row[_ngcontent-%COMP%]   .api-sig-type[_ngcontent-%COMP%]{color:var(--color--secondary, var(--color--primary));opacity:.8}.api-signature-row[_ngcontent-%COMP%]   .api-sig-punct[_ngcontent-%COMP%]{opacity:.6}.api-signature-row[_ngcontent-%COMP%]   .api-sig-return[_ngcontent-%COMP%]{color:var(--color--secondary, var(--color--primary));font-style:italic}.api-member-body[_ngcontent-%COMP%]{padding:16px 20px 20px}.demo-row[_ngcontent-%COMP%]{display:flex;gap:12px;flex-wrap:wrap;margin:20px 0 28px}.demo-grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin:20px 0 28px}.demo-swatch[_ngcontent-%COMP%]{padding:18px 20px 14px;border-radius:8px;min-height:72px;display:flex;flex-direction:column;justify-content:flex-end;gap:2px}.demo-swatch[_ngcontent-%COMP%]   .demo-name[_ngcontent-%COMP%]{font-size:13px;font-weight:600;line-height:1.2}.demo-swatch[_ngcontent-%COMP%]   .demo-tag[_ngcontent-%COMP%]{font-size:10px;font-family:Roboto Mono,monospace;opacity:.65;letter-spacing:.04em}.demo-split[_ngcontent-%COMP%]{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start;margin:20px 0 28px}@media(max-width:640px){.demo-split[_ngcontent-%COMP%]{grid-template-columns:1fr}}.demo-label[_ngcontent-%COMP%]{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;opacity:.5;margin:0 0 8px}.api-member-desc[_ngcontent-%COMP%]{font-size:14px;line-height:1.75;margin:0 0 4px;max-width:680px;color:var(--color--background--contrast, rgba(0, 0, 0, .8))}.api-member-desc[_ngcontent-%COMP%]:last-child{margin-bottom:0}.api-params-heading[_ngcontent-%COMP%], .api-returns-heading[_ngcontent-%COMP%]{font-size:13px;font-weight:600;margin:18px 0 4px;letter-spacing:.01em}.api-param-row[_ngcontent-%COMP%]{display:grid;grid-template-columns:230px 1fr;gap:16px;padding:12px 0;border-top:1px solid var(--color--surface--stroke, rgba(0, 0, 0, .06));font-size:13px;line-height:1.6;transition:background .12s ease}.api-param-row[_ngcontent-%COMP%]:hover{background:var(--color--surface--bg, rgba(0, 0, 0, .02))}.api-param-name[_ngcontent-%COMP%]{font-family:Roboto Mono,monospace;font-size:13px;font-weight:500;display:block}.api-param-type[_ngcontent-%COMP%]{font-family:Roboto Mono,monospace;font-size:12px;color:var(--color--primary);opacity:.85;display:block;margin-top:2px}.api-param-default[_ngcontent-%COMP%]{font-family:Roboto Mono,monospace;font-size:11px;opacity:.5;display:block}.api-param-desc[_ngcontent-%COMP%]{color:var(--color--background--contrast, rgba(0, 0, 0, .8));padding-top:2px}.api-props-table[_ngcontent-%COMP%]{width:100%;border-collapse:collapse;font-size:13px;margin:8px 0 0;border:1px solid var(--color--surface--stroke, rgba(0, 0, 0, .1));border-radius:10px;overflow:hidden}.api-props-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]{text-align:left;padding:11px 18px;background:var(--color--surface--bg, rgba(0, 0, 0, .03));font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.06em;opacity:.7;border-bottom:1px solid var(--color--surface--stroke, rgba(0, 0, 0, .12))}.api-props-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{padding:11px 18px;border-bottom:1px solid var(--color--surface--stroke, rgba(0, 0, 0, .07));vertical-align:top;line-height:1.65}.api-props-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]{transition:background .12s ease}.api-props-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:hover{background:var(--color--surface--bg, rgba(0, 0, 0, .02))}.api-props-table[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:last-child   td[_ngcontent-%COMP%]{border-bottom:none}.api-props-table[_ngcontent-%COMP%]   .prop-decorator[_ngcontent-%COMP%]{font-family:Roboto Mono,monospace;font-size:11px;opacity:.55;display:block;margin-bottom:2px}.api-props-table[_ngcontent-%COMP%]   .prop-name[_ngcontent-%COMP%]{font-family:Roboto Mono,monospace;font-size:13px;font-weight:500;color:var(--color--primary)}.api-props-table[_ngcontent-%COMP%]   .prop-type[_ngcontent-%COMP%]{font-family:Roboto Mono,monospace;font-size:12px;opacity:.65;display:block;margin-top:2px}"]})};export{C as ApplyGeometryPageComponent};