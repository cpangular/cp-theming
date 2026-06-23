import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDivider } from '@angular/material/divider';
import { ThemeDirective } from '@cpangular/cp-theming-ng-core';

@Component({
  selector: 'cpa-showcase-page',
  standalone: true,
  imports: [
    ThemeDirective,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDivider,
  ],
  template: `
    <article class="showcase-page">
      <header class="page-header">
        <h1>Showcase</h1>
        <p class="subtitle">{{ lib() }}</p>
      </header>

      @if (lib() === 'ng-material') {
        <!-- ─── Theme comparison grid ─────────────────────────────────────── -->
        <section class="showcase-section">
          <h2 class="section-title">Theme comparison</h2>
          <p class="section-desc">
            All four presets side-by-side. Each column scopes a different
            <code>[theme]</code> — the Material components inside inherit the correct palette
            automatically via the CSS cascade.
          </p>

          <div class="preset-grid">
            @for (preset of presets; track preset.value) {
              <div class="preset-col" [theme]="preset.value">
                <div class="preset-header">
                  <span class="preset-swatch"></span>
                  <strong>{{ preset.label }}</strong>
                </div>

                <div class="demo-group">
                  <button mat-flat-button>Filled</button>
                  <button mat-stroked-button>Outlined</button>
                  <button mat-button>Text</button>
                  <button mat-icon-button aria-label="favorite">
                    <mat-icon>favorite</mat-icon>
                  </button>
                </div>

                <mat-divider />

                <div class="demo-group column">
                  <mat-form-field appearance="fill" subscriptSizing="dynamic">
                    <mat-label>Fill variant</mat-label>
                    <input matInput placeholder="Type here…" />
                  </mat-form-field>

                  <mat-form-field appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Outline variant</mat-label>
                    <input matInput placeholder="Type here…" />
                  </mat-form-field>
                </div>

                <mat-divider />

                <div class="demo-group wrap">
                  <mat-chip-set>
                    <mat-chip>Alpha</mat-chip>
                    <mat-chip>Beta</mat-chip>
                    <mat-chip>Gamma</mat-chip>
                  </mat-chip-set>
                </div>

                <mat-divider />

                <div class="demo-group">
                  <mat-slide-toggle>Toggle</mat-slide-toggle>
                </div>
              </div>
            }
          </div>
        </section>

        <!-- ─── Density demo ──────────────────────────────────────────────── -->
        <section class="showcase-section">
          <h2 class="section-title">Density scopes</h2>
          <p class="section-desc">
            Apply <code>themeDensity="-N"</code> to any ancestor element. Angular Material component
            sizes update immediately via CSS — no Sass rebuild, no theme re-configuration.
          </p>

          <div class="density-grid">
            @for (d of densities; track d.scale) {
              <div class="density-col" [attr.themeDensity]="d.scale">
                <p class="density-label">
                  <code>themeDensity="{{ d.scale }}"</code>
                  <span>{{ d.label }}</span>
                </p>
                <div class="demo-group">
                  <button mat-flat-button>Button</button>
                  <button mat-stroked-button>Outlined</button>
                  <button mat-icon-button aria-label="star">
                    <mat-icon>star</mat-icon>
                  </button>
                </div>
                <div class="demo-group column" style="margin-top: 8px">
                  <mat-form-field appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Input</mat-label>
                    <input matInput />
                  </mat-form-field>
                </div>
                <div class="demo-group wrap" style="margin-top: 8px">
                  <mat-chip-set>
                    <mat-chip>Alpha</mat-chip>
                    <mat-chip>Beta</mat-chip>
                  </mat-chip-set>
                </div>
              </div>
            }
          </div>
        </section>

        <!-- ─── Color palette display ─────────────────────────────────────── -->
        <section class="showcase-section">
          <h2 class="section-title">Active palette swatches</h2>
          <p class="section-desc">
            Swatches resolved from the currently selected theme. Switch themes with the toolbar
            selector to see them update live.
          </p>

          <div class="swatch-row">
            @for (role of paletteRoles; track role.var) {
              <div class="swatch-item">
                <div class="swatch-color" [style.background]="'var(' + role.var + ')'"></div>
                <code class="swatch-label">{{ role.label }}</code>
              </div>
            }
          </div>
        </section>
      } @else {
        <section class="page-section">
          <p>
            The interactive showcase is available for the
            <strong>cp-theming-ng-material</strong> package. Navigate to
            <a href="../ng-material/showcase">ng-material → Showcase</a>
            to see all four theme presets, the density system, and live Angular Material components
            running under the cp-theming adapter.
          </p>
        </section>
      }
    </article>
  `,
  styles: [
    `
      @use 'page-shared';

      .showcase-page {
        max-width: 1200px;
        padding: 40px 48px 64px;
      }

      .showcase-section {
        margin-bottom: 64px;
      }

      .section-title {
        font-size: 22px;
        font-weight: 400;
        color: var(--color--primary);
        opacity: 0.85;
        margin: 0 0 8px;
      }

      .section-desc {
        font-size: 14px;
        line-height: 1.7;
        opacity: 0.7;
        max-width: 680px;
        margin: 0 0 24px;
      }

      /* Preset comparison grid */
      .preset-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        align-items: start;
      }

      .preset-col {
        border: 1px solid var(--color--surface--stroke, rgba(0, 0, 0, 0.12));
        border-radius: 12px;
        padding: 16px;
        background: var(--color--surface, #fff);
      }

      .preset-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 16px;
        font-size: 13px;
      }

      .preset-swatch {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--color--primary);
        flex-shrink: 0;
        border: 2px solid var(--color--primary--bg, rgba(0, 0, 0, 0.08));
      }

      .demo-group {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 0;
        flex-wrap: wrap;
      }

      .demo-group.column {
        flex-direction: column;
        align-items: stretch;
      }

      .demo-group.wrap {
        flex-wrap: wrap;
      }

      /* Density grid */
      .density-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
      }

      .density-col {
        border: 1px solid var(--color--surface--stroke, rgba(0, 0, 0, 0.12));
        border-radius: 12px;
        padding: 16px;
        background: var(--color--surface, #fff);
      }

      .density-label {
        margin: 0 0 12px;
        font-size: 13px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        opacity: 0.7;
      }

      /* Swatch row */
      .swatch-row {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }

      .swatch-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }

      .swatch-color {
        width: 56px;
        height: 56px;
        border-radius: 8px;
        border: 1px solid rgba(0, 0, 0, 0.1);
      }

      .swatch-label {
        font-size: 10px;
        opacity: 0.6;
        text-align: center;
        max-width: 72px;
        word-break: break-word;
      }
    `,
  ],
})
export class ShowcasePageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly lib = () => (this.route.snapshot.parent?.params?.['lib'] as string) ?? 'ng-material';

  readonly presets = [
    { value: 'azure-blue', label: 'Azure Blue' },
    { value: 'rose-red', label: 'Rose Red' },
    { value: 'cyan-orange', label: 'Cyan Orange' },
    { value: 'magenta-violet', label: 'Magenta Violet' },
  ];

  readonly densities = [
    { scale: '0', label: 'Default' },
    { scale: '-2', label: 'Compact' },
    { scale: '-4', label: 'Dense' },
  ];

  readonly paletteRoles = [
    { var: '--color--primary', label: '--color--primary' },
    { var: '--color--primary--bg', label: '--color--primary--bg' },
    { var: '--color--secondary', label: '--color--secondary' },
    { var: '--color--secondary--bg', label: '--color--secondary--bg' },
    { var: '--color--error', label: '--color--error' },
    { var: '--color--surface', label: '--color--surface' },
    { var: '--color--surface--bg', label: '--color--surface--bg' },
    { var: '--color--background', label: '--color--background' },
  ];
}
