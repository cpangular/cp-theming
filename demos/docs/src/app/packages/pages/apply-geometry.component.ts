import { Component, inject } from '@angular/core';
import { ThemeExampleComponent } from '../../shared/theme-example.component';
import { TocService } from '../../shell/toc.service';
import shapeHtml from '../../../examples/apply-geometry/shape.html' with { loader: 'text' };
import shapeScss from '../../../examples/apply-geometry/shape.scss' with { loader: 'text' };
import radiusHtml from '../../../examples/apply-geometry/radius.html' with { loader: 'text' };
import radiusScss from '../../../examples/apply-geometry/radius.scss' with { loader: 'text' };
import paddingHtml from '../../../examples/apply-geometry/padding.html' with { loader: 'text' };
import paddingScss from '../../../examples/apply-geometry/padding.scss' with { loader: 'text' };
import combinedScss from '../../../examples/apply-geometry/combined.scss' with { loader: 'text' };
import combinedHtml from '../../../examples/apply-geometry/combined.html' with { loader: 'text' };

@Component({
  selector: 'cpa-apply-geometry-page',
  standalone: true,
  imports: [ThemeExampleComponent],
  template: `
    <article class="doc-page">
      <header class="page-header">
        <h1>Geometry</h1>
        <p class="subtitle">Theming • @cpangular/cp-theming-core</p>
      </header>

      <section id="overview" class="page-section">
        <p class="intro">
          Geometry layers control the shape and spacing of themed elements. They are intentionally
          separate from color so the same geometry can apply across all palettes. Use
          <code>shape</code> for corner rounding and <code>container</code> for padding.
        </p>
      </section>

      <section id="shape" class="page-section">
        <h2>Shape scale</h2>
        <p>
          The <code>shape</code> attribute rounds corners using the M3
          <code>--shape--*</code> scale: <code>xxs</code>, <code>xs</code>, <code>sm</code>,
          <code>md</code>, <code>lg</code>, <code>xl</code>, <code>xxl</code>, and
          <code>full</code>. It sets <code>--container--radius</code> from the scale and applies it
          to the element (and any inset <code>outlined</code> border).
        </p>
        <cpa-theme-example
          title="Shape scale"
          [attrsHtml]="ex.shapeHtml"
          [scssScss]="ex.shapeScss"
        />
      </section>

      <section id="radius" class="page-section">
        <h2>Custom corner radius</h2>
        <p>
          For values outside the scale, set <code>--container--radius</code> directly or use
          <code>t.radius()</code> for per-corner control. A <code>container</code> (or
          <code>shape</code>) resolves the override onto the element.
        </p>
        <cpa-theme-example
          title="Custom radius"
          [attrsHtml]="ex.radiusHtml"
          [scssScss]="ex.radiusScss"
        />
      </section>

      <section id="padding" class="page-section">
        <h2>Padding</h2>
        <p>
          The <code>container</code> layer adds density-reactive padding. Set
          <code>--container--padding</code> or use <code>t.padding()</code> to override the internal
          spacing.
        </p>
        <cpa-theme-example
          title="Padding scale"
          [attrsHtml]="ex.paddingHtml"
          [scssScss]="ex.paddingScss"
        />
      </section>

      <section id="combined" class="page-section">
        <h2>Combined geometry</h2>
        <p>
          Shape, padding, and a fill compose into familiar shapes. A common pattern is a larger
          shape with proportional padding for "card" shapes, and a tight scale for compact elements
          like chips or badges.
        </p>
        <cpa-theme-example
          title="Card vs chip geometry"
          [attrsHtml]="ex.combinedHtml"
          [scssScss]="ex.combinedScss"
        />
      </section>
    </article>
  `,
  styles: [
    `
      @use 'page-shared';
    `,
  ],
})
export class ApplyGeometryPageComponent {
  protected readonly ex = {
    shapeHtml,
    shapeScss,
    radiusHtml,
    radiusScss,
    paddingHtml,
    paddingScss,
    combinedScss,
    combinedHtml,
  };

  constructor() {
    inject(TocService).set([
      { label: 'Overview', anchor: 'overview' },
      { label: 'Shape scale', anchor: 'shape' },
      { label: 'Custom radius', anchor: 'radius' },
      { label: 'Padding', anchor: 'padding' },
      { label: 'Combined geometry', anchor: 'combined' },
    ]);
  }
}
