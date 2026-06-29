import { Component, inject } from '@angular/core';
import { ThemeExampleComponent } from '../../shared/theme-example.component';
import { TocService } from '../../shell/toc.service';

const TOC = [
  { label: 'Overview', anchor: 'overview' },
  { label: 'API Reference', anchor: 'api' },
  { label: 'typography()', anchor: 'typography-fn' },
];

@Component({
  selector: 'cpa-typography-page',
  standalone: true,
  imports: [ThemeExampleComponent],
  template: `
    <article class="doc-page">
      <header class="page-header">
        <h1>Typography</h1>
        <p class="subtitle">@cpangular/cp-theming-core</p>
      </header>

      <section id="overview" class="page-section">
        <p class="intro">
          Typography configures the font families, weights, and optional per-level size overrides
          for the type scale. The same config applies to both light and dark modes; wrap in
          <code>t.light-dark()</code> only when font choices genuinely differ by mode.
        </p>
        <cpa-theme-example title="Configuring typography" [scssScss]="typographyScssScss" />
      </section>

      <section id="api" class="page-section">
        <h2 class="api-section-heading">API Reference</h2>
        <hr class="api-section-rule" />
        <div class="api-import-line">
          <code>&#64;use '@cpangular/cp-theming-core/scss/theme' as t;</code>
        </div>

        <div id="typography-fn" class="api-symbol">
          <h3 class="api-symbol-name">typography</h3>
          <p class="api-symbol-desc">
            Configure font families, weights, and optional per-level size overrides.
          </p>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-kw">t.</span><span class="api-sig-name">typography</span
              ><span class="api-sig-punct">(</span><span class="api-sig-param">$plain-family</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">system-ui</span
              ><span class="api-sig-punct">, </span><span class="api-sig-param">$brand-family</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">null</span
              ><span class="api-sig-punct">, …</span><span class="api-sig-punct">) → </span
              ><span class="api-sig-return">map</span></span
            >
            <div class="api-member-body">
              <h5 class="api-params-heading">Parameters</h5>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$plain-family</span
                  ><span class="api-param-type">string?</span
                  ><span class="api-param-default">default system-ui</span>
                </div>
                <div class="api-param-desc">Body and UI text font family.</div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$brand-family</span
                  ><span class="api-param-type">string?</span
                  ><span class="api-param-default">default null</span>
                </div>
                <div class="api-param-desc">
                  Display / headline font. Falls back to <code>$plain-family</code> if null.
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$bold-weight</span
                  ><span class="api-param-type">number?</span
                  ><span class="api-param-default">default 700</span>
                </div>
                <div class="api-param-desc">Bold font weight.</div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$medium-weight</span
                  ><span class="api-param-type">number?</span
                  ><span class="api-param-default">default 500</span>
                </div>
                <div class="api-param-desc">Medium / semi-bold font weight.</div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$regular-weight</span
                  ><span class="api-param-type">number?</span
                  ><span class="api-param-default">default 400</span>
                </div>
                <div class="api-param-desc">Regular font weight.</div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$scale-overrides</span
                  ><span class="api-param-type">map?</span
                  ><span class="api-param-default">default null</span>
                </div>
                <div class="api-param-desc">
                  Per-level overrides for font-size, line-height, and letter-spacing as a Sass map.
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
export class TypographyPageComponent {
  readonly typographyScssScss = `$my-theme: t.theme(
  $palettes: (...),
  $typography: t.typography(
    $plain-family: 'Inter, system-ui, sans-serif',
    $brand-family: '"Playfair Display", serif',
  ),
);`;

  constructor() {
    inject(TocService).set(TOC);
  }
}
