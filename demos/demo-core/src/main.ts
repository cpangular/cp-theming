import './scss/themes/ocean.scss';
import './scss/themes/ember.scss';
import './scss/base.scss';
import './scss/components.scss';

import { setMode, setTheme, ThemeMode } from '@cpangular/cp-theming-core';

// Set the initial theme
setTheme('ocean');

// Expose controls to the HTML onclick handlers
(window as Record<string, unknown>).switchMode = (mode: string) => {
  setMode(mode as ThemeMode);
};

(window as Record<string, unknown>).switchTheme = (theme: string) => {
  setTheme(theme);
};
