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
import { FRAMES_PATH, frameFiles, shownName } from './chapters';
import { contrastOf } from './contrast';

/** One frame of a chapter's example folder, and how its tab reads. */
export interface LiveFrame {
  /** `example`, or the name of a variation's files (`try-dark`). */
  frame: string;
  label: string;
  /** Controls for this frame, in place of the block's. */
  controls?: LiveControl[];
  /** Readouts for this frame, in place of the block's. */
  measures?: LiveMeasure[];
}

/** Something the reader can change in the running example: a colour or a number. */
export interface LiveControl {
  label: string;
  /**
   * The starting value: what the example's files say. `#rrggbb` for a colour
   * picker, a number for a slider.
   */
  value: string;
  /** A slider over these numbers; without it the control is a colour picker. */
  range?: { min: number; max: number; step?: number; unit?: string };
  /** The elements of the frame it is set on. */
  target: string;
  /** The custom properties it sets there… */
  properties?: string[];
  /** …or the attribute. */
  attribute?: string;
  /**
   * What is written, with `{}` where the value goes: `oklch({}% 0.13 250)`.
   * Without it, the value followed by the slider's unit.
   */
  format?: string;
}

/**
 * A contrast ratio the page reads from the running example and shows under the
 * controls: the text of the elements `selector` finds against what is painted
 * behind it. With several elements it is the lowest of them.
 */
export interface LiveMeasure {
  label: string;
  selector: string;
}

interface Reading {
  label: string;
  /** `4.58 : 1`, or a dash when nothing could be read. */
  text: string;
  /** Below the 4.5 that body text needs. */
  low: boolean;
}

interface FilePanel {
  /** The file, as the folder has it. */
  name: string;
  /** Its name on the tab. */
  shown: string;
  lang: string;
  code: string;
}

const LANG: Record<string, string> = { scss: 'scss', html: 'html', css: 'css', ts: 'typescript' };

/** The look of a live example block. Global and all under `.live`; LiveTemplateComponent shares it. */
export const LIVE_STYLES = `
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

      .live-controls {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 4px 20px;
        padding: 10px 16px;
        font-size: 14px;
        border-bottom: 1px solid var(--color--surface--stroke, rgba(0, 0, 0, 0.1));
      }

      .live-control {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 32px;
        cursor: pointer;
      }

      .live-control input[type='color'] {
        width: 44px;
        height: 30px;
        padding: 0;
        border: 1px solid var(--color--surface--stroke);
        border-radius: 6px;
        background: none;
        cursor: pointer;
      }

      .live-control--range .live-control-label {
        flex: 0 0 104px;
      }

      .live-control input[type='range'] {
        flex: 1;
        min-width: 0;
        accent-color: var(--color--primary);
        cursor: pointer;
      }

      .live-control--range .live-value {
        flex: 0 0 52px;
        text-align: right;
      }

      .live-value {
        font-family: 'Roboto Mono', monospace;
        font-size: 12.5px;
        opacity: 0.7;
      }

      .live-measures {
        grid-column: 1 / -1;
        display: grid;
        /* Wide enough for a label, a ratio and "below 4.5" on one line. */
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 0 20px;
      }

      .live-measure {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 10px;
        padding: 4px 0;
      }

      .live-measure strong {
        font-family: 'Roboto Mono', monospace;
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
      }

      .live-measure--low strong {
        color: var(--color--error);
      }

      .live-measure--low strong::after {
        content: ' (below 4.5)';
        font-family: Roboto, sans-serif;
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
`;

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
 * `themeMode` on the frame's `<html>` to the site's light or dark (unless the
 * example chooses its own mode, `ownMode`), and, when the example has controls,
 * it sets each one's value on its target: a colour or a number in a custom
 * property, or an attribute. It may also read contrast ratios out of the frame
 * and show them (`measures`); reading changes nothing.
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
          @if (controls_().length || readings().length) {
            <div class="live-controls">
              @for (c of controls_(); track $index) {
                <label class="live-control" [class.live-control--range]="!!c.range">
                  @if (c.range; as r) {
                    <span class="live-control-label">{{ c.label }}</span>
                    <input
                      type="range"
                      [min]="r.min"
                      [max]="r.max"
                      [step]="r.step ?? 1"
                      [value]="valueOf($index)"
                      (input)="pick($index, $event)"
                    />
                    <span class="live-value">{{ valueOf($index) }}{{ r.unit ?? '' }}</span>
                  } @else {
                    <input type="color" [value]="valueOf($index)" (input)="pick($index, $event)" />
                    <span>{{ c.label }}</span>
                    <span class="live-value">{{ valueOf($index) }}</span>
                  }
                </label>
              }
              @if (readings().length) {
                <div class="live-measures">
                  @for (m of readings(); track m.label) {
                    <div class="live-measure" [class.live-measure--low]="m.low">
                      <span>{{ m.label }}</span>
                      <strong>{{ m.text }}</strong>
                    </div>
                  }
                </div>
              }
            </div>
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
                {{ f.shown }}
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
  styles: [LIVE_STYLES],
})
export class LiveExampleComponent {
  private readonly sanitizer = inject(DomSanitizer);

  /** The chapter's example folder: `01-one-colour`. */
  readonly chapter = input.required<string>();
  /** The text of the folder's files, by file name. */
  readonly files = input.required<Record<string, string>>();
  /** The frames to show; more than one gives tabs. */
  readonly frames = input.required<LiveFrame[]>();
  /** Controls above the example; a frame may bring its own. */
  readonly controls = input<LiveControl[]>([]);
  /** Contrast readouts under the controls; a frame may bring its own. */
  readonly measures = input<LiveMeasure[]>([]);
  /** The example sets its own light or dark: the page leaves `themeMode` alone. */
  readonly ownMode = input(false);

  private readonly frameEl = viewChild.required<ElementRef<HTMLIFrameElement>>('frame');
  private readonly _frame = signal<string | null>(null);
  private readonly _file = signal<string | null>(null);
  /** What the reader set, by frame and control: `try-hue#0`. */
  private readonly _values = signal<Record<string, string>>({});
  private readonly _readings = signal<Reading[]>([]);

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
    return [use.html, use.script, use.styles, use.head, use.theme].filter(
      (name): name is string => !!name,
    );
  }

  private panel(name: string): FilePanel {
    const shown = shownName(name);
    return {
      name,
      shown,
      lang: LANG[shown.split('.').pop() ?? ''] ?? 'scss',
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

  /** The controls and readouts of the frame on show. */
  protected readonly controls_ = computed(() => this.active().controls ?? this.controls());
  private readonly measures_ = computed(() => this.active().measures ?? this.measures());
  protected readonly readings = this._readings.asReadonly();

  private key(index: number): string {
    return `${this.active().frame}#${index}`;
  }

  protected valueOf(index: number): string {
    return this._values()[this.key(index)] ?? this.controls_()[index].value;
  }

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

  protected pick(index: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this._values.update((all) => ({ ...all, [this.key(index)]: value }));
    this.applyControl(index);
    this.measure();
  }

  private resize?: ResizeObserver;

  private doc(): Document | null {
    try {
      return this.frameEl().nativeElement.contentDocument;
    } catch {
      return null;
    }
  }

  /** A frame of this block has loaded: before that there is nothing to keep in step. */
  private loaded = false;

  protected onLoad(): void {
    const doc = this.doc();
    // The empty document an <iframe> starts with loads too, before this block
    // has been given its frames.
    if (!doc?.body || doc.location.href === 'about:blank') return;
    this.loaded = true;
    this.syncMode();
    // What the reader had set on this frame is set again: a reload starts
    // from the example's files.
    this.controls_().forEach((_, i) => {
      if (this.key(i) in this._values()) this.applyControl(i);
    });
    this.measure();
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
    // The site's mode can change before this block has its inputs.
    if (!this.loaded || this.ownMode()) return;
    const root = this.doc()?.documentElement;
    if (!root) return;
    const scheme = getComputedStyle(this.frameEl().nativeElement).colorScheme;
    if (scheme === 'light' || scheme === 'dark') root.setAttribute('themeMode', scheme);
    else root.removeAttribute('themeMode');
    this.measure();
  }

  private applyControl(index: number): void {
    const control = this.controls_()[index];
    const doc = this.doc();
    if (!control || !doc) return;
    const value = this.valueOf(index);
    const written = control.format
      ? control.format.replace('{}', value)
      : `${value}${control.range?.unit ?? ''}`;
    for (const el of doc.querySelectorAll<HTMLElement>(control.target)) {
      if (control.attribute) el.setAttribute(control.attribute, value);
      for (const property of control.properties ?? []) el.style.setProperty(property, written);
    }
  }

  /** Reads the contrast ratios this frame's readouts ask for. */
  private measure(): void {
    const doc = this.doc();
    const measures = this.measures_();
    if (!doc?.body || !measures.length) {
      this._readings.set([]);
      return;
    }
    this._readings.set(
      measures.map(({ label, selector }) => {
        const ratios = [...doc.querySelectorAll(selector)]
          .map((el) => contrastOf(el))
          .filter((ratio) => !Number.isNaN(ratio));
        if (!ratios.length) return { label, text: '–', low: false };
        const lowest = Math.min(...ratios);
        // Rounded down, so a ratio is never shown higher than it is.
        return {
          label,
          text: `${(Math.floor(lowest * 100) / 100).toFixed(2)} : 1`,
          low: lowest < 4.5,
        };
      }),
    );
  }
}
