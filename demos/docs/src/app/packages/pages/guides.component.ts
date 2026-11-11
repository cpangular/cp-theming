import { Component, computed, inject, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TocService } from '../../shell/toc.service';

const CORE_TOC = [
  { label: 'CSS variable naming', anchor: 'css-naming' },
  { label: 'Runtime derivatives', anchor: 'runtime-derivatives' },
  { label: 'Palettes', anchor: 'palettes' },
  { label: 'Light & dark mode', anchor: 'light-dark' },
  { label: 'Nested theme scopes', anchor: 'nested-scopes' },
  { label: 'Palette scopes & surfaces', anchor: 'surfaces' },
  { label: 'Tone modifiers', anchor: 'tones' },
  { label: 'Elevation', anchor: 'elevation' },
  { label: 'Density', anchor: 'density' },
  { label: 'Shape', anchor: 'shape' },
  { label: 'Adaptor hooks', anchor: 'adaptor-hooks' },
];

const NG_CORE_TOC = [
  { label: 'Signal reactivity', anchor: 'signal-reactivity' },
  { label: 'Scoped themes', anchor: 'scoped-themes' },
  { label: 'Persisting state', anchor: 'persisting-state' },
];

const NG_MATERIAL_TOC = [
  { label: 'How the cascade works', anchor: 'cascade' },
  { label: 'Tertiary palette', anchor: 'tertiary' },
  { label: 'Component overrides', anchor: 'component-overrides' },
];

@Component({
  selector: 'cpa-guides-page',
  standalone: true,
  template: `
    <article class="doc-page">
      <header class="page-header">
        <h1>Guides</h1>
        <p class="subtitle">{{ lib() }}</p>
      </header>

      @switch (lib()) {
        @case ('core') {
          <section id="css-naming" class="page-section">
            <p>
              <code>--</code> is the namespace separator (like <code>.</code> in OOP).
              <code>-</code> is a word separator within a segment. The <code>color</code> role is
              the palette's primary identity — it becomes the prefix with no trailing segment.
            </p>
            <pre><code class="language-css">--color--primary           /* primary color role */
--color--primary--contrast /* black or white (highest contrast) */
--color--primary--dark     /* lightness − 0.12 */
--color--primary--darker   /* lightness − 0.24 */
--color--primary--bg       /* background role */
--color--primary--bg--high /* lighter/darker based on mode */
--color--primary--tint-1   /* 10% opacity tint */
--color--primary--focus    /* per-palette focus ring color */</code></pre>
          </section>

          <section id="runtime-derivatives" class="page-section">
            <h2>Runtime derivatives</h2>
            <p>
              All variant values are computed by the browser using CSS relative color syntax. There
              are no pre-computed values — the browser derives them at paint time.
            </p>
            <pre><code>/* What the output CSS looks like (simplified) */
[theme="azure-blue"] &#123;
  --color--primary: oklch(0.44 0.22 253);

  /* Derived by browser at runtime — NOT pre-computed */
  --color--primary--dark:     oklch(from var(--color--primary) calc(l - 0.12) c h);
  --color--primary--light:    oklch(from var(--color--primary) calc(l + 0.12) c h);
  /* Black or white text: S is 1 (white) when the relative luminance of
     --color--primary is below 0.179, else 0 (black) */
  --color--primary--contrast: oklch(from color(from var(--color--primary) srgb-linear S S S) l 0 0 / 1);
&#125;</code></pre>
          </section>

          <section id="palettes" class="page-section">
            <h2>Palettes</h2>
            <p>
              Each palette is a named color identity defined as an <code>oklch</code> color. You can
              provide separate values for light and dark mode with <code>t.light-dark()</code>.
            </p>
            <pre><code>$palettes: (
  // same color for both modes
  primary: t.palette(oklch(0.55 0.18 240)),

  // different light/dark values
  primary: t.light-dark(
    t.palette(oklch(0.55 0.18 240)),   // light mode
    t.palette(oklch(0.72 0.16 240)),   // dark mode
  ),

  // auto-derived from $brand color
  primary:    t.palette-from-brand(),
  background: t.background-from-brand(),
  surface:    t.surface-from-brand(),
)</code></pre>
            <p>Override individual roles within a palette:</p>
            <pre><code>primary: t.palette(
  $base:   oklch(0.55 0.18 240),
  $color:  oklch(0.50 0.20 240),   // identity color (defaults to $base)
  $bg:     oklch(0.88 0.06 240),   // container/bg role
  $stroke: oklch(0.45 0.16 240),   // border role
  $focus:  oklch(0.40 0.22 240),   // focus ring
),</code></pre>
            <p>
              Core palette names (<code>primary</code>, <code>secondary</code>, <code>error</code>,
              <code>warn</code>, <code>caution</code>, <code>pass</code>, <code>surface</code>,
              <code>background</code>) are pre-registered. Any additional names in your
              <code>$palettes</code> map are registered on demand.
            </p>
          </section>

          <section id="light-dark" class="page-section">
            <h2>Light &amp; dark mode</h2>
            <p>
              Wrap any sub-config value in <code>t.light-dark($light, $dark)</code> to provide
              separate light and dark expressions. The active <code>color-scheme</code> on the root
              element controls which resolves.
            </p>
            <pre><code>$my-theme: t.theme(
  $palettes: (
    primary: t.light-dark(
      t.palette(oklch(0.55 0.18 240)),   // light
      t.palette(oklch(0.72 0.16 240)),   // dark
    ),
  ),
  $weights: t.light-dark(
    t.weights($text-blend: 82%),
    t.weights($text-blend: 78%),
  ),
);</code></pre>
            <p>Control mode from HTML or TypeScript:</p>
            <pre><code>&lt;!-- HTML --&gt;
&lt;html themeMode="auto"&gt;    &lt;!-- follows OS preference --&gt;
&lt;html themeMode="light"&gt;
&lt;html themeMode="dark"&gt;
&lt;div  themeMode="invert"&gt;  &lt;!-- flip mode for this subtree --&gt;

// TypeScript
import &#123; setMode, ThemeMode &#125; from '@cpangular/cp-theming-core';
setMode(ThemeMode.DARK);
setMode(ThemeMode.AUTO);</code></pre>
          </section>

          <section id="nested-scopes" class="page-section">
            <h2>Nested theme scopes</h2>
            <p>
              Place the <code>theme</code> attribute on any element to apply a different palette to
              that subtree. CSS custom properties inherit, so all descendants pick up the new
              values.
            </p>
            <pre><code>&lt;html theme="azure-blue"&gt;
  &lt;!-- azure-blue variables active here --&gt;
  &lt;div theme="rose-red"&gt;
    &lt;!-- rose-red variables active here --&gt;
  &lt;/div&gt;
&lt;/html&gt;</code></pre>
          </section>

          <section id="surfaces" class="page-section">
            <h2>Palette scopes &amp; surface attributes</h2>
            <p>
              <code>[palette="name"]</code> activates a palette for a subtree by pointing
              <code>--palette-color--*</code> aliases at the named palette's vars and setting the
              identity text color. Stack atomic surface layers on top:
            </p>
            <pre><code>&lt;!-- subtle tonal fill, keeps identity text (chip/pill) --&gt;
&lt;section palette="primary" bg&gt;...&lt;/section&gt;

&lt;!-- solid fill from palette identity color --&gt;
&lt;div palette="secondary" filled&gt;...&lt;/div&gt;

&lt;!-- inset border from palette stroke role --&gt;
&lt;div palette="primary" outlined shape="sm"&gt;...&lt;/div&gt;

&lt;!-- corners + padding --&gt;
&lt;div palette="primary" bg shape="md" container&gt;...&lt;/div&gt;</code></pre>
            <p>Fill layers (<code>bg</code>, <code>filled</code>) set these vars on the element:</p>
            <pre><code class="language-css">--container--text            /* blended body text */
--container--text-emphasis   /* full-contrast text */
--container--text-deemphasis /* reduced emphasis text */
--container--stroke          /* border color */
--container--padding         /* density-reactive padding */
--container--radius          /* corner radius */</code></pre>
          </section>

          <section id="tones" class="page-section">
            <h2>Tone modifiers</h2>
            <p>Shift the active palette's lightness within a scope:</p>
            <pre><code>&lt;!-- mode-relative: darkens in light mode, lightens in dark --&gt;
&lt;div palette="primary" tone="high"&gt;...&lt;/div&gt;
&lt;div palette="primary" tone="low"&gt;...&lt;/div&gt;

&lt;!-- larger mode-relative shifts --&gt;
&lt;div palette="primary" tone="higher"&gt;...&lt;/div&gt;
&lt;div palette="primary" tone="highest"&gt;...&lt;/div&gt;
&lt;div palette="primary" tone="lower"&gt;...&lt;/div&gt;
&lt;div palette="primary" tone="lowest"&gt;...&lt;/div&gt;</code></pre>
          </section>

          <section id="elevation" class="page-section">
            <h2>Elevation</h2>
            <p>Five shadow levels, adapted for light and dark mode:</p>
            <pre><code>&lt;div elevated="0"&gt;flat&lt;/div&gt;
&lt;div elevated="1"&gt;card&lt;/div&gt;
&lt;div elevated="2"&gt;dropdown / select panel&lt;/div&gt;
&lt;div elevated="3"&gt;floating action button&lt;/div&gt;
&lt;div elevated="4"&gt;hovered FAB&lt;/div&gt;
&lt;div elevated="5"&gt;modal / dialog&lt;/div&gt;</code></pre>
            <p>Or from SCSS:</p>
            <pre><code>.my-card &#123;
  box-shadow: var(--elevation-2--shadow);
&#125;</code></pre>
          </section>

          <section id="density" class="page-section">
            <h2>Density</h2>
            <p>
              Set a base density in your theme config, or override per-subtree with
              <code>[themeDensity]</code>:
            </p>
            <pre><code>// in your theme definition
$density: t.density($scale: 0)  // 0 = default, -5 = most compact

&lt;!-- scoped override --&gt;
&lt;div themeDensity="-2"&gt;
  &lt;!-- all --space--* tokens are recalculated inside here --&gt;
&lt;/div&gt;</code></pre>
            <p>Density tokens:</p>
            <pre><code class="language-css">--space--xxs /*  2px base  (− 1px per step) */
--space--xs  /*  4px base  (− 1px per step) */
--space--sm  /*  8px base  (− 2px per step) */
--space--md  /* 16px base  (− 4px per step) */
--space--lg  /* 24px base  (− 4px per step) */
--space--xl  /* 32px base  (− 4px per step) */
--space--xxl /* 48px base  (− 4px per step) */</code></pre>
          </section>

          <section id="shape" class="page-section">
            <h2>Shape</h2>
            <p>Corner radius scale, emitted as CSS custom properties:</p>
            <pre><code>// in your theme definition (defaults shown)
$shape: t.shape($xs: 4px, $sm: 8px, $md: 12px, $lg: 16px, $xl: 28px)

/* CSS vars emitted */
--shape--xxs:  2px
--shape--xs:   4px
--shape--sm:   8px
--shape--md:  12px
--shape--lg:  16px
--shape--xl:  28px
--shape--xxl: 48px
--shape--full: 9999px</code></pre>
          </section>

          <section id="adaptor-hooks" class="page-section">
            <h2>Adaptor hooks</h2>
            <p>
              Third-party packages can extend <code>t.define-theme()</code> via the
              <code>$adaptor</code> parameter — without any coupling in core. An adaptor is a Sass
              map of hook mixins returned by a function:
            </p>
            <pre><code>// Using the Angular Material adaptor
&#64;use '@cpangular/cp-theming-core/scss/theme' as t;
&#64;use '@cpangular/cp-theming-ng-material/scss/material' as mat;

&#64;include t.define-theme('my-theme', $my-theme, $adaptor: mat.adaptor());</code></pre>
            <p>The adaptor receives four optional hook mixins:</p>
            <pre><code>// define-palette-after($palette-name) is called after each palette is registered.
// mat.adaptor() uses it to emit:
//   [palette="warn"]  &#123; --mat-sys-primary: var(--color--warn); … &#125;
//   [palette="pass"]  &#123; --mat-sys-primary: var(--color--pass); … &#125;
// so Material components respond to [palette] attributes automatically.</code></pre>
          </section>
        }

        @case ('ng-core') {
          <section id="signal-reactivity" class="page-section">
            <h2>ThemeService signal reactivity</h2>
            <p>
              <code>ThemeService</code> uses Angular signals internally. All state changes
              (<code>setTheme</code>, <code>setMode</code>) trigger signal updates synchronously.
              Components that read <code>themeService.theme()</code> or <code>mode()</code>
              re-render automatically when those signals change — no manual subscriptions.
            </p>
          </section>

          <section id="scoped-themes" class="page-section">
            <h2>Scoped themes with ThemeDirective</h2>
            <p>
              Import <code>ThemeDirective</code> and use <code>[theme]</code> on any host element.
              The directive sets the HTML attribute, activating the correct CSS variable scope.
            </p>
            <pre><code>// component.ts
imports: [ThemeDirective]

// template
&lt;div [theme]="'rose-red'"&gt;
  &lt;!-- Material components here inherit rose-red palette --&gt;
&lt;/div&gt;</code></pre>
          </section>

          <section id="persisting-state" class="page-section">
            <h2>Persisting theme/mode across sessions</h2>
            <pre><code>// Call once during app startup (e.g. in AppComponent constructor)
const themeService = inject(ThemeService);
themeService.configurePersistence(ThemeStorage.LOCAL);
themeService.restorePersistedState();</code></pre>
          </section>
        }

        @case ('ng-material') {
          <section id="cascade" class="page-section">
            <h2>How the cascade works</h2>
            <p>
              <code>material-core.css</code> maps every <code>--mat-sys-*</code> token to a
              <code>var(--color--*)</code> reference on <code>:root</code>. Because CSS custom
              property <code>var()</code> references are resolved lazily at the element where
              they're consumed (not where they're defined), Angular Material components inside a
              <code>[theme="rose-red"]</code> subtree automatically receive rose-red's values.
            </p>
          </section>

          <section id="tertiary" class="page-section">
            <h2>Tertiary palette</h2>
            <p>
              Angular Material M3 defines three accent palettes: primary, secondary, and tertiary.
              cp-theming only has two accent palettes. Tertiary is intentionally mapped to
              secondary. If you need a distinct tertiary, override
              <code>--mat-sys-tertiary*</code> after including <code>material-core.css</code>.
            </p>
          </section>

          <section id="component-overrides" class="page-section">
            <h2>Adding component overrides</h2>
            <p>
              Some Angular Material components bypass <code>--mat-sys-*</code> and hardcode values.
              Add patches in <code>apply-material-overrides()</code> in
              <code>packages/theme-ng-material/scss/_material.scss</code>. The demo-material
              application surfaces these gaps.
            </p>
          </section>
        }

        @default {
          <section class="page-section">
            <p>
              Guides for <strong>{{ lib() }}</strong> are coming soon.
            </p>
          </section>
        }
      }
    </article>
  `,
  styles: [
    `
      @use 'page-shared';
    `,
  ],
})
export class GuidesPageComponent {
  private readonly _toc = inject(TocService);
  private readonly _parentParams = toSignal(inject(ActivatedRoute).parent!.params);
  readonly lib = computed(() => (this._parentParams()?.['lib'] as string) ?? 'core');

  constructor() {
    effect(() => {
      const lib = this.lib();
      if (lib === 'core') this._toc.set(CORE_TOC);
      else if (lib === 'ng-core') this._toc.set(NG_CORE_TOC);
      else if (lib === 'ng-material') this._toc.set(NG_MATERIAL_TOC);
      else this._toc.clear();
    });
  }
}
