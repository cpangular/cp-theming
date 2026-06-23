import { Directive, ElementRef, Renderer2, effect, inject, input } from '@angular/core';

/**
 * Scopes a theme to the host element's subtree by setting the [theme] attribute.
 * Can be used alone or alongside [themeMode].
 *
 * Usage:
 *   <div [theme]="'azure-blue'">...</div>
 *   <div [theme]="'azure-blue'" [themeMode]="ThemeMode.DARK">...</div>
 */
@Directive({
  selector: '[theme]',
  standalone: true,
})
export class ThemeDirective {
  private readonly _el = inject<ElementRef<Element>>(ElementRef);
  private readonly _renderer = inject(Renderer2);

  /** The theme name to apply. Removes the attribute when null. */
  readonly theme = input<string | null>(null);

  constructor() {
    effect(() => {
      const theme = this.theme();
      if (theme !== null) {
        this._renderer.setAttribute(this._el.nativeElement, 'theme', theme);
      } else {
        this._renderer.removeAttribute(this._el.nativeElement, 'theme');
      }
    });
  }
}
