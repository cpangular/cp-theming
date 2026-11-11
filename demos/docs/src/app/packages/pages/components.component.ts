import { NgComponentOutlet } from '@angular/common';
import { Component, inject } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { CodeComponent } from '../../shared/code.component';
import { TocService } from '../../shell/toc.service';
import { ACCENT_EXAMPLE, FAMILIES, OVERLAY_SCOPES } from './components/gallery.components';
import overlayPanelTs from '../../../examples/components/overlay-panel.ts.txt' with {
  loader: 'text',
};
import overlayScopeTs from '../../../examples/components/overlay-scope.ts.txt' with {
  loader: 'text',
};

const TOC = [
  { label: 'Overview', anchor: 'overview' },
  ...FAMILIES.map((family) => ({ label: family.title, anchor: family.id })),
  { label: 'Overlays', anchor: 'overlays' },
];

/** The accent palettes a family that reads the primary roles is repeated under. */
const ACCENTS = ['secondary', 'tertiary', 'error', 'brand'];

/**
 * The Components page (PORT-PLAN.md, Phase 15): every Angular Material
 * component family, live, themed by the adapter and by nothing else. The
 * styles below are the page's own chrome (headings, the frame around a demo);
 * nothing in them reaches inside a `.gallery-demo`.
 */
@Component({
  selector: 'cpa-components-page',
  standalone: true,
  imports: [NgComponentOutlet, CodeComponent],
  providers: [provideNativeDateAdapter()],
  template: `
    <article class="doc-page">
      <header class="page-header">
        <h1>Components</h1>
        <p class="subtitle">@cpangular/cp-theming-ng-material</p>
      </header>

      <section id="overview" class="page-section">
        <p class="intro">
          Every Angular Material component family, in the states that matter, themed by the adapter
          alone. Switch the theme and the mode in the toolbar: the page has no colour of its own to
          keep up.
        </p>
        <p>
          A component that reads Material's primary roles takes its colour from the
          <code>palette</code> attribute on itself or on any ancestor. Those families are shown
          again under the four other accent palettes.
        </p>
        <p>
          A fill is the palette's colour exactly: a filled button, a checked checkbox, a slider. A
          label painted in that colour is not. <code>apply-material-overrides()</code> holds it to a
          lightness that reads on a surface, so a text button under a dark <code>brand</code> is
          still legible in dark mode while the filled one beside it stays the brand colour.
        </p>
        <p>
          The preset themes pass no brand, so <code>brand</code> on this page is the core default, a
          near-black, in both modes. In dark mode its fills are dark on a dark page: a brand is one
          colour and is never adjusted.
        </p>
        <div class="gallery-demo">
          <ng-container [ngComponentOutlet]="accent.component" />
        </div>
        <details class="gallery-source">
          <summary>accent.ng.html</summary>
          <cpa-code [code]="accent.source" lang="html" />
        </details>
      </section>

      @for (family of families; track family.id) {
        <section [id]="family.id" class="page-section gallery-section">
          <h2>{{ family.title }}</h2>
          <p>{{ family.text }}</p>
          <div class="gallery-demo">
            <ng-container [ngComponentOutlet]="family.component" />
          </div>
          @if (family.accent) {
            @for (palette of accents; track palette) {
              <p class="gallery-caption">
                <code>palette="{{ palette }}"</code>
              </p>
              <div class="gallery-demo" [attr.palette]="palette">
                <ng-container [ngComponentOutlet]="family.component" />
              </div>
            }
          }
          @for (source of family.sources; track source.file) {
            <details class="gallery-source">
              <summary>{{ source.file }}</summary>
              <cpa-code [code]="source.text" lang="html" />
            </details>
          }
        </section>
      }

      <section id="overlays" class="page-section gallery-section">
        <h2>Overlays</h2>
        <p>
          The adapter declares Material's tokens on every element that has a
          <code>theme</code> attribute, and the mode on every element that has a
          <code>themeMode</code> attribute. A component inside such an element follows it. An
          overlay follows it only if Material renders the overlay inside that element, and for most
          overlays it does not: they go into the overlay container, a <code>&lt;div&gt;</code> under
          <code>&lt;body&gt;</code>.
        </p>

        <table class="api-props-table">
          <thead>
            <tr>
              <th>Overlay</th>
              <th>Where Material renders it</th>
              <th>What it needs in a nested scope</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Select, autocomplete</td>
              <td>Next to the field, as a popover inside the element that opened it.</td>
              <td>Nothing. The panel is a descendant of the scope.</td>
            </tr>
            <tr>
              <td>Menu, datepicker, tooltip</td>
              <td>
                In the overlay container that the injector of their own element provides. By default
                that is the one under <code>&lt;body&gt;</code>.
              </td>
              <td>
                An overlay container provided on the scope that carries the scope's
                <code>theme</code> and <code>themeMode</code> attributes.
              </td>
            </tr>
            <tr>
              <td>Dialog, bottom sheet, snackbar</td>
              <td>
                In the overlay container of the injector that provides the service. By default that
                is the root injector.
              </td>
              <td>
                The same container, and the service provided on the scope too, so that a component
                inside it injects that instance. Or the attribute set on the overlay's own panel.
              </td>
            </tr>
          </tbody>
        </table>

        @for (scope of scopes; track scope.scope) {
          <h3>{{ scope.title }}</h3>
          <p>{{ scope.text }}</p>
          <div class="gallery-demo" [attr.data-scope]="scope.scope">
            <ng-container [ngComponentOutlet]="scope.component" />
          </div>
          @for (source of scope.sources; track source.file) {
            <details class="gallery-source" [open]="scope.scope !== 'page'">
              <summary>{{ source.file }}</summary>
              <cpa-code [code]="source.text" lang="html" />
            </details>
          }
          @if (scope.scope === 'mode') {
            <p>
              <code>cpaOverlayScope</code> is this site's directive, not part of the package. It
              provides an overlay container that copies the theme and the resolved mode of its
              element, and provides the three services again so they use it:
            </p>
            <cpa-code [code]="overlayScopeTs" lang="typescript" />
          }
          @if (scope.scope === 'panel') {
            <p>
              Material's <code>panelClass</code> adds a class, and the adapter selects on
              attributes, so the class themes nothing by itself: it is how the panel is found.
            </p>
            <cpa-code [code]="overlayPanelTs" lang="typescript" />
          }
        }

        <h3>What cannot follow a nested scope</h3>
        <ul class="gallery-limits">
          <li>
            A dialog, bottom sheet or snackbar opened through a service injected outside the scope
            (a root service, a parent component) renders in the page's theme and mode. The service
            decides, not the element that was clicked.
          </li>
          <li>
            The scoped container copies the attributes when an overlay is created. An overlay that
            is already open does not follow a later change of the scope's
            <code>theme</code> or <code>themeMode</code>; the next one opened does. A change on
            <code>&lt;html&gt;</code> reaches every overlay at once, open or not.
          </li>
          <li>
            Only <code>theme</code> and the resolved mode are copied. A <code>palette</code> or
            <code>themeDensity</code> attribute on the scope does not reach an overlay that renders
            in a container; it reaches a select or autocomplete panel, which is inside the scope.
          </li>
          <li>
            <code>themeMode="invert"</code> cannot be put on a container: under
            <code>&lt;body&gt;</code> it would invert the page's mode, not the scope's. The
            container gets the mode the scope resolves to, <code>light</code> or <code>dark</code>.
          </li>
          <li>
            Through the panel alone, the backdrop stays in the page's theme, and a tooltip cannot be
            reached: it has no event to set the attribute from.
          </li>
        </ul>
      </section>
    </article>
  `,
  styles: [
    `
      @use 'page-shared';

      .gallery-section h2 {
        margin: 0 0 8px;
      }

      .gallery-section h3 {
        margin: 32px 0 8px;
        font-size: 16px;
        font-weight: 500;
      }

      /* The frame around a live example. Layout and a hairline only: what is
         inside is coloured by the adapter. */
      .gallery-demo {
        margin: 16px 0 0;
        padding: 24px;
        border: 1px solid var(--color--surface--stroke);
        border-radius: 12px;
      }

      .gallery-demo[data-scope='theme'],
      .gallery-demo[data-scope='mode'],
      .gallery-demo[data-scope='panel'] {
        padding: 0;
        border: 0;
      }

      .gallery-caption {
        margin: 20px 0 0;
        font-size: 13px;
      }

      .gallery-source {
        margin: 12px 0 0;
        font-size: 13px;
      }

      .gallery-source summary {
        cursor: pointer;
        width: fit-content;
        opacity: 0.75;
      }

      .gallery-limits li {
        margin: 8px 0;
        line-height: 1.6;
      }
    `,
  ],
})
export class ComponentsPageComponent {
  protected readonly accent = ACCENT_EXAMPLE;
  protected readonly families = FAMILIES;
  protected readonly accents = ACCENTS;
  protected readonly scopes = OVERLAY_SCOPES;
  protected readonly overlayScopeTs = overlayScopeTs;
  protected readonly overlayPanelTs = overlayPanelTs;

  constructor() {
    inject(TocService).set(TOC);
  }
}
