import { Component, inject } from '@angular/core';
import { ThemeExampleComponent } from '../../shared/theme-example.component';
import { TocService } from '../../shell/toc.service';
import bgHtml from '../../../examples/apply-surfaces/bg.html' with { loader: 'text' };
import bgClassesHtml from '../../../examples/apply-surfaces/bg.classes.html' with {
  loader: 'text',
};
import bgScss from '../../../examples/apply-surfaces/bg.scss' with { loader: 'text' };
import filledHtml from '../../../examples/apply-surfaces/filled.html' with { loader: 'text' };
import filledClassesHtml from '../../../examples/apply-surfaces/filled.classes.html' with {
  loader: 'text',
};
import filledScss from '../../../examples/apply-surfaces/filled.scss' with { loader: 'text' };
import outlinedHtml from '../../../examples/apply-surfaces/outlined.html' with { loader: 'text' };
import outlinedClassesHtml from '../../../examples/apply-surfaces/outlined.classes.html' with {
  loader: 'text',
};
import outlinedScss from '../../../examples/apply-surfaces/outlined.scss' with { loader: 'text' };
import composeHtml from '../../../examples/apply-surfaces/compose.html' with { loader: 'text' };
import composeClassesHtml from '../../../examples/apply-surfaces/compose.classes.html' with {
  loader: 'text',
};
import composeScss from '../../../examples/apply-surfaces/compose.scss' with { loader: 'text' };

@Component({
  selector: 'cpa-apply-surfaces-page',
  standalone: true,
  imports: [ThemeExampleComponent],
  template: `
    <article class="doc-page">
      <header class="page-header">
        <h1>Surface Types</h1>
        <p class="subtitle">Theming • @cpangular/cp-theming-core</p>
      </header>

      <section id="overview" class="page-section">
        <p class="intro">
          Surfaces are built from <strong>atomic, composable layers</strong>. Each attribute does
          one thing, and they stack on top of a <a href="apply-palette">palette scope</a>. Start
          with a palette (which colors the text), then add a fill — <code>bg</code> for a subtle
          tonal surface or <code>filled</code> for an intense one — and optionally
          <code>outlined</code> for a border, <code>shape</code> for corners, and
          <code>container</code> for padding.
        </p>
        <p>
          Every layer requires a palette on the same element (or an ancestor) to supply its colors.
        </p>
      </section>

      <section id="bg" class="page-section">
        <h2>bg</h2>
        <p>
          The subtle fill. Lays down a low-intensity,
          <strong>same-hue tint of the palette color</strong> — derived at runtime so it always sits
          lighter than the text — and <strong>keeps the palette's identity color for text</strong>:
          colored text on a tonal surface (the chip / pill look).
        </p>
        <cpa-theme-example
          title="bg surface"
          [attrsHtml]="ex.bgHtml"
          [scssHtml]="ex.bgClassesHtml"
          [scssScss]="ex.bgScss"
        />
      </section>

      <section id="filled" class="page-section">
        <h2>filled</h2>
        <p>
          The intense fill. Uses the palette color directly as the background and switches text to
          the palette's contrast color. The punchy variant for filled buttons, badges, and chips.
        </p>
        <cpa-theme-example
          title="filled surface"
          [attrsHtml]="ex.filledHtml"
          [scssHtml]="ex.filledClassesHtml"
          [scssScss]="ex.filledScss"
        />
      </section>

      <section id="outlined" class="page-section">
        <h2>outlined</h2>
        <p>
          The border layer. Draws an inset border in the palette's stroke color as a
          <code>::after</code> pseudo-element, so it sits inside the bounds and tracks the corner
          radius from <code>shape</code>. With just a palette (no fill) it gives a transparent,
          ghost-style surface.
        </p>
        <cpa-theme-example
          title="outlined surface"
          [attrsHtml]="ex.outlinedHtml"
          [scssHtml]="ex.outlinedClassesHtml"
          [scssScss]="ex.outlinedScss"
        />
      </section>

      <section id="composition" class="page-section">
        <h2>Composing layers</h2>
        <p>
          Stack the layers to build richer surfaces. Add <code>outlined</code> over a
          <code>bg</code> fill for a soft chip with a matching border, or over
          <code>filled</code> for a solid chip with a crisp edge.
        </p>
        <cpa-theme-example
          title="composed surfaces"
          [attrsHtml]="ex.composeHtml"
          [scssHtml]="ex.composeClassesHtml"
          [scssScss]="ex.composeScss"
        />
      </section>

      <section id="comparison" class="page-section">
        <h2>Side-by-side comparison</h2>
        <div class="demo-row">
          <div class="demo-swatch" palette="primary" bg>
            <span class="demo-tag">bg</span>
            <span class="demo-name">Tonal fill</span>
          </div>
          <div class="demo-swatch" palette="primary" filled>
            <span class="demo-tag">filled</span>
            <span class="demo-name">Intense fill</span>
          </div>
          <div class="demo-swatch" palette="primary" outlined shape="sm">
            <span class="demo-tag">outlined</span>
            <span class="demo-name">Border only</span>
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
export class ApplySurfacesPageComponent {
  protected readonly ex = {
    bgHtml,
    bgClassesHtml,
    bgScss,
    filledHtml,
    filledClassesHtml,
    filledScss,
    outlinedHtml,
    outlinedClassesHtml,
    outlinedScss,
    composeHtml,
    composeClassesHtml,
    composeScss,
  };

  constructor() {
    inject(TocService).set([
      { label: 'Overview', anchor: 'overview' },
      { label: 'bg', anchor: 'bg' },
      { label: 'filled', anchor: 'filled' },
      { label: 'outlined', anchor: 'outlined' },
      { label: 'Composing layers', anchor: 'composition' },
      { label: 'Comparison', anchor: 'comparison' },
    ]);
  }
}
