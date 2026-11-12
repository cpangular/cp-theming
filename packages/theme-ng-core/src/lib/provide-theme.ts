import {
  APP_INITIALIZER,
  ENVIRONMENT_INITIALIZER,
  EnvironmentProviders,
  PLATFORM_ID,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ThemeStorage,
  configurePersistence,
  restoreTheme,
  restoreMode,
  enableRelativeDensity,
} from '@cpangular/cp-theming-core';
import { ThemeService } from './theme.service';

export interface ThemeProviderConfig {
  /**
   * Where to persist the selected theme and mode across page loads.
   * Defaults to ThemeStorage.LOCAL (localStorage).
   * Pass ThemeStorage.NONE to disable persistence.
   */
  storage?: ThemeStorage;

  /**
   * Whether to restore the persisted theme and mode at startup.
   * Defaults to true.
   */
  restore?: boolean;

  /**
   * Whether to enable relative density attributes:
   * [themeDensityLower] and [themeDensityHigher].
   * Defaults to true.
   */
  relativeDensity?: boolean;
}

/**
 * Call inside `providers` in your `ApplicationConfig` to configure theming.
 *
 * ```ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideTheme({ storage: ThemeStorage.LOCAL }),
 *   ],
 * };
 * ```
 *
 * Outside a browser (server rendering) it configures nothing and touches no
 * storage. To apply the saved theme before first paint, also put
 * `themeHeadSnippet` from `@cpangular/cp-theming-core` in an inline script in
 * `<head>`.
 */
export function provideTheme(config: ThemeProviderConfig = {}): EnvironmentProviders {
  const { storage = ThemeStorage.LOCAL, restore = true, relativeDensity = true } = config;

  return makeEnvironmentProviders([
    // Eagerly instantiate ThemeService so its watchers start immediately.
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => inject(ThemeService),
    },

    // Configure persistence + optionally restore + optionally enable relative density.
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const doc = inject(DOCUMENT);
        const root = doc.documentElement;
        const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
        return () => {
          // Storage and MutationObserver exist only in a browser. On a server the
          // HTML keeps the attributes it was written with; the head snippet
          // (themeHeadSnippet) applies the saved ones in the browser before first paint.
          if (!isBrowser) return;
          configurePersistence(storage);
          if (restore) {
            restoreTheme(root);
            restoreMode(root);
          }
          if (relativeDensity) {
            enableRelativeDensity(root);
          }
        };
      },
    },
  ]);
}
