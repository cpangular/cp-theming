import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { MatToolbar } from '@angular/material/toolbar';
import { ThemeSwitcherComponent } from './theme-switcher.component';

@Component({
  selector: 'cpa-navbar',
  standalone: true,
  imports: [RouterLink, MatToolbar, ThemeSwitcherComponent],
  template: `
    <mat-toolbar class="navbar">
      <a class="logo" routerLink="/">
        <span class="logo-mark">◆</span>
        <span class="logo-name">cp-theming</span>
      </a>

      <nav class="main-nav">
        @for (t of tracks; track t.path) {
          <a class="nav-link" [routerLink]="t.link" [class.nav-active]="track() === t.path">
            {{ t.label }}
          </a>
        }
      </nav>

      <span class="spacer"></span>
      <cpa-theme-switcher />
    </mat-toolbar>
  `,
  styles: [
    `
      :host {
        display: block;
        position: sticky;
        top: 0;
        z-index: 100;
      }

      .navbar {
        background: var(--color--primary);
        color: var(--color--primary--contrast);
        gap: 0;
        padding: 0 16px;
      }

      .logo {
        display: flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
        color: inherit;
        margin-right: 24px;
        font-size: 18px;
        font-weight: 500;
        opacity: 1;
        white-space: nowrap;
      }

      .logo-mark {
        font-size: 14px;
        opacity: 0.8;
      }

      .main-nav {
        display: flex;
        gap: 4px;
      }

      .nav-link {
        color: inherit;
        text-decoration: none;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 500;
        opacity: 0.75;
        transition:
          opacity 150ms,
          background 150ms;
        white-space: nowrap;
      }

      .nav-link:hover {
        opacity: 1;
        background: rgba(255, 255, 255, 0.12);
      }

      .nav-link.nav-active {
        opacity: 1;
        background: rgba(255, 255, 255, 0.18);
      }

      .spacer {
        flex: 1;
      }
    `,
  ],
})
export class NavbarComponent {
  // The three tracks (PORT-PLAN.md, Phase 17). `path` is the first segment of
  // the track's URLs; the Reference keeps its /packages/… addresses.
  protected readonly tracks = [
    { path: 'learn', label: 'Learn', link: '/learn' },
    { path: 'packages', label: 'Reference', link: '/packages/core' },
    { path: 'explore', label: 'Explore', link: '/explore' },
  ];

  private readonly router = inject(Router);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  protected readonly track = computed(() => this.url().split(/[/?#]/)[1] ?? '');
}
