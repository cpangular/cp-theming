import { Component, inject } from '@angular/core';
import { CodeComponent } from '../../shared/code.component';
import { ThemeExampleComponent } from '../../shared/theme-example.component';
import { TocService } from '../../shell/toc.service';
import levelsHtml from '../../../examples/elevation/levels.html' with { loader: 'text' };
import shadowScss from '../../../examples/elevation/shadow.scss' with { loader: 'text' };
import levelsScss from '../../../examples/elevation/levels.scss' with { loader: 'text' };
import lightDarkScss from '../../../examples/elevation/light-dark.scss' with { loader: 'text' };

const TOC = [
  { label: 'Overview', anchor: 'overview' },
  { label: 'API Reference', anchor: 'api' },
  { label: 'elevation()', anchor: 'elevation-fn' },
  { label: 'CSS Variables', anchor: 'css-vars' },
];

@Component({
  selector: 'cpa-elevation-page',
  standalone: true,
  imports: [CodeComponent, ThemeExampleComponent],
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
        <p>
          Levels 1 to 5 are the shadows Angular Material draws for its own five levels. Each is
          three shadows on top of each other: a key shadow straight below, a softer one around it,
          and a wide, faint one that makes even a level-1 card read as lifted on a light surface.
          With the Material adapter, Material's components and your own
          <code>elevated</code> elements cast the same shadow.
        </p>
        <cpa-theme-example
          title="Shadow levels"
          [attrsHtml]="ex.levelsHtml"
          [scssScss]="ex.shadowScss"
        />
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
            Configure the shadows of the elevation levels: their color, or a level's whole shadow.
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
                  The shadow color of levels 1 to 5, in dark mode <code>oklch(0 0 0 / 50%)</code>.
                  The three shadows of a level share it out: they take two thirds, just under a half
                  and two fifths of its opacity, so the default gives 20%, 14% and 12% in light
                  mode. Any CSS color, a <code>var()</code> too.
                </div>
              </div>
              <div class="api-param-row">
                <div>
                  <span class="api-param-name">$levels</span><span class="api-param-type">map?</span
                  ><span class="api-param-default">default null</span>
                </div>
                <div class="api-param-desc">
                  Override individual levels: a map from level (1–5) to
                  <code>(shadow: …, tint: …)</code>. A shadow given here is used as written, with as
                  many layers as it has. Its light and its dark version may differ in their colors
                  only.
                </div>
              </div>
            </div>
          </div>
          <cpa-code [code]="ex.lightDarkScss" lang="scss" />
          <cpa-code [code]="ex.levelsScss" lang="scss" />
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
  protected readonly ex = { levelsHtml, shadowScss, lightDarkScss, levelsScss };

  constructor() {
    inject(TocService).set(TOC);
  }
}
