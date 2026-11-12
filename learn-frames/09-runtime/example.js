import { ThemeStorage, configurePersistence, getMode, getTheme, setMode, setTheme, watchMode, watchTheme, } from '@cpangular/cp-theming-core';
// Save what the reader picks in localStorage. Once, before anything is set.
configurePersistence(ThemeStorage.LOCAL);
const themes = document.querySelectorAll('button[data-theme]');
const modes = document.querySelectorAll('button[data-mode]');
const state = document.querySelector('#state');
// A click sets an attribute on <html> and saves its value.
for (const button of themes)
    button.addEventListener('click', () => setTheme(button.dataset.theme ?? 'ocean'));
for (const button of modes)
    button.addEventListener('click', () => setMode(button.dataset.mode));
// The buttons show what the attributes say, whoever set them.
function show() {
    const theme = getTheme() ?? 'ocean'; // no attribute yet: the default theme
    const mode = getMode();
    for (const button of themes)
        button.setAttribute('aria-pressed', String(button.dataset.theme === theme));
    for (const button of modes)
        button.setAttribute('aria-pressed', String(button.dataset.mode === mode));
    if (state)
        state.textContent = `theme: ${theme}, mode: ${mode}`;
}
watchTheme(show);
watchMode(show);
show();
document.querySelector('#reload')?.addEventListener('click', () => location.reload());
