import {
  Directive,
  ElementRef,
  Renderer2,
  DestroyRef,
  effect,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { enableRelativeDensity } from '@cpangular/cp-theming-core';

/**
 * Applies density to the host element's subtree.
 *
 * Absolute:
 *   <div [themeDensity]="-2">...</div>     — sets density to exactly -2
 *
 * Relative (requires enableRelativeDensity() to be called at startup):
 *   <div [themeDensityLower]="1">...</div> — 1 step more compact than inherited
 *   <div [themeDensityHigher]="1">...</div>— 1 step more spacious than inherited
 *
 * Relative values chain correctly — a [themeDensityLower]="1" inside another
 * [themeDensityLower]="1" produces two steps of compaction.
 */
@Directive({
  selector: '[themeDensity],[themeDensityLower],[themeDensityHigher]',
  standalone: true,
})
export class ThemeDensityDirective {
  private readonly _el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _renderer = inject(Renderer2);
  private readonly _destroyRef = inject(DestroyRef);

  /** Absolute density level (0 = default, negative = compact, positive = spacious). */
  readonly themeDensity = input<number | null, unknown>(null, {
    transform: (v) => (v != null ? numberAttribute(v) : null),
  });

  /** Steps more compact than the inherited density. Positive integer. */
  readonly themeDensityLower = input<number | null, unknown>(null, {
    transform: (v) => (v != null ? numberAttribute(v) : null),
  });

  /** Steps more spacious than the inherited density. Positive integer. */
  readonly themeDensityHigher = input<number | null, unknown>(null, {
    transform: (v) => (v != null ? numberAttribute(v) : null),
  });

  constructor() {
    // Set/remove absolute themeDensity attribute
    effect(() => {
      const v = this.themeDensity();
      if (v !== null) {
        this._renderer.setAttribute(this._el.nativeElement, 'themeDensity', String(v));
      } else {
        this._renderer.removeAttribute(this._el.nativeElement, 'themeDensity');
      }
    });

    // Set/remove relative lower attribute — enableRelativeDensity() handles resolution
    effect(() => {
      const v = this.themeDensityLower();
      if (v !== null) {
        this._renderer.setAttribute(this._el.nativeElement, 'themeDensityLower', String(v));
      } else {
        this._renderer.removeAttribute(this._el.nativeElement, 'themeDensityLower');
      }
    });

    // Set/remove relative higher attribute
    effect(() => {
      const v = this.themeDensityHigher();
      if (v !== null) {
        this._renderer.setAttribute(this._el.nativeElement, 'themeDensityHigher', String(v));
      } else {
        this._renderer.removeAttribute(this._el.nativeElement, 'themeDensityHigher');
      }
    });
  }
}
