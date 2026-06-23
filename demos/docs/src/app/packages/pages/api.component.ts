import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'cpa-api-page',
  standalone: true,
  template: `
    <article class="doc-page">
      <header class="page-header">
        <h1>API Reference</h1>
        <p class="subtitle">{{ lib() }}</p>
      </header>

      @switch (lib()) {
        @case ('core') {
          <section class="page-section">
            <h2>SCSS API — theme authoring</h2>
            <table class="api-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="symbol">t.theme()</td>
                  <td class="type">function</td>
                  <td>Create a theme config map from typed sub-configs.</td>
                </tr>
                <tr>
                  <td class="symbol">t.palette()</td>
                  <td class="type">function</td>
                  <td>Define a palette from a base oklch color.</td>
                </tr>
                <tr>
                  <td class="symbol">t.palette-from-brand()</td>
                  <td class="type">function</td>
                  <td>Derive a palette from the theme's <code>$brand</code> color.</td>
                </tr>
                <tr>
                  <td class="symbol">t.background-from-brand()</td>
                  <td class="type">function</td>
                  <td>Derive a neutral background palette from brand.</td>
                </tr>
                <tr>
                  <td class="symbol">t.surface-from-brand()</td>
                  <td class="type">function</td>
                  <td>Derive a surface palette from brand.</td>
                </tr>
                <tr>
                  <td class="symbol">t.light-dark()</td>
                  <td class="type">function</td>
                  <td>Return light/dark variant of any sub-config value.</td>
                </tr>
                <tr>
                  <td class="symbol">t.weights()</td>
                  <td class="type">function</td>
                  <td>Configure text blend and state layer opacity weights.</td>
                </tr>
                <tr>
                  <td class="symbol">t.overlays()</td>
                  <td class="type">function</td>
                  <td>Configure scrim and shadow overlay colors.</td>
                </tr>
                <tr>
                  <td class="symbol">t.elevation()</td>
                  <td class="type">function</td>
                  <td>Configure elevation shadow levels.</td>
                </tr>
                <tr>
                  <td class="symbol">t.typography()</td>
                  <td class="type">function</td>
                  <td>Configure type scale (font family, sizes, line heights).</td>
                </tr>
                <tr>
                  <td class="symbol">t.density()</td>
                  <td class="type">function</td>
                  <td>Configure density scale (0 to −5).</td>
                </tr>
                <tr>
                  <td class="symbol">t.shape()</td>
                  <td class="type">function</td>
                  <td>Configure corner radius scale.</td>
                </tr>
                <tr>
                  <td class="symbol">t.focus()</td>
                  <td class="type">function</td>
                  <td>Configure focus ring width, offset, and style.</td>
                </tr>
                <tr>
                  <td class="symbol">t.motion()</td>
                  <td class="type">function</td>
                  <td>Configure motion duration and easing tokens.</td>
                </tr>
                <tr>
                  <td class="symbol">t.define-theme()</td>
                  <td class="type">mixin</td>
                  <td>Emit all CSS variable declarations for a theme.</td>
                </tr>
                <tr>
                  <td class="symbol">t.define-core-theme()</td>
                  <td class="type">mixin</td>
                  <td>
                    Emit shared <code>@property</code> registrations and attribute rules. Call once.
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section class="page-section">
            <h2>TypeScript API</h2>
            <table class="api-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Signature</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="symbol">getTheme</td>
                  <td class="type">(el?: Element) → string | null</td>
                </tr>
                <tr>
                  <td class="symbol">setTheme</td>
                  <td class="type">(name: string | null, el?: Element) → void</td>
                </tr>
                <tr>
                  <td class="symbol">getMode</td>
                  <td class="type">(el?: Element) → ThemeMode</td>
                </tr>
                <tr>
                  <td class="symbol">setMode</td>
                  <td class="type">(mode: ThemeMode, el?: Element) → void</td>
                </tr>
                <tr>
                  <td class="symbol">getEffectiveMode</td>
                  <td class="type">(el?: Element) → ThemeMode.LIGHT | ThemeMode.DARK</td>
                </tr>
                <tr>
                  <td class="symbol">getPreferredMode</td>
                  <td class="type">() → ThemeMode.LIGHT | ThemeMode.DARK</td>
                </tr>
                <tr>
                  <td class="symbol">watchMode</td>
                  <td class="type">(cb, opts?) → stop()</td>
                </tr>
                <tr>
                  <td class="symbol">watchTheme</td>
                  <td class="type">(cb, opts?) → stop()</td>
                </tr>
                <tr>
                  <td class="symbol">getAvailableThemes</td>
                  <td class="type">() → ThemeDef[]</td>
                </tr>
                <tr>
                  <td class="symbol">configurePersistence</td>
                  <td class="type">(storage: ThemeStorage) → void</td>
                </tr>
              </tbody>
            </table>
          </section>
        }

        @case ('ng-core') {
          <section class="page-section">
            <h2>ThemeService</h2>
            <table class="api-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="symbol">theme</td>
                  <td class="type">Signal&lt;string | null&gt;</td>
                  <td>Active theme name.</td>
                </tr>
                <tr>
                  <td class="symbol">mode</td>
                  <td class="type">Signal&lt;ThemeMode&gt;</td>
                  <td>Current mode setting (AUTO / LIGHT / DARK).</td>
                </tr>
                <tr>
                  <td class="symbol">effectiveMode</td>
                  <td class="type">Signal&lt;LIGHT | DARK&gt;</td>
                  <td>Resolved mode, never AUTO.</td>
                </tr>
                <tr>
                  <td class="symbol">availableThemes</td>
                  <td class="type">Signal&lt;ThemeDef[]&gt;</td>
                  <td>Themes discovered in loaded stylesheets.</td>
                </tr>
                <tr>
                  <td class="symbol">setTheme()</td>
                  <td class="type">(name: string | null) → void</td>
                  <td>Apply a theme by name.</td>
                </tr>
                <tr>
                  <td class="symbol">setMode()</td>
                  <td class="type">(mode: ThemeMode) → void</td>
                  <td>Set light/dark/auto mode.</td>
                </tr>
                <tr>
                  <td class="symbol">configurePersistence()</td>
                  <td class="type">(storage: ThemeStorage) → void</td>
                  <td>Enable localStorage/sessionStorage persistence.</td>
                </tr>
                <tr>
                  <td class="symbol">restorePersistedState()</td>
                  <td class="type">() → void</td>
                  <td>Apply previously persisted theme/mode.</td>
                </tr>
                <tr>
                  <td class="symbol">refreshAvailableThemes()</td>
                  <td class="type">() → void</td>
                  <td>Re-scan stylesheets for available themes.</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section class="page-section">
            <h2>ThemeDirective</h2>
            <table class="api-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="symbol">selector</td>
                  <td class="type">[theme]</td>
                </tr>
                <tr>
                  <td class="symbol">theme</td>
                  <td class="type">InputSignal&lt;string | null&gt;</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section class="page-section">
            <h2>ThemeModeDirective</h2>
            <table class="api-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="symbol">selector</td>
                  <td class="type">[themeMode]</td>
                </tr>
                <tr>
                  <td class="symbol">themeMode</td>
                  <td class="type">InputSignal&lt;ThemeMode | null&gt;</td>
                </tr>
              </tbody>
            </table>
          </section>
        }

        @case ('ng-material') {
          <section class="page-section">
            <h2>SCSS mixins</h2>
            <table class="api-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="symbol">define-ng-material-core-theme()</td>
                  <td>
                    Emit 166 <code>--mat-sys-*</code> → <code>var(--color--*)</code> mappings on
                    <code>:root</code>.
                  </td>
                </tr>
                <tr>
                  <td class="symbol">apply-material-overrides()</td>
                  <td>
                    Emit component-level patches that bypass <code>--mat-sys-*</code> tokens. Grows
                    with demo-material.
                  </td>
                </tr>
                <tr>
                  <td class="symbol">apply-material-density-scopes()</td>
                  <td>
                    Emit <code>[themeDensity="-N"]</code> rules that set Angular Material component
                    size tokens.
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section class="page-section">
            <h2>Precompiled CSS exports</h2>
            <table class="api-table">
              <thead>
                <tr>
                  <th>Export path</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="symbol">./css/material-core</td>
                  <td>166 <code>--mat-sys-*</code> token mappings.</td>
                </tr>
                <tr>
                  <td class="symbol">./css/material-overrides</td>
                  <td>Component patches + density scopes.</td>
                </tr>
                <tr>
                  <td class="symbol">./scss/*</td>
                  <td>Raw SCSS source for consuming via <code>@use</code>.</td>
                </tr>
              </tbody>
            </table>
          </section>
        }

        @default {
          <section class="page-section">
            <p>
              API reference for <strong>{{ lib() }}</strong> is coming soon.
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
export class ApiPageComponent {
  private readonly _parentParams = toSignal(inject(ActivatedRoute).parent!.params);
  readonly lib = computed(() => (this._parentParams()?.['lib'] as string) ?? 'core');
}
