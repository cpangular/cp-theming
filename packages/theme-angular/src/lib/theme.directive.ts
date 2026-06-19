// TODO(phase-5): Structural directive [cpaTheme] that scopes a theme to a subtree.
//
// Usage:
//   <div [cpaTheme]="'ocean'">...</div>
//   <div [cpaTheme]="'ocean'" [cpaThemeMode]="'dark'">...</div>
//
// Implementation notes:
//   - Sets [theme] and optionally [themeMode] on the host element
//   - Input changes update the attribute directly (no rebuild needed)

import { Directive, Input, ElementRef } from '@angular/core';

@Directive({ selector: '[cpaTheme]', standalone: true })
export class ThemeDirective {
  // TODO(phase-5): implement
  @Input() cpaTheme: string | null = null;
}
