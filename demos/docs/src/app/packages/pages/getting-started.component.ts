import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'cpa-getting-started-page',
  standalone: true,
  template: `
    <article class="doc-page">
      <header class="page-header">
        <h1>Getting Started</h1>
        <p class="subtitle">{{ lib() }}</p>
      </header>

      @switch (lib()) {
        @case ('core') {
          <section class="page-section">
            <h2>Installation</h2>
            <pre><code>pnpm add @cpangular/cp-theming-core</code></pre>
          </section>

          <section class="page-section">
            <h2>1. Write a theme</h2>
            <p>Create a <code>my-theme.scss</code> and define your theme:</p>
            <pre><code>@use '@cpangular/cp-theming-core/scss/theme' as t;

$my-theme: t.theme(
  $brand: oklch(0.44 0.22 253),          // enables *-from-brand() helpers
  $palettes: (
    background: t.background-from-brand(),
    surface:    t.surface-from-brand(),
    primary:    t.palette-from-brand(),
    secondary:  t.light-dark(
      t.palette(oklch(0.46 0.27 264)),
      t.palette(oklch(0.71 0.21 264)),
    ),
    error: t.light-dark(
      t.palette(oklch(0.52 0.22 27)),
      t.palette(oklch(0.70 0.20 27)),
    ),
  ),
  $weights:    t.light-dark(t.weights(), t.weights($text-blend: 78%)),
  $density:    t.density($scale: 0),
  $shape:      t.shape(),
  $typography: t.typography(),
  $motion:     t.motion(),
  $elevation:  t.light-dark(t.elevation(), t.elevation($shadow-color: oklch(0 0 0 / 50%))),
);

@include t.define-theme('my-theme', $my-theme, $default: true);
@include t.define-core-theme();</code></pre>
          </section>

          <section class="page-section">
            <h2>2. Load the CSS</h2>
            <p>In your HTML:</p>
            <pre><code>&lt;link rel="stylesheet" href="my-theme.css"&gt;</code></pre>
            <p>Or use the precompiled presets (no Sass needed):</p>
            <pre><code>&lt;link rel="stylesheet" href="node_modules/@cpangular/cp-theming-core/dist/core.css"&gt;
&lt;link rel="stylesheet" href="node_modules/@cpangular/cp-theming-core/dist/presets/azure-blue.css"&gt;</code></pre>
          </section>

          <section class="page-section">
            <h2>3. Apply a theme</h2>
            <pre><code>&lt;html theme="my-theme" themeMode="auto"&gt;</code></pre>
            <p>Or use the TypeScript API:</p>
            <pre><code>import &#123; setTheme, setMode, ThemeMode &#125; from '@cpangular/cp-theming-core';

setTheme('my-theme');
setMode(ThemeMode.DARK);</code></pre>
          </section>
        }

        @case ('ng-core') {
          <section class="page-section">
            <h2>Installation</h2>
            <pre><code>pnpm add @cpangular/cp-theming-ng-core @cpangular/cp-theming-core</code></pre>
          </section>

          <section class="page-section">
            <h2>1. Bootstrap with zoneless change detection</h2>
            <pre><code>// app.config.ts
import &#123; provideZonelessChangeDetection &#125; from '@angular/core';
import &#123; provideAnimationsAsync &#125; from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = &#123;
  providers: [
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
  ],
&#125;;</code></pre>
          </section>

          <section class="page-section">
            <h2>2. Inject ThemeService</h2>
            <pre><code>import &#123; Component, inject &#125; from '@angular/core';
import &#123; ThemeService &#125; from '@cpangular/cp-theming-ng-core';
import &#123; ThemeMode &#125; from '@cpangular/cp-theming-core';

@Component(&#123; ... &#125;)
export class AppComponent &#123;
  readonly themeService = inject(ThemeService);

  setDark() &#123;
    this.themeService.setMode(ThemeMode.DARK);
  &#125;
&#125;</code></pre>
          </section>

          <section class="page-section">
            <h2>3. Scope themes with directives</h2>
            <pre><code>&lt;!-- Scope a palette to a subtree --&gt;
&lt;div [theme]="'rose-red'"&gt;
  &lt;!-- everything here uses rose-red palette --&gt;
&lt;/div&gt;

&lt;!-- Force dark mode in a subtree --&gt;
&lt;div [themeMode]="ThemeMode.DARK"&gt;
  &lt;!-- always dark, regardless of global mode --&gt;
&lt;/div&gt;</code></pre>
            <p>
              Import <code>ThemeDirective</code> and <code>ThemeModeDirective</code> from
              <code>@cpangular/cp-theming-ng-core</code> into your component's <code>imports</code>.
            </p>
          </section>
        }

        @case ('ng-material') {
          <section class="page-section">
            <h2>Installation</h2>
            <pre><code>pnpm add @cpangular/cp-theming-ng-material @angular/material</code></pre>
          </section>

          <section class="page-section">
            <h2>1. Load the CSS</h2>
            <p>In your <code>angular.json</code> styles array (recommended):</p>
            <pre><code>"styles": [
  "@cpangular/cp-theming-core/dist/core.css",
  "@cpangular/cp-theming-core/dist/presets/azure-blue.css",
  "@cpangular/cp-theming-ng-material/dist/material-core.css",
  "@cpangular/cp-theming-ng-material/dist/material-overrides.css",
  "src/styles.scss"
]</code></pre>
            <p>Or via SCSS:</p>
            <pre><code>@use '@cpangular/cp-theming-ng-material/scss/material' as m;

@include m.define-ng-material-core-theme();
@include m.apply-material-overrides();
@include m.apply-material-density-scopes();</code></pre>
          </section>

          <section class="page-section">
            <h2>2. Set default theme in index.html</h2>
            <pre><code>&lt;html lang="en" theme="azure-blue"&gt;</code></pre>
            <p>No Angular Material prebuilt theme needed — our mappings replace it entirely.</p>
          </section>

          <section class="page-section">
            <h2>3. Use Material components normally</h2>
            <p>
              All Material components automatically inherit your theme variables. Switch themes at
              runtime via <code>ThemeService.setTheme()</code>.
            </p>
            <pre><code>&lt;button mat-flat-button&gt;Themed button&lt;/button&gt;
&lt;mat-form-field&gt;
  &lt;input matInput placeholder="Themed input" /&gt;
&lt;/mat-form-field&gt;</code></pre>
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
    `,
  ],
})
export class GettingStartedPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly lib = () => (this.route.snapshot.parent?.params?.['lib'] as string) ?? 'core';
}
