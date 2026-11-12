import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'cpa-home',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIcon],
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
            <a mat-stroked-button href="demos/demo-core/index.html" target="_blank" rel="noopener">
              Live demo: vanilla TypeScript + Vite
            </a>
          </div>
          <p class="hero-note">
            The live demo is <code>demos/demo-core</code> from the repository, built with this site.
            The three Angular demos, <code>demo-material</code>, <code>demo-brand-core</code> and
            <code>demo-brand-material</code>, are stubs and are not hosted yet.
          </p>
        </div>
      </section>

      <!-- Packages -->
      <section class="packages-section">
        <p class="section-intro">
          cp-theming is a layered system — start with the SCSS core, add Angular signals support,
          then drop in the Material M3 adapter when you need it.
        </p>
        <div class="pkg-grid">
          <a class="pkg-card" routerLink="/packages/core">
            <div class="pkg-icon"><mat-icon>palette</mat-icon></div>
            <div class="pkg-body">
              <div class="pkg-name">cp-theming-core</div>
              <div class="pkg-tags">SCSS API · Vanilla TypeScript · Zero dependencies</div>
              <p class="pkg-desc">
                The SCSS authoring API, CSS variable system, and precompiled CSS presets. Defines
                palettes, weights, overlays, density, and typography tokens. Works in any stack — no
                framework required.
              </p>
            </div>
            <mat-icon class="pkg-arrow">arrow_forward</mat-icon>
          </a>

          <a class="pkg-card" routerLink="/packages/ng-core">
            <div class="pkg-icon"><mat-icon>electric_bolt</mat-icon></div>
            <div class="pkg-body">
              <div class="pkg-name">cp-theming-ng-core</div>
              <div class="pkg-tags">Angular 22 · Signals · Zoneless</div>
              <p class="pkg-desc">
                Signal-based <code>ThemeService</code>, structural <code>[theme]</code> directive,
                and <code>[themeMode]</code> directive. Fully zoneless — no RxJS, no
                <code>NgZone</code> required.
              </p>
            </div>
            <mat-icon class="pkg-arrow">arrow_forward</mat-icon>
          </a>

          <a class="pkg-card" routerLink="/packages/ng-material">
            <div class="pkg-icon"><mat-icon>style</mat-icon></div>
            <div class="pkg-body">
              <div class="pkg-name">cp-theming-ng-material</div>
              <div class="pkg-tags">Angular Material 22 · M3 adapter</div>
              <p class="pkg-desc">
                Maps every <code>--color--*</code> token to the corresponding
                <code>--mat-sys-*</code> token. Drop in one CSS file — all Material components
                become theme-aware with no Sass configuration.
              </p>
            </div>
            <mat-icon class="pkg-arrow">arrow_forward</mat-icon>
          </a>
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

      /* ── Hero ────────────────────────────────────────────────────────────── */
      .hero {
        padding: 80px 48px 72px;
        background: linear-gradient(
          160deg,
          var(--color--primary--bg) 0%,
          var(--color--surface) 60%
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
        color: var(--color--surface--contrast);
        margin: 0 0 40px;
      }

      .hero-note {
        font-size: 13px;
        line-height: 1.6;
        color: var(--color--surface--contrast);
        margin: 24px 0 0;
      }

      .hero-actions {
        display: flex;
        gap: 16px;
        justify-content: center;
        flex-wrap: wrap;
      }

      /* ── Packages ────────────────────────────────────────────────────────── */
      .packages-section {
        padding: 56px 48px;
        max-width: 900px;
        margin: 0 auto;
      }

      .section-intro {
        font-size: 15px;
        line-height: 1.7;
        color: var(--color--surface--contrast);
        opacity: 0.75;
        margin: 0 0 36px;
      }

      .pkg-grid {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .pkg-card {
        display: flex;
        align-items: flex-start;
        gap: 20px;
        padding: 24px;
        border-radius: 12px;
        border: 1px solid var(--color--surface--stroke--low);
        background: var(--color--surface--bg);
        color: inherit;
        text-decoration: none;
        transition:
          border-color 150ms,
          box-shadow 150ms,
          background 150ms;
        cursor: pointer;

        &:hover {
          border-color: var(--color--primary--stroke);
          background: var(--color--surface--bg--high);
          box-shadow: 0 2px 12px oklch(from var(--color--primary) l c h / 10%);

          .pkg-arrow {
            opacity: 1;
            transform: translateX(2px);
          }
        }
      }

      .pkg-icon {
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: var(--color--primary--tint-2);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color--primary);
      }

      .pkg-body {
        flex: 1;
        min-width: 0;
      }

      .pkg-name {
        font-size: 16px;
        font-weight: 500;
        color: var(--color--primary);
        margin-bottom: 2px;
      }

      .pkg-tags {
        font-size: 12px;
        color: var(--color--surface--contrast);
        opacity: 0.6;
        margin-bottom: 8px;
      }

      .pkg-desc {
        font-size: 14px;
        line-height: 1.6;
        margin: 0;
        color: var(--color--surface--contrast);
      }

      .pkg-arrow {
        flex-shrink: 0;
        opacity: 0.3;
        transition:
          opacity 150ms,
          transform 150ms;
        margin-top: 2px;
        color: var(--color--primary);
      }

      /* ── Footer ──────────────────────────────────────────────────────────── */
      .site-footer {
        padding: 24px 48px;
        text-align: center;
        font-size: 13px;
        opacity: 0.5;
        border-top: 1px solid var(--color--surface--stroke);
      }
    `,
  ],
})
export class HomeComponent {}
