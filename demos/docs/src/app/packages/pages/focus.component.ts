import { Component, inject } from '@angular/core';
import { ThemeExampleComponent } from '../../shared/theme-example.component';
import { TocService } from '../../shell/toc.service';

const TOC = [
  { label: 'Overview', anchor: 'overview' },
  { label: 'API Reference', anchor: 'api' },
  { label: 'focus()', anchor: 'focus-fn' },
  { label: 'CSS Variables', anchor: 'css-vars' },
];

@Component({
  selector: 'cpa-focus-page',
  standalone: true,
  imports: [ThemeExampleComponent],
  template: `
    <article class="doc-page">
      <header class="page-header">
        <h1>Focus</h1>
        <p class="subtitle">@cpangular/cp-theming-core</p>
      </header>

      <section id="overview" class="page-section">
        <p class="intro">
          Focus configures the global focus ring appearance — width, offset, and border style. The
          ring <em>color</em> is intentionally per-palette, derived as
          <code>--color--name--focus</code>. A same-hue focus ring on a same-hue surface is
          invisible; the per-palette derivation ensures visibility by default (hue-shifted by ~40°),
          while still allowing explicit override via <code>t.palette($focus: ...)</code>.
        </p>
        <cpa-theme-example
          title="Per-palette focus ring"
          [attrsHtml]="focusAttrsHtml"
          [scssScss]="focusScssScss"
        >
          <div demo class="demo-row">
            <span palette="primary" bg shape="full" class="focus-demo">primary</span>
            <span palette="secondary" bg shape="full" class="focus-demo">secondary</span>
            <span palette="error" bg shape="full" class="focus-demo">error</span>
            <span palette="pass" bg shape="full" class="focus-demo">pass</span>
          </div>
        </cpa-theme-example>
      </section>

      <section id="api" class="page-section">
        <h2 class="api-section-heading">API Reference</h2>
        <hr class="api-section-rule" />
        <div class="api-import-line">
          <code>&#64;use '@cpangular/cp-theming-core/scss/theme' as t;</code>
        </div>

        <div id="focus-fn" class="api-symbol">
          <h3 class="api-symbol-name">focus</h3>
          <p class="api-symbol-desc">
            Configure the global focus ring appearance. Ring <em>color</em> is per-palette via
            <code>--color--name--focus</code>.
          </p>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-kw">t.</span><span class="api-sig-name">focus</span
              ><span class="api-sig-punct">(</span><span class="api-sig-param">$width</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">2px</span
              ><span class="api-sig-punct">, </span><span class="api-sig-param">$offset</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">2px</span
              ><span class="api-sig-punct">, </span><span class="api-sig-param">$style</span
              ><span class="api-sig-punct">: </span><span class="api-sig-default">solid</span
              ><span class="api-sig-punct">) → </span><span class="api-sig-return">map</span></span
            >
            <div class="api-member-body">
              <h5 class="api-params-heading">Parameters</h5>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$width</span
                  ><span class="api-param-type">length?</span
                  ><span class="api-param-default">default 2px</span>
                </div>
                <div class="api-param-desc">
                  Focus ring border width (→ <code>--focus--width</code>).
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$offset</span
                  ><span class="api-param-type">length?</span
                  ><span class="api-param-default">default 2px</span>
                </div>
                <div class="api-param-desc">
                  Offset from the element edge (→ <code>--focus--offset</code>).
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$style</span
                  ><span class="api-param-type">string?</span
                  ><span class="api-param-default">default solid</span>
                </div>
                <div class="api-param-desc">CSS border style (→ <code>--focus--style</code>).</div>
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
              <td><code>--focus--width</code></td>
              <td>Focus ring border width.</td>
            </tr>
            <tr>
              <td><code>--focus--offset</code></td>
              <td>Offset from the element edge.</td>
            </tr>
            <tr>
              <td><code>--focus--style</code></td>
              <td>CSS border style (solid, dashed, etc.).</td>
            </tr>
            <tr>
              <td><code>--color--&#123;name&#125;--focus</code></td>
              <td>
                Per-palette focus ring color. Auto-derived as a hue-shifted variant of the palette
                base color.
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </article>
  `,
  styles: [
    `
      @use 'page-shared';
      .focus-demo {
        outline: 3px solid var(--palette-color--focus);
        outline-offset: 3px;
      }
    `,
  ],
})
export class FocusPageComponent {
  readonly focusAttrsHtml = `<!-- the ring uses each palette's auto-derived, hue-shifted focus color -->
<span palette="primary" bg shape="full">primary</span>
<span palette="secondary" bg shape="full">secondary</span>
<span palette="error" bg shape="full">error</span>
<span palette="pass" bg shape="full">pass</span>`;

  readonly focusScssScss = `.focus-demo {
  // --palette-color--focus resolves to the active palette's focus ring color
  outline: 3px solid var(--palette-color--focus);
  outline-offset: 3px;
}`;

  constructor() {
    inject(TocService).set(TOC);
  }
}
