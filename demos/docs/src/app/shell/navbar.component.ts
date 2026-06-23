import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { ThemeSwitcherComponent } from './theme-switcher.component';

@Component({
  selector: 'cpa-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatToolbar, ThemeSwitcherComponent],
  template: `
    <mat-toolbar class="navbar">
      <a class="logo" routerLink="/">
        <span class="logo-mark">◆</span>
        <span class="logo-name">cp-theming</span>
      </a>

      <nav class="main-nav">
        <a
          class="nav-link"
          routerLink="/packages/core"
          routerLinkActive="nav-active"
          [routerLinkActiveOptions]="{
            paths: 'subset',
            queryParams: 'ignored',
            fragment: 'ignored',
            matrixParams: 'ignored',
          }"
        >
          cp-theming-core
        </a>
        <a
          class="nav-link"
          routerLink="/packages/ng-core"
          routerLinkActive="nav-active"
          [routerLinkActiveOptions]="{
            paths: 'subset',
            queryParams: 'ignored',
            fragment: 'ignored',
            matrixParams: 'ignored',
          }"
        >
          cp-theming-ng-core
        </a>
        <a
          class="nav-link"
          routerLink="/packages/ng-material"
          routerLinkActive="nav-active"
          [routerLinkActiveOptions]="{
            paths: 'subset',
            queryParams: 'ignored',
            fragment: 'ignored',
            matrixParams: 'ignored',
          }"
        >
          cp-theming-ng-material
        </a>
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
        font-size: 13px;
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
export class NavbarComponent {}
