import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'cpa-guides-page',
  standalone: true,
  template: `
    <article class="doc-page">
      <header class="page-header">
        <h1>Guides</h1>
        <p class="subtitle">{{ lib() }}</p>
      </header>

      @switch (lib()) {
        @case ('core') {
          <section class="page-section">
            <h2>CSS variable naming convention</h2>
            <p>
              <code>--</code> is the namespace separator (like <code>.</code> in OOP).
              <code>-</code> is a word separator within a segment. The <code>color</code> role is
              the palette's primary identity — it becomes the prefix with no trailing segment.
            </p>
            <pre><code>--color--primary                      primary color role
--color--primary--contrast            black or white (highest contrast)
--color--primary--dark                lightness − 0.12
--color--primary--darker              lightness − 0.24
--color--primary--bg                  background role
--color--primary--bg--high            lighter/darker based on mode
--color--primary--tint-1              10% opacity tint
--color--primary--focus               per-palette focus ring color</code></pre>
          </section>

          <section class="page-section">
            <h2>Runtime derivatives</h2>
            <p>
              All variant values are computed by the browser using CSS relative color syntax. There
              are no pre-computed values — the browser derives them at paint time.
            </p>
            <pre><code>/* What the output CSS looks like (simplified) */
[theme="azure-blue"] &#123;
  --color--primary: oklch(0.44 0.22 253);

  /* Derived by browser at runtime — NOT pre-computed */
  --color--primary--dark:    oklch(from var(--color--primary) calc(l - 0.12) c h);
  --color--primary--light:   oklch(from var(--color--primary) calc(l + 0.12) c h);
  --color--primary--contrast: oklch(from var(--color--primary)
      clamp(0, calc(l * -10 + 6), 1) 0 0);
&#125;</code></pre>
          </section>

          <section class="page-section">
            <h2>Nested theme scopes</h2>
            <p>
              Place the <code>theme</code> attribute on any element to apply a different palette to
              that subtree. CSS custom properties inherit, so all descendants pick up the new
              values.
            </p>
            <pre><code>&lt;html theme="azure-blue"&gt;
  &lt;!-- azure-blue variables active here --&gt;
  &lt;div theme="rose-red"&gt;
    &lt;!-- rose-red variables active here --&gt;
  &lt;/div&gt;
&lt;/html&gt;</code></pre>
          </section>
        }

        @case ('ng-core') {
          <section class="page-section">
            <h2>ThemeService signal reactivity</h2>
            <p>
              <code>ThemeService</code> uses Angular signals internally. All state changes
              (<code>setTheme</code>, <code>setMode</code>) trigger signal updates synchronously.
              Components that read <code>themeService.theme()</code> or <code>mode()</code>
              re-render automatically when those signals change — no manual subscriptions.
            </p>
          </section>

          <section class="page-section">
            <h2>Scoped themes with ThemeDirective</h2>
            <p>
              Import <code>ThemeDirective</code> and use <code>[theme]</code> on any host element.
              The directive sets the HTML attribute, activating the correct CSS variable scope.
            </p>
            <pre><code>// component.ts
imports: [ThemeDirective]

// template
&lt;div [theme]="'rose-red'"&gt;
  &lt;!-- Material components here inherit rose-red palette --&gt;
&lt;/div&gt;</code></pre>
          </section>

          <section class="page-section">
            <h2>Persisting theme/mode across sessions</h2>
            <pre><code>// Call once during app startup (e.g. in AppComponent constructor)
const themeService = inject(ThemeService);
themeService.configurePersistence(ThemeStorage.LOCAL);
themeService.restorePersistedState();</code></pre>
          </section>
        }

        @case ('ng-material') {
          <section class="page-section">
            <h2>How the cascade works</h2>
            <p>
              <code>material-core.css</code> maps every <code>--mat-sys-*</code> token to a
              <code>var(--color--*)</code> reference on <code>:root</code>. Because CSS custom
              property <code>var()</code> references are resolved lazily at the element where
              they're consumed (not where they're defined), Angular Material components inside a
              <code>[theme="rose-red"]</code> subtree automatically receive rose-red's values.
            </p>
          </section>

          <section class="page-section">
            <h2>Tertiary palette</h2>
            <p>
              Angular Material M3 defines three accent palettes: primary, secondary, and tertiary.
              cp-theming only has two accent palettes. Tertiary is intentionally mapped to
              secondary. If you need a distinct tertiary, override
              <code>--mat-sys-tertiary*</code> after including <code>material-core.css</code>.
            </p>
          </section>

          <section class="page-section">
            <h2>Adding component overrides</h2>
            <p>
              Some Angular Material components bypass <code>--mat-sys-*</code> and hardcode values.
              Add patches in <code>apply-material-overrides()</code> in
              <code>packages/theme-ng-material/scss/_material.scss</code>. The demo-material
              application surfaces these gaps.
            </p>
          </section>
        }

        @default {
          <section class="page-section">
            <p>
              Guides for <strong>{{ lib() }}</strong> are coming soon.
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
export class GuidesPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly lib = () => (this.route.snapshot.parent?.params?.['lib'] as string) ?? 'core';
}
