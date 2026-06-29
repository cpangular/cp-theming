import { Component, inject } from '@angular/core';
import { ThemeExampleComponent } from '../../shared/theme-example.component';
import { TocService } from '../../shell/toc.service';

@Component({
  selector: 'cpa-apply-borders-page',
  standalone: true,
  imports: [ThemeExampleComponent],
  template: `
    <article class="doc-page">
      <header class="page-header">
        <h1>Borders</h1>
        <p class="subtitle">Theming • @cpangular/cp-theming-core</p>
      </header>

      <section id="overview" class="page-section">
        <p class="intro">
          The <code>outlined</code> layer adds a border whose color is derived from the active
          palette. The border is rendered as an inset <code>::after</code> element, so it sits
          inside the bounds and tracks the corner radius from <code>shape</code> — and stays
          semantically linked to its palette with no hard-coded hex values.
        </p>
      </section>

      <section id="adding-border" class="page-section">
        <h2>Adding a border</h2>
        <p>
          Add the <code>outlined</code> attribute or use <code>t.outlined()</code>
          to apply a 1&nbsp;px border in the palette's stroke color. With only a palette (no fill)
          it is a transparent, ghost-style surface.
        </p>
        <cpa-theme-example
          title="Basic border"
          [attrsHtml]="borderAttrsHtml"
          [scssScss]="borderScssScss"
        >
          <div demo class="demo-row">
            <div class="demo-swatch" palette="primary" bg outlined shape="sm">
              <span class="demo-tag">bg + outlined</span>
              <span class="demo-name">Primary</span>
            </div>
            <div class="demo-swatch" palette="secondary" bg outlined shape="sm">
              <span class="demo-tag">bg + outlined</span>
              <span class="demo-name">Secondary</span>
            </div>
            <div class="demo-swatch" palette="error" outlined shape="sm">
              <span class="demo-tag">outlined only</span>
              <span class="demo-name">Error</span>
            </div>
          </div>
        </cpa-theme-example>
      </section>

      <section id="width" class="page-section">
        <h2>Custom border width</h2>
        <p>
          Override <code>--stroke-width</code> to change the border thickness without losing the
          palette-linked color. The <code>container</code>
          layer automatically folds the width into its padding so content never shifts.
        </p>
        <cpa-theme-example
          title="Custom border width"
          [attrsHtml]="widthAttrsHtml"
          [scssScss]="widthScssScss"
        >
          <div demo class="demo-row">
            <div
              class="demo-swatch"
              palette="primary"
              outlined
              shape="sm"
              style="--stroke-width: 1px"
            >
              <span class="demo-tag">1px (default)</span>
              <span class="demo-name">Normal</span>
            </div>
            <div
              class="demo-swatch"
              palette="primary"
              outlined
              shape="sm"
              style="--stroke-width: 2px"
            >
              <span class="demo-tag">2px</span>
              <span class="demo-name">Medium</span>
            </div>
            <div
              class="demo-swatch"
              palette="primary"
              outlined
              shape="sm"
              style="--stroke-width: 4px"
            >
              <span class="demo-tag">4px</span>
              <span class="demo-name">Heavy</span>
            </div>
          </div>
        </cpa-theme-example>
      </section>

      <section id="combined" class="page-section">
        <h2>Combined with fills</h2>
        <p>
          <code>outlined</code> composes with <code>bg</code> or <code>filled</code> for extra
          definition — most useful on a subtle <code>bg</code> surface where the edge is otherwise
          soft.
        </p>
        <cpa-theme-example
          title="outlined + fill combinations"
          [attrsHtml]="combinedAttrsHtml"
          [scssScss]="combinedScssScss"
        >
          <div demo class="demo-row">
            <div class="demo-swatch" palette="primary" bg outlined shape="sm" container>
              <span class="demo-tag">bg + outlined</span>
              <span class="demo-name">Defined card</span>
            </div>
            <div class="demo-swatch" palette="secondary" filled outlined shape="sm" container>
              <span class="demo-tag">filled + outlined</span>
              <span class="demo-name">Bold edge</span>
            </div>
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
export class ApplyBordersPageComponent {
  readonly borderAttrsHtml = `<div palette="primary" bg outlined shape="sm">
  Bordered tonal card
</div>

<!-- outlined without a fill (just the border) -->
<div palette="primary" outlined shape="sm">
  Border only — transparent
</div>`;

  readonly borderScssScss = `@use '@cpangular/cp-theming-core/scss/theme' as t;

.my-card {
  @include t.apply-palette('primary');
  @include t.bg();
  @include t.outlined();
  @include t.shape('sm');
}`;

  readonly widthAttrsHtml = `<div palette="primary" outlined shape="sm"
     style="--stroke-width: 2px">
  2px border
</div>`;

  readonly widthScssScss = `@use '@cpangular/cp-theming-core/scss/theme' as t;

.my-card {
  @include t.apply-palette('primary');
  @include t.outlined();
  @include t.shape('sm');
  --stroke-width: 2px;
}`;

  readonly combinedAttrsHtml = `<div palette="primary" bg outlined shape="sm" container>
  bg + outlined
</div>

<button palette="secondary" filled outlined shape="sm" container>
  filled + outlined
</button>`;

  readonly combinedScssScss = `@use '@cpangular/cp-theming-core/scss/theme' as t;

.card {
  @include t.apply-palette('primary');
  @include t.bg();
  @include t.outlined();
  @include t.shape('sm');
  @include t.container();
}

.badge {
  @include t.apply-palette('secondary');
  @include t.filled();
  @include t.outlined();
  @include t.shape('sm');
  @include t.container();
}`;

  constructor() {
    inject(TocService).set([
      { label: 'Overview', anchor: 'overview' },
      { label: 'Adding a border', anchor: 'adding-border' },
      { label: 'Custom width', anchor: 'width' },
      { label: 'Combined with fills', anchor: 'combined' },
    ]);
  }
}
