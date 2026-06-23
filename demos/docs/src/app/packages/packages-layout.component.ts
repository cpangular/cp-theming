import { Component, computed, input } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';

const LIB_TITLES: Record<string, string> = {
  core: '@cpangular/cp-theming-core',
  'ng-core': '@cpangular/cp-theming-ng-core',
  'ng-material': '@cpangular/cp-theming-ng-material',
};

@Component({
  selector: 'cpa-packages-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, MatSidenavModule, MatListModule],
  template: `
    <mat-sidenav-container class="layout-container">
      <mat-sidenav class="sidenav" mode="side" opened>
        <span class="pkg-label">{{ libTitle() }}</span>
        <mat-nav-list>
          @for (item of nav; track item.path) {
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
        <div class="page-scroll">
          <router-outlet />
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

      .page-scroll {
        height: 100%;
        overflow-y: auto;
        padding: 40px 48px 64px;
      }
    `,
  ],
})
export class PackagesLayoutComponent {
  // withComponentInputBinding() in appConfig binds the :lib route param here
  readonly lib = input<string>('core');
  readonly libTitle = computed(() => LIB_TITLES[this.lib()] ?? this.lib());

  readonly nav = [
    { path: 'overview', label: 'Overview' },
    { path: 'getting-started', label: 'Getting Started' },
    { path: 'api', label: 'API Reference' },
    { path: 'guides', label: 'Guides' },
    { path: 'showcase', label: 'Showcase' },
  ];
}
