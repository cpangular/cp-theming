import { Component, inject } from '@angular/core';
import { ThemeExampleComponent } from '../../shared/theme-example.component';
import { TocService } from '../../shell/toc.service';

const TOC = [
  { label: 'Overview', anchor: 'overview' },
  { label: 'API Reference', anchor: 'api' },
  { label: 'density()', anchor: 'density-fn' },
  { label: 'CSS Variables', anchor: 'css-vars' },
];

@Component({
  selector: 'cpa-density-page',
  standalone: true,
  imports: [ThemeExampleComponent],
  template: `
    <article class="doc-page">
      <header class="page-header">
        <h1>Density</h1>
        <p class="subtitle">@cpangular/cp-theming-core</p>
      </header>

      <section id="overview" class="page-section">
        <p class="intro">
          Density controls component size compaction. Scale <code>0</code> is comfortable (default);
          each step down to <code>-5</code> reduces component heights and spacing. Set a base
          density in your theme config, or override per-subtree with <code>[themeDensity]</code> —
          useful for compact toolbars or data-dense tables.
        </p>
        <cpa-theme-example title="Density scopes" [attrsHtml]="densityAttrsHtml">
          <div demo class="demo-row">
            <div palette="primary" filled container shape="md" themeDensity="0">scale 0</div>
            <div palette="primary" filled container shape="md" themeDensity="-2">scale -2</div>
            <div palette="primary" filled container shape="md" themeDensity="-4">scale -4</div>
            <div palette="primary" filled container shape="md" themeDensity="-5">scale -5</div>
          </div>
        </cpa-theme-example>
      </section>

      <section id="api" class="page-section">
        <h2 class="api-section-heading">API Reference</h2>
        <hr class="api-section-rule" />
        <div class="api-import-line">
          <code>&#64;use '@cpangular/cp-theming-core/scss/theme' as t;</code>
        </div>

        <div id="density-fn" class="api-symbol">
          <h3 class="api-symbol-name">density</h3>
          <p class="api-symbol-desc">
            <code>0</code> is comfortable (default). Each step reduces component heights and spacing
            down to <code>-5</code> (most compact).
          </p>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-kw">t.</span><span class="api-sig-name">density</span
              ><span class="api-sig-punct">(</span><span class="api-sig-param">$scale</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">0</span
              ><span class="api-sig-punct">) → </span><span class="api-sig-return">map</span></span
            >
            <div class="api-member-body">
              <h5 class="api-params-heading">Parameters</h5>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$scale</span
                  ><span class="api-param-type">number?</span
                  ><span class="api-param-default">default 0</span>
                </div>
                <div class="api-param-desc">
                  Density scale. <code>0</code> = comfortable, <code>-5</code> = most compact.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="css-vars" class="page-section">
        <h2>CSS Variables</h2>
        <p>
          Space tokens use <code>calc()</code> with <code>--density-scale</code> to shrink as
          density increases:
        </p>
        <table class="api-props-table">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Base (scale 0)</th>
              <th>Reduction per step</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>--density-scale</code></td>
              <td colspan="2">
                The active scale value (0 to -5). Set by <code>[themeDensity]</code>.
              </td>
            </tr>
            <tr>
              <td><code>--space--xxs</code></td>
              <td>2px</td>
              <td>−1px/step</td>
            </tr>
            <tr>
              <td><code>--space--xs</code></td>
              <td>4px</td>
              <td>−1px/step</td>
            </tr>
            <tr>
              <td><code>--space--sm</code></td>
              <td>8px</td>
              <td>−2px/step</td>
            </tr>
            <tr>
              <td><code>--space--md</code></td>
              <td>16px</td>
              <td>−4px/step</td>
            </tr>
            <tr>
              <td><code>--space--lg</code></td>
              <td>24px</td>
              <td>−4px/step</td>
            </tr>
            <tr>
              <td><code>--space--xl</code></td>
              <td>32px</td>
              <td>−4px/step</td>
            </tr>
            <tr>
              <td><code>--space--xxl</code></td>
              <td>48px</td>
              <td>−4px/step</td>
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
export class DensityPageComponent {
  readonly densityAttrsHtml = `<!-- --space--* tokens recalculate inside each scope, so container() padding shrinks -->
<div palette="primary" filled container shape="md" themeDensity="0">scale 0</div>
<div palette="primary" filled container shape="md" themeDensity="-2">scale -2</div>
<div palette="primary" filled container shape="md" themeDensity="-4">scale -4</div>
<div palette="primary" filled container shape="md" themeDensity="-5">scale -5</div>`;

  constructor() {
    inject(TocService).set(TOC);
  }
}
