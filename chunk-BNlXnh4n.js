import {db as nr,T as Td,a4 as Ra,_ as _v,aL as Xo,aM as mr,aN as ut}from'./main-PSPEVRAY.js';var u=(()=>{class t{get vertical(){return this._vertical}set vertical(i){this._vertical=nr(i);}_vertical=false;get inset(){return this._inset}set inset(i){this._inset=nr(i);}_inset=false;static \u0275fac=function(e){return new(e||t)};static \u0275cmp=Td({type:t,selectors:[["mat-divider"]],hostAttrs:["role","separator",1,"mat-divider"],hostVars:7,hostBindings:function(e,r){e&2&&(Ra("aria-orientation",r.vertical?"vertical":"horizontal"),_v("mat-divider-vertical",r.vertical)("mat-divider-horizontal",!r.vertical)("mat-divider-inset",r.inset));},inputs:{vertical:"vertical",inset:"inset"},decls:0,vars:0,template:function(e,r){},styles:[`.mat-divider {
  display: block;
  margin: 0;
  border-top-style: solid;
  border-top-color: var(--mat-divider-color, var(--mat-sys-outline-variant));
  border-top-width: var(--mat-divider-width, 1px);
}
.mat-divider.mat-divider-vertical {
  border-top: 0;
  border-right-style: solid;
  border-right-color: var(--mat-divider-color, var(--mat-sys-outline-variant));
  border-right-width: var(--mat-divider-width, 1px);
}
.mat-divider.mat-divider-inset {
  margin-left: 80px;
}
[dir=rtl] .mat-divider.mat-divider-inset {
  margin-left: auto;
  margin-right: 80px;
}
`],encapsulation:2})}return t})(),f=(()=>{class t{static \u0275fac=function(e){return new(e||t)};static \u0275mod=Xo({type:t});static \u0275inj=mr({imports:[ut]})}return t})();export{f,u};