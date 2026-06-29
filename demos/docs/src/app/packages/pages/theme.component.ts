import { Component, inject } from '@angular/core';
import { TocService } from '../../shell/toc.service';

const TOC = [
  { label: 'Overview', anchor: 'overview' },
  { label: 'Light & dark mode', anchor: 'light-dark' },
  { label: 'Nested theme scopes', anchor: 'nested-scopes' },
  { label: 'Palette scopes', anchor: 'palette-scopes' },
  { label: 'Adaptor hooks', anchor: 'adaptor-hooks' },
  { label: 'API Reference', anchor: 'api' },
  { label: 'define-core-theme', anchor: 'define-core-theme' },
  { label: 'define-theme', anchor: 'define-theme' },
  { label: 'theme()', anchor: 'theme-fn' },
  { label: 'light-dark()', anchor: 'light-dark-fn' },
];

@Component({
  selector: 'cpa-theme-page',
  standalone: true,
  template: `
    <article class="doc-page">
      <header class="page-header">
        <h1>Theme</h1>
        <p class="subtitle">@cpangular/cp-theming-core</p>
      </header>

      <section id="overview" class="page-section">
        <p class="intro">
          A theme is a named set of CSS variable declarations scoped to a
          <code>[theme="name"]</code> attribute. Build one with <code>t.theme()</code> from typed
          sub-configs, then emit it to CSS with <code>&#64;include t.define-theme()</code>. Call
          <code>&#64;include t.define-core-theme()</code> once to register all shared
          <code>&#64;property</code> declarations and the attribute rules that activate scoped token
          inheritance.
        </p>
        <pre><code>&#64;use '@cpangular/cp-theming-core/scss/theme' as t;

$my-theme: t.theme(
  $palettes: (
    primary: t.palette(oklch(0.44 0.22 253)),
  ),
  $weights:    t.weights(),
  $typography: t.typography($plain-family: system-ui),
  $density:    t.density($scale: 0),
  $shape:      t.shape(),
  $focus:      t.focus($width: 3px),
  $motion:     t.motion(),
  $elevation:  t.elevation(),
  $overlay:    t.overlays(),
);

&#64;include t.define-theme('my-theme', $my-theme, $default: true);
&#64;include t.define-core-theme();</code></pre>
      </section>

      <section id="light-dark" class="page-section">
        <h2>Light &amp; dark mode</h2>
        <p>
          Wrap any sub-config value in <code>t.light-dark($light, $dark)</code> to provide separate
          light and dark expressions. The active <code>color-scheme</code> on the root element
          controls which resolves.
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
setMode(ThemeMode.DARK);</code></pre>
      </section>

      <section id="nested-scopes" class="page-section">
        <h2>Nested theme scopes</h2>
        <p>
          Place the <code>theme</code> attribute on any element to apply a different theme to that
          subtree. CSS custom properties inherit, so all descendants pick up the new values.
        </p>
        <pre><code>&lt;html theme="azure-blue"&gt;
  &lt;!-- azure-blue variables active here --&gt;
  &lt;div theme="rose-red"&gt;
    &lt;!-- rose-red variables active here --&gt;
  &lt;/div&gt;
&lt;/html&gt;</code></pre>
      </section>

      <section id="palette-scopes" class="page-section">
        <h2>Palette scopes &amp; surface attributes</h2>
        <p>
          <code>[palette="name"]</code> activates a palette for a subtree by pointing
          <code>--palette-color--*</code> aliases at the named palette's vars. Combine with a
          surface attribute to apply background and text styling:
        </p>
        <pre><code>&lt;!-- bg from palette bg role, text auto-contrasted --&gt;
&lt;section palette="primary" container&gt;...&lt;/section&gt;

&lt;!-- solid fill from palette identity color --&gt;
&lt;div palette="secondary" filled&gt;...&lt;/div&gt;

&lt;!-- transparent bg, inset border from palette stroke role --&gt;
&lt;div palette="primary" outlined&gt;...&lt;/div&gt;</code></pre>
      </section>

      <section id="adaptor-hooks" class="page-section">
        <h2>Adaptor hooks</h2>
        <p>
          Third-party packages can extend <code>t.define-theme()</code> via the
          <code>$adaptor</code> parameter — without any coupling in core. An adaptor is a Sass map
          of hook mixins returned by a function:
        </p>
        <pre><code>&#64;use '@cpangular/cp-theming-core/scss/theme' as t;
&#64;use '@cpangular/cp-theming-ng-material/scss/material' as mat;

&#64;include t.define-theme('my-theme', $my-theme, $adaptor: mat.adaptor());</code></pre>
      </section>

      <section id="api" class="page-section">
        <h2 class="api-section-heading">API Reference</h2>
        <hr class="api-section-rule" />
        <div class="api-import-line">
          <code>&#64;use '@cpangular/cp-theming-core/scss/theme' as t;</code>
        </div>

        <div id="define-core-theme" class="api-symbol">
          <h3 class="api-symbol-name">define-core-theme</h3>
          <p class="api-symbol-desc">
            Emit shared <code>&#64;property</code> registrations for all palette color roles, and
            the attribute-selector rules (<code>[theme]</code>, <code>[palette]</code>,
            <code>[themeDensity]</code>) that activate scoped token inheritance. Call once at root —
            never more than once per stylesheet.
          </p>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-kw">&#64;include t.</span
              ><span class="api-sig-name">define-core-theme</span
              ><span class="api-sig-punct">(</span><span class="api-sig-param">$selector</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">':root'</span
              ><span class="api-sig-punct">)</span></span
            >
            <div class="api-member-body">
              <h5 class="api-params-heading">Parameters</h5>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$selector</span
                  ><span class="api-param-type">string</span
                  ><span class="api-param-default">default ':root'</span>
                </div>
                <div class="api-param-desc">
                  CSS selector to emit <code>&#64;property</code> declarations on. Override only if
                  your app root is not <code>:root</code>.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="define-theme" class="api-symbol">
          <h3 class="api-symbol-name">define-theme</h3>
          <p class="api-symbol-desc">
            Emit all CSS variable declarations for a named theme scoped to
            <code>[theme="$name"]</code>. Multiple themes can coexist — the active one is selected
            by setting the <code>theme</code> attribute on any ancestor element.
          </p>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-kw">&#64;include t.</span
              ><span class="api-sig-name">define-theme</span><span class="api-sig-punct">(</span
              ><span class="api-sig-param">$name</span><span class="api-sig-punct">, </span
              ><span class="api-sig-param">$theme</span><span class="api-sig-punct">, </span
              ><span class="api-sig-param">$default</span><span class="api-sig-punct">: </span
              ><span class="api-sig-default">false</span><span class="api-sig-punct">, </span
              ><span class="api-sig-param">$dedupe</span><span class="api-sig-punct">: </span
              ><span class="api-sig-default">true</span><span class="api-sig-punct">, </span
              ><span class="api-sig-param">$adaptor</span><span class="api-sig-punct">: </span
              ><span class="api-sig-default">()</span><span class="api-sig-punct">)</span></span
            >
            <div class="api-member-body">
              <h5 class="api-params-heading">Parameters</h5>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$name</span
                  ><span class="api-param-type">string</span>
                </div>
                <div class="api-param-desc">
                  Attribute value matched by <code>[theme="$name"]</code>. Required.
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$theme</span><span class="api-param-type">map</span>
                </div>
                <div class="api-param-desc">
                  Theme config map returned by <code>t.theme()</code>. Required.
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$default</span
                  ><span class="api-param-type">boolean</span
                  ><span class="api-param-default">default false</span>
                </div>
                <div class="api-param-desc">
                  Also emit on <code>:root</code> so the theme applies without any
                  <code>[theme]</code> attribute present.
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$dedupe</span
                  ><span class="api-param-type">boolean</span
                  ><span class="api-param-default">default true</span>
                </div>
                <div class="api-param-desc">
                  Skip properties whose light and dark values are identical — reduces output CSS
                  size.
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$adaptor</span><span class="api-param-type">map</span
                  ><span class="api-param-default">default ()</span>
                </div>
                <div class="api-param-desc">
                  Hook map from a package adaptor, e.g. <code>mat.adaptor()</code> from
                  <code>cp-theming-ng-material</code>.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="theme-fn" class="api-symbol">
          <h3 class="api-symbol-name">theme</h3>
          <p class="api-symbol-desc">
            Assemble a theme config map from typed sub-configs. Only <code>$palettes</code> is
            required — all other parameters have well-considered defaults.
          </p>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-kw">t.</span><span class="api-sig-name">theme</span
              ><span class="api-sig-punct">(</span><span class="api-sig-param">$palettes</span
              ><span class="api-sig-punct">, </span><span class="api-sig-param">$brand</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">null</span
              ><span class="api-sig-punct">, </span><span class="api-sig-param">$weights</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">null</span
              ><span class="api-sig-punct">, </span><span class="api-sig-param">$typography</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">null</span
              ><span class="api-sig-punct">, …</span><span class="api-sig-punct">) → </span
              ><span class="api-sig-return">map</span></span
            >
            <div class="api-member-body">
              <h5 class="api-params-heading">Parameters</h5>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$palettes</span
                  ><span class="api-param-type">map</span>
                </div>
                <div class="api-param-desc">
                  Map of palette name → <code>t.palette()</code> or
                  <code>t.light-dark()</code> pair. Required.
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$brand</span
                  ><span class="api-param-type">color?</span
                  ><span class="api-param-default">default null</span>
                </div>
                <div class="api-param-desc">
                  Brand color emitted as <code>--color--brand</code>. Required for
                  <code>t.palette-from-brand()</code>.
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$weights</span
                  ><span class="api-param-type">map?</span
                  ><span class="api-param-default">default null</span>
                </div>
                <div class="api-param-desc">
                  State layer and text blend opacities. Pass <code>t.weights()</code> or
                  <code>t.light-dark(t.weights(), t.weights())</code>.
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$typography</span
                  ><span class="api-param-type">map?</span
                  ><span class="api-param-default">default null</span>
                </div>
                <div class="api-param-desc">
                  Type scale config from <code>t.typography()</code>. Defaults to system-ui.
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$density</span
                  ><span class="api-param-type">map?</span
                  ><span class="api-param-default">default null</span>
                </div>
                <div class="api-param-desc">
                  Density scale from <code>t.density()</code>. Defaults to 0 (comfortable).
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$shape</span><span class="api-param-type">map?</span
                  ><span class="api-param-default">default null</span>
                </div>
                <div class="api-param-desc">Corner radius scale from <code>t.shape()</code>.</div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$focus</span><span class="api-param-type">map?</span
                  ><span class="api-param-default">default null</span>
                </div>
                <div class="api-param-desc">
                  Focus ring width, offset, and style from <code>t.focus()</code>.
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$motion</span><span class="api-param-type">map?</span
                  ><span class="api-param-default">default null</span>
                </div>
                <div class="api-param-desc">
                  Motion duration and easing tokens from <code>t.motion()</code>.
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$elevation</span
                  ><span class="api-param-type">map?</span
                  ><span class="api-param-default">default null</span>
                </div>
                <div class="api-param-desc">Shadow levels from <code>t.elevation()</code>.</div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$overlay</span
                  ><span class="api-param-type">map?</span
                  ><span class="api-param-default">default null</span>
                </div>
                <div class="api-param-desc">
                  Scrim and shadow overlay colors from <code>t.overlays()</code>.
                </div>
              </div>
              <h5 class="api-returns-heading">Returns</h5>
              <div class="api-param-row">
                <div><span class="api-param-type">map</span></div>
                <div class="api-param-desc">
                  Theme config map. Pass to <code>t.define-theme()</code>.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="light-dark-fn" class="api-symbol">
          <h3 class="api-symbol-name">light-dark</h3>
          <p class="api-symbol-desc">
            Wrap any sub-config value to provide separate expressions for light and dark modes. The
            active <code>color-scheme</code> on the root element controls which resolves. This is
            NOT the CSS <code>light-dark()</code> function — it works for any value type, not just
            <code>&lt;color&gt;</code>.
          </p>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-kw">t.</span><span class="api-sig-name">light-dark</span
              ><span class="api-sig-punct">(</span><span class="api-sig-param">$light</span
              ><span class="api-sig-punct">, </span><span class="api-sig-param">$dark</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">$light</span
              ><span class="api-sig-punct">) → </span><span class="api-sig-return">map</span></span
            >
            <div class="api-member-body">
              <h5 class="api-params-heading">Parameters</h5>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$light</span><span class="api-param-type">any</span>
                </div>
                <div class="api-param-desc">
                  Value used in light mode. Can be a palette, sub-config, number, or any Sass type.
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$dark</span><span class="api-param-type">any</span
                  ><span class="api-param-default">default $light</span>
                </div>
                <div class="api-param-desc">
                  Value used in dark mode. If omitted, both modes use the same value.
                </div>
              </div>
              <h5 class="api-returns-heading">Returns</h5>
              <div class="api-param-row">
                <div><span class="api-param-type">map</span></div>
                <div class="api-param-desc">
                  A <code>(light: ..., dark: ...)</code> map consumed by <code>t.theme()</code>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </article>
  `,
  styles: [
    `
      @use 'page-shared';
    `,
  ],
})
export class ThemePageComponent {
  constructor() {
    inject(TocService).set(TOC);
  }
}
