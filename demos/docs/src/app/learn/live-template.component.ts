import { NgComponentOutlet } from '@angular/common';
import { Component, Type, ViewEncapsulation, computed, input, signal } from '@angular/core';
import { LIVE_STYLES } from './live-example.component';
import { RoleLine, rolesOf } from './material-roles';

/** One file shown beside the example. */
export interface LiveSource {
  name: string;
  code: string;
}

/** One example the block can show, and how its tab reads. */
export interface LivePanel {
  label: string;
  /** The component whose `templateUrl` is the first file. */
  component: Type<unknown>;
  /** The text of the files it is built from, the template first. */
  files: LiveSource[];
}

/** What the reader is pointing at, and where its colours come from. */
interface Probe {
  name: string;
  lines: RoleLine[];
}

const LANG: Record<string, string> = { scss: 'scss', html: 'html', css: 'css', ts: 'typescript' };

/**
 * A live example that Angular renders in the page, with its source beside it:
 * the Learn track's block for Angular Material (chapter 10), whose components
 * cannot run in a plain HTML frame. Each panel is a component whose template
 * is an example file (`.ng.html`), as on the Components gallery, so the text
 * shown is what runs. It looks like `cpa-live-example` and shares its styles.
 *
 * With `roles`, pointing at a button (or focusing it) shows which `--mat-sys-*`
 * variable paints its fill and its text and which cp-theming variable that one
 * is declared from. Both are read from the stylesheets on the page
 * (material-roles.ts); nothing is listed here.
 */
@Component({
  selector: 'cpa-live-template',
  standalone: true,
  imports: [NgComponentOutlet],
  encapsulation: ViewEncapsulation.None,
  template: `
    <figure class="live live--template">
      @if (panels().length > 1) {
        <div class="live-tabs" role="tablist">
          @for (p of panels(); track p.label) {
            <button
              type="button"
              role="tab"
              class="live-tab"
              [class.live-tab--active]="active() === p"
              [attr.aria-selected]="active() === p"
              (click)="select(p)"
            >
              {{ p.label }}
            </button>
          }
        </div>
      }

      <div class="live-body">
        <div class="live-stage">
          <div class="live-render" (pointerover)="probe($event)" (focusin)="probe($event)">
            <ng-container *ngComponentOutlet="active().component" />
          </div>
          @if (roles()) {
            <div class="live-roles" aria-live="polite">
              @if (probed(); as p) {
                <p class="live-roles-name">{{ p.name }}</p>
                @for (line of p.lines; track line.part) {
                  <p class="live-role" [title]="line.role + ': ' + line.declaration">
                    <span class="live-role-part">{{ line.part }}</span>
                    <code>{{ line.role }}</code>
                    <span class="live-role-from">from</span>
                    @for (token of line.tokens; track token) {
                      <code>{{ token }}</code>
                    } @empty {
                      <code>{{ line.declaration }}</code>
                    }
                    <span class="live-role-scope">in {{ line.scope }}</span>
                    @if (line.patch; as patch) {
                      <span class="live-role-scope" [title]="patch">adjusted by a patch</span>
                    }
                  </p>
                } @empty {
                  <p class="live-role">Nothing here is painted through a Material variable.</p>
                }
              } @else {
                <p class="live-roles-name">Point at a button, or move to one with the Tab key.</p>
              }
            </div>
          }
        </div>

        <div class="live-source">
          <div class="live-files">
            @for (f of active().files; track f.name) {
              <button
                type="button"
                class="live-file"
                [class.live-file--active]="file() === f.name"
                (click)="selectFile(f.name)"
              >
                {{ f.name }}
              </button>
            }
          </div>
          <!-- Every panel stays in the DOM, so highlight.js sees each one once. -->
          @for (f of sources(); track f.name) {
            <pre
              class="live-pre"
              [class.live-pre--hidden]="file() !== f.name"
            ><code [class]="'language-' + lang(f.name)" [textContent]="f.code.trimEnd()"></code></pre>
          }
        </div>
      </div>
    </figure>
  `,
  styles: [
    LIVE_STYLES,
    `
      /* A rendered example is as wide as the block; its source goes under it. */
      .live--template .live-body {
        grid-template-columns: minmax(0, 1fr);
      }

      .live--template .live-source {
        border-left: 0;
        border-top: 1px solid var(--color--surface--stroke, rgba(0, 0, 0, 0.1));
      }

      .live-render {
        flex: 1 0 auto;
        padding: 16px;
      }

      .live-roles {
        min-height: 104px;
        padding: 10px 16px 12px;
        border-top: 1px solid var(--color--surface--stroke, rgba(0, 0, 0, 0.1));
        font-size: 13.5px;
      }

      .live-roles p {
        max-width: none;
        margin: 0;
        font-size: inherit;
        line-height: 1.5;
      }

      .live-roles .live-roles-name {
        min-height: 24px;
        font-weight: 500;
      }

      .live-roles .live-role {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 4px 8px;
        margin-top: 6px;
      }

      .live-role-part {
        flex: 0 0 34px;
        font-weight: 500;
      }

      .live-role-from,
      .live-role-scope {
        opacity: 0.7;
      }
    `,
  ],
})
export class LiveTemplateComponent {
  /** The examples to show; more than one gives tabs. */
  readonly panels = input.required<LivePanel[]>();
  /** Show where a button's colours come from while the reader points at it. */
  readonly roles = input(false);

  private readonly _panel = signal<LivePanel | null>(null);
  private readonly _file = signal<string | null>(null);
  private readonly _probed = signal<Probe | null>(null);

  protected readonly active = computed(() => {
    const chosen = this._panel();
    return chosen && this.panels().includes(chosen) ? chosen : this.panels()[0];
  });

  /** Every file of every panel, once. */
  protected readonly sources = computed(() => {
    const seen = new Map<string, LiveSource>();
    for (const panel of this.panels()) for (const f of panel.files) seen.set(f.name, f);
    return [...seen.values()];
  });

  protected readonly file = computed(() => {
    const names = this.active().files.map((f) => f.name);
    const chosen = this._file();
    return chosen && names.includes(chosen) ? chosen : names[0];
  });

  protected readonly probed = this._probed.asReadonly();

  protected lang(name: string): string {
    return LANG[name.split('.').pop() ?? ''] ?? 'html';
  }

  protected select(panel: LivePanel): void {
    this._panel.set(panel);
    this._file.set(null);
    this._probed.set(null);
  }

  protected selectFile(name: string): void {
    this._file.set(name);
  }

  /** The button under the pointer or with the focus, and its colours' origin. */
  protected probe(event: Event): void {
    if (!this.roles()) return;
    const target = event.target as Element | null;
    // A toggle paints itself, not the <button> inside it.
    const el = target?.closest('.mat-button-toggle') ?? target?.closest('button');
    if (!el) return;
    const label = el.getAttribute('aria-label') ?? el.textContent?.replace(/\s+/g, ' ').trim();
    // The nearest scope that names a palette for components, or the theme.
    const scope = el.closest('[palette]:not([theme]), [theme]');
    const where = scope?.hasAttribute('theme')
      ? `theme="${scope.getAttribute('theme')}"`
      : `palette="${scope?.getAttribute('palette')}"`;
    this._probed.set({ name: `“${label}”, under ${where}`, lines: rolesOf(el) });
  }
}
