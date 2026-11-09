import { beforeEach, describe, expect, it, vi } from 'vitest';

// Storage keys are the persistence contract (Phase 12 exports them for the head snippet).
const KEY_PERSIST = 'cp-theming--persist';
const KEY_THEME = 'cp-theming--theme';
const KEY_MODE = 'cp-theming--mode';

// The module reads the persist config when it loads, so every test gets a fresh copy.
async function load() {
  vi.resetModules();
  return await import('../../src/index.ts');
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  document.documentElement.removeAttribute('theme');
  document.documentElement.removeAttribute('themeMode');
});

describe('persistence', () => {
  it('is off until configured: setTheme sets the attribute and stores nothing', async () => {
    const api = await load();
    expect(api.getPersistence()).toBe(api.ThemeStorage.NONE);
    api.setTheme('ocean');
    api.setMode(api.ThemeMode.DARK);
    expect(document.documentElement.getAttribute('theme')).toBe('ocean');
    expect(document.documentElement.getAttribute('themeMode')).toBe('dark');
    expect(localStorage.getItem(KEY_THEME)).toBeNull();
    expect(sessionStorage.getItem(KEY_MODE)).toBeNull();
  });

  it('saves theme and mode to localStorage when LOCAL', async () => {
    const api = await load();
    api.configurePersistence(api.ThemeStorage.LOCAL);
    api.setTheme('ocean');
    api.setMode(api.ThemeMode.DARK);
    expect(localStorage.getItem(KEY_PERSIST)).toBe('local');
    expect(localStorage.getItem(KEY_THEME)).toBe('ocean');
    expect(localStorage.getItem(KEY_MODE)).toBe('dark');
    expect(sessionStorage.getItem(KEY_THEME)).toBeNull();
  });

  it('saves to sessionStorage when SESSION, and only the config to localStorage', async () => {
    const api = await load();
    api.configurePersistence(api.ThemeStorage.SESSION);
    api.setTheme('ember');
    api.setMode(api.ThemeMode.LIGHT);
    expect(localStorage.getItem(KEY_PERSIST)).toBe('session');
    expect(sessionStorage.getItem(KEY_THEME)).toBe('ember');
    expect(sessionStorage.getItem(KEY_MODE)).toBe('light');
    expect(localStorage.getItem(KEY_THEME)).toBeNull();
  });

  it('remembers the configured storage across module loads', async () => {
    const first = await load();
    first.configurePersistence(first.ThemeStorage.SESSION);
    const second = await load();
    expect(second.getPersistence()).toBe(second.ThemeStorage.SESSION);
  });

  it('restores a saved theme and mode onto the element and returns them', async () => {
    localStorage.setItem(KEY_PERSIST, 'local');
    localStorage.setItem(KEY_THEME, 'ocean');
    localStorage.setItem(KEY_MODE, 'dark');
    const api = await load();
    expect(api.restoreTheme()).toBe('ocean');
    expect(api.restoreMode()).toBe(api.ThemeMode.DARK);
    expect(document.documentElement.getAttribute('theme')).toBe('ocean');
    expect(document.documentElement.getAttribute('themeMode')).toBe('dark');
  });

  it('returns null and leaves the element alone when nothing is saved', async () => {
    const api = await load();
    api.configurePersistence(api.ThemeStorage.LOCAL);
    expect(api.restoreTheme()).toBeNull();
    expect(api.restoreMode()).toBeNull();
    expect(document.documentElement.hasAttribute('theme')).toBe(false);
    expect(document.documentElement.hasAttribute('themeMode')).toBe(false);
  });

  it('switching to NONE clears saved values from both storages', async () => {
    const api = await load();
    api.configurePersistence(api.ThemeStorage.LOCAL);
    api.setTheme('ocean');
    api.configurePersistence(api.ThemeStorage.SESSION);
    api.setMode(api.ThemeMode.DARK);
    api.configurePersistence(api.ThemeStorage.NONE);
    expect(localStorage.getItem(KEY_PERSIST)).toBe('none');
    expect(localStorage.getItem(KEY_THEME)).toBeNull();
    expect(localStorage.getItem(KEY_MODE)).toBeNull();
    expect(sessionStorage.getItem(KEY_THEME)).toBeNull();
    expect(sessionStorage.getItem(KEY_MODE)).toBeNull();
  });

  it('writes to the element it is given, not the document root', async () => {
    const api = await load();
    api.configurePersistence(api.ThemeStorage.LOCAL);
    const panel = document.createElement('div');
    api.setTheme('ember', panel);
    api.setMode(api.ThemeMode.INVERT, panel);
    expect(panel.getAttribute('theme')).toBe('ember');
    expect(api.getTheme(panel)).toBe('ember');
    expect(api.getMode(panel)).toBe(api.ThemeMode.INVERT);
    expect(document.documentElement.hasAttribute('theme')).toBe(false);
    expect(localStorage.getItem(KEY_THEME)).toBe('ember');
    localStorage.setItem(KEY_THEME, 'ocean');
    expect(api.restoreTheme(panel)).toBe('ocean');
    expect(panel.getAttribute('theme')).toBe('ocean');
  });
});
