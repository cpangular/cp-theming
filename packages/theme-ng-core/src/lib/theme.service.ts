// TODO(phase-5): Signal-based Angular service wrapping @cpangular/cp-theming-core.
//
// Will expose:
//   theme        = signal<string | null>       — current [theme] attribute value
//   mode         = signal<ThemeMode>           — current [themeMode] attribute value
//   effectiveMode = computed<ThemeMode.LIGHT | ThemeMode.DARK>
//                                              — resolved mode (auto → system pref)
//
// Implementation notes:
//   - Use Angular inject(DOCUMENT) not direct window/document references
//   - Wire to watchMode() / watchTheme() from @cpangular/cp-theming-core in ngOnInit
//   - Use takeUntilDestroyed() for cleanup
//   - Expose setTheme() and setMode() as methods (delegate to core functions)

import { Injectable, signal, computed } from '@angular/core';
import { ThemeMode } from '@cpangular/cp-theming-core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  // TODO(phase-5): implement
  readonly theme = signal<string | null>(null);
  readonly mode = signal<ThemeMode>(ThemeMode.AUTO);
  readonly effectiveMode = computed(() =>
    this.mode() === ThemeMode.AUTO
      ? ThemeMode.LIGHT // TODO(phase-5): read system preference
      : (this.mode() as ThemeMode.LIGHT | ThemeMode.DARK),
  );
}
