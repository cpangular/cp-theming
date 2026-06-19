// @cpangular/cp-theming-core — public API
export {
  ThemeMode,
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
} from './theme.js';

export type { ThemeDef, WatchOptions } from './types.js';
