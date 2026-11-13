import { Component, computed, inject } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatFormField } from '@angular/material/form-field';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { ThemeService } from '@cpangular/cp-theming-ng-core';
import { ThemeMode } from '@cpangular/cp-theming-core';

const MODE_CYCLE: ThemeMode[] = [ThemeMode.AUTO, ThemeMode.LIGHT, ThemeMode.DARK];

const MODE_META: Record<ThemeMode, { icon: string; tooltip: string }> = {
  [ThemeMode.AUTO]: { icon: 'brightness_auto', tooltip: 'Auto (follows system) — click for light' },
  [ThemeMode.LIGHT]: { icon: 'light_mode', tooltip: 'Light mode — click for dark' },
  [ThemeMode.DARK]: { icon: 'dark_mode', tooltip: 'Dark mode — click for auto' },
  [ThemeMode.INVERT]: { icon: 'brightness_auto', tooltip: 'Invert' },
};

@Component({
  selector: 'cpa-theme-switcher',
  standalone: true,
  imports: [MatSelect, MatOption, MatFormField, MatIconButton, MatIcon, MatTooltip],
  template: `
    <div class="switcher">
      <mat-form-field class="theme-select" subscriptSizing="dynamic" appearance="outline">
        <mat-select
          [value]="themeService.theme() ?? 'azure-blue'"
          (selectionChange)="setTheme($event.value)"
        >
          @for (t of themes; track t.value) {
            <mat-option [value]="t.value">{{ t.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <button mat-icon-button (click)="cycleMode()" [matTooltip]="modeMeta().tooltip">
        <mat-icon>{{ modeMeta().icon }}</mat-icon>
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
      }

      .switcher {
        display: flex;
        align-items: center;
        gap: 4px;

        /* Keep the icon button's icon in the toolbar's contrast colour */
        --mat-icon-button-icon-color: var(--color--primary--contrast);

        ::ng-deep .mat-mdc-icon-button mat-icon {
          color: var(--color--primary--contrast);
        }
      }

      .theme-select {
        width: 148px;

        --mat-form-field-container-height: 36px;
        --mat-form-field-container-vertical-padding: 6px;
        /* The field sits on the primary-coloured toolbar, where Material's own
           defaults (outline and arrow in primary when focused) would vanish. */
        --mat-select-enabled-trigger-text-color: var(--color--primary--contrast);
        --mat-select-enabled-arrow-color: var(--color--primary--contrast);
        --mat-select-focused-arrow-color: var(--color--primary--contrast);
        --mat-form-field-outlined-label-text-color: var(--color--primary--contrast);
        --mat-form-field-outlined-hover-label-text-color: var(--color--primary--contrast);
        --mat-form-field-outlined-outline-color: oklch(
          from var(--color--primary--contrast) l c h / 0.7
        );
        --mat-form-field-outlined-hover-outline-color: var(--color--primary--contrast);
        --mat-form-field-outlined-focus-outline-color: var(--color--primary--contrast);
        --mat-form-field-outlined-input-text-color: var(--color--primary--contrast);

        ::ng-deep .mat-mdc-text-field-wrapper {
          background: rgba(255, 255, 255, 0.12);
        }
      }
    `,
  ],
})
export class ThemeSwitcherComponent {
  readonly themeService = inject(ThemeService);

  readonly modeMeta = computed(() => MODE_META[this.themeService.mode()]);

  readonly themes = [
    { value: 'azure-blue', label: 'Azure Blue' },
    { value: 'rose-red', label: 'Rose Red' },
    { value: 'cyan-orange', label: 'Cyan Orange' },
    { value: 'magenta-violet', label: 'Magenta Violet' },
    // Not a preset: the example theme package, @acme/theme (src/styles.scss).
    { value: 'acme', label: 'Acme' },
  ];

  setTheme(value: string): void {
    this.themeService.setTheme(value);
  }

  cycleMode(): void {
    const current = this.themeService.mode();
    const idx = MODE_CYCLE.indexOf(current);
    const next = MODE_CYCLE[(idx + 1) % MODE_CYCLE.length];
    this.themeService.setMode(next);
  }
}
