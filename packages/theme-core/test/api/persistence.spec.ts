import { beforeEach, describe, expect, it, vi } from 'vitest';

// Storage keys are the persistence contract, pinned here as literals. The package
// exports them and builds the head snippet from them (head-snippet.spec.ts).
const KEY_PERSIST = 'cp-theming--persist';
const KEY_THEME = 'cp-theming--theme';
const KEY_MODE = 'cp-theming--mode';

// The module caches the persist config on first use, so every test gets a fresh copy.
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

  it('does not touch storage when the module loads, only on first use', async () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem');
    try {
      const api = await load();
      expect(getItem).not.toHaveBeenCalled();
      api.getPersistence();
      expect(getItem).toHaveBeenCalledWith(KEY_PERSIST);
    } finally {
      getItem.mockRestore();
    }
  });

  it('exports the storage keys it uses', async () => {
    const api = await load();
    expect(api.PERSIST_CONFIG_KEY).toBe(KEY_PERSIST);
    expect(api.PERSIST_THEME_KEY).toBe(KEY_THEME);
    expect(api.PERSIST_MODE_KEY).toBe(KEY_MODE);
  });

  it('treats an unknown persist config as NONE', async () => {
    localStorage.setItem(KEY_PERSIST, 'cookie');
    localStorage.setItem(KEY_THEME, 'ocean');
    const api = await load();
    expect(api.getPersistence()).toBe(api.ThemeStorage.NONE);
    expect(api.restoreTheme()).toBeNull();
  });

  it('does not restore a saved mode that is not a ThemeMode', async () => {
    localStorage.setItem(KEY_PERSIST, 'local');
    localStorage.setItem(KEY_MODE, 'dim');
    const api = await load();
    expect(api.restoreMode()).toBeNull();
    expect(document.documentElement.hasAttribute('themeMode')).toBe(false);
  });

  it('still sets the attributes when storage refuses the write', async () => {
    const api = await load();
    api.configurePersistence(api.ThemeStorage.LOCAL);
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
    });
    try {
      expect(() => api.setTheme('ocean')).not.toThrow();
      expect(() => api.setMode(api.ThemeMode.DARK)).not.toThrow();
      expect(() => api.configurePersistence(api.ThemeStorage.SESSION)).not.toThrow();
    } finally {
      setItem.mockRestore();
    }
    expect(document.documentElement.getAttribute('theme')).toBe('ocean');
    expect(document.documentElement.getAttribute('themeMode')).toBe('dark');
    expect(api.getPersistence()).toBe(api.ThemeStorage.SESSION);
  });
});
