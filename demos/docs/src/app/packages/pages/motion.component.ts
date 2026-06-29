import { Component, inject } from '@angular/core';
import { ThemeExampleComponent } from '../../shared/theme-example.component';
import { TocService } from '../../shell/toc.service';

const TOC = [
  { label: 'Overview', anchor: 'overview' },
  { label: 'API Reference', anchor: 'api' },
  { label: 'motion()', anchor: 'motion-fn' },
  { label: 'CSS Variables', anchor: 'css-vars' },
];

@Component({
  selector: 'cpa-motion-page',
  standalone: true,
  imports: [ThemeExampleComponent],
  template: `
    <article class="doc-page">
      <header class="page-header">
        <h1>Motion</h1>
        <p class="subtitle">@cpangular/cp-theming-core</p>
      </header>

      <section id="overview" class="page-section">
        <p class="intro">
          Motion emits duration and easing tokens as CSS custom properties. Four duration steps
          cover the range from micro-interactions to page-level transitions. Four named easings
          follow Material Design conventions for entering, exiting, and in-place transitions.
        </p>
        <cpa-theme-example title="Using motion tokens" [scssScss]="motionScssScss" />
      </section>

      <section id="api" class="page-section">
        <h2 class="api-section-heading">API Reference</h2>
        <hr class="api-section-rule" />
        <div class="api-import-line">
          <code>&#64;use '@cpangular/cp-theming-core/scss/theme' as t;</code>
        </div>

        <div id="motion-fn" class="api-symbol">
          <h3 class="api-symbol-name">motion</h3>
          <p class="api-symbol-desc">
            Configure motion duration and easing tokens emitted as
            <code>--motion--duration-*</code> and <code>--motion--easing-*</code> CSS variables.
          </p>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-kw">t.</span><span class="api-sig-name">motion</span
              ><span class="api-sig-punct">(</span><span class="api-sig-param">$duration-short</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">100ms</span
              ><span class="api-sig-punct">, </span
              ><span class="api-sig-param">$duration-medium</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">250ms</span
              ><span class="api-sig-punct">, …</span><span class="api-sig-punct">) → </span
              ><span class="api-sig-return">map</span></span
            >
            <div class="api-member-body">
              <h5 class="api-params-heading">Parameters</h5>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$duration-short</span
                  ><span class="api-param-type">time?</span
                  ><span class="api-param-default">default 100ms</span>
                </div>
                <div class="api-param-desc">Micro-interactions and toggles.</div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$duration-medium</span
                  ><span class="api-param-type">time?</span
                  ><span class="api-param-default">default 250ms</span>
                </div>
                <div class="api-param-desc">Component transitions.</div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$duration-long</span
                  ><span class="api-param-type">time?</span
                  ><span class="api-param-default">default 400ms</span>
                </div>
                <div class="api-param-desc">Page-level transitions.</div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$duration-extra</span
                  ><span class="api-param-type">time?</span
                  ><span class="api-param-default">default 600ms</span>
                </div>
                <div class="api-param-desc">Complex or emphasized transitions.</div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$easing-standard</span
                  ><span class="api-param-type">string?</span
                  ><span class="api-param-default">cubic-bezier(0.2,0,0,1)</span>
                </div>
                <div class="api-param-desc">Default easing for most transitions.</div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$easing-emphasized</span
                  ><span class="api-param-type">string?</span
                  ><span class="api-param-default">cubic-bezier(0.2,0,0,1)</span>
                </div>
                <div class="api-param-desc">
                  Emphasized motion (shared-axis, container transform).
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$easing-decelerate</span
                  ><span class="api-param-type">string?</span
                  ><span class="api-param-default">cubic-bezier(0,0,0,1)</span>
                </div>
                <div class="api-param-desc">Elements entering the screen.</div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$easing-accelerate</span
                  ><span class="api-param-type">string?</span
                  ><span class="api-param-default">cubic-bezier(0.3,0,1,1)</span>
                </div>
                <div class="api-param-desc">Elements leaving the screen.</div>
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
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>--motion--duration-short</code></td>
              <td>100ms</td>
              <td>Micro-interactions and toggles.</td>
            </tr>
            <tr>
              <td><code>--motion--duration-medium</code></td>
              <td>250ms</td>
              <td>Component transitions.</td>
            </tr>
            <tr>
              <td><code>--motion--duration-long</code></td>
              <td>400ms</td>
              <td>Page-level transitions.</td>
            </tr>
            <tr>
              <td><code>--motion--duration-extra</code></td>
              <td>600ms</td>
              <td>Complex or emphasized transitions.</td>
            </tr>
            <tr>
              <td><code>--motion--easing-standard</code></td>
              <td colspan="2">Default easing for most transitions.</td>
            </tr>
            <tr>
              <td><code>--motion--easing-emphasized</code></td>
              <td colspan="2">Emphasized motion.</td>
            </tr>
            <tr>
              <td><code>--motion--easing-decelerate</code></td>
              <td colspan="2">Elements entering the screen.</td>
            </tr>
            <tr>
              <td><code>--motion--easing-accelerate</code></td>
              <td colspan="2">Elements leaving the screen.</td>
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
export class MotionPageComponent {
  readonly motionScssScss = `.my-element {
  transition: background-color var(--motion--duration-medium) var(--motion--easing-standard);
}`;

  constructor() {
    inject(TocService).set(TOC);
  }
}
