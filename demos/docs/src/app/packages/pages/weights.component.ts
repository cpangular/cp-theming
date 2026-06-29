import { Component, inject } from '@angular/core';
import { ThemeExampleComponent } from '../../shared/theme-example.component';
import { TocService } from '../../shell/toc.service';

const TOC = [
  { label: 'Overview', anchor: 'overview' },
  { label: 'API Reference', anchor: 'api' },
  { label: 'weights()', anchor: 'weights-fn' },
  { label: 'CSS Variables', anchor: 'css-vars' },
];

@Component({
  selector: 'cpa-weights-page',
  standalone: true,
  imports: [ThemeExampleComponent],
  template: `
    <article class="doc-page">
      <header class="page-header">
        <h1>Weights</h1>
        <p class="subtitle">@cpangular/cp-theming-core</p>
      </header>

      <section id="overview" class="page-section">
        <p class="intro">
          Weights configure text opacity levels and state layer blend percentages. They control how
          prominent body text appears and how visible hover, press, focus, and drag interaction
          overlays are. Providing separate light and dark weights with
          <code>t.light-dark()</code> is common — dark mode often needs slightly lower primary text
          opacity to reduce eye strain.
        </p>
        <cpa-theme-example title="Configuring weights" [scssScss]="weightsScssScss" />
      </section>

      <section id="api" class="page-section">
        <h2 class="api-section-heading">API Reference</h2>
        <hr class="api-section-rule" />
        <div class="api-import-line">
          <code>&#64;use '@cpangular/cp-theming-core/scss/theme' as t;</code>
        </div>

        <div id="weights-fn" class="api-symbol">
          <h3 class="api-symbol-name">weights</h3>
          <p class="api-symbol-desc">
            Configure text opacity levels and state layer opacities for interaction overlays.
          </p>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-kw">t.</span><span class="api-sig-name">weights</span
              ><span class="api-sig-punct">(</span><span class="api-sig-param">$text-blend</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">0.87</span
              ><span class="api-sig-punct">, </span><span class="api-sig-param">$state-hover</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">0.08</span
              ><span class="api-sig-punct">, …</span><span class="api-sig-punct">) → </span
              ><span class="api-sig-return">map</span></span
            >
            <div class="api-member-body">
              <h5 class="api-params-heading">Parameters</h5>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$text-blend</span
                  ><span class="api-param-type">number?</span
                  ><span class="api-param-default">default 0.87</span>
                </div>
                <div class="api-param-desc">
                  Primary text opacity (→ <code>--weight--text-blend</code>).
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$text-emphasis-blend</span
                  ><span class="api-param-type">number?</span
                  ><span class="api-param-default">default 1.0</span>
                </div>
                <div class="api-param-desc">
                  High-emphasis text opacity (→ <code>--weight--text-emphasis-blend</code>).
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$text-deemphasis-blend</span
                  ><span class="api-param-type">number?</span
                  ><span class="api-param-default">default 0.55</span>
                </div>
                <div class="api-param-desc">
                  Low-emphasis / hint text opacity (→ <code>--weight--text-deemphasis-blend</code>).
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$text-primary-tint</span
                  ><span class="api-param-type">number?</span
                  ><span class="api-param-default">default 0.12</span>
                </div>
                <div class="api-param-desc">
                  Tint percentage for primary-colored text on surfaces.
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$state-hover</span
                  ><span class="api-param-type">number?</span
                  ><span class="api-param-default">default 0.08</span>
                </div>
                <div class="api-param-desc">
                  Hover state layer opacity (→ <code>--weight--state-hover</code>).
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$state-press</span
                  ><span class="api-param-type">number?</span
                  ><span class="api-param-default">default 0.12</span>
                </div>
                <div class="api-param-desc">
                  Press / active state layer opacity (→ <code>--weight--state-press</code>).
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$state-focus</span
                  ><span class="api-param-type">number?</span
                  ><span class="api-param-default">default 0.12</span>
                </div>
                <div class="api-param-desc">
                  Keyboard-focused state layer opacity (→ <code>--weight--state-focus</code>).
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$state-drag</span
                  ><span class="api-param-type">number?</span
                  ><span class="api-param-default">default 0.16</span>
                </div>
                <div class="api-param-desc">
                  Dragging state layer opacity (→ <code>--weight--state-drag</code>).
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$tints</span><span class="api-param-type">list?</span
                  ><span class="api-param-default">default (0.04, 0.08, 0.12, 0.18, 0.26)</span>
                </div>
                <div class="api-param-desc">
                  Five opacity values for <code>--weight--tint-1</code> through
                  <code>--weight--tint-5</code>.
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
              <td><code>--weight--text-blend</code></td>
              <td>Primary text opacity.</td>
            </tr>
            <tr>
              <td><code>--weight--text-emphasis-blend</code></td>
              <td>High-emphasis text opacity.</td>
            </tr>
            <tr>
              <td><code>--weight--text-deemphasis-blend</code></td>
              <td>Low-emphasis / hint text opacity.</td>
            </tr>
            <tr>
              <td><code>--weight--text-primary-tint</code></td>
              <td>Tint for primary-colored text on surfaces.</td>
            </tr>
            <tr>
              <td><code>--weight--state-hover</code></td>
              <td>Hover state layer opacity.</td>
            </tr>
            <tr>
              <td><code>--weight--state-press</code></td>
              <td>Press / active state layer opacity.</td>
            </tr>
            <tr>
              <td><code>--weight--state-focus</code></td>
              <td>Keyboard-focused state layer opacity.</td>
            </tr>
            <tr>
              <td><code>--weight--state-drag</code></td>
              <td>Dragging state layer opacity.</td>
            </tr>
            <tr>
              <td><code>--weight--tint-1 … --weight--tint-5</code></td>
              <td>Palette tint opacities at five levels.</td>
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
export class WeightsPageComponent {
  readonly weightsScssScss = `$my-theme: t.theme(
  $palettes: (...),
  $weights: t.light-dark(
    t.weights($text-blend: 0.87),   // light mode
    t.weights($text-blend: 0.78),   // dark mode — slightly more translucent
  ),
);`;

  constructor() {
    inject(TocService).set(TOC);
  }
}
