import { Component, inject } from '@angular/core';
import { TocService } from '../../shell/toc.service';

const TOC = [
  { label: 'Overview', anchor: 'overview' },
  { label: 'Theme management', anchor: 'theme-mgmt' },
  { label: 'Mode management', anchor: 'mode-mgmt' },
  { label: 'Persistence', anchor: 'persistence' },
  { label: 'ThemeMode enum', anchor: 'theme-mode' },
];

@Component({
  selector: 'cpa-typescript-api-page',
  standalone: true,
  template: `
    <article class="doc-page">
      <header class="page-header">
        <h1>TypeScript API</h1>
        <p class="subtitle">@cpangular/cp-theming-core</p>
      </header>

      <section id="overview" class="page-section">
        <p class="intro">
          The TypeScript API is a thin, framework-agnostic layer for reading and writing theme and
          mode at runtime. All functions accept an optional <code>el?: Element</code> to scope the
          operation to a specific DOM subtree. If omitted they operate on
          <code>document.documentElement</code>.
        </p>
        <div class="api-import-line">
          <code
            >import &#123; getTheme, setTheme, ThemeMode, ... &#125; from
            '@cpangular/cp-theming-core';</code
          >
        </div>
      </section>

      <section id="theme-mgmt" class="page-section">
        <h2 class="api-section-heading">Theme management</h2>
        <hr class="api-section-rule" />

        <div class="api-symbol">
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-name">getTheme</span><span class="api-sig-punct">(</span
              ><span class="api-sig-param">el</span><span class="api-sig-punct">?: </span
              ><span class="api-sig-type">Element</span><span class="api-sig-punct">): </span
              ><span class="api-sig-return">string | null</span></span
            >
            <div class="api-member-body">
              <p class="api-member-desc">
                Read the active theme name from the nearest <code>[theme]</code> ancestor.
              </p>
            </div>
          </div>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-name">setTheme</span><span class="api-sig-punct">(</span
              ><span class="api-sig-param">name</span><span class="api-sig-punct">: </span
              ><span class="api-sig-type">string | null</span><span class="api-sig-punct">, </span
              ><span class="api-sig-param">el</span><span class="api-sig-punct">?: </span
              ><span class="api-sig-type">Element</span><span class="api-sig-punct">): </span
              ><span class="api-sig-return">void</span></span
            >
            <div class="api-member-body">
              <p class="api-member-desc">
                Apply a theme by name. Pass <code>null</code> to remove and inherit from parent.
              </p>
            </div>
          </div>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-name">getAvailableThemes</span
              ><span class="api-sig-punct">(): </span
              ><span class="api-sig-return">ThemeDef[]</span></span
            >
            <div class="api-member-body">
              <p class="api-member-desc">
                Scan the loaded stylesheets and return one entry per theme name found in a
                <code>[theme="name"]</code> selector. A cross-origin stylesheet cannot be read and
                is skipped.
              </p>
            </div>
          </div>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-name">watchTheme</span><span class="api-sig-punct">(</span
              ><span class="api-sig-param">cb</span><span class="api-sig-punct">: </span
              ><span class="api-sig-type">(name: string | null) =&gt; void</span
              ><span class="api-sig-punct">, </span><span class="api-sig-param">opts</span
              ><span class="api-sig-punct">?: </span><span class="api-sig-type">WatchOptions</span
              ><span class="api-sig-punct">): </span
              ><span class="api-sig-return">() =&gt; void</span></span
            >
            <div class="api-member-body">
              <p class="api-member-desc">
                Subscribe to theme changes via <code>MutationObserver</code>. Returns an unsubscribe
                function.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="mode-mgmt" class="page-section">
        <h2 class="api-section-heading">Mode management</h2>
        <hr class="api-section-rule" />

        <div class="api-symbol">
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-name">getMode</span><span class="api-sig-punct">(</span
              ><span class="api-sig-param">el</span><span class="api-sig-punct">?: </span
              ><span class="api-sig-type">Element</span><span class="api-sig-punct">): </span
              ><span class="api-sig-return">ThemeMode</span></span
            >
            <div class="api-member-body">
              <p class="api-member-desc">
                Read the mode setting — <code>AUTO</code>, <code>LIGHT</code>, or <code>DARK</code>.
              </p>
            </div>
          </div>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-name">setMode</span><span class="api-sig-punct">(</span
              ><span class="api-sig-param">mode</span><span class="api-sig-punct">: </span
              ><span class="api-sig-type">ThemeMode</span><span class="api-sig-punct">, </span
              ><span class="api-sig-param">el</span><span class="api-sig-punct">?: </span
              ><span class="api-sig-type">Element</span><span class="api-sig-punct">): </span
              ><span class="api-sig-return">void</span></span
            >
            <div class="api-member-body">
              <p class="api-member-desc">
                Set light / dark / auto mode by writing <code>color-scheme</code> on the element.
              </p>
            </div>
          </div>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-name">getEffectiveMode</span><span class="api-sig-punct">(</span
              ><span class="api-sig-param">el</span><span class="api-sig-punct">?: </span
              ><span class="api-sig-type">Element</span><span class="api-sig-punct">): </span
              ><span class="api-sig-return">ThemeMode.LIGHT | ThemeMode.DARK</span></span
            >
            <div class="api-member-body">
              <p class="api-member-desc">
                Resolved mode — never AUTO. Follows system <code>prefers-color-scheme</code> when
                mode is AUTO.
              </p>
            </div>
          </div>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-name">getPreferredMode</span
              ><span class="api-sig-punct">(): </span
              ><span class="api-sig-return">ThemeMode.LIGHT | ThemeMode.DARK</span></span
            >
            <div class="api-member-body">
              <p class="api-member-desc">
                Read the OS/browser preferred color scheme via
                <code>prefers-color-scheme</code> media query.
              </p>
            </div>
          </div>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-name">watchMode</span><span class="api-sig-punct">(</span
              ><span class="api-sig-param">cb</span><span class="api-sig-punct">: </span
              ><span class="api-sig-type">(mode: ThemeMode) =&gt; void</span
              ><span class="api-sig-punct">, </span><span class="api-sig-param">opts</span
              ><span class="api-sig-punct">?: </span><span class="api-sig-type">WatchOptions</span
              ><span class="api-sig-punct">): </span
              ><span class="api-sig-return">() =&gt; void</span></span
            >
            <div class="api-member-body">
              <p class="api-member-desc">
                Subscribe to mode changes. Returns an unsubscribe function.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="persistence" class="page-section">
        <h2 class="api-section-heading">Persistence</h2>
        <hr class="api-section-rule" />

        <div class="api-symbol">
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-name">configurePersistence</span
              ><span class="api-sig-punct">(</span><span class="api-sig-param">storage</span
              ><span class="api-sig-punct">: </span><span class="api-sig-type">ThemeStorage</span
              ><span class="api-sig-punct">): </span><span class="api-sig-return">void</span></span
            >
            <div class="api-member-body">
              <p class="api-member-desc">
                Wire theme and mode to a storage adapter. Pass <code>localStorage</code>,
                <code>sessionStorage</code>, or a custom <code>ThemeStorage</code> implementation.
              </p>
            </div>
          </div>
          <div class="api-member-card">
            <span class="api-signature-row"
              ><span class="api-sig-name">themeHeadSnippet</span
              ><span class="api-sig-punct">: </span><span class="api-sig-return">string</span></span
            >
            <div class="api-member-body">
              <p class="api-member-desc">
                JavaScript text for an inline <code>&lt;script&gt;</code> in
                <code>&lt;head&gt;</code>: applies the saved theme and mode to
                <code>&lt;html&gt;</code> before first paint. See Getting Started, "No flash on
                reload".
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="theme-mode" class="page-section">
        <h2 class="api-section-heading">ThemeMode</h2>
        <hr class="api-section-rule" />
        <p class="api-symbol-desc">Enum representing the three possible mode settings.</p>
        <table class="api-props-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="prop-name">ThemeMode.AUTO</span></td>
              <td>Follow the system <code>prefers-color-scheme</code> preference.</td>
            </tr>
            <tr>
              <td><span class="prop-name">ThemeMode.LIGHT</span></td>
              <td>Force light mode regardless of system preference.</td>
            </tr>
            <tr>
              <td><span class="prop-name">ThemeMode.DARK</span></td>
              <td>Force dark mode regardless of system preference.</td>
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
export class TypeScriptApiPageComponent {
  constructor() {
    inject(TocService).set(TOC);
  }
}
