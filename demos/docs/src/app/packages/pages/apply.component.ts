import { Component } from '@angular/core';

/** @deprecated Route now redirects to apply-palette. This component is kept to avoid import errors. */
@Component({
  selector: 'cpa-apply-page',
  standalone: true,
  template: ``,
})
export class ApplyPageComponent {}

const TOC = [
  { label: 'Overview', anchor: 'overview' },
  { label: 'Palette scopes', anchor: 'palette-scopes' },
  { label: 'Tone modifiers', anchor: 'tones' },
  { label: 'API Reference', anchor: 'api' },
  { label: 'apply-palette()', anchor: 'apply-palette' },
  { label: 'container()', anchor: 'container' },
  { label: 'filled()', anchor: 'filled' },
  { label: 'outlined()', anchor: 'outlined' },
  { label: 'stroke()', anchor: 'stroke' },
  { label: 'radius()', anchor: 'radius' },
  { label: 'padding()', anchor: 'padding' },
];

@Component({
  selector: 'cpa-apply-page',
  standalone: true,
  template: `
    <article class="doc-page">
      <header class="page-header">
        <h1>Apply Mixins</h1>
        <p class="subtitle">@cpangular/cp-theming-core</p>
      </header>

      <section id="overview" class="page-section">
        <p class="intro">
          The apply mixins are a composable layer for associating palette colors with DOM elements.
          They stamp <code>--palette-color--*</code> alias variables onto an element and emit
          surface styling (background, text, border) based on the active palette. They work
          independently of any component framework.
        </p>
      </section>

      <section id="palette-scopes" class="page-section">
        <h2>Palette scopes</h2>
        <p>
          The <code>[palette="name"]</code> attribute activates a palette scope on an element — it
          routes the named palette's color tokens into <code>--palette-color--*</code> alias
          variables that the element and all its descendants can use. On its own it applies no
          visible styling.
        </p>
        <p>
          To get background and text colors, add one of three <strong>surface attributes</strong>
          alongside it. Each one describes a different visual treatment:
        </p>
        <table class="api-table">
          <thead>
            <tr>
              <th>Attribute</th>
              <th>Background</th>
              <th>Text</th>
              <th>Use for</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>container</code></td>
              <td>Muted tint (bg role)</td>
              <td>Auto-contrasted</td>
              <td>Sections, cards, page regions</td>
            </tr>
            <tr>
              <td><code>filled</code></td>
              <td>Solid palette color</td>
              <td>Auto-contrasted</td>
              <td>Buttons, chips, badges</td>
            </tr>
            <tr>
              <td><code>outlined</code></td>
              <td>Transparent</td>
              <td>Palette color</td>
              <td>Outlined buttons, bordered cards</td>
            </tr>
          </tbody>
        </table>
        <pre><code>&lt;!-- Muted tinted background, contrasted body text --&gt;
&lt;section palette="primary" container&gt;...&lt;/section&gt;

&lt;!-- Solid palette color background —  punchy fill --&gt;
&lt;div palette="secondary" filled&gt;...&lt;/div&gt;

&lt;!-- No background, palette-colored text + border --&gt;
&lt;div palette="error" outlined&gt;...&lt;/div&gt;</code></pre>
        <p>
          All three set the same <code>--container--*</code> vars on the element so you can use them
          in child styles without knowing which surface type is active:
        </p>
        <pre><code class="language-css">--container--text            /* blended body text color */
--container--text-emphasis   /* full-contrast text */
--container--text-deemphasis /* reduced-emphasis text */
--container--stroke          /* border color */
--container--padding         /* density-reactive padding */
--container--radius          /* corner radius */</code></pre>
        <p>
          Add the <code>.stroke</code> class to render an inset border using
          <code>--container--stroke</code>:
        </p>
        <pre><code>&lt;div palette="primary" container class="stroke"&gt;...&lt;/div&gt;</code></pre>
      </section>

      <section id="tones" class="page-section">
        <h2>Tone modifiers</h2>
        <p>
          Shift the active palette's lightness within a scope using the <code>tone</code> attribute:
        </p>
        <pre><code>&lt;!-- mode-relative: darkens in light mode, lightens in dark --&gt;
&lt;div palette="primary" tone="high"&gt;...&lt;/div&gt;
&lt;div palette="primary" tone="low"&gt;...&lt;/div&gt;

      &lt;!-- larger mode-relative shifts --&gt;
      &lt;div palette="primary" tone="higher"&gt;...&lt;/div&gt;
      &lt;div palette="primary" tone="highest"&gt;...&lt;/div&gt;
      &lt;div palette="primary" tone="lower"&gt;...&lt;/div&gt;
      &lt;div palette="primary" tone="lowest"&gt;...&lt;/div&gt;</code></pre>
      </section>

      <section id="api" class="page-section">
        <h2 class="api-section-heading">API Reference</h2>
        <hr class="api-section-rule" />
        <div class="api-import-line">
          <code>&#64;use '@cpangular/cp-theming-core/scss/theme' as t;</code>
        </div>

        <div id="apply-palette" class="api-symbol">
          <h3 class="api-symbol-name">apply-palette</h3>
          <p class="api-symbol-desc">
            Stamp <code>--palette-color--*</code> alias variables pointing at the named palette's
            token set. Does not apply any background or text styling on its own — use with
            <code>container()</code>, <code>filled()</code>, or <code>outlined()</code>.
          </p>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-kw">&#64;include t.</span
              ><span class="api-sig-name">apply-palette</span><span class="api-sig-punct">(</span
              ><span class="api-sig-param">$name</span><span class="api-sig-punct">)</span></span
            >
            <div class="api-member-body">
              <h5 class="api-params-heading">Parameters</h5>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$name</span
                  ><span class="api-param-type">string</span>
                </div>
                <div class="api-param-desc">
                  Palette name matching one registered in <code>t.theme($palettes: (...))</code>.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="container" class="api-symbol">
          <h3 class="api-symbol-name">container</h3>
          <p class="api-symbol-desc">
            Apply palette background color (<code>--color--name--bg</code>) and auto-contrasted
            text. Emits <code>--container--*</code> vars and sets <code>background-color</code>,
            <code>color</code>, <code>border-radius</code>, and <code>padding</code>.
          </p>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-kw">&#64;include t.</span
              ><span class="api-sig-name">container</span><span class="api-sig-punct">(</span
              ><span class="api-sig-param">$palette</span><span class="api-sig-punct">: </span
              ><span class="api-sig-default">null</span><span class="api-sig-punct">)</span></span
            >
            <div class="api-member-body">
              <h5 class="api-params-heading">Parameters</h5>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$palette</span
                  ><span class="api-param-type">string?</span
                  ><span class="api-param-default">default null</span>
                </div>
                <div class="api-param-desc">
                  If provided, calls <code>apply-palette($palette)</code> first. Omit if palette is
                  already active.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="filled" class="api-symbol">
          <h3 class="api-symbol-name">filled</h3>
          <p class="api-symbol-desc">
            Apply the palette identity color (<code>--color--name</code>) as background with
            auto-contrasted text — a solid filled surface.
          </p>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-kw">&#64;include t.</span
              ><span class="api-sig-name">filled</span><span class="api-sig-punct">(</span
              ><span class="api-sig-param">$palette</span><span class="api-sig-punct">: </span
              ><span class="api-sig-default">null</span><span class="api-sig-punct">)</span></span
            >
            <div class="api-member-body">
              <h5 class="api-params-heading">Parameters</h5>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$palette</span
                  ><span class="api-param-type">string?</span
                  ><span class="api-param-default">default null</span>
                </div>
                <div class="api-param-desc">Optional palette name to activate before applying.</div>
              </div>
            </div>
          </div>
        </div>

        <div id="outlined" class="api-symbol">
          <h3 class="api-symbol-name">outlined</h3>
          <p class="api-symbol-desc">
            Apply an inset border from the palette stroke role with no background — transparent
            container with a colored border.
          </p>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-kw">&#64;include t.</span
              ><span class="api-sig-name">outlined</span><span class="api-sig-punct">(</span
              ><span class="api-sig-param">$palette</span><span class="api-sig-punct">: </span
              ><span class="api-sig-default">null</span><span class="api-sig-punct">)</span></span
            >
            <div class="api-member-body">
              <h5 class="api-params-heading">Parameters</h5>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$palette</span
                  ><span class="api-param-type">string?</span
                  ><span class="api-param-default">default null</span>
                </div>
                <div class="api-param-desc">Optional palette name to activate before applying.</div>
              </div>
            </div>
          </div>
        </div>

        <div id="stroke" class="api-symbol">
          <h3 class="api-symbol-name">stroke</h3>
          <p class="api-symbol-desc">
            Emit an inset border using <code>::after</code> pseudo-element. Can be layered with
            <code>container()</code> or <code>filled()</code>. The stroke width compensates padding
            automatically so content is never clipped.
          </p>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-kw">&#64;include t.</span
              ><span class="api-sig-name">stroke</span><span class="api-sig-punct">(</span
              ><span class="api-sig-param">$width</span><span class="api-sig-punct">: </span
              ><span class="api-sig-default">1px</span><span class="api-sig-punct">, </span
              ><span class="api-sig-param">$color</span><span class="api-sig-punct">: </span
              ><span class="api-sig-default">null</span><span class="api-sig-punct">)</span></span
            >
            <div class="api-member-body">
              <h5 class="api-params-heading">Parameters</h5>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$width</span
                  ><span class="api-param-type">length?</span
                  ><span class="api-param-default">default 1px</span>
                </div>
                <div class="api-param-desc">
                  Border width. Also sets <code>--container--stroke-width</code> so padding
                  compensates.
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$color</span
                  ><span class="api-param-type">color?</span
                  ><span class="api-param-default">default --container--stroke</span>
                </div>
                <div class="api-param-desc">
                  Explicit stroke color override. Defaults to the active palette's stroke role.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="radius" class="api-symbol">
          <h3 class="api-symbol-name">radius</h3>
          <p class="api-symbol-desc">
            Set <code>--container--radius--*</code> variables. All corners can be set independently;
            unset corners fall through to side pairs, then to the base all-corners value.
          </p>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-kw">&#64;include t.</span
              ><span class="api-sig-name">radius</span><span class="api-sig-punct">(</span
              ><span class="api-sig-param">$all</span><span class="api-sig-punct">: </span
              ><span class="api-sig-default">null</span><span class="api-sig-punct">, </span
              ><span class="api-sig-param">$top</span><span class="api-sig-punct">: </span
              ><span class="api-sig-default">null</span><span class="api-sig-punct">, </span
              ><span class="api-sig-param">$bottom</span><span class="api-sig-punct">: </span
              ><span class="api-sig-default">null</span><span class="api-sig-punct">, …</span
              ><span class="api-sig-punct">)</span></span
            >
            <div class="api-member-body">
              <h5 class="api-params-heading">Parameters</h5>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$all</span
                  ><span class="api-param-type">length?</span>
                </div>
                <div class="api-param-desc">All corners base fallback.</div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$top / $bottom</span
                  ><span class="api-param-type">length?</span>
                </div>
                <div class="api-param-desc">Top-left + top-right / bottom-left + bottom-right.</div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$left / $right</span
                  ><span class="api-param-type">length?</span>
                </div>
                <div class="api-param-desc">Top-left + bottom-left / top-right + bottom-right.</div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$tl / $tr / $br / $bl</span
                  ><span class="api-param-type">length?</span>
                </div>
                <div class="api-param-desc">Individual corners (highest priority).</div>
              </div>
            </div>
          </div>
        </div>

        <div id="padding" class="api-symbol">
          <h3 class="api-symbol-name">padding</h3>
          <p class="api-symbol-desc">
            Set <code>--container--padding--*</code> variables. Unset values fall through to axis
            pairs, then to the base all-sides value, then to <code>--space--lg</code>. Padding
            automatically compensates for inset stroke width.
          </p>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-kw">&#64;include t.</span
              ><span class="api-sig-name">padding</span><span class="api-sig-punct">(</span
              ><span class="api-sig-param">$all</span><span class="api-sig-punct">: </span
              ><span class="api-sig-default">null</span><span class="api-sig-punct">, </span
              ><span class="api-sig-param">$block</span><span class="api-sig-punct">: </span
              ><span class="api-sig-default">null</span><span class="api-sig-punct">, </span
              ><span class="api-sig-param">$inline</span><span class="api-sig-punct">: </span
              ><span class="api-sig-default">null</span><span class="api-sig-punct">, …</span
              ><span class="api-sig-punct">)</span></span
            >
            <div class="api-member-body">
              <h5 class="api-params-heading">Parameters</h5>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$all</span
                  ><span class="api-param-type">length?</span>
                </div>
                <div class="api-param-desc">All four sides base fallback.</div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$block / $inline</span
                  ><span class="api-param-type">length?</span>
                </div>
                <div class="api-param-desc">Block (top + bottom) / inline (left + right) axes.</div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$block-start / $block-end</span
                  ><span class="api-param-type">length?</span>
                </div>
                <div class="api-param-desc">Individual block sides.</div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$inline-start / $inline-end</span
                  ><span class="api-param-type">length?</span>
                </div>
                <div class="api-param-desc">Individual inline sides.</div>
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
export class ApplyPageComponent {
  constructor() {
    inject(TocService).set(TOC);
  }
}
