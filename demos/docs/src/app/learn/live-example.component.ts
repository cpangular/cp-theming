import {
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FRAMES_PATH, frameFiles } from './chapters';

/** One frame of a chapter's example folder, and how its tab reads. */
export interface LiveFrame {
  /** `example`, or the name of a variation's files (`try-dark`). */
  frame: string;
  label: string;
}

/** A colour the reader can change in the running example. */
export interface LiveControl {
  label: string;
  /** The starting colour, as `#rrggbb`: what the example's files say. */
  value: string;
  /** The elements of the frame it is set on. */
  target: string;
  /** The custom properties it sets there. */
  properties: string[];
}

interface FilePanel {
  name: string;
  lang: string;
  code: string;
}

const LANG: Record<string, string> = { scss: 'scss', html: 'html', css: 'css' };

/**
 * A live example of a Learn chapter with its source beside it.
 *
 * The example runs in an `<iframe>`: a document the docs build writes from the
 * chapter's files (`scripts/learn.ts`), so nothing of the docs site's own
 * styles reaches it. The source panels show the text of those same files, which
 * the chapter page imports with `with { loader: 'text' }`.
 *
 * With more than one frame the block has tabs: each is the example with some
 * of its files swapped (`frameFiles()` in chapters.ts, the rule the build
 * uses), and the files a tab swapped are marked.
 *
 * The page does two things to the running frame and nothing else: it sets
 * `themeMode` on the frame's `<html>` to the site's light or dark, and, when
 * the example has a control, it sets that colour on the control's target.
 */
@Component({
  selector: 'cpa-live-example',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  template: `
    <figure class="live">
      @if (frames().length > 1) {
        <div class="live-tabs" role="tablist">
          @for (f of frames(); track f.frame) {
            <button
              type="button"
              role="tab"
              class="live-tab"
              [class.live-tab--active]="active().frame === f.frame"
              [attr.aria-selected]="active().frame === f.frame"
              (click)="select(f.frame)"
            >
              {{ f.label }}
            </button>
          }
        </div>
      }

      <div class="live-body">
        <div class="live-stage">
          @if (control(); as c) {
            <label class="live-control">
              <input type="color" [value]="colour()" (input)="pick($event)" />
              <span>{{ c.label }}</span>
              <span class="live-value">{{ colour() }}</span>
            </label>
          }
          <iframe
            #frame
            class="live-frame"
            [src]="src()"
            [title]="'Live example: ' + active().label"
            (load)="onLoad()"
          ></iframe>
        </div>

        <div class="live-source">
          <div class="live-files">
            @for (f of files_(); track f.name) {
              <button
                type="button"
                class="live-file"
                [class.live-file--active]="file() === f.name"
                (click)="selectFile(f.name)"
              >
                {{ f.name }}
                @if (changed().includes(f.name)) {
                  <span class="live-changed">changed</span>
                }
              </button>
            }
          </div>
          <!-- Every panel stays in the DOM, so highlight.js sees each one once. -->
          @for (p of panels(); track p.name) {
            <pre
              class="live-pre"
              [class.live-pre--hidden]="file() !== p.name"
            ><code [class]="'language-' + p.lang" [textContent]="p.code"></code></pre>
          }
        </div>
      </div>
    </figure>
  `,
  styles: [
    `
      .live {
        margin: 20px 0 8px;
        border: 1px solid var(--color--surface--stroke, rgba(0, 0, 0, 0.12));
        border-radius: 12px;
        overflow: hidden;
      }

      .live-tabs,
      .live-files {
        display: flex;
        flex-wrap: wrap;
        background: var(--color--surface--bg, rgba(0, 0, 0, 0.03));
        border-bottom: 1px solid var(--color--surface--stroke, rgba(0, 0, 0, 0.1));
      }

      .live-tab,
      .live-file {
        padding: 9px 16px;
        border: none;
        border-bottom: 2px solid transparent;
        margin-bottom: -1px;
        background: none;
        cursor: pointer;
        font: inherit;
        font-size: 13px;
        font-weight: 500;
        color: var(--color--background--contrast);
        opacity: 0.65;
        white-space: nowrap;
      }

      .live-file {
        padding: 7px 14px;
        font-family: 'Roboto Mono', monospace;
        font-size: 12px;
      }

      .live-tab:hover,
      .live-file:hover {
        opacity: 0.9;
      }

      .live-tab--active,
      .live-file--active {
        opacity: 1;
        color: var(--color--primary);
        border-bottom-color: var(--color--primary);
      }

      .live-changed {
        margin-left: 6px;
        padding: 1px 6px;
        border-radius: 99px;
        font-family: Roboto, sans-serif;
        font-size: 10px;
        background: var(--color--primary--tint-2);
      }

      .live-body {
        display: grid;
        grid-template-columns: minmax(0, 11fr) minmax(0, 9fr);
        align-items: stretch;
      }

      @media (max-width: 1100px) {
        .live-body {
          grid-template-columns: minmax(0, 1fr);
        }
      }

      .live-stage {
        min-width: 0;
        display: flex;
        flex-direction: column;
      }

      .live-control {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 16px;
        font-size: 14px;
        border-bottom: 1px solid var(--color--surface--stroke, rgba(0, 0, 0, 0.1));
        cursor: pointer;
      }

      .live-control input {
        width: 44px;
        height: 30px;
        padding: 0;
        border: 1px solid var(--color--surface--stroke);
        border-radius: 6px;
        background: none;
        cursor: pointer;
      }

      .live-value {
        font-family: 'Roboto Mono', monospace;
        font-size: 12.5px;
        opacity: 0.7;
      }

      .live-frame {
        display: block;
        width: 100%;
        /* At least as tall as its content (the height set once it has loaded),
           and as tall as the source beside it. */
        height: 240px;
        border: 0;
        flex: 1 0 auto;
      }

      .live-source {
        min-width: 0;
        display: flex;
        flex-direction: column;
        border-left: 1px solid var(--color--surface--stroke, rgba(0, 0, 0, 0.1));
      }

      @media (max-width: 1100px) {
        .live-source {
          border-left: 0;
          border-top: 1px solid var(--color--surface--stroke, rgba(0, 0, 0, 0.1));
        }
      }

      .live-pre {
        flex: 1;
        margin: 0;
        max-height: 420px;
        overflow: auto;
        border: none;
        border-radius: 0;
        box-shadow: none;
        padding: 14px 16px;
        font-size: 13px;
      }

      .live-pre--hidden {
        display: none;
      }
    `,
  ],
})
export class LiveExampleComponent {
  private readonly sanitizer = inject(DomSanitizer);

  /** The chapter's example folder: `01-one-colour`. */
  readonly chapter = input.required<string>();
  /** The text of the folder's files, by file name. */
  readonly files = input.required<Record<string, string>>();
  /** The frames to show; more than one gives tabs. */
  readonly frames = input.required<LiveFrame[]>();
  readonly control = input<LiveControl>();

  private readonly frameEl = viewChild.required<ElementRef<HTMLIFrameElement>>('frame');
  private readonly _frame = signal<string | null>(null);
  private readonly _file = signal<string | null>(null);
  private readonly _colour = signal<string | null>(null);

  protected readonly active = computed(
    () => this.frames().find((f) => f.frame === this._frame()) ?? this.frames()[0],
  );

  protected readonly src = computed(() =>
    // A path of this site, built from two inputs the chapter page writes.
    this.sanitizer.bypassSecurityTrustResourceUrl(
      `${FRAMES_PATH}/${this.chapter()}/${this.active().frame}.html`,
    ),
  );

  private namesOf(frame: string): string[] {
    const use = frameFiles(frame, Object.keys(this.files()));
    return [use.html, ...(use.styles ? [use.styles] : []), use.theme];
  }

  private panel(name: string): FilePanel {
    return {
      name,
      lang: LANG[name.split('.').pop() ?? ''] ?? 'scss',
      code: (this.files()[name] ?? `/* ${name} is missing */`).trimEnd(),
    };
  }

  /** The files of the frame on show. */
  protected readonly files_ = computed(() =>
    this.namesOf(this.active().frame).map((n) => this.panel(n)),
  );

  /** Every file of every frame, once. */
  protected readonly panels = computed(() =>
    [...new Set(this.frames().flatMap((f) => this.namesOf(f.frame)))].map((n) => this.panel(n)),
  );

  /** The files this frame has in place of the example's. */
  protected readonly changed = computed(() => {
    // Only where there are tabs to compare: a single frame is just its files.
    if (this.frames().length < 2) return [];
    const base = this.namesOf('example');
    return this.namesOf(this.active().frame).filter((n) => !base.includes(n));
  });

  protected readonly file = computed(() => {
    const names = this.files_().map((f) => f.name);
    const chosen = this._file();
    return chosen && names.includes(chosen) ? chosen : (this.changed()[0] ?? names[0]);
  });

  protected readonly colour = computed(() => this._colour() ?? this.control()?.value ?? '');

  constructor() {
    // The frame follows the site's light or dark, also when it changes.
    const sync = () => this.syncMode();
    const attrs = new MutationObserver(sync);
    attrs.observe(document.documentElement, { attributes: true });
    const os = window.matchMedia('(prefers-color-scheme: dark)');
    os.addEventListener('change', sync);
    inject(DestroyRef).onDestroy(() => {
      attrs.disconnect();
      os.removeEventListener('change', sync);
      this.resize?.disconnect();
    });
  }

  protected select(frame: string): void {
    this._frame.set(frame);
    this._file.set(null);
  }

  protected selectFile(name: string): void {
    this._file.set(name);
  }

  protected pick(event: Event): void {
    this._colour.set((event.target as HTMLInputElement).value);
    this.applyControl();
  }

  private resize?: ResizeObserver;

  private doc(): Document | null {
    try {
      return this.frameEl().nativeElement.contentDocument;
    } catch {
      return null;
    }
  }

  protected onLoad(): void {
    const doc = this.doc();
    if (!doc?.body) return;
    this.syncMode();
    if (this._colour()) this.applyControl();
    // As tall as its content: the example is part of the page, not a scroll box.
    const fit = () => {
      const height = doc.body.offsetHeight;
      if (height > 0) this.frameEl().nativeElement.style.height = `${height}px`;
    };
    this.resize?.disconnect();
    this.resize = new ResizeObserver(fit);
    this.resize.observe(doc.body);
    fit();
  }

  /** `themeMode` on the frame's root: the mode this block is shown in. */
  private syncMode(): void {
    const root = this.doc()?.documentElement;
    if (!root) return;
    const scheme = getComputedStyle(this.frameEl().nativeElement).colorScheme;
    if (scheme === 'light' || scheme === 'dark') root.setAttribute('themeMode', scheme);
    else root.removeAttribute('themeMode');
  }

  private applyControl(): void {
    const control = this.control();
    const doc = this.doc();
    if (!control || !doc) return;
    for (const el of doc.querySelectorAll<HTMLElement>(control.target))
      for (const property of control.properties) el.style.setProperty(property, this.colour());
  }
}
