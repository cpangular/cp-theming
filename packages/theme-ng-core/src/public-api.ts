/*
 * Public API Surface of @cpangular/cp-theming-ng-core
 */

export { ThemeService } from './lib/theme.service';
export { ThemeDirective } from './lib/theme.directive';
export { ThemeModeDirective } from './lib/theme-mode.directive';

// Re-export core types so consumers only need one import.
export { ThemeMode, ThemeStorage, type ThemeDef } from '@cpangular/cp-theming-core';
