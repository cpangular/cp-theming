import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

const LIB_OVERVIEW: Record<
  string,
  { title: string; subtitle: string; intro: string; bullets: string[] }
> = {
  core: {
    title: 'cp-theming-core',
    subtitle: 'SCSS API · CSS variable system · Vanilla TypeScript',
    intro:
      'The foundation of the cp-theming system. Contains the full SCSS authoring API, ' +
      'a runtime CSS variable system based on oklch, a typed TypeScript API for controlling ' +
      'theme and mode, and precompiled CSS presets for zero-config usage.',
    bullets: [
      'Runtime color derivatives via CSS <code>oklch(from var(--x) …)</code> — no Sass color math',
      "Single SCSS import: <code>@use '@cpangular/cp-theming-core/scss/theme' as t;</code>",
      'Typed sub-config builder functions: <code>t.palette()</code>, <code>t.weights()</code>, <code>t.typography()</code>, etc.',
      'Density system: <code>[themeDensity="-3"]</code> compacts all space tokens in the subtree',
      'Composable mixin layers: <code>apply-palette</code> → <code>container</code> / <code>filled</code> / <code>outlined</code> → <code>stroke</code>',
      'TypeScript API: <code>setTheme()</code>, <code>setMode()</code>, <code>watchMode()</code>, <code>watchTheme()</code>, <code>getAvailableThemes()</code>',
      'Precompiled CSS presets: azure-blue, rose-red, cyan-orange, magenta-violet',
      'All custom properties registered via <code>@property</code> — CSS transitions and keyframes work',
    ],
  },
  'ng-core': {
    title: 'cp-theming-ng-core',
    subtitle: 'Angular 22 · Signals · Zoneless-first',
    intro:
      'Signal-based Angular wrapper around the cp-theming-core TypeScript API. ' +
      'Zero Angular Material dependency — it works with any Angular application. ' +
      'Fully zoneless-first, compatible with <code>provideZonelessChangeDetection()</code>.',
    bullets: [
      '<code>ThemeService</code> — <code>providedIn: root</code>, exposes <code>theme</code>, <code>mode</code>, <code>effectiveMode</code>, <code>availableThemes</code> as readonly signals',
      '<code>ThemeDirective</code> — selector <code>[theme]</code>, signal input <code>theme</code> — sets the <code>[theme]</code> attribute on host to scope a palette to a subtree',
      '<code>ThemeModeDirective</code> — selector <code>[themeMode]</code>, signal input <code>themeMode</code> — overrides the mode (light/dark/auto) for a subtree',
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
      'required in consumer projects. Also provides per-element density scopes that ' +
      'keep Angular Material components in sync with the theme density system.',
    bullets: [
      '166 <code>--mat-sys-*</code> → <code>var(--color--*)</code> mappings covering color, surface, overlays, state layers, shape, elevation, motion, and typography',
      'Unscoped <code>:root {}</code> block — CSS cascade handles nested <code>[theme]</code> elements automatically',
      'Per-element density scopes: <code>[themeDensity="-N"]</code> compacts buttons, icon buttons, form fields, lists, toolbar, tabs, chips, and steppers',
      '<code>define-ng-material-core-theme()</code> mixin for SCSS consumers',
      '<code>apply-material-overrides()</code> mixin for component-level patches',
      'Precompiled <code>material-core.css</code> and <code>material-overrides.css</code> for CSS-only consumers',
      'No <code>@angular/material/prebuilt-themes</code> needed — our mapping replaces it',
    ],
  },
};

@Component({
  selector: 'cpa-overview-page',
  standalone: true,
  template: `
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
  `,
  styles: [
    `
      @use 'page-shared';
    `,
  ],
})
export class OverviewPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly lib = () => (this.route.snapshot.parent?.params?.['lib'] as string) ?? 'core';
  readonly content = () =>
    LIB_OVERVIEW[this.lib()] ?? {
      title: this.lib(),
      subtitle: '',
      intro: '',
      bullets: [],
    };
}
