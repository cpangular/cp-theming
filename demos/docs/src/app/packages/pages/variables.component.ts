import { NgTemplateOutlet } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TocService } from '../../shell/toc.service';
import { CodeComponent } from '../../shared/code.component';
import { VARIABLES } from '../../../../.generated/variables';
import { ColourSwatchesComponent } from './variables/colour-swatches.component';
import type { VariableTable } from './variables/variables-data';
import colorRolesDisplayCss from '../../../examples/variables/color-roles.display.css' with {
  loader: 'text',
};

const TOC = [
  { label: 'Naming convention', anchor: 'naming' },
  { label: 'Color variables', anchor: 'color-vars' },
  { label: 'Weight variables', anchor: 'weight-vars' },
  { label: 'Space variables', anchor: 'space-vars' },
  { label: 'Shape variables', anchor: 'shape-vars' },
  { label: 'Focus variables', anchor: 'focus-vars' },
  { label: 'Motion variables', anchor: 'motion-vars' },
  { label: 'Elevation variables', anchor: 'elevation-vars' },
  { label: 'Overlay variables', anchor: 'overlay-vars' },
  { label: 'Typography variables', anchor: 'text-vars' },
  { label: 'Palette scope variables', anchor: 'palette-scope-vars' },
  { label: 'Container scope variables', anchor: 'container-vars' },
];

/**
 * The Reference's CSS Variables page. Its content is generated from the
 * compiled core.css when the site is built (scripts/variables.ts): one live
 * swatch for every colour token, grouped by palette and role, and a table row
 * for every other variable. The page adds the headings, a sentence per family
 * and the theme and mode the swatches are shown in.
 */
@Component({
  selector: 'cpa-variables-page',
  standalone: true,
  imports: [CodeComponent, ColourSwatchesComponent, NgTemplateOutlet],
  template: `
    <article class="doc-page">
      <header class="page-header">
        <h1>CSS Variables</h1>
        <p class="subtitle">&#64;cpangular/cp-theming-core</p>
      </header>

      <section id="naming" class="page-section">
        <h2>Naming convention</h2>
        <p>
          <code>--</code> is the namespace separator (like <code>.</code> in OOP). <code>-</code> is
          a word separator within a segment. The <code>color</code> role is the palette's primary
          identity — it becomes the prefix with no trailing segment.
        </p>
        <cpa-code [code]="ex.colorRolesDisplayCss" lang="css" />
        <p>
          Everything below this section is read out of the compiled <em>core.css</em> when the site
          is built: {{ data.colourTokens }} colour tokens and {{ data.otherVariables }} other
          variables. Names that core keeps to itself (a segment that starts with an underscore) are
          left out.
        </p>
      </section>

      <section id="color-vars" class="page-section">
        <h2>Color variables</h2>
        <p>
          Every colour token core declares, as a live swatch. A palette has three roles (its colour,
          <code>bg</code> and <code>stroke</code>), and each role has the same set: the role itself,
          six steps in a fixed direction, six that follow the mode, and the light and dark value a
          theme sets. The small chip in a swatch is that colour's <code>--contrast</code>: black or
          white, whichever reads on it. Click a swatch for its name.
        </p>

        <cpa-colour-swatches [palettes]="data.palettes" />
      </section>

      <section id="weight-vars" class="page-section">
        <h2>Weight variables</h2>
        <p>Percentages for text emphasis, state washes and tints. Each is kept per mode.</p>
        <ng-container *ngTemplateOutlet="table; context: { $implicit: tables['weight-vars'] }" />
      </section>

      <section id="space-vars" class="page-section">
        <h2>Space variables</h2>
        <p>
          The spacing scale at density 0. A <code>themeDensity</code> scope declares all of them
          again for its density.
        </p>
        <ng-container *ngTemplateOutlet="table; context: { $implicit: tables['space-vars'] }" />
      </section>

      <section id="shape-vars" class="page-section">
        <h2>Shape variables</h2>
        <p>Corner radii.</p>
        <ng-container *ngTemplateOutlet="table; context: { $implicit: tables['shape-vars'] }" />
      </section>

      <section id="focus-vars" class="page-section">
        <h2>Focus variables</h2>
        <p>The geometry of the focus ring. Its colour is per palette, above.</p>
        <ng-container *ngTemplateOutlet="table; context: { $implicit: tables['focus-vars'] }" />
      </section>

      <section id="motion-vars" class="page-section">
        <h2>Motion variables</h2>
        <p>Durations and easing curves.</p>
        <ng-container *ngTemplateOutlet="table; context: { $implicit: tables['motion-vars'] }" />
      </section>

      <section id="elevation-vars" class="page-section">
        <h2>Elevation variables</h2>
        <p>A shadow and a surface tint for each of the six levels.</p>
        <ng-container *ngTemplateOutlet="table; context: { $implicit: tables['elevation-vars'] }" />
      </section>

      <section id="overlay-vars" class="page-section">
        <h2>Overlay variables</h2>
        <ng-container *ngTemplateOutlet="table; context: { $implicit: tables['overlay-vars'] }" />
      </section>

      <section id="text-vars" class="page-section">
        <h2>Typography variables</h2>
        <p>
          The families and weights, then the type scale: one variable for each cell, named
          <code>--text--&#123;style&#125;--&#123;property&#125;</code>.
        </p>
        <ng-container *ngTemplateOutlet="table; context: { $implicit: tables['text-vars'] }" />
        <div class="var-scroll">
          <table class="api-props-table var-scale">
            <thead>
              <tr>
                <th>Style</th>
                @for (property of data.typeScale.properties; track property) {
                  <th>
                    <code>--{{ property }}</code>
                  </th>
                }
              </tr>
            </thead>
            <tbody>
              @for (s of data.typeScale.styles; track s.style) {
                <tr>
                  <td>
                    <code>--text--{{ s.style }}</code>
                  </td>
                  @for (property of data.typeScale.properties; track property) {
                    <td>{{ s.values[property] }}</td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section id="palette-scope-vars" class="page-section">
        <h2>Palette scope variables</h2>
        <p>
          Declared by <code>[palette]</code> on its element: the colours of the palette that element
          is in. <code>tone</code> moves them along the steps.
        </p>
        <ng-container
          *ngTemplateOutlet="table; context: { $implicit: tables['palette-scope-vars'] }"
        />
        <details>
          <summary>
            The palette before tone is applied ({{ tables['palette-source-vars'].rows.length }}
            variables)
          </summary>
          <ng-container
            *ngTemplateOutlet="table; context: { $implicit: tables['palette-source-vars'] }"
          />
        </details>
      </section>

      <section id="container-vars" class="page-section">
        <h2>Container scope variables</h2>
        <p>
          Set by the surface layers (<code>bg</code>, <code>filled</code>, <code>outlined</code>,
          <code>shape</code>, <code>container</code>) and read by the elements inside. The ones
          marked as yours are read by core and never set by it.
        </p>
        <ng-container *ngTemplateOutlet="table; context: { $implicit: tables['container-vars'] }" />
      </section>
    </article>

    <ng-template #table let-t>
      <div class="var-scroll">
        <table class="api-props-table">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Value in core</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            @for (row of t.rows; track row.name) {
              <tr>
                <td>
                  <code>{{ row.name }}</code>
                </td>
                <td class="var-value">{{ row.input ? 'not set' : row.value }}</td>
                <td>
                  @if (row.note) {
                    <span>{{ row.note }} </span>
                  }
                  @if (row.type) {
                    <span>Registered as {{ row.type }}. </span>
                  }
                  @if (row.pair; as pair) {
                    <span
                      >Per mode: <code>{{ pair[0] }}</code
                      >, <code>{{ pair[1] }}</code
                      >.
                    </span>
                  }
                  @if (row.where; as where) {
                    <span>Declared on {{ where.join(', ') }}. </span>
                  }
                  @if (row.input) {
                    <span>Yours to set. </span>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </ng-template>
  `,
  styles: [
    `
      @use 'page-shared';

      .var-scroll {
        overflow-x: auto;
      }

      .var-value {
        max-width: 340px;
        font-family: 'Roboto Mono', monospace;
        font-size: 12.5px;
        overflow-wrap: anywhere;
      }

      .var-scale td,
      .var-scale th {
        white-space: nowrap;
      }

      details {
        margin-top: 12px;
      }

      summary {
        cursor: pointer;
      }
    `,
  ],
})
export class VariablesPageComponent {
  protected readonly ex = { colorRolesDisplayCss };
  protected readonly data = VARIABLES;
  protected readonly tables: Record<string, VariableTable> = Object.fromEntries(
    VARIABLES.tables.map((table) => [table.id, table]),
  );

  constructor() {
    inject(TocService).set(TOC);
  }
}
