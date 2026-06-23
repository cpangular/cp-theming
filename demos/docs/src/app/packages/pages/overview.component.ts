import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

const LIB_OVERVIEW: Record<
  string,
  { title: string; subtitle: string; intro: string; bullets: string[] }
> = {
  'ng-core': {
    title: 'cp-theming-ng-core',
    subtitle: 'Angular 22 · Signals · Zoneless-first',
    intro:
      'Signal-based Angular wrapper around the cp-theming-core TypeScript API. ' +
      'Zero Angular Material dependency — it works with any Angular application. ' +
      'Fully zoneless-first, compatible with <code>provideZonelessChangeDetection()</code>.',
    bullets: [
      '<code>ThemeService</code> — <code>providedIn: root</code>, exposes <code>theme</code>, <code>mode</code>, <code>effectiveMode</code>, <code>availableThemes</code> as readonly signals',
      '<code>ThemeDirective</code> — selector <code>[theme]</code>, signal input — sets the <code>[theme]</code> attribute on host to scope a palette to a subtree',
      '<code>ThemeModeDirective</code> — selector <code>[themeMode]</code>, signal input — overrides the mode (light/dark/auto) for a subtree',
      'MutationObserver-based watchers with <code>DestroyRef</code> cleanup — no memory leaks',
      'Re-exports <code>ThemeMode</code>, <code>ThemeStorage</code>, <code>ThemeDef</code> from cp-theming-core',
    ],
  },
  'ng-material': {
    title: 'cp-theming-ng-material',
    subtitle: 'Angular Material 22 · M3 adapter',
    intro:
      'SCSS adapter that maps the cp-theming CSS variable system to Angular Material 22 ' +
      'system tokens (<code>--mat-sys-*</code>). Ships precompiled CSS — no Sass setup ' +
      'required in consumer projects.',
    bullets: [
      '166 <code>--mat-sys-*</code> → <code>var(--color--*)</code> mappings covering color, surface, overlays, state layers, shape, elevation, motion, and typography',
      'Re-emitted at <code>[theme]</code> level to fix CSS <code>@property</code> eager resolution in nested theme scopes',
      'Per-element density scopes: <code>[themeDensity="-N"]</code> compacts buttons, icon buttons, form fields, lists, toolbar, tabs, chips, and steppers',
      '<code>define-ng-material-core-theme()</code> mixin for SCSS consumers',
      'Precompiled <code>material-core.css</code> and <code>material-overrides.css</code> for CSS-only consumers',
      'No <code>@angular/material/prebuilt-themes</code> needed — our mapping replaces it',
    ],
  },
};

@Component({
  selector: 'cpa-overview-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (lib() === 'core') {
      <article class="doc-page">
        <header class="page-header">
          <h1>cp-theming-core</h1>
          <p class="subtitle">SCSS API · CSS variable system · Vanilla TypeScript</p>
        </header>

        <section class="page-section">
          <p class="intro">
            The foundation of the cp-theming system. Defines the full SCSS authoring API, a runtime
            CSS variable system in <code>oklch</code>, a typed TypeScript API for controlling theme
            and mode at runtime, and precompiled CSS presets for zero-config drop-in usage.
          </p>
        </section>

        <section class="page-section">
          <h2>How it works</h2>
          <div class="concept-grid">
            <a class="concept-card" routerLink="../api">
              <div class="concept-card-title">
                <span class="concept-icon">🎨</span>
                <h3>Palettes</h3>
              </div>
              <p>
                Named sets of runtime CSS variables — color, background, stroke, tints, contrast,
                and focus ring. All derivatives computed by the browser.
              </p>
            </a>
            <a class="concept-card" routerLink="../guides">
              <div class="concept-card-title">
                <span class="concept-icon">🌓</span>
                <h3>Light &amp; dark</h3>
              </div>
              <p>
                Every value can have separate light and dark expressions. The active color-scheme on
                the root element controls which resolves at runtime.
              </p>
            </a>
            <a class="concept-card" routerLink="../guides">
              <div class="concept-card-title">
                <span class="concept-icon">🧩</span>
                <h3>Nested scopes</h3>
              </div>
              <p>
                Place a theme attribute on any element to apply a different palette to that subtree
                — fully cascade-native, no JavaScript re-render.
              </p>
            </a>
            <a class="concept-card" routerLink="../guides">
              <div class="concept-card-title">
                <span class="concept-icon">📐</span>
                <h3>Density</h3>
              </div>
              <p>
                A single attribute compacts all space tokens in a subtree. Angular Material
                components respond automatically.
              </p>
            </a>
          </div>
        </section>

        <section class="page-section">
          <h2>Installation</h2>
          <pre class="code-block"><code>npm install &#64;cpangular/cp-theming-core</code></pre>
          <p>Then load the preset and core CSS in your stylesheet or <code>angular.json</code>:</p>
          <pre class="code-block"><code>&#64;cpangular/cp-theming-core/dist/presets/azure-blue.css
&#64;cpangular/cp-theming-core/dist/core.css</code></pre>
        </section>

        <section class="page-section">
          <h2>SCSS authoring</h2>
          <p>One import gives you the full API:</p>
          <pre class="code-block"><code>&#64;use '&#64;cpangular/cp-theming-core/scss/theme' as t;

&#64;include t.define-theme('my-theme', t.theme(
  background: t.light-dark(t.palette(oklch(0.97 0.004 253)), t.palette(oklch(0.18 0.014 253))),
  surface:    t.light-dark(t.palette(oklch(0.93 0.008 253)), t.palette(oklch(0.24 0.018 253))),
  primary:    t.light-dark(t.palette(oklch(0.43 0.19 253)),  t.palette(oklch(0.72 0.17 253))),
));
&#64;include t.define-core-theme();</code></pre>
        </section>

        <section class="page-section">
          <h2>CSS variable reference</h2>
          <p>Every palette emits a consistent set of variables:</p>
          <div class="token-table-wrap">
            <table class="api-table">
              <thead>
                <tr>
                  <th>Variable</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>--color--&#123;name&#125;</code></td>
                  <td>Primary identity color</td>
                </tr>
                <tr>
                  <td><code>--color--&#123;name&#125;--contrast</code></td>
                  <td>Black or white — highest contrast against the color role</td>
                </tr>
                <tr>
                  <td><code>--color--&#123;name&#125;--dark / --light</code></td>
                  <td>Absolute lightness step (±0.12 in oklch L)</td>
                </tr>
                <tr>
                  <td><code>--color--&#123;name&#125;--high / --low</code></td>
                  <td>Mode-relative step — darkens in light mode, lightens in dark</td>
                </tr>
                <tr>
                  <td><code>--color--&#123;name&#125;--bg</code></td>
                  <td>Container background tone</td>
                </tr>
                <tr>
                  <td><code>--color--&#123;name&#125;--stroke</code></td>
                  <td>Mid-tone border — auto-derived, always visible on its surface</td>
                </tr>
                <tr>
                  <td><code>--color--&#123;name&#125;--stroke--low / --high</code></td>
                  <td>Subtle divider / emphasized border</td>
                </tr>
                <tr>
                  <td><code>--color--&#123;name&#125;--tint-1…5</code></td>
                  <td>Transparent overlays at 10 / 20 / 38 / 60 / 80 %</td>
                </tr>
                <tr>
                  <td><code>--color--&#123;name&#125;--focus</code></td>
                  <td>Focus ring — auto-derived with hue shift, always distinct</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="page-section">
          <h2>TypeScript API</h2>
          <pre
            class="code-block"
          ><code>import &#123; setTheme, setMode, getAvailableThemes, ThemeMode &#125; from '&#64;cpangular/cp-theming-core';

setTheme('rose-red');       // apply a preset
setMode(ThemeMode.DARK);    // force dark mode
setMode(ThemeMode.AUTO);    // follow OS preference

const themes = getAvailableThemes(); // ['azure-blue', 'rose-red', …]</code></pre>
        </section>
      </article>
    } @else {
      @let data = content();
      <article class="doc-page">
        <header class="page-header">
          <h1>{{ data.title }}</h1>
          <p class="subtitle">{{ data.subtitle }}</p>
        </header>
        <section class="page-section">
          <p class="intro" [innerHTML]="data.intro"></p>
        </section>
        <section class="page-section">
          <h2>Key features</h2>
          <ul class="feature-list">
            @for (b of data.bullets; track b) {
              <li [innerHTML]="b"></li>
            }
          </ul>
        </section>
      </article>
    }
  `,
  styles: [
    `
      @use 'page-shared';

      .concept-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 12px;
        margin-top: 8px;
      }

      .concept-card {
        display: block;
        padding: 16px 20px;
        border-radius: 10px;
        border: 1px solid var(--color--surface--stroke--low);
        background: var(--color--surface--bg);
        text-decoration: none;
        color: inherit;
        transition:
          border-color 120ms,
          background 120ms;

        &:hover {
          border-color: var(--color--primary--stroke);
          background: var(--color--surface--bg--high);
        }

        .concept-card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;

          .concept-icon {
            font-size: 18px;
            line-height: 1;
            flex-shrink: 0;
          }

          h3 {
            font-size: 14px;
            font-weight: 500;
            margin: 0;
            color: var(--color--primary);
          }
        }

        p {
          font-size: 13px;
          line-height: 1.6;
          margin: 0;
          opacity: 0.8;
        }
      }

      .code-block {
        background: var(--color--surface--bg);
        border: 1px solid var(--color--surface--stroke--low);
        border-radius: 8px;
        padding: 16px 20px;
        font-family: 'Roboto Mono', monospace;
        font-size: 13px;
        line-height: 1.7;
        overflow-x: auto;
        margin: 12px 0 20px;
        white-space: pre;

        code {
          background: none;
          padding: 0;
          font-size: inherit;
          border-radius: 0;
        }
      }

      .token-table-wrap {
        overflow-x: auto;
      }
    `,
  ],
})
export class OverviewPageComponent {
  private readonly _parentParams = toSignal(inject(ActivatedRoute).parent!.params);
  readonly lib = computed(() => (this._parentParams()?.['lib'] as string) ?? 'core');
  readonly content = () =>
    LIB_OVERVIEW[this.lib()] ?? { title: this.lib(), subtitle: '', intro: '', bullets: [] };
}
