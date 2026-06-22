// @cpangular/cp-theming-core — public API
export {
  ThemeMode,
  ThemeStorage,
  getTheme,
  setTheme,
  clearTheme,
  getMode,
  setMode,
  getEffectiveMode,
  getPreferredMode,
  watchMode,
  watchTheme,
  getAvailableThemes,
  configurePersistence,
  getPersistence,
  restoreTheme,
  restoreMode,
} from './theme.js';

export type { ThemeDef, WatchOptions } from './types.js';
