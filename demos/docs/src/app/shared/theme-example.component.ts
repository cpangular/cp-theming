import {
  AfterContentInit,
  Component,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
  computed,
  input,
  signal,
} from '@angular/core';

interface FileTab {
  id: string;
  label: string;
  lang: string;
  code: string;
}

interface Method {
  id: 'attrs' | 'scss';
  label: string;
  files: FileTab[];
}

/**
 * Reusable example block for theming docs pages.
 *
 * Layout (matches material.angular.dev style):
 *   [Method tabs]          - e.g. "Attributes" | "SCSS" (only shown if >1 method)
 *   {live example}         - the rendered demo (shared [demo] slot)
 *   [File tabs]            - e.g. "HTML" | "SCSS" (only shown if the method has >1 file)
 *   {code for active file}
 *
 * All code panels are in the DOM so highlight.js processes them on the first pass.
 * Tab switching is CSS-only (display: none on inactive panels).
 */
@Component({
  selector: 'cpa-theme-example',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="tex-wrap">
      @if (title()) {
        <h3 class="tex-title">{{ title() }}</h3>
      }

      <!-- Method tabs -->
      @if (methods().length > 1) {
        <div class="tex-method-tabs">
          @for (m of methods(); track m.id) {
            <button
              class="tex-method-tab"
              [class.tex-method-tab--active]="method() === m.id"
              (click)="selectMethod(m.id)"
            >
              {{ m.label }}
            </button>
          }
        </div>
      }

      <!-- Live example -->
      <div class="tex-preview" #preview [class.tex-preview--empty]="!hasDemo()">
        <ng-content select="[demo]"></ng-content>
      </div>

      <!-- Code: file sub-tabs + panels -->
      <div class="tex-impl">
        @if (currentFiles().length > 1) {
          <div class="tex-file-tabs">
            @for (f of currentFiles(); track f.id) {
              <button
                class="tex-file-tab"
                [class.tex-file-tab--active]="activeFile() === f.id"
                (click)="selectFile(f.id)"
              >
                {{ f.label }}
              </button>
            }
          </div>
        }
        @for (f of allFiles(); track f.id) {
          <pre
            class="tex-pre"
            [class.tex-pre--hidden]="activeFile() !== f.id"
          ><code [class]="'language-' + f.lang" [textContent]="f.code"></code></pre>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .tex-wrap {
        border: 1px solid var(--color--surface--stroke, rgba(0, 0, 0, 0.12));
        border-radius: 12px;
        overflow: hidden;
        margin: 16px 0 32px;
      }

      .tex-title {
        margin: 0;
        padding: 10px 20px;
        background: var(--color--surface--bg, rgba(0, 0, 0, 0.02));
        border-bottom: 1px solid var(--color--surface--stroke, rgba(0, 0, 0, 0.08));
        color: var(--color--background--contrast, inherit);
        opacity: 0.7;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        font-size: 11px;
        font-weight: 600;
      }

      /* Method tabs — the primary selector, sits at the very top of the body */
      .tex-method-tabs {
        display: flex;
        gap: 4px;
        padding: 6px 8px 0;
        background: var(--color--surface--bg, rgba(0, 0, 0, 0.02));
        border-bottom: 1px solid var(--color--surface--stroke, rgba(0, 0, 0, 0.1));
      }

      .tex-method-tab {
        padding: 8px 18px;
        border: none;
        border-radius: 8px 8px 0 0;
        background: none;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        font-family: inherit;
        color: var(--color--background--contrast, rgba(0, 0, 0, 0.6));
        opacity: 0.6;
        margin-bottom: -1px;
        border: 1px solid transparent;
        border-bottom: none;
        transition:
          opacity 0.12s,
          background 0.12s;
        white-space: nowrap;

        &:hover:not(.tex-method-tab--active) {
          opacity: 0.85;
          background: rgba(0, 0, 0, 0.03);
        }

        &--active {
          opacity: 1;
          color: var(--color--primary);
          background: var(--color--background, #fff);
          border-color: var(--color--surface--stroke, rgba(0, 0, 0, 0.1));
        }
      }

      .tex-preview {
        padding: 28px 24px;
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        align-items: flex-start;
        min-height: 80px;
      }

      .tex-preview--empty {
        display: none;
      }

      .tex-impl {
        border-top: 1px solid var(--color--surface--stroke, rgba(0, 0, 0, 0.12));
      }

      /* File sub-tabs — secondary selector inside the active method */
      .tex-file-tabs {
        display: flex;
        background: var(--color--surface--bg, rgba(0, 0, 0, 0.025));
        border-bottom: 1px solid var(--color--surface--stroke, rgba(0, 0, 0, 0.1));
      }

      .tex-file-tab {
        padding: 7px 16px;
        border: none;
        border-bottom: 2px solid transparent;
        background: none;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        font-family: inherit;
        color: var(--color--background--contrast, rgba(0, 0, 0, 0.6));
        opacity: 0.55;
        margin-bottom: -1px;
        transition:
          opacity 0.12s,
          border-color 0.12s;
        white-space: nowrap;

        &:hover:not(.tex-file-tab--active) {
          opacity: 0.8;
          background: rgba(0, 0, 0, 0.03);
        }

        &--active {
          opacity: 1;
          color: var(--color--primary);
          border-bottom-color: var(--color--primary);
        }
      }

      .tex-pre {
        margin: 0;
        border-radius: 0;
        border: none;
        box-shadow: none;

        &--hidden {
          display: none;
        }
      }
    `,
  ],
})
export class ThemeExampleComponent implements AfterContentInit {
  readonly title = input<string>('');

  @ViewChild('preview', { static: true }) private previewRef!: ElementRef<HTMLElement>;

  /** True when something is projected into the [demo] slot. */
  readonly hasDemo = signal(false);

  /** Method labels (override defaults if desired). */
  readonly attrsLabel = input<string>('Attributes');
  readonly scssLabel = input<string>('SCSS');

  /** Attributes-method files. */
  readonly attrsHtml = input<string>('');
  readonly attrsScss = input<string>('');

  /** SCSS-method files. */
  readonly scssHtml = input<string>('');
  readonly scssScss = input<string>('');

  private readonly _method = signal<'attrs' | 'scss' | null>(null);
  private readonly _fileSelection = signal<string>('');

  readonly methods = computed<Method[]>(() => {
    const list: Method[] = [];

    const attrsFiles: FileTab[] = [];
    if (this.attrsHtml())
      attrsFiles.push({ id: 'attrs-html', label: 'HTML', lang: 'html', code: this.attrsHtml() });
    if (this.attrsScss())
      attrsFiles.push({ id: 'attrs-scss', label: 'SCSS', lang: 'scss', code: this.attrsScss() });
    if (attrsFiles.length) list.push({ id: 'attrs', label: this.attrsLabel(), files: attrsFiles });

    const scssFiles: FileTab[] = [];
    if (this.scssHtml())
      scssFiles.push({ id: 'scss-html', label: 'HTML', lang: 'html', code: this.scssHtml() });
    if (this.scssScss())
      scssFiles.push({ id: 'scss-scss', label: 'SCSS', lang: 'scss', code: this.scssScss() });
    if (scssFiles.length) list.push({ id: 'scss', label: this.scssLabel(), files: scssFiles });

    return list;
  });

  readonly method = computed<'attrs' | 'scss'>(() => {
    const sel = this._method();
    const ids = this.methods().map((m) => m.id);
    return sel && ids.includes(sel) ? sel : (ids[0] ?? 'attrs');
  });

  readonly currentFiles = computed<FileTab[]>(
    () => this.methods().find((m) => m.id === this.method())?.files ?? [],
  );

  readonly allFiles = computed<FileTab[]>(() => this.methods().flatMap((m) => m.files));

  readonly activeFile = computed<string>(() => {
    const sel = this._fileSelection();
    const files = this.currentFiles();
    return sel && files.some((f) => f.id === sel) ? sel : (files[0]?.id ?? '');
  });

  selectMethod(id: 'attrs' | 'scss'): void {
    this._method.set(id);
    this._fileSelection.set('');
  }

  selectFile(id: string): void {
    this._fileSelection.set(id);
  }

  ngAfterContentInit(): void {
    this.hasDemo.set((this.previewRef?.nativeElement?.children.length ?? 0) > 0);
  }
}
