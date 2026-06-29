import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

interface Category {
  title: string;
  route: string;
  description: string;
}

const CORE_CATEGORIES: Category[] = [
  {
    title: 'Palette',
    route: 'palette',
    description:
      'Named color palettes with runtime derivatives — dark, light, contrast, tints, and focus ring. All computed by the browser via CSS relative color syntax.',
  },
  {
    title: 'Theme',
    route: 'theme',
    description:
      'Assemble a complete theme from typed sub-configs and emit CSS variables with define-theme() and define-core-theme(). Control light/dark mode with t.light-dark().',
  },
  {
    title: 'Weights',
    route: 'weights',
    description:
      'Text opacity levels and state layer blend percentages for hover, press, focus, and drag interactions.',
  },
  {
    title: 'Typography',
    route: 'typography',
    description:
      'Font families, weights, and optional per-level size overrides for the type scale.',
  },
  {
    title: 'Density',
    route: 'density',
    description:
      'Component size compaction — scale from 0 (comfortable) to −5 (most compact), with per-subtree overrides via [themeDensity].',
  },
  {
    title: 'Shape',
    route: 'shape',
    description:
      'Corner radius scale from extra-small through fully-rounded pill shapes, mapped to component categories.',
  },
  {
    title: 'Focus',
    route: 'focus',
    description:
      'Global focus ring width, offset, and style. Ring color is per-palette via --color--name--focus — a matching-hue ring on a same-hue surface is invisible without it.',
  },
  {
    title: 'Motion',
    route: 'motion',
    description:
      'Duration and easing tokens for short, medium, long, and extra-long transitions, with four named easings.',
  },
  {
    title: 'Elevation',
    route: 'elevation',
    description:
      'Six shadow levels with configurable shadow color, automatically scaling opacity for light and dark modes.',
  },
  {
    title: 'Overlay',
    route: 'overlay',
    description: 'Scrim and shadow overlay colors for modal backdrops and elevated surfaces.',
  },
  {
    title: 'Apply Mixins',
    route: 'apply',
    description:
      'Composable SCSS mixins for palette scopes, tones, containers, filled and outlined surfaces, radius, and padding.',
  },
  {
    title: 'CSS Variables',
    route: 'variables',
    description:
      'Complete reference for all --color--, --weight--, --space--, --shape--, --motion--, --focus--, and --elevation-- CSS variables.',
  },
  {
    title: 'TypeScript API',
    route: 'typescript-api',
    description:
      'Vanilla TypeScript functions for reading and setting theme/mode, watching for changes, and persisting selections across sessions.',
  },
];

const NG_CORE_CATEGORIES: Category[] = [
  {
    title: 'ThemeService',
    route: 'api',
    description:
      'Signal-based Angular service exposing theme, mode, effectiveMode, and availableThemes as readonly signals. No RxJS, no zones required.',
  },
  {
    title: 'Directives',
    route: 'api',
    description:
      '[theme] and [themeMode] attribute directives for scoping themes and overriding light/dark mode for a DOM subtree.',
  },
];

const NG_MATERIAL_CATEGORIES: Category[] = [
  {
    title: 'Core Mappings',
    route: 'api',
    description:
      '166 --mat-sys-* → var(--color--*) token mappings that wire all Angular Material M3 component tokens to cp-theming palettes.',
  },
  {
    title: 'Adaptor',
    route: 'api',
    description:
      'adaptor() hook for t.define-theme() — automatically emits [palette="name"] override rules so Material components respond to the palette attribute.',
  },
  {
    title: 'Material Density',
    route: 'api',
    description:
      'Per-element density size control: [themeDensity="-N"] rules compact buttons, inputs, lists, toolbar, tabs, chips, and steppers independently.',
  },
];

const LIB_META: Record<
  string,
  { title: string; subtitle: string; intro: string; categories: Category[] }
> = {
  core: {
    title: '@cpangular/cp-theming-core',
    subtitle: 'SCSS API · CSS variable system · Vanilla TypeScript',
    intro:
      'The foundation of the cp-theming system. Defines the full SCSS authoring API, a runtime CSS variable system in oklch, a vanilla TypeScript API for controlling theme and mode, and precompiled CSS presets for zero-config usage.',
    categories: CORE_CATEGORIES,
  },
  'ng-core': {
    title: '@cpangular/cp-theming-ng-core',
    subtitle: 'Angular 22 · Signals · Zoneless-first',
    intro:
      'Signal-based Angular wrapper around the cp-theming-core TypeScript API. Zero Angular Material dependency — works with any Angular application.',
    categories: NG_CORE_CATEGORIES,
  },
  'ng-material': {
    title: '@cpangular/cp-theming-ng-material',
    subtitle: 'Angular Material 22 · M3 adapter',
    intro:
      'SCSS adapter mapping the cp-theming CSS variable system to Angular Material 22 system tokens. Ships precompiled CSS — no Sass setup required in consumer projects.',
    categories: NG_MATERIAL_CATEGORIES,
  },
};

@Component({
  selector: 'cpa-categories-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="doc-page">
      <header class="page-header">
        <h1>{{ meta().title }}</h1>
        <p class="subtitle">{{ meta().subtitle }}</p>
      </header>

      <section class="page-section">
        <p class="categories-intro">{{ meta().intro }}</p>
        <div class="categories-grid">
          @for (cat of meta().categories; track cat.route + cat.title) {
            <a class="category-card" [routerLink]="cat.route">
              <span class="category-name">{{ cat.title }}</span>
              <span class="category-desc">{{ cat.description }}</span>
            </a>
          }
        </div>
      </section>
    </article>
  `,
  styles: [
    `
      @use 'page-shared';

      .categories-intro {
        margin-bottom: 32px;
        font-size: 15px;
        line-height: 1.7;
        max-width: 720px;
      }

      .categories-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
      }

      .category-card {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 20px 24px;
        border: 1px solid var(--color--surface--stroke);
        border-radius: var(--shape--sm, 8px);
        text-decoration: none;
        color: inherit;
        transition:
          background-color 150ms,
          border-color 150ms;

        &:hover {
          background-color: color-mix(in oklch, var(--color--primary) 6%, transparent);
          border-color: var(--color--primary);
        }
      }

      .category-name {
        font-size: 15px;
        font-weight: 600;
        color: var(--color--primary);
      }

      .category-desc {
        font-size: 13px;
        line-height: 1.55;
        opacity: 0.75;
      }
    `,
  ],
})
export class CategoriesPageComponent {
  private readonly _parentParams = toSignal(inject(ActivatedRoute).parent!.params);
  readonly lib = computed(() => (this._parentParams()?.['lib'] as string) ?? 'core');
  readonly meta = computed(() => LIB_META[this.lib()] ?? LIB_META['core']);
}
