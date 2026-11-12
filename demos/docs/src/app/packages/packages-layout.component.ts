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
import { CHAPTERS } from '../learn/chapters';

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

// The layout of all three tracks: `lib` is a package of the Reference
// (/packages/:lib), `learn` or `explore`.
const LIB_TITLES: Record<string, string> = {
  learn: 'Learn',
  explore: 'Explore',
  core: '@cpangular/cp-theming-core',
  'ng-core': '@cpangular/cp-theming-ng-core',
  'ng-material': '@cpangular/cp-theming-ng-material',
};

interface NavItem {
  path: string;
  label: string;
  section?: string;
  /** Listed, not linked: a Learn chapter that is not written yet. */
  disabled?: boolean;
}

// The Reference is three packages; the sidebar switches between them.
const PACKAGES: { lib: string; label: string }[] = [
  { lib: 'core', label: 'core' },
  { lib: 'ng-core', label: 'ng-core' },
  { lib: 'ng-material', label: 'ng-material' },
];

const LEARN_NAV: NavItem[] = [
  { path: './', label: 'Start here' },
  ...CHAPTERS.map((c, i) => ({
    path: c.slug,
    label: `${c.n}. ${c.title}`,
    disabled: !c.written,
    ...(i === 0 ? { section: 'Chapters' } : {}),
  })),
];

const EXPLORE_NAV: NavItem[] = [
  { path: 'components', label: 'Components' },
  { path: 'showcase', label: 'Showcase' },
];

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

// The Components gallery and the Showcase are the Explore track; their routes
// under /packages/ng-material stay, unlisted.
const LIB_NAV: Record<string, NavItem[]> = {
  learn: LEARN_NAV,
  explore: EXPLORE_NAV,
  core: CORE_NAV,
  'ng-core': FLAT_NAV,
  'ng-material': FLAT_NAV,
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
      <mat-sidenav class="sidenav" [class.sidenav--wide]="lib() === 'learn'" mode="side" opened>
        @if (isPackage()) {
          <div class="pkg-switch">
            @for (p of packages; track p.lib) {
              <a
                class="pkg-switch-link"
                [class.pkg-switch-link--active]="p.lib === lib()"
                [routerLink]="'/packages/' + p.lib"
                >{{ p.label }}</a
              >
            }
          </div>
        }
        <span class="pkg-label">{{ libTitle() }}</span>
        <mat-nav-list>
          @for (item of nav(); track item.path) {
            @if (item.section) {
              <div class="nav-section-header">{{ item.section }}</div>
            }
            @if (item.disabled) {
              <mat-list-item class="nav-disabled" disabled>
                <span matListItemTitle>{{ item.label }}</span>
              </mat-list-item>
            } @else {
              <a
                mat-list-item
                [routerLink]="item.path"
                routerLinkActive="nav-active"
                [routerLinkActiveOptions]="{ exact: true }"
              >
                <span matListItemTitle>{{ item.label }}</span>
              </a>
            }
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <div #pageScroll class="page-scroll" (click)="onPageClick($event)">
          <div class="page-main">
            <router-outlet />
          </div>
          @if (lib() !== 'learn') {
            <aside class="toc-rail">
              <cpa-toc [scrollEl]="pageScrollEl" />
            </aside>
          }
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

      /* Learn: room for a chapter title on one line. */
      .sidenav--wide {
        width: 320px;
      }

      .pkg-switch {
        display: flex;
        gap: 4px;
        margin: 12px 12px 0;
        padding: 3px;
        border-radius: 10px;
        background: var(--color--surface--bg);
      }

      .pkg-switch-link {
        flex: 1;
        padding: 5px 0;
        border-radius: 7px;
        text-align: center;
        text-decoration: none;
        font-size: 12px;
        font-weight: 500;
        color: var(--color--background--contrast);
        opacity: 0.7;
      }

      .pkg-switch-link--active {
        opacity: 1;
        color: var(--color--primary--contrast);
        background: var(--color--primary);
      }

      .nav-disabled {
        opacity: 0.45;
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
  readonly packages = PACKAGES;
  readonly isPackage = computed(() => PACKAGES.some((p) => p.lib === this.lib()));

  @ViewChild('pageScroll') private readonly _pageScrollRef!: ElementRef<HTMLElement>;
  pageScrollEl: HTMLElement | null = null;

  private readonly _router = inject(Router);

  constructor() {
    const router = this._router;
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
      .subscribe(() => {
        setTimeout(highlightCode, 0);
        setTimeout(() => this._scrollToFragment(router.parseUrl(router.url).fragment), 50);
      });
  }

  ngAfterViewInit(): void {
    this.pageScrollEl = this._pageScrollRef.nativeElement;
  }

  /**
   * Keeps `href="#section"` on this page. The site has a `<base href>`, and a
   * fragment-only link resolves against it: without this the browser would
   * load the site root with that fragment.
   */
  onPageClick(event: MouseEvent): void {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element | null)?.closest?.('a[href^="#"]');
    const fragment = link?.getAttribute('href')?.slice(1);
    if (!link || !fragment) return;
    event.preventDefault();
    void this._router.navigate([], { fragment, queryParamsHandling: 'preserve' });
    this._scrollToFragment(fragment);
  }

  /** Scrolls the page container (not the window) to the section the URL fragment names. */
  private _scrollToFragment(fragment: string | null): void {
    const container = this.pageScrollEl;
    if (!fragment || !container) return;
    const el = document.getElementById(fragment);
    if (!el) return;
    const top = el.getBoundingClientRect().top - container.getBoundingClientRect().top;
    container.scrollBy({ top: top - 24, behavior: 'smooth' });
  }
}
