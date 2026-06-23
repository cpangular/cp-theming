import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  ThemeStorage,
  configurePersistence,
  restoreMode,
  restoreTheme,
} from '@cpangular/cp-theming-core';
import { appRoutes } from './app.routes';

// Restore previously persisted theme/mode choices from localStorage.
// Falls back to the HTML attribute defaults (theme="azure-blue" themeMode="light").
configurePersistence(ThemeStorage.LOCAL);
restoreTheme();
restoreMode();

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideAnimationsAsync(),
  ],
};
