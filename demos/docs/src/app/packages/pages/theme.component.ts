import { Component, inject } from '@angular/core';
import { TocService } from '../../shell/toc.service';
import { CodeComponent } from '../../shared/code.component';
import { ThemeExampleComponent } from '../../shared/theme-example.component';
import basicScss from '../../../examples/theme/basic.scss' with { loader: 'text' };
import lightDarkScss from '../../../examples/theme/light-dark.scss' with { loader: 'text' };
import modeHtml from '../../../examples/theme/mode.html' with { loader: 'text' };
import htmlModeHtml from '../../../examples/theme/html-mode.html' with { loader: 'text' };
import nestedHtml from '../../../examples/theme/nested.html' with { loader: 'text' };
import paletteScopesHtml from '../../../examples/theme/palette-scopes.html' with { loader: 'text' };
import adaptorScss from '../../../examples/theme/adaptor.scss' with { loader: 'text' };

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
  imports: [CodeComponent, ThemeExampleComponent],
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
          <code>&#64;include t.define-core-theme()</code> once, before any theme: it registers the
          typed properties and declares every default, every derivation and the attribute rules,
          shared by all themes. A theme rule then holds only what was passed to
          <code>t.theme()</code>.
        </p>
        <cpa-code [code]="ex.basicScss" lang="scss" />
        <p>
          A theme does not have to pass every palette. Colours follow the chain
          <code>brand</code> → <code>primary</code> → <code>secondary</code>,
          <code>tertiary</code> → <code>background</code>, <code>surface</code>: pass whichever you
          have, and core generates each one you leave out from the nearest one you passed. The brand
          colour is kept exactly as written; the primary generated from it is moved into the
          lightness that reads on the page. <code>error</code>, <code>warn</code>,
          <code>caution</code> and <code>pass</code> have fixed defaults. The Palette page has the
          numbers.
        </p>
      </section>

      <section id="light-dark" class="page-section">
        <h2>Light &amp; dark mode</h2>
        <p>
          Wrap any sub-config value in <code>t.light-dark($light, $dark)</code> to provide separate
          light and dark values. Each value resolves against the mode of the element that uses it.
        </p>
        <cpa-code [code]="ex.lightDarkScss" lang="scss" />
        <p>
          The <code>themeMode</code> attribute chooses the mode. It works on any element, with or
          without a <code>theme</code> attribute, and applies to everything inside it:
        </p>
        <cpa-theme-example title="themeMode on any element" [attrsHtml]="ex.modeHtml" />
        <p>
          On <code>&lt;html&gt;</code> it sets the mode of the page; <code>auto</code> follows the
          operating system:
        </p>
        <cpa-code [code]="ex.htmlModeHtml" lang="html" />
        <p>Or from TypeScript:</p>
        <pre><code class="language-typescript">import &#123; setMode, ThemeMode &#125; from '@cpangular/cp-theming-core';

setMode(ThemeMode.DARK);
setMode(ThemeMode.AUTO);</code></pre>
      </section>

      <section id="nested-scopes" class="page-section">
        <h2>Nested theme scopes</h2>
        <p>
          Place the <code>theme</code> attribute on any element to apply a different theme to that
          subtree. A nested theme declares only what its author passed and inherits everything else
          from the theme around it. The palettes that are generated follow what the nested theme
          passes: one that passes only <code>primary</code> gets its own secondary and tertiary, one
          that passes only <code>brand</code> gets a whole new set, and one that passes no colour
          (only a shape, say) keeps every colour of the theme around it.
        </p>
        <cpa-theme-example title="A theme inside a theme" [attrsHtml]="ex.nestedHtml" />
      </section>

      <section id="palette-scopes" class="page-section">
        <h2>Palette scopes &amp; surface attributes</h2>
        <p>
          <code>[palette="name"]</code> activates a palette for a subtree by pointing
          <code>--palette-color--*</code> aliases at the named palette's vars. Combine with a
          surface attribute to apply background and text styling:
        </p>
        <cpa-theme-example
          title="Palette scope and surface layers"
          [attrsHtml]="ex.paletteScopesHtml"
        />
      </section>

      <section id="adaptor-hooks" class="page-section">
        <h2>Adaptor hooks</h2>
        <p>
          Third-party packages can extend <code>t.define-theme()</code> via the
          <code>$adaptor</code> parameter — without any coupling in core. An adaptor is a Sass map
          of hook mixins returned by a function:
        </p>
        <cpa-code [code]="ex.adaptorScss" lang="scss" />
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
            Emit everything that does not depend on a theme, once: the
            <code>&#64;property</code> registrations (each core palette role's light and dark color,
            and the weight, density, space and shape scalars), every default, the
            <code>themeMode</code> rules, every derivation, the palettes a theme left out, and the
            attribute rules (<code>[palette]</code>, the surface layers, <code>[elevated]</code>,
            <code>[themeDensity]</code>). Call it once, at the top level of a stylesheet, before any
            theme.
          </p>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-kw">&#64;include t.</span
              ><span class="api-sig-name">define-core-theme</span
              ><span class="api-sig-punct">()</span></span
            >
            <div class="api-member-body">
              <p class="api-member-desc">
                No parameters. The registrations are top-level <code>&#64;property</code> rules and
                the defaults and derivations sit on <code>:where(:root)</code> and
                <code>:where(:root, [theme])</code>, at zero specificity, so a theme rule and your
                own <code>:root</code> rule both win over them.
              </p>
            </div>
          </div>
        </div>

        <div id="define-theme" class="api-symbol">
          <h3 class="api-symbol-name">define-theme</h3>
          <p class="api-symbol-desc">
            Emit one rule for a named theme, scoped to <code>[theme="$name"]</code>, holding only
            what was passed to <code>t.theme()</code>. Multiple themes can coexist — the active one
            is selected by setting the <code>theme</code> attribute on any ancestor element.
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
                  Also apply on <code>:where(:root)</code>, so the theme applies without any
                  <code>theme</code> attribute and any <code>theme</code> attribute beats it.
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$dedupe</span
                  ><span class="api-param-type">boolean</span
                  ><span class="api-param-default">default true</span>
                </div>
                <div class="api-param-desc">
                  Accepted for compatibility. A theme rule holds only what was passed, so nothing is
                  left to dedupe.
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
            Assemble a theme config map from typed sub-configs. Nothing is required: pass
            <code>$brand</code>, some palettes, or both. The map holds only what was passed; core
            generates the palettes that were left out and supplies the default of everything else.
          </p>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-kw">t.</span><span class="api-sig-name">theme</span
              ><span class="api-sig-punct">(</span><span class="api-sig-param">$palettes</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">()</span
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
                  <code>t.light-dark()</code> pair. A palette left out is generated
                  (<code>primary</code>, <code>secondary</code>, <code>tertiary</code>,
                  <code>background</code>, <code>surface</code>) or a fixed default
                  (<code>error</code>, <code>warn</code>, <code>caution</code>, <code>pass</code>).
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$brand</span
                  ><span class="api-param-type">color?</span
                  ><span class="api-param-default">default null</span>
                </div>
                <div class="api-param-desc">
                  The brand color, exactly as given: the <code>brand</code> palette,
                  <code>--color--brand</code>. Never adjusted. A primary, background and surface the
                  theme does not pass are generated from it. The same as passing
                  <code>brand: t.palette(…)</code> in <code>$palettes</code>.
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
            Wrap any sub-config value to provide separate values for light and dark modes. Each
            resolves against the mode of the element that uses it. This is NOT the CSS
            <code>light-dark()</code> function — it works for any value type, not just
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
  protected readonly ex = {
    basicScss,
    lightDarkScss,
    modeHtml,
    htmlModeHtml,
    nestedHtml,
    paletteScopesHtml,
    adaptorScss,
  };

  constructor() {
    inject(TocService).set(TOC);
  }
}
