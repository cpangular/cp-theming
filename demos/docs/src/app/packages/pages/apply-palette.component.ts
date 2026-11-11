import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeExampleComponent } from '../../shared/theme-example.component';
import { TocService } from '../../shell/toc.service';
import scopesHtml from '../../../examples/apply-palette/scopes.html' with { loader: 'text' };
import scopesClassesHtml from '../../../examples/apply-palette/scopes.classes.html' with {
  loader: 'text',
};
import scopesScss from '../../../examples/apply-palette/scopes.scss' with { loader: 'text' };
import nestedHtml from '../../../examples/apply-palette/nested.html' with { loader: 'text' };
import varsHtml from '../../../examples/apply-palette/vars.html' with { loader: 'text' };
import varsScss from '../../../examples/apply-palette/vars.scss' with { loader: 'text' };

@Component({
  selector: 'cpa-apply-palette-page',
  standalone: true,
  imports: [ThemeExampleComponent, RouterLink],
  template: `
    <article class="doc-page">
      <header class="page-header">
        <h1>Palette Scopes</h1>
        <p class="subtitle">Theming • @cpangular/cp-theming-core</p>
      </header>

      <section id="overview" class="page-section">
        <p class="intro">
          Activating a palette on an element routes its color tokens into
          <code>--palette-color--*</code> alias variables. Every descendant can then reference those
          variables without knowing which specific palette is active — making components
          palette-agnostic by default.
        </p>
        <p>
          On its own the attribute sets the palette's identity color as the text color for the
          element and its descendants. Pair it with a
          <a routerLink="../apply-surfaces">surface layer</a> to add backgrounds and borders.
        </p>
      </section>

      <section id="activate" class="page-section">
        <h2>Activating a palette</h2>
        <p>
          Use <code>palette="name"</code> on any element or use the
          <code>t.apply-palette()</code> SCSS mixin on a class.
        </p>
        <cpa-theme-example
          title="Applying palette scopes"
          layout="column"
          [attrsHtml]="ex.scopesHtml"
          [scssHtml]="ex.scopesClassesHtml"
          [scssScss]="ex.scopesScss"
        />
      </section>

      <section id="inheritance" class="page-section">
        <h2>Scope inheritance</h2>
        <p>
          Palette variables inherit through the CSS cascade. An inner
          <code>palette</code> attribute overrides the outer one for that subtree.
        </p>
        <cpa-theme-example
          title="Nested palette scopes"
          layout="column"
          [attrsHtml]="ex.nestedHtml"
        />
      </section>

      <section id="using-vars" class="page-section">
        <h2>Using palette variables</h2>
        <p>
          Within a palette scope, children reference a compact 3-wide window per category:
          <code>--palette-color</code> / <code>--palette-color--high</code> /
          <code>--palette-color--low</code> (and the same <code>--bg</code> and
          <code>--stroke</code> windows). <code>tone()</code> slides the window across the palette
          without renaming anything.
        </p>
        <cpa-theme-example
          title="Referencing palette vars in child styles"
          layout="column"
          [attrsHtml]="ex.varsHtml"
          [attrsScss]="ex.varsScss"
        />
      </section>

      <section id="color-properties" class="page-section">
        <h2>Color properties</h2>
        <p>
          Activating a palette exposes a compact 3-wide window per category as
          <code>--palette-color--*</code> alias variables. Every swatch below is rendered from one
          of those aliases inside a single <code>palette</code> scope — switch the active palette to
          see them all resolve to the new identity together.
        </p>
        <div class="pal-toggle">
          @for (p of paletteOptions; track p) {
            <button
              type="button"
              [attr.palette]="p"
              [class.active]="selectedPalette() === p"
              (click)="selectedPalette.set(p)"
            >
              {{ p }}
            </button>
          }
        </div>
        <div class="prop-swatches" [attr.palette]="selectedPalette()">
          @for (group of colorGroups; track group.title) {
            <h4 class="swatch-group-title">{{ group.title }}</h4>
            <div class="swatch-grid">
              @for (role of group.roles; track role.var) {
                <div
                  class="swatch-chip"
                  [title]="role.desc"
                  [style.background]="'var(' + role.var + ')'"
                  [style.color]="'var(' + role.var + '--contrast, currentColor)'"
                >
                  <code>{{ role.var }}</code>
                  <span class="swatch-aa">Aa</span>
                </div>
              }
            </div>
          }
        </div>
      </section>
    </article>
  `,
  styles: [
    `
      @use 'page-shared';

      .pal-toggle {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 24px;
      }

      .pal-toggle button {
        font: inherit;
        font-size: 13px;
        text-transform: capitalize;
        padding: 5px 16px;
        border-radius: 999px;
        border: 1px solid var(--palette-color--stroke, #888);
        background: transparent;
        color: var(--palette-color, currentColor);
        cursor: pointer;
        opacity: 0.6;
        transition:
          opacity 0.15s ease,
          background-color 0.15s ease;
      }

      .pal-toggle button:hover {
        opacity: 1;
        background: var(--palette-color--bg);
      }

      .pal-toggle button.active {
        opacity: 1;
        background: var(--palette-color--bg);
        border-color: var(--palette-color);
        font-weight: 500;
      }

      .prop-swatches {
        display: block;
      }

      .swatch-group-title {
        margin: 22px 0 8px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        opacity: 0.55;
      }

      .swatch-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 8px;
      }

      .swatch-chip {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 8px;
        border: 1px solid rgba(0, 0, 0, 0.08);
        min-height: 44px;
        cursor: default;
      }

      .swatch-chip code {
        background: none;
        color: inherit;
        font-size: 11px;
        padding: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .swatch-aa {
        font-weight: 700;
        font-size: 14px;
        opacity: 0.85;
        flex: none;
      }
    `,
  ],
})
export class ApplyPalettePageComponent {
  protected readonly ex = {
    scopesHtml,
    scopesClassesHtml,
    scopesScss,
    nestedHtml,
    varsHtml,
    varsScss,
  };

  readonly paletteOptions = ['primary', 'secondary', 'error', 'warn', 'caution', 'pass'];
  readonly selectedPalette = signal('primary');

  readonly colorGroups = [
    {
      title: 'Color window',
      roles: [
        { var: '--palette-color--high', desc: 'Emphasis step toward the foreground.' },
        {
          var: '--palette-color',
          desc: 'The palette identity color — default text color in scope.',
        },
        { var: '--palette-color--low', desc: 'De-emphasis step toward the background.' },
      ],
    },
    {
      title: 'Background window',
      roles: [
        { var: '--palette-color--bg--high', desc: 'bg, emphasis toward the foreground.' },
        {
          var: '--palette-color--bg',
          desc: 'Solid tonal background fill for the bg() surface layer.',
        },
        { var: '--palette-color--bg--low', desc: 'bg, de-emphasis toward the background.' },
      ],
    },
    {
      title: 'Stroke window',
      roles: [
        { var: '--palette-color--stroke--high', desc: 'stroke, emphasis toward the foreground.' },
        {
          var: '--palette-color--stroke',
          desc: 'Border / divider color for outlined() and rules.',
        },
        { var: '--palette-color--stroke--low', desc: 'stroke, de-emphasis toward the background.' },
      ],
    },
    {
      title: 'focus & tints',
      roles: [
        {
          var: '--palette-color--focus',
          desc: 'Focus-ring color, hue-shifted for visibility on same-hue surfaces.',
        },
        { var: '--palette-color--tint-1', desc: 'Lightest tint toward surface.' },
        { var: '--palette-color--tint-2', desc: 'Tint step 2.' },
        { var: '--palette-color--tint-3', desc: 'Tint step 3.' },
        { var: '--palette-color--tint-4', desc: 'Tint step 4.' },
        { var: '--palette-color--tint-5', desc: 'Deepest tint step.' },
      ],
    },
  ];

  constructor() {
    inject(TocService).set([
      { label: 'Overview', anchor: 'overview' },
      { label: 'Activating a palette', anchor: 'activate' },
      { label: 'Scope inheritance', anchor: 'inheritance' },
      { label: 'Using palette variables', anchor: 'using-vars' },
      { label: 'Color properties', anchor: 'color-properties' },
    ]);
  }
}
