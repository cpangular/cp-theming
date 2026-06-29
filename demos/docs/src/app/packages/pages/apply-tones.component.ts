import { Component, inject } from '@angular/core';
import { ThemeExampleComponent } from '../../shared/theme-example.component';
import { TocService } from '../../shell/toc.service';

@Component({
  selector: 'cpa-apply-tones-page',
  standalone: true,
  imports: [ThemeExampleComponent],
  template: `
    <article class="doc-page">
      <header class="page-header">
        <h1>Tones</h1>
        <p class="subtitle">Theming • @cpangular/cp-theming-core</p>
      </header>

      <section id="overview" class="page-section">
        <p class="intro">
          Tones adjust the lightness of a surface relative to the current color mode. A
          <em>higher</em> tone means more emphasis — a darker surface in light mode and a lighter
          surface in dark mode — always staying readable and on-brand.
        </p>
      </section>

      <section id="mode-relative" class="page-section">
        <h2>Mode-relative tones</h2>
        <p>
          Use tone values <code>low</code> / <code>lower</code> / <code>lowest</code> and
          <code>high</code> / <code>higher</code> / <code>highest</code> to shift lightness relative
          to the current color mode across seven steps. The result flips correctly between light and
          dark. No tone is the mid step. Each tone slides a 3-wide window so a child's
          <code>low</code>/<code>high</code> neighbors stay valid.
        </p>
        <cpa-theme-example
          title="Mode-relative tone scale"
          [attrsHtml]="relativeAttrsHtml"
          [scssScss]="relativeScssScss"
        >
          <div demo class="demo-row">
            <div class="demo-swatch" palette="primary" filled tone="lowest">
              <span class="demo-tag">tone=&quot;lowest&quot;</span>
              <span class="demo-name">Lowest</span>
            </div>
            <div class="demo-swatch" palette="primary" filled tone="lower">
              <span class="demo-tag">tone=&quot;lower&quot;</span>
              <span class="demo-name">Lower</span>
            </div>
            <div class="demo-swatch" palette="primary" filled tone="low">
              <span class="demo-tag">tone=&quot;low&quot;</span>
              <span class="demo-name">Low</span>
            </div>
            <div class="demo-swatch" palette="primary" filled>
              <span class="demo-tag">(no tone)</span>
              <span class="demo-name">Mid</span>
            </div>
            <div class="demo-swatch" palette="primary" filled tone="high">
              <span class="demo-tag">tone=&quot;high&quot;</span>
              <span class="demo-name">High</span>
            </div>
            <div class="demo-swatch" palette="primary" filled tone="higher">
              <span class="demo-tag">tone=&quot;higher&quot;</span>
              <span class="demo-name">Higher</span>
            </div>
            <div class="demo-swatch" palette="primary" filled tone="highest">
              <span class="demo-tag">tone=&quot;highest&quot;</span>
              <span class="demo-name">Highest</span>
            </div>
          </div>
        </cpa-theme-example>
      </section>

      <section id="across-palettes" class="page-section">
        <h2>Tones across palettes</h2>
        <p>
          The same tone value applied to different palettes keeps the relative lightness consistent
          — useful for sidebars, headers, or tinted regions that span multiple semantic zones.
        </p>
        <div class="demo-row">
          <div class="demo-swatch" palette="primary" filled tone="high">
            <span class="demo-tag">primary · high</span>
            <span class="demo-name">Primary</span>
          </div>
          <div class="demo-swatch" palette="secondary" filled tone="high">
            <span class="demo-tag">secondary · high</span>
            <span class="demo-name">Secondary</span>
          </div>
          <div class="demo-swatch" palette="error" filled tone="high">
            <span class="demo-tag">error · high</span>
            <span class="demo-name">Error</span>
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
export class ApplyTonesPageComponent {
  readonly relativeAttrsHtml = `<div palette="primary" filled tone="low">
  Low tone — lighter in light mode
</div>

<div palette="primary" filled>
  Mid tone (no tone attribute)
</div>

<div palette="primary" filled tone="high">
  High tone — darker in light mode
</div>`;

  readonly relativeScssScss = `@use '@cpangular/cp-theming-core/scss/theme' as t;

.card-low {
  @include t.apply-palette('primary');
  @include t.tone('low');
  @include t.filled();
}

.card-high {
  @include t.apply-palette('primary');
  @include t.tone('high');
  @include t.filled();
}`;

  constructor() {
    inject(TocService).set([
      { label: 'Overview', anchor: 'overview' },
      { label: 'Mode-relative tones', anchor: 'mode-relative' },
      { label: 'Across palettes', anchor: 'across-palettes' },
    ]);
  }
}
