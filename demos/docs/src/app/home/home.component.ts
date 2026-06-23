import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'cpa-home',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIcon],
  template: `
    <div class="home-scroll">
      <!-- Hero -->
      <section class="hero">
        <div class="hero-inner">
          <div class="hero-eyebrow">CSS-variable-based theming system</div>
          <h1 class="hero-title">cp-theming</h1>
          <p class="hero-sub">
            Runtime color derivatives. Single SCSS import. Angular Material M3 adapter. Showcase
            what you build — this site runs on the same system.
          </p>
          <div class="hero-actions">
            <a mat-flat-button routerLink="/packages/core/getting-started">Get started</a>
            <a mat-stroked-button routerLink="/packages/ng-material/showcase">View showcase</a>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="section features-section">
        <h2 class="section-title">Design principles</h2>
        <div class="card-grid">
          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar>palette</mat-icon>
              <mat-card-title>Runtime derivatives</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              All color variants — dark, light, contrast, tints — computed by the browser via CSS
              relative color (<code>oklch(from var(--x) l c h)</code>). No Sass color math. No
              pre-generated palettes.
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar>code</mat-icon>
              <mat-card-title>Single import</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              Everything in one line:
              <code>@use '@cpangular/cp-theming-core/scss/theme' as t;</code>
              Typed sub-configs, composable mixins, and a full CSS variable system.
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar>extension</mat-icon>
              <mat-card-title>Framework-agnostic core</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              The core package has zero Angular dependency. Angular integration is an optional
              adapter layer — add it only when you need it.
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar>swap_horiz</mat-icon>
              <mat-card-title>Nested theme scopes</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              Place <code>[theme]="'rose-red'"</code> on any element to scope a different palette to
              that subtree — including inside Angular Material components. Fully cascade-native.
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar>style</mat-icon>
              <mat-card-title>Material M3 adapter</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              One CSS file — 166 <code>--mat-sys-*</code> mappings — makes every Angular Material 22
              component theme-aware automatically. No Sass theme configuration required.
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar>tune</mat-icon>
              <mat-card-title>Per-element density</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              Apply <code>themeDensity="-2"</code> to any ancestor to compact all Material
              components in that subtree — buttons, form fields, tabs, chips, lists, toolbar. No
              SCSS rebuild.
            </mat-card-content>
          </mat-card>
        </div>
      </section>

      <!-- Packages -->
      <section class="section packages-section">
        <h2 class="section-title">Packages</h2>
        <div class="pkg-grid">
          <mat-card class="pkg-card">
            <mat-card-header>
              <mat-card-title>cp-theming-core</mat-card-title>
              <mat-card-subtitle>SCSS API · Vanilla TypeScript</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              The SCSS authoring API, CSS variable system, TypeScript theme/mode API, and
              precompiled CSS presets. Zero framework dependency.
            </mat-card-content>
            <mat-card-actions>
              <a mat-button routerLink="/packages/core">Explore →</a>
            </mat-card-actions>
          </mat-card>

          <mat-card class="pkg-card">
            <mat-card-header>
              <mat-card-title>cp-theming-ng-core</mat-card-title>
              <mat-card-subtitle>Angular 22 · Signals · Zoneless</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <code>ThemeService</code> (signals),
              <code>ThemeDirective</code> (<code>[theme]</code>), and
              <code>ThemeModeDirective</code>
              (<code>[themeMode]</code>) — all zoneless-ready.
            </mat-card-content>
            <mat-card-actions>
              <a mat-button routerLink="/packages/ng-core">Explore →</a>
            </mat-card-actions>
          </mat-card>

          <mat-card class="pkg-card">
            <mat-card-header>
              <mat-card-title>cp-theming-ng-material</mat-card-title>
              <mat-card-subtitle>Angular Material 22 · M3 adapter</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              SCSS adapter mapping <code>--color--*</code> → <code>--mat-sys-*</code> tokens. Ships
              precompiled CSS — no Sass setup needed in consumer projects.
            </mat-card-content>
            <mat-card-actions>
              <a mat-button routerLink="/packages/ng-material">Explore →</a>
            </mat-card-actions>
          </mat-card>
        </div>
      </section>

      <footer class="site-footer">
        <p>
          MIT License ·
          <a href="https://github.com/cpangular/cp-theming" target="_blank" rel="noopener">
            GitHub
          </a>
        </p>
      </footer>
    </div>
  `,
  styles: [
    `
      .home-scroll {
        height: 100%;
        overflow-y: auto;
      }

      /* Hero */
      .hero {
        padding: 80px 48px 72px;
        background: linear-gradient(
          160deg,
          var(--color--primary--bg, oklch(0.96 0.02 250)) 0%,
          var(--color--surface, oklch(0.98 0.005 250)) 60%
        );
        text-align: center;
      }

      .hero-inner {
        max-width: 680px;
        margin: 0 auto;
      }

      .hero-eyebrow {
        font-size: 13px;
        font-weight: 500;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--color--primary);
        margin-bottom: 12px;
      }

      .hero-title {
        font-size: 60px;
        font-weight: 300;
        margin: 0 0 20px;
        color: var(--color--primary);
        letter-spacing: -0.02em;
      }

      .hero-sub {
        font-size: 17px;
        line-height: 1.7;
        color: var(--color--surface--contrast, rgba(0, 0, 0, 0.7));
        margin: 0 0 40px;
      }

      .hero-actions {
        display: flex;
        gap: 16px;
        justify-content: center;
        flex-wrap: wrap;
      }

      /* Generic section */
      .section {
        padding: 56px 48px;
      }

      .section-title {
        font-size: 28px;
        font-weight: 400;
        margin: 0 0 32px;
        color: var(--color--primary);
      }

      /* Feature cards */
      .card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
      }

      /* Package cards */
      .packages-section {
        background: var(--color--surface--bg, rgba(0, 0, 0, 0.03));
      }

      .pkg-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 24px;
      }

      .pkg-card mat-card-content {
        margin-top: 8px;
      }

      /* Footer */
      .site-footer {
        padding: 24px 48px;
        text-align: center;
        font-size: 13px;
        opacity: 0.5;
        border-top: 1px solid var(--color--surface--stroke, rgba(0, 0, 0, 0.1));
      }
    `,
  ],
})
export class HomeComponent {}
