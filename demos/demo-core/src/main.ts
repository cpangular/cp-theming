import './scss/base.scss'; // core first
import './scss/themes/ocean.scss';
import './scss/themes/ember.scss';
import './scss/components.scss';

import {
  configurePersistence,
  getAvailableThemes,
  getTheme,
  restoreMode,
  restoreTheme,
  setMode,
  setTheme,
  watchTheme,
  ThemeMode,
  ThemeStorage,
} from '@cpangular/cp-theming-core';

configurePersistence(ThemeStorage.SESSION);

// ── Forced-mode panels ───────────────────────────────────────────────────────────────

const forcedPanels = Array.from(
  document.querySelectorAll<HTMLElement>('[data-forced-theme-panel]'),
);

function syncForcedPanels(theme: string | null) {
  forcedPanels.forEach((el) => {
    if (theme) el.setAttribute('theme', theme);
    else el.removeAttribute('theme');
  });
}

// ── Restore persisted state or apply defaults ─────────────────────────────────

const restoredTheme = restoreTheme(document.body) ?? 'ocean';
if (!getTheme(document.body)) setTheme(restoredTheme, document.body);
if (!restoreMode()) setMode(ThemeMode.AUTO);
syncForcedPanels(restoredTheme);

// ── Theme dropdown ───────────────────────────────────────────────────────────────

const select = document.getElementById('theme-select') as HTMLSelectElement;

function populateThemeSelect() {
  const themes = getAvailableThemes();
  const current = getTheme(document.body);
  select.innerHTML = themes
    .map(
      (t) => `<option value="${t.name}"${t.name === current ? ' selected' : ''}>${t.name}</option>`,
    )
    .join('');
}

populateThemeSelect();

watchTheme(
  (theme) => {
    if (theme && select.value !== theme) select.value = theme;
    syncForcedPanels(theme);
  },
  { element: document.body },
);

// ── Window-exposed controls ───────────────────────────────────────────────────────

(window as unknown as Record<string, unknown>).switchMode = (mode: string) => {
  setMode(mode as ThemeMode);
};

(window as unknown as Record<string, unknown>).switchTheme = (theme: string) => {
  setTheme(theme, document.body);
};
