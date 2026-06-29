import { Component, inject } from '@angular/core';
import { ThemeExampleComponent } from '../../shared/theme-example.component';
import { TocService } from '../../shell/toc.service';

const TOC = [
  { label: 'Overview', anchor: 'overview' },
  { label: 'API Reference', anchor: 'api' },
  { label: 'shape()', anchor: 'shape-fn' },
  { label: 'CSS Variables', anchor: 'css-vars' },
];

@Component({
  selector: 'cpa-shape-page',
  standalone: true,
  imports: [ThemeExampleComponent],
  template: `
    <article class="doc-page">
      <header class="page-header">
        <h1>Shape</h1>
        <p class="subtitle">@cpangular/cp-theming-core</p>
      </header>

      <section id="overview" class="page-section">
        <p class="intro">
          Shape defines the corner radius scale. Named steps map conceptually to component
          categories: <code>$sm</code> for chips and inputs, <code>$md</code> for cards and menus,
          <code>$xl</code> for dialogs, <code>$full</code> for pill-shaped elements.
        </p>
        <cpa-theme-example
          title="Corner radius scale"
          [attrsHtml]="shapeAttrsHtml"
          [scssScss]="shapeScssScss"
        >
          <div demo class="demo-row">
            <div palette="primary" filled container shape="xxs">xxs</div>
            <div palette="primary" filled container shape="xs">xs</div>
            <div palette="primary" filled container shape="sm">sm</div>
            <div palette="primary" filled container shape="md">md</div>
            <div palette="primary" filled container shape="lg">lg</div>
            <div palette="primary" filled container shape="xl">xl</div>
            <div palette="primary" filled container shape="xxl">xxl</div>
          </div>
        </cpa-theme-example>
      </section>

      <section id="api" class="page-section">
        <h2 class="api-section-heading">API Reference</h2>
        <hr class="api-section-rule" />
        <div class="api-import-line">
          <code>&#64;use '@cpangular/cp-theming-core/scss/theme' as t;</code>
        </div>

        <div id="shape-fn" class="api-symbol">
          <h3 class="api-symbol-name">shape</h3>
          <p class="api-symbol-desc">
            Configure the corner radius scale. Named steps map to component categories: chips →
            <code>$sm</code>, cards → <code>$md</code>, dialogs → <code>$xl</code>.
          </p>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-kw">t.</span><span class="api-sig-name">shape</span
              ><span class="api-sig-punct">(</span><span class="api-sig-param">$xxs</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">2px</span
              ><span class="api-sig-punct">, </span><span class="api-sig-param">$xs</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">4px</span
              ><span class="api-sig-punct">, </span><span class="api-sig-param">$sm</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">8px</span
              ><span class="api-sig-punct">, </span><span class="api-sig-param">$md</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">12px</span
              ><span class="api-sig-punct">, …</span><span class="api-sig-punct">) → </span
              ><span class="api-sig-return">map</span></span
            >
            <div class="api-member-body">
              <h5 class="api-params-heading">Parameters</h5>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$xxs / $xs / $sm</span
                  ><span class="api-param-type">length?</span
                  ><span class="api-param-default">2px / 4px / 8px</span>
                </div>
                <div class="api-param-desc">
                  Extra-small steps. <code>$sm</code> used for chips and input fields.
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$md</span><span class="api-param-type">length?</span
                  ><span class="api-param-default">12px</span>
                </div>
                <div class="api-param-desc">Cards and menus.</div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$lg</span><span class="api-param-type">length?</span
                  ><span class="api-param-default">16px</span>
                </div>
                <div class="api-param-desc">Side sheets and navigation rail.</div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$xl / $xxl</span
                  ><span class="api-param-type">length?</span
                  ><span class="api-param-default">28px / 32px</span>
                </div>
                <div class="api-param-desc">Dialogs and large surfaces.</div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$full</span
                  ><span class="api-param-type">length?</span
                  ><span class="api-param-default">9999px</span>
                </div>
                <div class="api-param-desc">Fully rounded / pill shape.</div>
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
              <th>Default</th>
              <th>Usage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>--shape--xxs</code></td>
              <td>2px</td>
              <td>Smallest radius step.</td>
            </tr>
            <tr>
              <td><code>--shape--xs</code></td>
              <td>4px</td>
              <td>Extra-small.</td>
            </tr>
            <tr>
              <td><code>--shape--sm</code></td>
              <td>8px</td>
              <td>Chips, input fields.</td>
            </tr>
            <tr>
              <td><code>--shape--md</code></td>
              <td>12px</td>
              <td>Cards, menus.</td>
            </tr>
            <tr>
              <td><code>--shape--lg</code></td>
              <td>16px</td>
              <td>Side sheets, navigation rail.</td>
            </tr>
            <tr>
              <td><code>--shape--xl</code></td>
              <td>28px</td>
              <td>Dialogs.</td>
            </tr>
            <tr>
              <td><code>--shape--xxl</code></td>
              <td>32px</td>
              <td>Large surfaces.</td>
            </tr>
            <tr>
              <td><code>--shape--full</code></td>
              <td>9999px</td>
              <td>Fully rounded / pill.</td>
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
export class ShapePageComponent {
  readonly shapeAttrsHtml = `<div palette="primary" filled container shape="xxs">xxs</div>
<div palette="primary" filled container shape="xs">xs</div>
<div palette="primary" filled container shape="sm">sm</div>
<div palette="primary" filled container shape="md">md</div>
<div palette="primary" filled container shape="lg">lg</div>
<div palette="primary" filled container shape="xl">xl</div>
<div palette="primary" filled container shape="xxl">xxl</div>`;

  readonly shapeScssScss = `@use '@cpangular/cp-theming-core/scss/theme' as t;

.box-xxs { @include t.apply-palette('primary'); @include t.filled(); @include t.container(); @include t.shape('xxs'); }
.box-xs  { @include t.apply-palette('primary'); @include t.filled(); @include t.container(); @include t.shape('xs'); }
.box-sm  { @include t.apply-palette('primary'); @include t.filled(); @include t.container(); @include t.shape('sm'); }
.box-md  { @include t.apply-palette('primary'); @include t.filled(); @include t.container(); @include t.shape('md'); }
.box-lg  { @include t.apply-palette('primary'); @include t.filled(); @include t.container(); @include t.shape('lg'); }
.box-xl  { @include t.apply-palette('primary'); @include t.filled(); @include t.container(); @include t.shape('xl'); }
.box-xxl { @include t.apply-palette('primary'); @include t.filled(); @include t.container(); @include t.shape('xxl'); }`;

  constructor() {
    inject(TocService).set(TOC);
  }
}
