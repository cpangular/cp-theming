/*
 * Public API Surface of @cpangular/cp-theming-ng-core
 */

export { ThemeService } from './lib/theme.service';
export { ThemeDirective } from './lib/theme.directive';
export { ThemeModeDirective } from './lib/theme-mode.directive';
export { ThemeDensityDirective } from './lib/theme-density.directive';
export { provideTheme } from './lib/provide-theme';
export type { ThemeProviderConfig } from './lib/provide-theme';

// Re-export core types and density helpers so consumers only need one import.
export {
  ThemeMode,
  ThemeStorage,
  enableRelativeDensity,
  themeHeadSnippet,
  type ThemeDef,
} from '@cpangular/cp-theming-core';
