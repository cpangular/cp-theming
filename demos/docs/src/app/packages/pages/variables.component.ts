import { Component, inject } from '@angular/core';
import { TocService } from '../../shell/toc.service';
import { CodeComponent } from '../../shared/code.component';
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
  { label: 'Container scope vars', anchor: 'container-vars' },
];

@Component({
  selector: 'cpa-variables-page',
  standalone: true,
  imports: [CodeComponent],
  template: `
    <article class="doc-page">
      <header class="page-header">
        <h1>CSS Variables</h1>
        <p class="subtitle">@cpangular/cp-theming-core</p>
      </header>

      <section id="naming" class="page-section">
        <h2>Naming convention</h2>
        <p>
          <code>--</code> is the namespace separator (like <code>.</code> in OOP). <code>-</code> is
          a word separator within a segment. The <code>color</code> role is the palette's primary
          identity — it becomes the prefix with no trailing segment.
        </p>
        <cpa-code [code]="ex.colorRolesDisplayCss" lang="css" />
      </section>

      <section id="color-vars" class="page-section">
        <h2>Color variables</h2>
        <p>
          Each named palette emits three role prefixes: the identity color (no suffix after the
          name), <code>--bg</code>, and <code>--stroke</code>. All three have the full derivative
          set below.
        </p>
        <table class="api-props-table">
          <thead>
            <tr>
              <th>Variable pattern</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>--color--&#123;name&#125;</code></td>
              <td>Identity / primary color for the palette.</td>
            </tr>
            <tr>
              <td><code>--color--&#123;name&#125;--contrast</code></td>
              <td>White or black — whichever contrasts more with the identity color.</td>
            </tr>
            <tr>
              <td><code>--color--&#123;name&#125;--dark</code></td>
              <td>Lightness − 0.12.</td>
            </tr>
            <tr>
              <td><code>--color--&#123;name&#125;--darker</code></td>
              <td>Lightness − 0.24.</td>
            </tr>
            <tr>
              <td><code>--color--&#123;name&#125;--light</code></td>
              <td>Lightness + 0.12.</td>
            </tr>
            <tr>
              <td><code>--color--&#123;name&#125;--lighter</code></td>
              <td>Lightness + 0.24.</td>
            </tr>
            <tr>
              <td><code>--color--&#123;name&#125;--high</code></td>
              <td>Mode-relative: darker in light mode, lighter in dark mode.</td>
            </tr>
            <tr>
              <td><code>--color--&#123;name&#125;--higher</code></td>
              <td>Stronger version of <code>--high</code>.</td>
            </tr>
            <tr>
              <td><code>--color--&#123;name&#125;--low</code></td>
              <td>Opposite direction from <code>--high</code>.</td>
            </tr>
            <tr>
              <td><code>--color--&#123;name&#125;--lower</code></td>
              <td>Stronger version of <code>--low</code>.</td>
            </tr>
            <tr>
              <td><code>--color--&#123;name&#125;--bg</code></td>
              <td>Background/container role (full derivative set).</td>
            </tr>
            <tr>
              <td><code>--color--&#123;name&#125;--stroke</code></td>
              <td>Border/stroke role (full derivative set).</td>
            </tr>
            <tr>
              <td><code>--color--&#123;name&#125;--focus</code></td>
              <td>Focus ring color — hue-shifted per palette for visibility.</td>
            </tr>
            <tr>
              <td><code>--color--&#123;name&#125;--tint-1 … tint-5</code></td>
              <td>Transparent tints at 10% / 20% / 38% / 60% / 80%.</td>
            </tr>
            <tr>
              <td><code>--color--brand</code></td>
              <td>
                The <code>brand</code> palette's color: the brand color exactly as
                <code>$brand</code> gave it. <code>brand</code> is a palette like the others, so
                every variable above exists for it (<code>--color--brand--contrast</code>,
                <code>--color--brand--bg</code>, …).
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section id="weight-vars" class="page-section">
        <h2>Weight variables</h2>
        <table class="api-props-table">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>--weight--text-blend</code></td>
              <td>Primary text opacity (default 0.87).</td>
            </tr>
            <tr>
              <td><code>--weight--text-emphasis-blend</code></td>
              <td>High-emphasis text opacity (default 1.0).</td>
            </tr>
            <tr>
              <td><code>--weight--text-deemphasis-blend</code></td>
              <td>Low-emphasis / hint text opacity (default 0.55).</td>
            </tr>
            <tr>
              <td><code>--weight--text-primary-tint</code></td>
              <td>Tint for primary-colored text on surfaces.</td>
            </tr>
            <tr>
              <td><code>--weight--state-hover</code></td>
              <td>Hover state layer opacity (default 0.08).</td>
            </tr>
            <tr>
              <td><code>--weight--state-press</code></td>
              <td>Press / active state layer opacity (default 0.12).</td>
            </tr>
            <tr>
              <td><code>--weight--state-focus</code></td>
              <td>Keyboard-focused state layer opacity (default 0.12).</td>
            </tr>
            <tr>
              <td><code>--weight--state-drag</code></td>
              <td>Dragging state layer opacity (default 0.16).</td>
            </tr>
            <tr>
              <td><code>--weight--tint-1 … tint-5</code></td>
              <td>Tint opacities at five levels.</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section id="space-vars" class="page-section">
        <h2>Space variables</h2>
        <table class="api-props-table">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Base (scale 0)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>--density-scale</code></td>
              <td>Active density scale (0 to −5).</td>
            </tr>
            <tr>
              <td><code>--space--xxs</code></td>
              <td>2px</td>
            </tr>
            <tr>
              <td><code>--space--xs</code></td>
              <td>4px</td>
            </tr>
            <tr>
              <td><code>--space--sm</code></td>
              <td>8px</td>
            </tr>
            <tr>
              <td><code>--space--md</code></td>
              <td>16px</td>
            </tr>
            <tr>
              <td><code>--space--lg</code></td>
              <td>24px</td>
            </tr>
            <tr>
              <td><code>--space--xl</code></td>
              <td>32px</td>
            </tr>
            <tr>
              <td><code>--space--xxl</code></td>
              <td>48px</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section id="shape-vars" class="page-section">
        <h2>Shape variables</h2>
        <table class="api-props-table">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Default</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>--shape--xxs</code></td>
              <td>2px</td>
            </tr>
            <tr>
              <td><code>--shape--xs</code></td>
              <td>4px</td>
            </tr>
            <tr>
              <td><code>--shape--sm</code></td>
              <td>8px</td>
            </tr>
            <tr>
              <td><code>--shape--md</code></td>
              <td>12px</td>
            </tr>
            <tr>
              <td><code>--shape--lg</code></td>
              <td>16px</td>
            </tr>
            <tr>
              <td><code>--shape--xl</code></td>
              <td>28px</td>
            </tr>
            <tr>
              <td><code>--shape--xxl</code></td>
              <td>32px</td>
            </tr>
            <tr>
              <td><code>--shape--full</code></td>
              <td>9999px</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section id="focus-vars" class="page-section">
        <h2>Focus variables</h2>
        <table class="api-props-table">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Default</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>--focus--width</code></td>
              <td>2px</td>
            </tr>
            <tr>
              <td><code>--focus--offset</code></td>
              <td>2px</td>
            </tr>
            <tr>
              <td><code>--focus--style</code></td>
              <td>solid</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section id="motion-vars" class="page-section">
        <h2>Motion variables</h2>
        <table class="api-props-table">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Default</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>--motion--duration-short</code></td>
              <td>100ms</td>
            </tr>
            <tr>
              <td><code>--motion--duration-medium</code></td>
              <td>250ms</td>
            </tr>
            <tr>
              <td><code>--motion--duration-long</code></td>
              <td>400ms</td>
            </tr>
            <tr>
              <td><code>--motion--duration-extra</code></td>
              <td>600ms</td>
            </tr>
            <tr>
              <td><code>--motion--easing-standard</code></td>
              <td>cubic-bezier(0.2,0,0,1)</td>
            </tr>
            <tr>
              <td><code>--motion--easing-emphasized</code></td>
              <td>cubic-bezier(0.2,0,0,1)</td>
            </tr>
            <tr>
              <td><code>--motion--easing-decelerate</code></td>
              <td>cubic-bezier(0,0,0,1)</td>
            </tr>
            <tr>
              <td><code>--motion--easing-accelerate</code></td>
              <td>cubic-bezier(0.3,0,1,1)</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section id="elevation-vars" class="page-section">
        <h2>Elevation variables</h2>
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
              <td>No shadow.</td>
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
              <td>Surface tint color at each elevation level.</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section id="overlay-vars" class="page-section">
        <h2>Overlay variables</h2>
        <table class="api-props-table">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>--overlay--scrim</code></td>
              <td>Modal / backdrop scrim color.</td>
            </tr>
            <tr>
              <td><code>--overlay--shadow</code></td>
              <td>Elevation shadow base color.</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section id="container-vars" class="page-section">
        <h2>Container scope variables</h2>
        <p>
          Set by the surface layers (<code>bg()</code>, <code>filled()</code>,
          <code>outlined()</code>, <code>shape()</code>, <code>container()</code>) and read by child
          elements:
        </p>
        <table class="api-props-table">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>--container--text</code></td>
              <td>Blended body text color.</td>
            </tr>
            <tr>
              <td><code>--container--text-emphasis</code></td>
              <td>Full-contrast text.</td>
            </tr>
            <tr>
              <td><code>--container--text-deemphasis</code></td>
              <td>Reduced emphasis text.</td>
            </tr>
            <tr>
              <td><code>--container--stroke</code></td>
              <td>Border color.</td>
            </tr>
            <tr>
              <td><code>--container--padding</code></td>
              <td>Density-reactive padding (all sides).</td>
            </tr>
            <tr>
              <td><code>--container--radius</code></td>
              <td>Corner radius base value.</td>
            </tr>
            <tr>
              <td><code>--palette-color</code></td>
              <td>Active palette identity color alias.</td>
            </tr>
            <tr>
              <td><code>--palette-color--bg</code></td>
              <td>Active palette bg role alias.</td>
            </tr>
            <tr>
              <td><code>--palette-color--stroke</code></td>
              <td>Active palette stroke role alias.</td>
            </tr>
            <tr>
              <td><code>--palette-color--focus</code></td>
              <td>Active palette focus role alias.</td>
            </tr>
            <tr>
              <td><code>--palette-color--tint-1 … tint-5</code></td>
              <td>Active palette tint aliases.</td>
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
export class VariablesPageComponent {
  protected readonly ex = { colorRolesDisplayCss };

  constructor() {
    inject(TocService).set(TOC);
  }
}
