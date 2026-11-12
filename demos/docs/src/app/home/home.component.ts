import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CHAPTERS } from '../learn/chapters';

@Component({
  selector: 'cpa-home',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIcon],
  template: `
    <div class="home-scroll">
      <!-- Hero: Learn first -->
      <section class="hero">
        <div class="hero-inner">
          <div class="hero-eyebrow">CSS-variable-based theming system</div>
          <h1 class="hero-title">cp-theming</h1>
          <p class="hero-sub">
            Give it a colour. The browser works out the rest: the shades, the text that reads on
            them, light and dark. Start with chapter 1 and see it happen.
          </p>
          <div class="hero-actions">
            <a mat-flat-button [routerLink]="'/learn/' + chapters[0].slug">Start learning</a>
            <a mat-stroked-button routerLink="/packages/core/getting-started">Install it</a>
          </div>
        </div>
      </section>

      <!-- Learn -->
      <section class="track-section">
        <h2 class="track-title">Learn</h2>
        <p class="section-intro">
          Short chapters, read in order. Each answers one question and starts with a running
          example.
        </p>
        <ol class="chapter-list">
          @for (c of chapters; track c.n) {
            <li>
              @if (c.written) {
                <a class="chapter" [routerLink]="'/learn/' + c.slug">
                  <span class="chapter-n">{{ c.n }}</span>
                  <span class="chapter-body">
                    <span class="chapter-title">{{ c.title }}</span>
                    <span class="chapter-q">{{ c.question }}</span>
                  </span>
                </a>
              } @else {
                <span class="chapter chapter--off">
                  <span class="chapter-n">{{ c.n }}</span>
                  <span class="chapter-body">
                    <span class="chapter-title">{{ c.title }}</span>
                    <span class="chapter-q">{{ c.question }} Not written yet.</span>
                  </span>
                </span>
              }
            </li>
          }
        </ol>
      </section>

      <!-- Reference -->
      <section class="track-section">
        <h2 class="track-title">Reference</h2>
        <p class="section-intro">
          Every function, variable and attribute, by package. Start with the SCSS core, add Angular
          signals support, then the Material M3 adapter when you need it.
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

      <!-- Explore -->
      <section class="track-section">
        <h2 class="track-title">Explore</h2>
        <p class="section-intro">The system at work, to look around in.</p>
        <div class="pkg-grid">
          <a class="pkg-card" routerLink="/explore/components">
            <div class="pkg-icon"><mat-icon>widgets</mat-icon></div>
            <div class="pkg-body">
              <div class="pkg-name">Components</div>
              <p class="pkg-desc">
                Every Angular Material component family, themed, in its states and under each
                palette.
              </p>
            </div>
            <mat-icon class="pkg-arrow">arrow_forward</mat-icon>
          </a>

          <a class="pkg-card" routerLink="/explore/showcase">
            <div class="pkg-icon"><mat-icon>dashboard</mat-icon></div>
            <div class="pkg-body">
              <div class="pkg-name">Showcase</div>
              <p class="pkg-desc">The four preset themes side by side, in light and dark.</p>
            </div>
            <mat-icon class="pkg-arrow">arrow_forward</mat-icon>
          </a>

          <a class="pkg-card" href="demos/demo-core/index.html" target="_blank" rel="noopener">
            <div class="pkg-icon"><mat-icon>open_in_new</mat-icon></div>
            <div class="pkg-body">
              <div class="pkg-name">Live demo: vanilla TypeScript + Vite</div>
              <p class="pkg-desc">
                <code>demos/demo-core</code> from the repository, built with this site. The three
                Angular demos, <code>demo-material</code>, <code>demo-brand-core</code> and
                <code>demo-brand-material</code>, are stubs and are not hosted yet.
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

      .hero-actions {
        display: flex;
        gap: 16px;
        justify-content: center;
        flex-wrap: wrap;
      }

      /* ── Tracks ──────────────────────────────────────────────────────────── */
      .track-section {
        padding: 48px 48px 8px;
        max-width: 900px;
        margin: 0 auto;
      }

      .track-title {
        margin: 0 0 8px;
        font-size: 26px;
        font-weight: 400;
        color: var(--color--primary);
      }

      /* ── Learn ───────────────────────────────────────────────────────────── */
      .chapter-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      @media (max-width: 760px) {
        .chapter-list {
          grid-template-columns: minmax(0, 1fr);
        }
      }

      .chapter {
        display: flex;
        gap: 14px;
        height: 100%;
        padding: 16px 18px;
        border-radius: 12px;
        border: 1px solid var(--color--surface--stroke--low);
        background: var(--color--surface--bg);
        color: inherit;
        text-decoration: none;
        transition:
          border-color 150ms,
          background 150ms;
      }

      a.chapter:hover {
        border-color: var(--color--primary--stroke);
        background: var(--color--surface--bg--high);
      }

      .chapter--off {
        opacity: 0.55;
        background: none;
      }

      .chapter-n {
        flex-shrink: 0;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        background: var(--color--primary--tint-2);
        color: var(--color--primary);
      }

      .chapter-body {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .chapter-title {
        font-size: 15px;
        font-weight: 500;
        color: var(--color--primary);
      }

      .chapter-q {
        font-size: 13.5px;
        line-height: 1.5;
        color: var(--color--surface--contrast);
      }

      .section-intro {
        font-size: 15px;
        line-height: 1.7;
        color: var(--color--surface--contrast);
        opacity: 0.75;
        margin: 0 0 24px;
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
        margin-top: 48px;
        text-align: center;
        font-size: 13px;
        opacity: 0.5;
        border-top: 1px solid var(--color--surface--stroke);
      }
    `,
  ],
})
export class HomeComponent {
  protected readonly chapters = CHAPTERS;
}
