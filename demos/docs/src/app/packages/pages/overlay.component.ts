import { Component, inject } from '@angular/core';
import { ThemeExampleComponent } from '../../shared/theme-example.component';
import { TocService } from '../../shell/toc.service';
import overlaysScss from '../../../examples/overlay/overlays.scss' with { loader: 'text' };

const TOC = [
  { label: 'Overview', anchor: 'overview' },
  { label: 'API Reference', anchor: 'api' },
  { label: 'overlays()', anchor: 'overlays-fn' },
  { label: 'CSS Variables', anchor: 'css-vars' },
];

@Component({
  selector: 'cpa-overlay-page',
  standalone: true,
  imports: [ThemeExampleComponent],
  template: `
    <article class="doc-page">
      <header class="page-header">
        <h1>Overlay</h1>
        <p class="subtitle">@cpangular/cp-theming-core</p>
      </header>

      <section id="overview" class="page-section">
        <p class="intro">
          Overlay defines the scrim and shadow overlay colors used by modals, drawers, and elevated
          surfaces. <code>--overlay--scrim</code> dims the page behind dialogs.
          <code>--overlay--shadow</code> is used by elevation shadows.
        </p>
        <cpa-theme-example title="Configuring overlays" [scssScss]="ex.overlaysScss" />
      </section>

      <section id="api" class="page-section">
        <h2 class="api-section-heading">API Reference</h2>
        <hr class="api-section-rule" />
        <div class="api-import-line">
          <code>&#64;use '@cpangular/cp-theming-core/scss/theme' as t;</code>
        </div>

        <div id="overlays-fn" class="api-symbol">
          <h3 class="api-symbol-name">overlays</h3>
          <p class="api-symbol-desc">
            Configure scrim and shadow overlay colors for modal backdrops and elevation.
          </p>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-kw">t.</span><span class="api-sig-name">overlays</span
              ><span class="api-sig-punct">(</span><span class="api-sig-param">$scrim</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">null</span
              ><span class="api-sig-punct">, </span><span class="api-sig-param">$shadow</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">null</span
              ><span class="api-sig-punct">) → </span><span class="api-sig-return">map</span></span
            >
            <div class="api-member-body">
              <h5 class="api-params-heading">Parameters</h5>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$scrim</span
                  ><span class="api-param-type">color?</span
                  ><span class="api-param-default">oklch(0 0 0 / 50%)</span>
                </div>
                <div class="api-param-desc">
                  Modal / backdrop scrim color (→ <code>--overlay--scrim</code>).
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$shadow</span
                  ><span class="api-param-type">color?</span
                  ><span class="api-param-default">oklch(0 0 0 / 30%)</span>
                </div>
                <div class="api-param-desc">
                  Elevation shadow color (→ <code>--overlay--shadow</code>).
                </div>
              </div>
            </div>
          </div>
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
              <td><code>--overlay--scrim</code></td>
              <td>Modal / backdrop scrim color.</td>
            </tr>
            <tr>
              <td><code>--overlay--shadow</code></td>
              <td>Elevation shadow base color.</td>
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
export class OverlayPageComponent {
  protected readonly ex = { overlaysScss };

  constructor() {
    inject(TocService).set(TOC);
  }
}
