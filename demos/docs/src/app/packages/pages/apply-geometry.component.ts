import { Component, inject } from '@angular/core';
import { ThemeExampleComponent } from '../../shared/theme-example.component';
import { TocService } from '../../shell/toc.service';

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
          [attrsHtml]="shapeAttrsHtml"
          [scssScss]="shapeScssScss"
        >
          <div demo class="demo-row">
            <div class="demo-swatch" palette="primary" bg shape="xs">
              <span class="demo-tag">shape="xs"</span>
              <span class="demo-name">4px</span>
            </div>
            <div class="demo-swatch" palette="primary" bg shape="md">
              <span class="demo-tag">shape="md"</span>
              <span class="demo-name">12px</span>
            </div>
            <div class="demo-swatch" palette="primary" bg shape="xl">
              <span class="demo-tag">shape="xl"</span>
              <span class="demo-name">28px</span>
            </div>
            <div class="demo-swatch" palette="primary" bg shape="full">
              <span class="demo-tag">shape="full"</span>
              <span class="demo-name">Pill</span>
            </div>
          </div>
        </cpa-theme-example>
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
          [attrsHtml]="radiusAttrsHtml"
          [scssScss]="radiusScssScss"
        >
          <div demo class="demo-row">
            <div
              class="demo-swatch"
              palette="primary"
              bg
              container
              style="--container--radius: 0px"
            >
              <span class="demo-tag">radius: 0px</span>
              <span class="demo-name">Square</span>
            </div>
            <div
              class="demo-swatch"
              palette="primary"
              bg
              container
              style="--container--radius: 20px"
            >
              <span class="demo-tag">radius: 20px</span>
              <span class="demo-name">Rounded</span>
            </div>
            <div
              class="demo-swatch"
              palette="primary"
              bg
              container
              style="--container--radius--top: 20px"
            >
              <span class="demo-tag">radius--top: 20px</span>
              <span class="demo-name">Top only</span>
            </div>
          </div>
        </cpa-theme-example>
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
          [attrsHtml]="paddingAttrsHtml"
          [scssScss]="paddingScssScss"
        >
          <div demo class="demo-row">
            <div
              class="demo-swatch"
              palette="primary"
              bg
              container
              style="--container--padding: 8px"
            >
              <span class="demo-tag">padding: 8px</span>
              <span class="demo-name">Dense</span>
            </div>
            <div
              class="demo-swatch"
              palette="primary"
              bg
              container
              style="--container--padding: 16px"
            >
              <span class="demo-tag">padding: 16px</span>
              <span class="demo-name">Default</span>
            </div>
            <div
              class="demo-swatch"
              palette="primary"
              bg
              container
              style="--container--padding: 32px"
            >
              <span class="demo-tag">padding: 32px</span>
              <span class="demo-name">Relaxed</span>
            </div>
          </div>
        </cpa-theme-example>
      </section>

      <section id="combined" class="page-section">
        <h2>Combined geometry</h2>
        <p>
          Shape, padding, and a fill compose into familiar shapes. A common pattern is a larger
          shape with proportional padding for "card" shapes, and a tight scale for compact elements
          like chips or badges.
        </p>
        <cpa-theme-example title="Card vs chip geometry" [scssScss]="combinedScssScss">
          <div demo class="demo-row">
            <div
              class="demo-swatch"
              palette="primary"
              bg
              shape="lg"
              container
              style="--container--padding: 24px; width:160px"
            >
              <span class="demo-tag">card style</span>
              <span class="demo-name">shape="lg" + padding</span>
            </div>
            <span
              palette="secondary"
              filled
              shape="full"
              container
              style="--container--padding-block: 6px; --container--padding-inline: 16px; font-size:13px; align-self:center"
            >
              chip style
            </span>
          </div>
        </cpa-theme-example>
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
  readonly shapeAttrsHtml = `<div palette="primary" bg shape="md">
  Rounded with the md scale step
</div>`;

  readonly shapeScssScss = `@use '@cpangular/cp-theming-core/scss/theme' as t;

.my-card {
  @include t.apply-palette('primary');
  @include t.bg();
  @include t.shape('md');
}`;

  readonly radiusAttrsHtml = `<div palette="primary" bg container
     style="--container--radius: 20px">
  Custom 20px corners
</div>`;

  readonly radiusScssScss = `@use '@cpangular/cp-theming-core/scss/theme' as t;

.my-card {
  @include t.apply-palette('primary');
  @include t.bg();
  @include t.container();
  @include t.radius(20px);
}

// Per-corner control
.my-sheet {
  @include t.container();
  @include t.radius($top: 20px);
}`;

  readonly paddingAttrsHtml = `<div palette="primary" bg container
     style="--container--padding: 24px">
  Relaxed padding
</div>`;

  readonly paddingScssScss = `@use '@cpangular/cp-theming-core/scss/theme' as t;

.my-card {
  @include t.apply-palette('primary');
  @include t.bg();
  @include t.container();
  @include t.padding(24px);
}

// Asymmetric padding
.my-chip {
  @include t.container();
  @include t.padding(6px 16px);
}`;

  readonly combinedScssScss = `@use '@cpangular/cp-theming-core/scss/theme' as t;

.card {
  @include t.apply-palette('primary');
  @include t.bg();
  @include t.shape('lg');
  @include t.container();
  @include t.padding(24px);
}

.chip {
  @include t.apply-palette('secondary');
  @include t.filled();
  @include t.shape('full');
  @include t.container();
  @include t.padding(6px 16px);
}`;

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
