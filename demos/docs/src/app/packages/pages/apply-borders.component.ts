import { Component, inject } from '@angular/core';
import { ThemeExampleComponent } from '../../shared/theme-example.component';
import { TocService } from '../../shell/toc.service';
import basicHtml from '../../../examples/apply-borders/basic.html' with { loader: 'text' };
import basicScss from '../../../examples/apply-borders/basic.scss' with { loader: 'text' };
import widthHtml from '../../../examples/apply-borders/width.html' with { loader: 'text' };
import widthScss from '../../../examples/apply-borders/width.scss' with { loader: 'text' };
import combinedHtml from '../../../examples/apply-borders/combined.html' with { loader: 'text' };
import combinedScss from '../../../examples/apply-borders/combined.scss' with { loader: 'text' };

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
          [attrsHtml]="ex.basicHtml"
          [scssScss]="ex.basicScss"
        />
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
          [attrsHtml]="ex.widthHtml"
          [scssScss]="ex.widthScss"
        />
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
export class ApplyBordersPageComponent {
  protected readonly ex = {
    basicHtml,
    basicScss,
    widthHtml,
    widthScss,
    combinedHtml,
    combinedScss,
  };

  constructor() {
    inject(TocService).set([
      { label: 'Overview', anchor: 'overview' },
      { label: 'Adding a border', anchor: 'adding-border' },
      { label: 'Custom width', anchor: 'width' },
      { label: 'Combined with fills', anchor: 'combined' },
    ]);
  }
}
