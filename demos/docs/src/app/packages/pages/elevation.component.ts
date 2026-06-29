import { Component, inject } from '@angular/core';
import { ThemeExampleComponent } from '../../shared/theme-example.component';
import { TocService } from '../../shell/toc.service';

const TOC = [
  { label: 'Overview', anchor: 'overview' },
  { label: 'API Reference', anchor: 'api' },
  { label: 'elevation()', anchor: 'elevation-fn' },
  { label: 'CSS Variables', anchor: 'css-vars' },
];

@Component({
  selector: 'cpa-elevation-page',
  standalone: true,
  imports: [ThemeExampleComponent],
  template: `
    <article class="doc-page">
      <header class="page-header">
        <h1>Elevation</h1>
        <p class="subtitle">@cpangular/cp-theming-core</p>
      </header>

      <section id="overview" class="page-section">
        <p class="intro">
          Elevation provides six shadow levels. In light mode shadows use a dark color at low
          opacity; in dark mode the same shadow color uses higher opacity to remain visible on dark
          surfaces. Apply elevation via the <code>elevated</code> attribute or directly from SCSS.
        </p>
        <cpa-theme-example
          title="Shadow levels"
          [attrsHtml]="elevAttrsHtml"
          [scssScss]="elevScssScss"
        >
          <div demo class="demo-row">
            <div palette="surface" bg container shape="md" elevated="1">elevated="1"</div>
            <div palette="surface" bg container shape="md" elevated="2">elevated="2"</div>
            <div palette="surface" bg container shape="md" elevated="3">elevated="3"</div>
            <div palette="surface" bg container shape="md" elevated="4">elevated="4"</div>
            <div palette="surface" bg container shape="md" elevated="5">elevated="5"</div>
          </div>
        </cpa-theme-example>
      </section>

      <section id="api" class="page-section">
        <h2 class="api-section-heading">API Reference</h2>
        <hr class="api-section-rule" />
        <div class="api-import-line">
          <code>&#64;use '@cpangular/cp-theming-core/scss/theme' as t;</code>
        </div>

        <div id="elevation-fn" class="api-symbol">
          <h3 class="api-symbol-name">elevation</h3>
          <p class="api-symbol-desc">
            Configure shadow levels for the six elevation steps. Dark mode defaults to 50% shadow
            opacity.
          </p>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-kw">t.</span><span class="api-sig-name">elevation</span
              ><span class="api-sig-punct">(</span><span class="api-sig-param">$shadow-color</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">null</span
              ><span class="api-sig-punct">, </span><span class="api-sig-param">$levels</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">null</span
              ><span class="api-sig-punct">) → </span><span class="api-sig-return">map</span></span
            >
            <div class="api-member-body">
              <h5 class="api-params-heading">Parameters</h5>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$shadow-color</span
                  ><span class="api-param-type">color?</span
                  ><span class="api-param-default">oklch(0 0 0 / 30%)</span>
                </div>
                <div class="api-param-desc">
                  Base shadow color. Opacity is scaled per step. Dark mode defaults to 50%.
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$levels</span
                  ><span class="api-param-type">list?</span
                  ><span class="api-param-default">default null</span>
                </div>
                <div class="api-param-desc">
                  Override individual levels as a list of <code>box-shadow</code> values.
                </div>
              </div>
            </div>
          </div>
          <pre><code>// Light and dark have different shadow opacity
$elevation: t.light-dark(
  t.elevation($shadow-color: oklch(0 0 0 / 20%)),
  t.elevation($shadow-color: oklch(0 0 0 / 50%)),
)</code></pre>
        </div>
      </section>

      <section id="css-vars" class="page-section">
        <h2>CSS Variables</h2>
        <table class="api-props-table">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>--elevation-0--shadow</code></td>
              <td>No shadow (flat).</td>
            </tr>
            <tr>
              <td><code>--elevation-1--shadow</code></td>
              <td>Card-level elevation.</td>
            </tr>
            <tr>
              <td><code>--elevation-2--shadow</code></td>
              <td>Dropdown / select panel.</td>
            </tr>
            <tr>
              <td><code>--elevation-3--shadow</code></td>
              <td>Floating action button.</td>
            </tr>
            <tr>
              <td><code>--elevation-4--shadow</code></td>
              <td>Hovered FAB.</td>
            </tr>
            <tr>
              <td><code>--elevation-5--shadow</code></td>
              <td>Modal / dialog.</td>
            </tr>
            <tr>
              <td><code>--elevation-&#123;N&#125;--tint</code></td>
              <td>Surface tint color for elevated surfaces at each level.</td>
            </tr>
          </tbody>
        </table>
      </section>
    </article>
  `,
  styles: [
    `
      @use 'page-shared';
    `,
  ],
})
export class ElevationPageComponent {
  readonly elevAttrsHtml = `<div palette="surface" bg container shape="md" elevated="1">card</div>
<div palette="surface" bg container shape="md" elevated="2">dropdown</div>
<div palette="surface" bg container shape="md" elevated="3">fab</div>
<div palette="surface" bg container shape="md" elevated="4">hovered fab</div>
<div palette="surface" bg container shape="md" elevated="5">dialog</div>`;

  readonly elevScssScss = `@use '@cpangular/cp-theming-core/scss/theme' as t;

// Apply a level via the elevated attribute, or pull the shadow var directly:
.my-card {
  box-shadow: var(--elevation-2--shadow);
}`;

  constructor() {
    inject(TocService).set(TOC);
  }
}
