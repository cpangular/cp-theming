import { Component, inject } from '@angular/core';
import { ThemeExampleComponent } from '../../shared/theme-example.component';
import { TocService } from '../../shell/toc.service';

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
          [attrsHtml]="bgAttrsHtml"
          [scssHtml]="bgScssHtml"
          [scssScss]="bgScssScss"
        >
          <div demo class="demo-row">
            <span palette="primary" bg>Primary</span>
            <span palette="secondary" bg>Secondary</span>
            <span palette="error" bg>Error</span>
          </div>
        </cpa-theme-example>
      </section>

      <section id="filled" class="page-section">
        <h2>filled</h2>
        <p>
          The intense fill. Uses the palette color directly as the background and switches text to
          the palette's contrast color. The punchy variant for filled buttons, badges, and chips.
        </p>
        <cpa-theme-example
          title="filled surface"
          [attrsHtml]="filledAttrsHtml"
          [scssHtml]="filledScssHtml"
          [scssScss]="filledScssScss"
        >
          <div demo class="demo-row">
            <span palette="primary" filled>Primary</span>
            <span palette="secondary" filled>Secondary</span>
            <span palette="error" filled>Error</span>
          </div>
        </cpa-theme-example>
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
          [attrsHtml]="outlinedAttrsHtml"
          [scssHtml]="outlinedScssHtml"
          [scssScss]="outlinedScssScss"
        >
          <div demo class="demo-row">
            <span palette="primary" outlined>Primary</span>
            <span palette="secondary" outlined>Secondary</span>
            <span palette="error" outlined>Error</span>
          </div>
        </cpa-theme-example>
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
          [attrsHtml]="composeAttrsHtml"
          [scssHtml]="composeScssHtml"
          [scssScss]="composeScssScss"
        >
          <div demo class="demo-row">
            <span palette="primary" bg outlined>Soft</span>
            <span palette="primary" filled outlined>Filled</span>
          </div>
        </cpa-theme-example>
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
  readonly bgAttrsHtml = `<span palette="primary" bg>Primary</span>
<span palette="secondary" bg>Secondary</span>
<span palette="error" bg>Error</span>`;

  readonly bgScssHtml = `<span class="chip-primary">Primary</span>
<span class="chip-secondary">Secondary</span>
<span class="chip-error">Error</span>`;

  readonly bgScssScss = `@use '@cpangular/cp-theming-core/scss/theme' as t;

.chip-primary {
  @include t.apply-palette('primary');
  @include t.bg();
}

.chip-secondary {
  @include t.apply-palette('secondary');
  @include t.bg();
}

.chip-error {
  @include t.apply-palette('error');
  @include t.bg();
}`;

  readonly filledAttrsHtml = `<span palette="primary" filled>Primary</span>
<span palette="secondary" filled>Secondary</span>
<span palette="error" filled>Error</span>`;

  readonly filledScssHtml = `<span class="btn-primary">Primary</span>
<span class="btn-secondary">Secondary</span>
<span class="btn-error">Error</span>`;

  readonly filledScssScss = `@use '@cpangular/cp-theming-core/scss/theme' as t;

.btn-primary {
  @include t.apply-palette('primary');
  @include t.filled();
}

.btn-secondary {
  @include t.apply-palette('secondary');
  @include t.filled();
}

.btn-error {
  @include t.apply-palette('error');
  @include t.filled();
}`;

  readonly outlinedAttrsHtml = `<span palette="primary" outlined>Primary</span>
<span palette="secondary" outlined>Secondary</span>
<span palette="error" outlined>Error</span>`;

  readonly outlinedScssHtml = `<span class="ghost-primary">Primary</span>
<span class="ghost-secondary">Secondary</span>
<span class="ghost-error">Error</span>`;

  readonly outlinedScssScss = `@use '@cpangular/cp-theming-core/scss/theme' as t;

.ghost-primary {
  @include t.apply-palette('primary');
  @include t.outlined();
}

.ghost-secondary {
  @include t.apply-palette('secondary');
  @include t.outlined();
}

.ghost-error {
  @include t.apply-palette('error');
  @include t.outlined();
}`;

  readonly composeAttrsHtml = `<!-- soft chip: fill + matching border -->
<span palette="primary" bg outlined>Soft</span>

<!-- solid chip: fill + crisp edge -->
<span palette="primary" filled outlined>Filled</span>`;

  readonly composeScssHtml = `<span class="chip-soft">Soft</span>
<span class="chip-filled">Filled</span>`;

  readonly composeScssScss = `@use '@cpangular/cp-theming-core/scss/theme' as t;

.chip-soft {
  @include t.apply-palette('primary');
  @include t.bg();
  @include t.outlined();
}

.chip-filled {
  @include t.apply-palette('primary');
  @include t.filled();
  @include t.outlined();
}`;

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
