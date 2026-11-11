import {
  Component,
  computed,
  input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  afterNextRender,
  inject,
  DestroyRef,
} from '@angular/core';
import { NavigationEnd, RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { TableOfContentsComponent } from '../shell/table-of-contents.component';

import hljs from 'highlight.js/lib/core';
import scss from 'highlight.js/lib/languages/scss';
import css from 'highlight.js/lib/languages/css';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';

hljs.registerLanguage('scss', scss);
hljs.registerLanguage('css', css);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('json', json);

const LIB_TITLES: Record<string, string> = {
  core: '@cpangular/cp-theming-core',
  'ng-core': '@cpangular/cp-theming-ng-core',
  'ng-material': '@cpangular/cp-theming-ng-material',
};

interface NavItem {
  path: string;
  label: string;
  section?: string;
}

const CORE_NAV: NavItem[] = [
  { path: 'getting-started', label: 'Getting Started' },
  { path: 'palette', label: 'Palette', section: 'SCSS API' },
  { path: 'theme', label: 'Theme' },
  { path: 'weights', label: 'Weights' },
  { path: 'typography', label: 'Typography' },
  { path: 'density', label: 'Density' },
  { path: 'shape', label: 'Shape' },
  { path: 'focus', label: 'Focus' },
  { path: 'motion', label: 'Motion' },
  { path: 'elevation', label: 'Elevation' },
  { path: 'overlay', label: 'Overlay' },
  { path: 'apply-palette', label: 'Palette Scopes', section: 'Theming' },
  { path: 'apply-surfaces', label: 'Surface Types' },
  { path: 'apply-borders', label: 'Borders' },
  { path: 'apply-geometry', label: 'Geometry' },
  { path: 'apply-tones', label: 'Tones' },
  { path: 'variables', label: 'CSS Variables', section: 'Reference' },
  { path: 'typescript-api', label: 'TypeScript API' },
];

const FLAT_NAV: NavItem[] = [
  { path: 'categories', label: 'Overview' },
  { path: 'getting-started', label: 'Getting Started' },
  { path: 'api', label: 'API Reference' },
  { path: 'guides', label: 'Guides' },
];

// ng-material has its own list: the Components and Showcase pages have content
// for it only.
const NG_MATERIAL_NAV: NavItem[] = [
  { path: 'categories', label: 'Overview' },
  { path: 'getting-started', label: 'Getting Started' },
  { path: 'api', label: 'API Reference' },
  { path: 'guides', label: 'Guides' },
  { path: 'components', label: 'Components' },
  { path: 'showcase', label: 'Showcase' },
];

const LIB_NAV: Record<string, NavItem[]> = {
  core: CORE_NAV,
  'ng-core': FLAT_NAV,
  'ng-material': NG_MATERIAL_NAV,
};

@Component({
  selector: 'cpa-packages-layout',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatSidenavModule,
    MatListModule,
    TableOfContentsComponent,
  ],
  template: `
    <mat-sidenav-container class="layout-container">
      <mat-sidenav class="sidenav" mode="side" opened>
        <span class="pkg-label">{{ libTitle() }}</span>
        <mat-nav-list>
          @for (item of nav(); track item.path) {
            @if (item.section) {
              <div class="nav-section-header">{{ item.section }}</div>
            }
            <a
              mat-list-item
              [routerLink]="item.path"
              routerLinkActive="nav-active"
              [routerLinkActiveOptions]="{ exact: true }"
            >
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <div #pageScroll class="page-scroll">
          <div class="page-main">
            <router-outlet />
          </div>
          <aside class="toc-rail">
            <cpa-toc [scrollEl]="pageScrollEl" />
          </aside>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      :host {
        flex: 1;
        display: flex;
        overflow: hidden;
      }

      .layout-container {
        flex: 1;
      }

      .sidenav {
        width: 248px;
        padding-top: 8px;
        border-right: 1px solid var(--color--surface--stroke);
      }

      .pkg-label {
        display: block;
        padding: 20px 16px 6px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--color--primary);
        opacity: 0.7;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .nav-section-header {
        display: block;
        padding: 16px 16px 4px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        opacity: 0.45;
      }

      .page-scroll {
        height: 100%;
        overflow-y: auto;
        display: flex;
        align-items: flex-start;
      }

      .page-main {
        flex: 1;
        min-width: 0;
        padding: 40px 48px 64px;
      }

      .toc-rail {
        width: 220px;
        flex-shrink: 0;
        position: sticky;
        top: 0;
        align-self: flex-start;
        padding: 40px 24px 0 0;
        max-height: 100vh;
        overflow-y: auto;
      }
    `,
  ],
})
export class PackagesLayoutComponent implements AfterViewInit {
  readonly lib = input<string>('core');
  readonly libTitle = computed(() => LIB_TITLES[this.lib()] ?? this.lib());
  readonly nav = computed(() => LIB_NAV[this.lib()] ?? FLAT_NAV);

  @ViewChild('pageScroll') private readonly _pageScrollRef!: ElementRef<HTMLElement>;
  pageScrollEl: HTMLElement | null = null;

  constructor() {
    const router = inject(Router);
    const destroyRef = inject(DestroyRef);
    const highlightCode = () =>
      document
        .querySelectorAll('pre code:not(.hljs)')
        .forEach((el) => hljs.highlightElement(el as HTMLElement));
    afterNextRender(highlightCode);
    router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe(() => setTimeout(highlightCode, 0));
  }

  ngAfterViewInit(): void {
    this.pageScrollEl = this._pageScrollRef.nativeElement;
  }
}
