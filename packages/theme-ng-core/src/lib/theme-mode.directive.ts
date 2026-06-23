import { Directive, ElementRef, Renderer2, effect, inject, input } from '@angular/core';
import { ThemeMode } from '@cpangular/cp-theming-core';

/**
 * Scopes a theme mode to the host element's subtree by setting the [themeMode] attribute.
 * Can be used alone (without [theme]) to force a mode on any subtree.
 *
 * Usage:
 *   <div [themeMode]="ThemeMode.DARK">...</div>
 *   <div [theme]="'azure-blue'" [themeMode]="ThemeMode.DARK">...</div>
 */
@Directive({
  selector: '[themeMode]',
  standalone: true,
})
export class ThemeModeDirective {
  private readonly _el = inject<ElementRef<Element>>(ElementRef);
  private readonly _renderer = inject(Renderer2);

  /** The theme mode to apply. Removes the attribute when null. */
  readonly themeMode = input<ThemeMode | null>(null);

  constructor() {
    effect(() => {
      const mode = this.themeMode();
      if (mode !== null) {
        this._renderer.setAttribute(this._el.nativeElement, 'themeMode', mode);
      } else {
        this._renderer.removeAttribute(this._el.nativeElement, 'themeMode');
      }
    });
  }
}
