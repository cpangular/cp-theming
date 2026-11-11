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

export { themeHeadSnippet } from './head-snippet.js';

export {
  ATTR_THEME,
  ATTR_MODE,
  PERSIST_CONFIG_KEY,
  PERSIST_THEME_KEY,
  PERSIST_MODE_KEY,
} from './storage-keys.js';

export type { ThemeDef, WatchOptions } from './types.js';

export { enableRelativeDensity } from './density.js';
