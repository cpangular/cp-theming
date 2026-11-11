import { Component, computed, inject, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { themeHeadSnippet } from '@cpangular/cp-theming-core';
import { TocService } from '../../shell/toc.service';

const CORE_TOC = [
  { label: 'Install', anchor: 'install' },
  { label: 'Option A — Prebuilt CSS', anchor: 'option-a' },
  { label: 'Option B — Custom theme', anchor: 'option-b' },
  { label: 'TypeScript API', anchor: 'typescript-api' },
  { label: 'No flash on reload', anchor: 'no-flash' },
];

const NG_CORE_TOC = [
  { label: 'Install', anchor: 'install' },
  { label: 'Load CSS', anchor: 'load-css' },
  { label: 'Bootstrap', anchor: 'bootstrap' },
  { label: 'No flash on reload', anchor: 'no-flash' },
  { label: 'ThemeService', anchor: 'theme-service' },
  { label: 'Directives', anchor: 'directives' },
];

const NG_MATERIAL_TOC = [
  { label: 'Install', anchor: 'install' },
  { label: 'Load CSS', anchor: 'load-css' },
  { label: 'Bootstrap', anchor: 'bootstrap' },
  { label: 'Set HTML attributes', anchor: 'html-attrs' },
  { label: 'No flash on reload', anchor: 'no-flash' },
  { label: 'Use Material components', anchor: 'use-components' },
];

@Component({
  selector: 'cpa-getting-started-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="doc-page">
      <header class="page-header">
        <h1>Getting Started</h1>
        <p class="subtitle">{{ lib() }}</p>
      </header>

      @switch (lib()) {
        @case ('core') {
          <section id="install" class="page-section">
            <h2>Install</h2>
            <pre><code>npm install @cpangular/cp-theming-core
# or
pnpm add @cpangular/cp-theming-core</code></pre>
          </section>

          <section id="option-a" class="page-section">
            <h2>Option A — Prebuilt CSS</h2>
            <p>
              No Sass. Use one of the four included presets. Add to <code>styles</code> in
              <code>angular.json</code>:
            </p>
            <pre><code>"styles": [
  "@cpangular/cp-theming-core/dist/presets/azure-blue.css",
  "@cpangular/cp-theming-core/dist/core.css",
  "src/styles.scss"
]</code></pre>
            <p>Set the active theme on <code>&lt;html&gt;</code> in <code>index.html</code>:</p>
            <pre><code>&lt;html lang="en" theme="azure-blue" themeMode="auto"&gt;</code></pre>
            <p>
              <strong>Included presets:</strong>
              <code>azure-blue</code>, <code>rose-red</code>, <code>cyan-orange</code>,
              <code>magenta-violet</code>.
            </p>
          </section>

          <section id="option-b" class="page-section">
            <h2>Option B — Custom theme (Sass)</h2>
            <p>
              Define your own palette colors using
              <a href="https://oklch.com" target="_blank" rel="noopener">oklch</a>. Each palette
              needs a light-mode and dark-mode color — all derivative shades (contrast, tints, focus
              ring) are computed by the browser at runtime.
            </p>
            <pre><code>// styles/theme.scss
&#64;use '@cpangular/cp-theming-core/scss/theme' as t;

// oklch(lightness chroma hue)
// Light mode: lower lightness — readable on white
// Dark mode:  higher lightness — readable on dark backgrounds
$primary: t.light-dark(
  t.palette(oklch(0.40 0.22 270)),   // deep purple
  t.palette(oklch(0.78 0.18 270))    // soft purple
);
$secondary: t.light-dark(
  t.palette(oklch(0.45 0.18 170)),   // teal
  t.palette(oklch(0.74 0.15 170))    // light teal
);

// Assemble — unspecified palettes use built-in defaults
$my-theme: t.theme(
  $palettes: (
    primary:   $primary,
    secondary: $secondary,
  )
);

&#64;include t.define-theme('my-brand', $my-theme, $default: true);
&#64;include t.define-core-theme();</code></pre>
            <pre><code>&lt;html lang="en" theme="my-brand" themeMode="auto"&gt;</code></pre>
            <p>
              See the <a routerLink="../api">API reference</a> for the full
              <code>t.theme()</code> options — typography, density, shape, motion, and more.
            </p>
          </section>

          <section id="typescript-api" class="page-section">
            <h2>TypeScript API</h2>
            <p>
              Call once at app startup to restore saved preferences and enable runtime features:
            </p>
            <pre><code>import &#123; configurePersistence, restoreTheme, restoreMode,
         enableRelativeDensity, ThemeStorage &#125; from '@cpangular/cp-theming-core';

// Persist theme + mode in localStorage across reloads
configurePersistence(ThemeStorage.LOCAL);
restoreTheme();
restoreMode();

// Enable [themeDensityLower] / [themeDensityHigher] (optional)
enableRelativeDensity();</code></pre>
            <p>Switch themes and modes at any time:</p>
            <pre><code>import &#123; setTheme, setMode, ThemeMode &#125; from '@cpangular/cp-theming-core';

setTheme('rose-red');         // switch palette
setMode(ThemeMode.DARK);      // force dark
setMode(ThemeMode.AUTO);      // follow OS preference</code></pre>
          </section>

          <section id="no-flash" class="page-section">
            <h2>No flash on reload</h2>
            <p>
              <code>restoreTheme()</code> and <code>restoreMode()</code> run when your bundle runs,
              which is after the browser has painted the theme written in the HTML. A visitor who
              saved a dark theme sees the default one for a moment on every reload. To apply the
              saved theme and mode before the first paint, put this inline script in
              <code>&lt;head&gt;</code>, before your stylesheets:
            </p>
            <pre><code>{{ headScript }}</code></pre>
            <p>
              The script text is exported as <code>themeHeadSnippet</code>, built from the same
              storage keys <code>setTheme()</code> and <code>setMode()</code> write to, so a server
              or build step can insert it instead of a pasted copy:
            </p>
            <pre><code>import &#123; themeHeadSnippet &#125; from '@cpangular/cp-theming-core';

const tag = '&lt;script&gt;' + themeHeadSnippet + '&lt;/script&gt;';</code></pre>
            <p>
              It reads the storage chosen with <code>configurePersistence()</code> and sets
              <code>theme</code> and <code>themeMode</code> on <code>&lt;html&gt;</code>. With
              nothing saved, with persistence off, or with storage blocked, it leaves the attributes
              in your HTML as they are. A saved mode other than <code>auto</code>,
              <code>light</code>, <code>dark</code> or <code>invert</code> is ignored. Keep the
              <code>restoreTheme()</code> / <code>restoreMode()</code> calls: they are harmless
              after the snippet and cover pages without it.
            </p>
            <p>
              <strong>Content Security Policy.</strong> An inline script is blocked by a policy
              without <code>'unsafe-inline'</code>. Give the tag the nonce your server issues for
              the response, and allow that nonce in <code>script-src</code>:
            </p>
            <pre><code>&lt;script nonce="RANDOM_PER_RESPONSE"&gt;…&lt;/script&gt;

Content-Security-Policy: script-src 'self' 'nonce-RANDOM_PER_RESPONSE'</code></pre>
            <p>
              The nonce must be new for every response, so a page served as a static file cannot use
              one; allow the script by its hash instead (<code>script-src 'self' 'sha256-…'</code>,
              the SHA-256 of the exact text between the tags, which changes only when the snippet
              does).
            </p>
            <p>
              The package can be imported where there is no <code>localStorage</code> (a server
              render, a test runner): nothing touches storage until a function is called, and
              without storage the theme and mode still apply, unsaved.
            </p>
          </section>
        }

        @case ('ng-core') {
          <section id="install" class="page-section">
            <h2>Install</h2>
            <pre><code>npm install @cpangular/cp-theming-core @cpangular/cp-theming-ng-core
# or
pnpm add @cpangular/cp-theming-core @cpangular/cp-theming-ng-core</code></pre>
          </section>

          <section id="load-css" class="page-section">
            <h2>Load the CSS</h2>
            <p>Add to the <code>styles</code> array in <code>angular.json</code>:</p>
            <pre><code>"styles": [
  "@cpangular/cp-theming-core/dist/presets/azure-blue.css",
  "@cpangular/cp-theming-core/dist/core.css",
  "src/styles.scss"
]</code></pre>
          </section>

          <section id="bootstrap" class="page-section">
            <h2>Bootstrap</h2>
            <p>
              Add <code>provideTheme()</code> to <code>app.config.ts</code>. It configures
              persistence, restores saved state, and activates relative density — all in one call.
            </p>
            <pre><code>// app.config.ts
import &#123; ApplicationConfig, provideZonelessChangeDetection &#125; from '@angular/core';
import &#123; provideRouter, withComponentInputBinding &#125; from '@angular/router';
import &#123; provideTheme &#125; from '@cpangular/cp-theming-ng-core';
import &#123; appRoutes &#125; from './app.routes';

export const appConfig: ApplicationConfig = &#123;
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideTheme(),
  ],
&#125;;</code></pre>
            <pre><code>&lt;!-- index.html --&gt;
&lt;html lang="en" theme="azure-blue" themeMode="auto"&gt;</code></pre>
            <p><code>provideTheme()</code> accepts an optional config object:</p>
            <pre><code>import &#123; ThemeStorage &#125; from '@cpangular/cp-theming-core';

provideTheme(&#123;
  storage: ThemeStorage.LOCAL,  // 'LOCAL' | 'SESSION' | 'NONE' (default: LOCAL)
  restore: true,                 // restore saved theme + mode on init (default: true)
  relativeDensity: true,         // enable [themeDensityLower]/Higher (default: true)
&#125;)</code></pre>
          </section>

          <section id="no-flash" class="page-section">
            <h2>No flash on reload</h2>
            <p>
              <code>provideTheme()</code> restores the saved theme and mode when the app starts,
              after the browser has already painted the theme written in <code>index.html</code>. To
              apply the saved one before the first paint, add this inline script to
              <code>&lt;head&gt;</code> in <code>index.html</code>, before the stylesheets:
            </p>
            <pre><code>{{ headScript }}</code></pre>
            <p>
              The text is exported as <code>themeHeadSnippet</code> from
              <code>@cpangular/cp-theming-core</code> (and re-exported here). Under a Content
              Security Policy without <code>'unsafe-inline'</code> the tag needs the response's
              nonce (<code>&lt;script nonce="…"&gt;</code>, allowed with
              <code>script-src 'nonce-…'</code>) or its SHA-256 hash in <code>script-src</code>; see
              <a routerLink="/packages/core/getting-started" fragment="no-flash"
                >core Getting Started</a
              >.
            </p>
            <p>
              If the production build inlines critical CSS (the Angular default), turn that off. The
              inlined rules do not include the theme rules, and the full stylesheet then loads
              without blocking rendering, so the first frame is painted with no theme at all,
              whatever the snippet set.
            </p>
            <pre><code>// angular.json → build → configurations → production
"optimization": &#123;
  "scripts": true,
  "fonts": true,
  "styles": &#123; "minify": true, "inlineCritical": false &#125;
&#125;</code></pre>
            <p>
              Outside a browser (server rendering) <code>provideTheme()</code> and
              <code>ThemeService</code> skip storage, observers and the stylesheet scan; the
              rendered HTML keeps the attributes it was written with and the snippet applies the
              saved ones in the browser.
            </p>
          </section>

          <section id="theme-service" class="page-section">
            <h2>ThemeService</h2>
            <p>
              <code>ThemeService</code> is <code>providedIn: 'root'</code> — inject it anywhere. All
              properties are readonly signals.
            </p>
            <pre><code>import &#123; Component, inject &#125; from '@angular/core';
import &#123; ThemeService &#125; from '@cpangular/cp-theming-ng-core';
import &#123; ThemeMode &#125; from '@cpangular/cp-theming-core';

&#64;Component(&#123; ... &#125;)
export class MyComponent &#123;
  readonly theme = inject(ThemeService);

  toggleDark() &#123;
    const next = this.theme.effectiveMode() === ThemeMode.DARK
      ? ThemeMode.LIGHT
      : ThemeMode.DARK;
    this.theme.setMode(next);
  &#125;
&#125;</code></pre>
            <table class="api-table">
              <thead>
                <tr>
                  <th>Signal</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>theme</code></td>
                  <td><code>Signal&lt;string | null&gt;</code></td>
                  <td>Active palette name</td>
                </tr>
                <tr>
                  <td><code>mode</code></td>
                  <td><code>Signal&lt;ThemeMode&gt;</code></td>
                  <td>Raw mode — may be <code>AUTO</code></td>
                </tr>
                <tr>
                  <td><code>effectiveMode</code></td>
                  <td><code>Signal&lt;LIGHT | DARK&gt;</code></td>
                  <td>Resolved mode — never <code>AUTO</code></td>
                </tr>
                <tr>
                  <td><code>availableThemes</code></td>
                  <td><code>Signal&lt;ThemeDef[]&gt;</code></td>
                  <td>Palettes found in loaded CSS</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section id="directives" class="page-section">
            <h2>Directives</h2>
            <p>Import into your component's <code>imports</code> array:</p>
            <pre><code>import &#123; ThemeDirective, ThemeModeDirective, ThemeDensityDirective &#125;
  from '@cpangular/cp-theming-ng-core';

&#64;Component(&#123;
  imports: [ThemeDirective, ThemeModeDirective, ThemeDensityDirective],
  template: \`
    &lt;!-- Scope a palette to a subtree --&gt;
    &lt;div [theme]="'rose-red'"&gt;...&lt;/div&gt;

    &lt;!-- Force dark mode in a subtree --&gt;
    &lt;div [themeMode]="ThemeMode.DARK"&gt;...&lt;/div&gt;

    &lt;!-- Lower density by 1 step relative to parent context --&gt;
    &lt;section [themeDensityLower]="1"&gt;...&lt;/section&gt;
  \`,
&#125;)</code></pre>
          </section>
        }

        @case ('ng-material') {
          <section id="install" class="page-section">
            <h2>Install</h2>
            <pre><code>npm install @cpangular/cp-theming-core @cpangular/cp-theming-ng-core             @cpangular/cp-theming-ng-material &#64;angular/material &#64;angular/cdk
# or
pnpm add @cpangular/cp-theming-core @cpangular/cp-theming-ng-core          @cpangular/cp-theming-ng-material &#64;angular/material &#64;angular/cdk</code></pre>
            <p>
              <strong>Do not</strong> add any <code>&#64;angular/material/prebuilt-themes</code>
              stylesheet — this package replaces it entirely.
            </p>
          </section>

          <section id="load-css" class="page-section">
            <h2>Load the CSS</h2>
            <p>Add to the <code>styles</code> array in <code>angular.json</code>:</p>
            <pre><code>"styles": [
  "@cpangular/cp-theming-core/dist/presets/azure-blue.css",
  "@cpangular/cp-theming-core/dist/core.css",
  "@cpangular/cp-theming-ng-material/dist/material-core.css",
  "@cpangular/cp-theming-ng-material/dist/material-overrides.css",
  "src/styles.scss"
]</code></pre>
            <p>Or include everything via SCSS instead:</p>
            <pre><code>&#64;use '@cpangular/cp-theming-ng-material/scss/material' as m;

&#64;include m.define-ng-material-core-theme();
&#64;include m.apply-material-overrides();
&#64;include m.apply-material-density-scopes();</code></pre>
          </section>

          <section id="bootstrap" class="page-section">
            <h2>Bootstrap</h2>
            <pre><code>// app.config.ts
import &#123; ApplicationConfig, provideZonelessChangeDetection &#125; from '@angular/core';
import &#123; provideRouter, withComponentInputBinding &#125; from '@angular/router';
import &#123; provideTheme &#125; from '@cpangular/cp-theming-ng-core';
import &#123; appRoutes &#125; from './app.routes';

export const appConfig: ApplicationConfig = &#123;
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideTheme(),
  ],
&#125;;</code></pre>
          </section>

          <section id="html-attrs" class="page-section">
            <h2>Set HTML attributes</h2>
            <pre><code>&lt;!-- index.html --&gt;
&lt;html lang="en" theme="azure-blue" themeMode="auto"&gt;</code></pre>
            <p>
              <code>theme</code> selects the active palette. <code>themeMode</code> accepts
              <code>light</code>, <code>dark</code>, or <code>auto</code> (follows OS preference).
              Material components respond immediately to runtime changes.
            </p>
          </section>

          <section id="no-flash" class="page-section">
            <h2>No flash on reload</h2>
            <p>
              To apply a saved theme and mode before the first paint, add the inline head script
              described in
              <a routerLink="/packages/ng-core/getting-started" fragment="no-flash"
                >ng-core Getting Started</a
              >, including its Content Security Policy nonce and the critical-CSS setting.
            </p>
          </section>

          <section id="use-components" class="page-section">
            <h2>Use Material components</h2>
            <p>
              All Angular Material M3 components inherit your theme variables automatically — no
              extra per-component setup needed.
            </p>
            <pre><code>&lt;button mat-flat-button&gt;Themed button&lt;/button&gt;
&lt;mat-form-field&gt;
  &lt;input matInput placeholder="Themed input" /&gt;
&lt;/mat-form-field&gt;</code></pre>
            <p>Switch themes at runtime via <code>ThemeService</code>:</p>
            <pre><code>import &#123; inject &#125; from '@angular/core';
import &#123; ThemeService &#125; from '@cpangular/cp-theming-ng-core';
import &#123; ThemeMode &#125; from '@cpangular/cp-theming-core';

readonly themeService = inject(ThemeService);

this.themeService.setTheme('rose-red');
this.themeService.setMode(ThemeMode.DARK);</code></pre>
            <p>Apply density scopes with the directive:</p>
            <pre><code>&lt;!-- Reduce density by 2 steps in this form --&gt;
&lt;section [themeDensityLower]="2"&gt;
  &lt;mat-form-field&gt;...&lt;/mat-form-field&gt;
&lt;/section&gt;</code></pre>
            <p>
              See the <a routerLink="../showcase">Showcase</a> for live demos of all component
              states across themes and densities.
            </p>
          </section>
        }

        @default {
          <section class="page-section">
            <p>
              Getting started documentation for <strong>{{ lib() }}</strong> is coming soon.
            </p>
          </section>
        }
      }
    </article>
  `,
  styles: [
    `
      @use 'page-shared';

      .api-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
        margin-top: 16px;

        th,
        td {
          padding: 8px 12px;
          text-align: left;
          border-bottom: 1px solid var(--color--surface--stroke);
        }

        th {
          font-weight: 600;
          opacity: 0.6;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        td code {
          font-size: 12px;
        }
      }
    `,
  ],
})
export class GettingStartedPageComponent {
  private readonly _toc = inject(TocService);
  private readonly _parentParams = toSignal(inject(ActivatedRoute).parent!.params);
  /** The inline head script, shown from the library's own export so it cannot go stale. */
  readonly headScript = `<script>${themeHeadSnippet}</script>`;

  readonly lib = computed(() => (this._parentParams()?.['lib'] as string) ?? 'core');

  constructor() {
    effect(() => {
      if (this.lib() === 'core') this._toc.set(CORE_TOC);
      else if (this.lib() === 'ng-core') this._toc.set(NG_CORE_TOC);
      else if (this.lib() === 'ng-material') this._toc.set(NG_MATERIAL_TOC);
      else this._toc.clear();
    });
  }
}
