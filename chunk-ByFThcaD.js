import {K}from'./chunk-OyUYdTmh.js';import {D,I}from'./chunk-BIiBbc_z.js';import {r}from'./chunk-PDEPeMdV.js';import'./chunk-OfBABVD5.js';import {T as Td,p as pa,f as TS,A as Ad,x as xa,m as hv,z as zI}from'./main-PSPEVRAY.js';import'./chunk-jf2QdeWO.js';var u=`@use "@cpangular/cp-theming-core/scss/theme" as t;

// Three themes to choose from. ocean is the default: it applies until the
// reader picks one.
$ocean: t.theme(
  $brand: #1565c0,
);
$forest: t.theme(
  $brand: #2e7d32,
);
$sunset: t.theme(
  $brand: #e65100,
);

@include t.define-core-theme();
@include t.define-theme("ocean", $ocean, $default: true);
@include t.define-theme("forest", $forest);
@include t.define-theme("sunset", $sunset);
`;var g=`<!-- themeHeadSnippet from @cpangular/cp-theming-core, pasted as it is. It runs
     before the page is drawn and puts the saved theme and mode on <html>. -->
<script>(function(){try{var d=document.documentElement,p=localStorage.getItem("cp-theming--persist"),s=p==="local"?localStorage:p==="session"?sessionStorage:null;if(!s)return;var t=s.getItem("cp-theming--theme"),m=s.getItem("cp-theming--mode");if(t)d.setAttribute("theme",t);if(m==="auto"||m==="light"||m==="dark"||m==="invert")d.setAttribute("themeMode",m)}catch(e){}})();<\/script>
`;var f=`<!-- the theme and the mode are attributes of <html>; the buttons set them -->
<p class="row">
  <strong>Theme</strong>
  <button type="button" data-theme="ocean">ocean</button>
  <button type="button" data-theme="forest">forest</button>
  <button type="button" data-theme="sunset">sunset</button>
</p>
<p class="row">
  <strong>Mode</strong>
  <button type="button" data-mode="auto">auto</button>
  <button type="button" data-mode="light">light</button>
  <button type="button" data-mode="dark">dark</button>
</p>

<article palette="surface" filled container shape="md" elevated="1">
  <h4>Invoice 1042</h4>
  <p>Due on Friday</p>
  <button type="button" palette="primary" filled shape="full">Pay</button>
</article>

<!-- a reload starts the page again from nothing but what was saved -->
<p class="row">
  <button type="button" id="reload">Reload this example</button>
  <span id="state"></span>
</p>
`;var b=`/* Every option button, and the pressed one: the value set now. */
.row button {
  border: 1px solid var(--color--surface--stroke);
  border-radius: var(--shape--full);
  background: none;
  color: inherit;
}
.row button[aria-pressed="true"] {
  border-color: var(--color--primary);
  background: var(--color--primary);
  color: var(--color--primary--contrast);
}

/* Layout only. */
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space--sm);
  margin: 0 0 var(--space--md);
}
.row strong {
  width: 4em;
}
button {
  padding: var(--space--xs) var(--space--md);
  border: 0;
  font: inherit;
  cursor: pointer;
}
article {
  max-width: 320px;
  margin-bottom: var(--space--lg);
}
article h4,
article p {
  margin: 0 0 var(--space--xs);
}
article button {
  margin-top: var(--space--sm);
}
#state {
  font: 12px/1.4 ui-monospace, monospace;
}
`;var w=`import {
  ThemeStorage,
  configurePersistence,
  getMode,
  getTheme,
  setMode,
  setTheme,
  watchMode,
  watchTheme,
  type ThemeMode,
} from '@cpangular/cp-theming-core';

// Save what the reader picks in localStorage. Once, before anything is set.
configurePersistence(ThemeStorage.LOCAL);

const themes = document.querySelectorAll<HTMLButtonElement>('button[data-theme]');
const modes = document.querySelectorAll<HTMLButtonElement>('button[data-mode]');
const state = document.querySelector('#state');

// A click sets an attribute on <html> and saves its value.
for (const button of themes)
  button.addEventListener('click', () => setTheme(button.dataset.theme ?? 'ocean'));
for (const button of modes)
  button.addEventListener('click', () => setMode(button.dataset.mode as ThemeMode));

// The buttons show what the attributes say, whoever set them.
function show(): void {
  const theme = getTheme() ?? 'ocean'; // no attribute yet: the default theme
  const mode = getMode();
  for (const button of themes)
    button.setAttribute('aria-pressed', String(button.dataset.theme === theme));
  for (const button of modes)
    button.setAttribute('aria-pressed', String(button.dataset.mode === mode));
  if (state) state.textContent = \`theme: \${theme}, mode: \${mode}\`;
}
watchTheme(show);
watchMode(show);
show();

document.querySelector('#reload')?.addEventListener('click', () => location.reload());
`;var v=`<p class="row">
  <strong>Theme</strong>
  <button type="button" data-theme="ocean">ocean</button>
  <button type="button" data-theme="forest">forest</button>
  <button type="button" data-theme="sunset">sunset</button>
</p>
<!-- one button in place of three: it goes to whichever mode the page is not in -->
<p class="row">
  <strong>Mode</strong>
  <button type="button" id="toggle">Switch</button>
</p>

<article palette="surface" filled container shape="md" elevated="1">
  <h4>Invoice 1042</h4>
  <p>Due on Friday</p>
  <button type="button" palette="primary" filled shape="full">Pay</button>
</article>

<p class="row">
  <button type="button" id="reload">Reload this example</button>
  <span id="state"></span>
</p>
`;var x=`import {
  ThemeMode,
  ThemeStorage,
  configurePersistence,
  getEffectiveMode,
  getTheme,
  setMode,
  setTheme,
  watchMode,
  watchTheme,
} from '@cpangular/cp-theming-core';

configurePersistence(ThemeStorage.LOCAL);

const themes = document.querySelectorAll<HTMLButtonElement>('button[data-theme]');
const toggle = document.querySelector('#toggle');
const state = document.querySelector('#state');

for (const button of themes)
  button.addEventListener('click', () => setTheme(button.dataset.theme ?? 'ocean'));

// The mode may be auto. getEffectiveMode() says what that comes to right now:
// light or dark, never auto.
toggle?.addEventListener('click', () =>
  setMode(getEffectiveMode() === ThemeMode.DARK ? ThemeMode.LIGHT : ThemeMode.DARK),
);

function show(): void {
  const theme = getTheme() ?? 'ocean';
  const dark = getEffectiveMode() === ThemeMode.DARK;
  for (const button of themes)
    button.setAttribute('aria-pressed', String(button.dataset.theme === theme));
  if (toggle) toggle.textContent = dark ? 'Switch to light' : 'Switch to dark';
  if (state) state.textContent = \`theme: \${theme}, mode: \${dark ? 'dark' : 'light'}\`;
}
watchTheme(show);
watchMode(show); // also runs when the device changes between light and dark
show();

document.querySelector('#reload')?.addEventListener('click', () => location.reload());
`;var y=`import {
  ThemeStorage,
  configurePersistence,
  getMode,
  getTheme,
  setMode,
  setTheme,
  watchMode,
  watchTheme,
  type ThemeMode,
} from '@cpangular/cp-theming-core';

// Nothing is saved: a choice lasts until the page is loaded again.
configurePersistence(ThemeStorage.NONE);

const themes = document.querySelectorAll<HTMLButtonElement>('button[data-theme]');
const modes = document.querySelectorAll<HTMLButtonElement>('button[data-mode]');
const state = document.querySelector('#state');

// A click still sets an attribute on <html>.
for (const button of themes)
  button.addEventListener('click', () => setTheme(button.dataset.theme ?? 'ocean'));
for (const button of modes)
  button.addEventListener('click', () => setMode(button.dataset.mode as ThemeMode));

// The buttons show what the attributes say, whoever set them.
function show(): void {
  const theme = getTheme() ?? 'ocean'; // no attribute yet: the default theme
  const mode = getMode();
  for (const button of themes)
    button.setAttribute('aria-pressed', String(button.dataset.theme === theme));
  for (const button of modes)
    button.setAttribute('aria-pressed', String(button.dataset.mode === mode));
  if (state) state.textContent = \`theme: \${theme}, mode: \${mode}\`;
}
watchTheme(show);
watchMode(show);
show();

document.querySelector('#reload')?.addEventListener('click', () => location.reload());
`;var T=`export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideTheme(),
  ],
};
`;var S=`  readonly themeService = inject(ThemeService);

  readonly modeMeta = computed(() => MODE_META[this.themeService.mode()]);
`;var E=`  setTheme(value: string): void {
    this.themeService.setTheme(value);
  }

  cycleMode(): void {
    const current = this.themeService.mode();
    const idx = MODE_CYCLE.indexOf(current);
    const next = MODE_CYCLE[(idx + 1) % MODE_CYCLE.length];
    this.themeService.setMode(next);
  }
`;var M=class h{files={"theme.scss":u,"head.html":g,"example.html":f,"example.scss":b,"example.ts.txt":w,"try-toggle.html":v,"try-toggle.ts.txt":x,"try-unsaved.ts.txt":y};provideTs=T;switcherTs=S;switcherSetTs=E;example=[{frame:"example",label:"Example"}];tryIt=[{frame:"try-toggle",label:"One toggle"},{frame:"try-unsaved",label:"Not saved"}];static \u0275fac=function(r){return new(r||h)};static \u0275cmp=Td({type:h,selectors:[["cpa-learn-runtime"]],decls:132,vars:12,consts:[[3,"n"],["chapterExample",""],[1,"learn-lead"],["chapter","09-runtime",3,"files","frames","ownMode"],["chapterIdea",""],["name","theme"],["name","themeMode"],["name","setTheme()"],["name","setMode()"],["name","getTheme()"],["name","getMode()"],["name","watchTheme()"],["name","watchMode()"],["name","themeHeadSnippet"],["name","configurePersistence()"],["chapterCode",""],["lang","html",3,"code"],["lang","typescript",3,"code"],["name","provideTheme()"],["name","ThemeService"],["chapterTry",""],["name","getEffectiveMode()"],["chapterNow",""]],template:function(r,a){r&1&&(pa(0,"cpa-chapter",0)(1,"div",1)(2,"p",2),TS(3," Pick a theme and a mode, then press Reload. This example is a small page of its own, with a script. It keeps its own mode: "),pa(4,"code"),TS(5,"auto"),Ad(),TS(6," there follows your device, not this site's switch. "),Ad(),xa(7,"cpa-live-example",3),Ad(),pa(8,"div",4)(9,"p"),TS(10," Until now "),xa(11,"cpa-ref",5),TS(12," and "),xa(13,"cpa-ref",6),TS(14," were typed into the HTML. When a visitor to your site chooses, two things are needed: something that sets those attributes on a click, and something that remembers the choice for the next visit. "),Ad(),pa(15,"p"),TS(16," The first is not a new mechanism. Switching a theme is setting the "),xa(17,"cpa-ref",5),TS(18," attribute, on the page's root element "),pa(19,"code"),TS(20,"<html>"),Ad(),TS(21," unless you choose another, and the browser does the rest, as it did when chapter 1's picker changed the colour. Every theme is already in the stylesheet (chapter 6), so nothing is loaded and nothing is rebuilt. cp-theming's script functions are small conveniences around the two attributes: "),Ad(),pa(22,"ul")(23,"li"),xa(24,"cpa-ref",7),TS(25," and "),xa(26,"cpa-ref",8),TS(27," set the attribute and save the value. "),Ad(),pa(28,"li"),xa(29,"cpa-ref",9),TS(30," and "),xa(31,"cpa-ref",10),TS(32," read it."),Ad(),pa(33,"li"),xa(34,"cpa-ref",11),TS(35," and "),xa(36,"cpa-ref",12),TS(37," call a function of yours when the attribute changes, whether your own script changed it or something else did. "),xa(38,"cpa-ref",12),TS(39," also calls it when the mode is "),pa(40,"code"),TS(41,"auto"),Ad(),TS(42," and the device goes from light to dark. The example cannot change your device's setting, so it does not show that. "),Ad()(),pa(43,"p"),TS(44," Remembering has a catch: the saved choice has to be on the root element before the browser draws the page. A script that arrives with the rest of the page runs too late, and the visitor sees the default theme for a moment and then their own. So the restoring is done by a short script in the page's head, ahead of the stylesheets. The package exports its text as a string, "),xa(45,"cpa-ref",13),TS(46,". It reads the saved theme and mode and sets the two attributes, and that is all it does. Press Reload in the example. The page comes back in the theme you chose without passing through ocean, its default. "),Ad(),pa(47,"p"),TS(48," The functions save nothing until you turn saving on. "),xa(49,"cpa-ref",14),TS(50," says where choices are kept: in the browser's local storage, which lasts; in its session storage, which lasts until the tab is closed; or nowhere. It also writes that choice itself into local storage, under a key of its own, and that is how the head snippet knows where to look. "),Ad(),pa(51,"p"),TS(52," So you need neither application state that repaints the page from the theme nor a stylesheet for each theme. The choice is one attribute and one saved word. "),Ad()(),pa(53,"div",15)(54,"p"),TS(55," Two pieces. The first goes in the page's head, before the stylesheets. It is the text of "),xa(56,"cpa-ref",13),TS(57,", which the package exports so that you, or a step of your build, can paste it in. Besides light, dark and auto it accepts "),pa(58,"code"),TS(59,"invert"),Ad(),TS(60,", a fourth mode that is the opposite of the mode around the element. This track does not use it. "),Ad(),xa(61,"cpa-code",16),pa(62,"p"),TS(63," The second is the page's script. It imports the functions from "),pa(64,"code"),TS(65,"@cpangular/cp-theming-core"),Ad(),TS(66,". The buttons in "),pa(67,"em"),TS(68,"example.html"),Ad(),TS(69," carry the name of a theme or a mode in a "),pa(70,"code"),TS(71,"data-"),Ad(),TS(72," attribute. "),pa(73,"code"),TS(74,"ThemeStorage"),Ad(),TS(75," and "),pa(76,"code"),TS(77,"ThemeMode"),Ad(),TS(78," are the lists of storages and of modes. "),xa(79,"cpa-ref",9),TS(80," gives nothing while no theme is set, so the script falls back to ocean. "),xa(81,"cpa-ref",10),TS(82," gives auto while no mode is set. "),Ad(),xa(83,"cpa-code",17),pa(84,"p"),TS(85," In an Angular application the same two jobs are done by "),xa(86,"cpa-ref",18),TS(87," and "),xa(88,"cpa-ref",19),TS(89,", from "),pa(90,"code"),TS(91,"@cpangular/cp-theming-ng-core"),Ad(),TS(92,". "),xa(93,"cpa-ref",18),TS(94," goes in the application's providers. It turns saving on and restores the saved choice at startup. It saves in local storage unless you give it another storage. The snippet in the head is still needed: it puts the saved theme on the first paint, before Angular has started. This site's own configuration, where the other two providers have nothing to do with theming: "),Ad(),xa(95,"cpa-code",17),pa(96,"p"),xa(97,"cpa-ref",19),TS(98," gives a component the theme and the mode as signals, Angular's values that a template follows by itself, and it has the two setters as methods. The switcher at the top right of this site is written with it. "),pa(99,"code"),TS(100,"MODE_META"),Ad(),TS(101," and "),pa(102,"code"),TS(103,"MODE_CYCLE"),Ad(),TS(104," are the switcher's own: an icon and a tooltip for each mode, and the order its button steps through the modes. "),Ad(),xa(105,"cpa-code",17)(106,"cpa-code",17),pa(107,"p"),TS(108," One thing about the example itself: it runs inside this site, so the docs keep what it saves under keys of its own, and a choice made in it does not change this site's theme. Apart from that, its files are what you would write. "),Ad()(),pa(109,"div",20)(110,"ul")(111,"li")(112,"strong"),TS(113,"One toggle."),Ad(),TS(114," A single button in place of the three modes. A mode can be "),pa(115,"code"),TS(116,"auto"),Ad(),TS(117,", which follows the device and so is neither light nor dark. "),xa(118,"cpa-ref",21),TS(119," says which of the two the page shows right now, and the button sets the other one. "),Ad(),pa(120,"li")(121,"strong"),TS(122,"Not saved."),Ad(),TS(123," The script passes "),pa(124,"code"),TS(125,"ThemeStorage.NONE"),Ad(),TS(126,', "nowhere", to '),xa(127,"cpa-ref",14),TS(128,", which also clears anything saved before. Switching works as before. Press Reload and the page is back at its default. "),Ad()(),xa(129,"cpa-live-example",3),Ad(),pa(130,"span",22),TS(131," let a visitor choose the theme and the mode, keep the choice between visits, and bring it back before the first frame is drawn, in plain TypeScript or in Angular. "),Ad()()),r&2&&(hv("n",9),zI(7),hv("files",a.files)("frames",a.example)("ownMode",true),zI(54),hv("code",a.files["head.html"]),zI(22),hv("code",a.files["example.ts.txt"]),zI(12),hv("code",a.provideTs),zI(10),hv("code",a.switcherTs),zI(),hv("code",a.switcherSetTs),zI(23),hv("files",a.files)("frames",a.tryIt)("ownMode",true));},dependencies:[D,K,r,I],encapsulation:2})};export{M as RuntimeChapterComponent};