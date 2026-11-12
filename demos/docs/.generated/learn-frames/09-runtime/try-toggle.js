import {
  ThemeMode,
  ThemeStorage,
  configurePersistence,
  getEffectiveMode,
  getTheme,
  setMode,
  setTheme,
  watchMode,
  watchTheme,
} from '@cpangular/cp-theming-core';
configurePersistence(ThemeStorage.LOCAL);
const themes = document.querySelectorAll('button[data-theme]');
const toggle = document.querySelector('#toggle');
const state = document.querySelector('#state');
for (const button of themes)
  button.addEventListener('click', () => setTheme(button.dataset.theme ?? 'ocean'));
// The mode may be auto. getEffectiveMode() says what that comes to right now:
// light or dark, never auto.
toggle?.addEventListener('click', () =>
  setMode(getEffectiveMode() === ThemeMode.DARK ? ThemeMode.LIGHT : ThemeMode.DARK),
);
function show() {
  const theme = getTheme() ?? 'ocean';
  const dark = getEffectiveMode() === ThemeMode.DARK;
  for (const button of themes)
    button.setAttribute('aria-pressed', String(button.dataset.theme === theme));
  if (toggle) toggle.textContent = dark ? 'Switch to light' : 'Switch to dark';
  if (state) state.textContent = `theme: ${theme}, mode: ${dark ? 'dark' : 'light'}`;
}
watchTheme(show);
watchMode(show); // also runs when the device changes between light and dark
show();
document.querySelector('#reload')?.addEventListener('click', () => location.reload());
