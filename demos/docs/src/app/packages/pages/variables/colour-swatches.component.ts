import { NgTemplateOutlet } from '@angular/common';
import { Component, input, signal } from '@angular/core';
import type { ColourToken, PaletteGroup } from './variables-data';

/** The token the reader clicked, with the colour it has where it is shown. */
interface Picked {
  token: ColourToken;
  value: string;
}

/**
 * The colour tokens of the CSS Variables page: one live swatch each, grouped
 * by palette and role, inside an element that carries the theme and the mode
 * the reader chose with the switch above it. The palettes are the generated
 * data (scripts/lib/variables.ts); a swatch is an element whose background is
 * `var()` of its token, so what it shows is what the token is, there.
 */
@Component({
  selector: 'cpa-colour-swatches',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <div class="var-switch">
      <label>
        Theme
        <select (change)="setTheme($event)">
          <option value="">This site's</option>
          @for (name of themes; track name) {
            <option [value]="name">{{ name }}</option>
          }
        </select>
      </label>
      <span class="var-modes" role="group" aria-label="Mode">
        @for (m of modes; track m.value) {
          <button
            type="button"
            [class.var-mode--on]="mode() === m.value"
            [attr.aria-pressed]="mode() === m.value"
            (click)="mode.set(m.value)"
          >
            {{ m.label }}
          </button>
        }
      </span>
      <span class="var-picked" aria-live="polite">
        @if (picked(); as p) {
          <code>{{ p.token.name }}</code>
          <span>{{ p.value }}</span>
          @if (p.token.contrast; as contrast) {
            <span>text on it:</span>
            <code>{{ contrast }}</code>
          }
        } @else {
          <span>No swatch chosen.</span>
        }
      </span>
    </div>

    <div class="var-stage" [attr.theme]="theme()" [attr.themeMode]="mode()">
      @for (p of palettes(); track p.name) {
        <section class="var-palette" [id]="'color-' + p.name">
          <h3>
            {{ p.name }}
            <span>
              {{
                p.generated
                  ? 'generated when a theme leaves it out'
                  : p.name === 'brand'
                    ? 'exactly as passed'
                    : 'a fixed default unless a theme passes it'
              }}
            </span>
          </h3>
          @for (r of p.roles; track r.role) {
            <div class="var-role">
              <code class="var-role-name">{{ r.base.name }}</code>
              <div class="var-tiles">
                <ng-container *ngTemplateOutlet="tile; context: { $implicit: r.base }" />
                <span class="var-gap"></span>
                @for (t of r.fixed; track t.name) {
                  <ng-container *ngTemplateOutlet="tile; context: { $implicit: t }" />
                }
                <span class="var-gap"></span>
                @for (t of r.relative; track t.name) {
                  <ng-container *ngTemplateOutlet="tile; context: { $implicit: t }" />
                }
                <span class="var-gap"></span>
                @for (t of r.inputs; track t.name) {
                  <ng-container *ngTemplateOutlet="tile; context: { $implicit: t }" />
                }
              </div>
            </div>
          }
          <div class="var-role">
            <code class="var-role-name">{{ p.focus[0].name }}, tints</code>
            <div class="var-tiles">
              @for (t of p.focus; track t.name) {
                <ng-container *ngTemplateOutlet="tile; context: { $implicit: t }" />
              }
              <span class="var-gap"></span>
              @for (t of p.tints; track t.name) {
                <ng-container *ngTemplateOutlet="tile; context: { $implicit: t }" />
              }
            </div>
          </div>
        </section>
      }
    </div>

    <ng-template #tile let-t>
      <button
        type="button"
        class="var-tile"
        [class.var-tile--on]="picked()?.token === t"
        [title]="t.name"
        (click)="pick(t, $event)"
      >
        <span class="var-swatch" [style.background]="'var(' + t.name + ')'">
          @if (t.contrast) {
            <span
              class="var-on"
              [title]="t.contrast"
              [style.background]="'var(' + t.contrast + ')'"
              [style.color]="'var(' + t.name + ')'"
              >Aa</span
            >
          }
        </span>
        <span class="var-label">{{ t.label }}</span>
      </button>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .var-switch {
        position: sticky;
        top: 0;
        z-index: 2;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px 20px;
        padding: 10px 14px;
        border: 1px solid var(--color--surface--stroke);
        border-radius: 10px 10px 0 0;
        background: var(--color--surface);
        color: var(--color--surface--contrast);
        font-size: 14px;
      }

      .var-switch select,
      .var-modes button {
        font: inherit;
        color: inherit;
        padding: 4px 10px;
        border: 1px solid var(--color--surface--stroke);
        border-radius: 6px;
        background: var(--color--background);
        cursor: pointer;
      }

      .var-modes {
        display: inline-flex;
        gap: 4px;
      }

      .var-modes .var-mode--on {
        border-color: var(--color--primary);
        background: var(--color--primary);
        color: var(--color--primary--contrast);
      }

      .var-picked {
        display: inline-flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 6px;
        font-size: 13px;
      }

      .var-stage {
        padding: 4px 14px 14px;
        border: 1px solid var(--color--surface--stroke);
        border-top: 0;
        border-radius: 0 0 10px 10px;
        background: var(--color--background);
        color: var(--color--background--contrast);
      }

      .var-palette h3 {
        margin: 18px 0 6px;
        font-size: 18px;
        font-weight: 500;
      }

      .var-palette h3 span {
        margin-left: 8px;
        font-size: 13px;
        font-weight: 400;
        opacity: 0.7;
      }

      .var-role {
        margin-bottom: 10px;
      }

      .var-role-name {
        display: inline-block;
        margin-bottom: 4px;
      }

      .var-tiles {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }

      .var-gap {
        width: 8px;
      }

      .var-tile {
        width: 58px;
        padding: 0;
        border: 0;
        background: none;
        color: inherit;
        font: inherit;
        cursor: pointer;
      }

      .var-swatch {
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        height: 40px;
        border-radius: 6px;
        outline: 1px solid var(--color--surface--stroke);
        outline-offset: -1px;
      }

      .var-tile--on .var-swatch {
        outline: 3px solid var(--color--primary--focus);
        outline-offset: 1px;
      }

      .var-on {
        margin: 4px;
        padding: 0 4px;
        border-radius: 4px;
        font-size: 10px;
        line-height: 15px;
      }

      .var-label {
        display: block;
        overflow: hidden;
        font-size: 10.5px;
        line-height: 1.5;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    `,
  ],
})
export class ColourSwatchesComponent {
  readonly palettes = input.required<PaletteGroup[]>();

  /** The themes in the stylesheets of this site. */
  protected readonly themes = themeNames();
  protected readonly modes: { value: string | null; label: string }[] = [
    { value: null, label: "This site's" },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ];

  /** The theme and the mode the swatches are shown in; null follows the site. */
  protected readonly theme = signal<string | null>(null);
  protected readonly mode = signal<string | null>(null);
  protected readonly picked = signal<Picked | null>(null);

  protected setTheme(event: Event): void {
    this.theme.set((event.target as HTMLSelectElement).value || null);
    this.picked.set(null);
  }

  protected pick(token: ColourToken, event: Event): void {
    const swatch = (event.currentTarget as HTMLElement).querySelector('.var-swatch');
    this.picked.set({
      token,
      value: swatch ? getComputedStyle(swatch).backgroundColor : '',
    });
  }
}

/** The names of the themes the page's stylesheets define, in order. */
function themeNames(): string[] {
  const names = new Set<string>();
  const walk = (rules: CSSRuleList) => {
    for (const rule of Array.from(rules)) {
      const selector = (rule as Partial<CSSStyleRule>).selectorText;
      if (typeof selector === 'string')
        for (const m of selector.matchAll(/\[theme=["']?([\w-]+)["']?\]/g)) names.add(m[1]);
      const nested = (rule as Partial<CSSGroupingRule>).cssRules;
      if (nested) walk(nested);
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      walk(sheet.cssRules);
    } catch {
      // A stylesheet from another site (the web fonts).
    }
  }
  return [...names];
}
