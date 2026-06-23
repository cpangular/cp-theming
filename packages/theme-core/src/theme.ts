// ─────────────────────────────────────────────────────────────────────────────
// Theme API — read/write the active theme and mode on the DOM.
//
// All functions accept an optional `element` parameter. When omitted they
// operate on `document.documentElement` (the <html> element).
// ─────────────────────────────────────────────────────────────────────────────

import { ThemeMode, ThemeStorage, type ThemeDef, type WatchOptions } from './types.js';

const ATTR_THEME = 'theme';
const ATTR_MODE = 'themeMode';

// ─── Persistence ─────────────────────────────────────────────────────────────

const _PERSIST_CONFIG_KEY = 'cp-theming--persist';
const _PERSIST_THEME_KEY = 'cp-theming--theme';
const _PERSIST_MODE_KEY = 'cp-theming--mode';

// The persist config itself is always stored in localStorage so it survives sessions.
let _persistStorage: ThemeStorage =
  (localStorage.getItem(_PERSIST_CONFIG_KEY) as ThemeStorage) ?? ThemeStorage.NONE;

function _getStorage(): Storage | null {
  if (_persistStorage === ThemeStorage.LOCAL) return localStorage;
  if (_persistStorage === ThemeStorage.SESSION) return sessionStorage;
  return null;
}

function _saveTheme(theme: string): void {
  _getStorage()?.setItem(_PERSIST_THEME_KEY, theme);
}

function _saveMode(mode: ThemeMode): void {
  _getStorage()?.setItem(_PERSIST_MODE_KEY, mode);
}

/**
 * Configures where theme and mode selections are persisted.
 * Call once at app startup before restoreTheme/restoreMode.
 * Switching to NONE clears any previously saved values.
 */
export function configurePersistence(storage: ThemeStorage): void {
  _persistStorage = storage;
  localStorage.setItem(_PERSIST_CONFIG_KEY, storage);
  if (storage === ThemeStorage.NONE) {
    localStorage.removeItem(_PERSIST_THEME_KEY);
    localStorage.removeItem(_PERSIST_MODE_KEY);
    sessionStorage.removeItem(_PERSIST_THEME_KEY);
    sessionStorage.removeItem(_PERSIST_MODE_KEY);
  }
}

/** Returns the currently configured persistence storage. */
export function getPersistence(): ThemeStorage {
  return _persistStorage;
}

/**
 * Reads the persisted theme from storage and applies it to the element.
 * Returns the restored theme name, or null if nothing was saved.
 */
export function restoreTheme(element: Element = document.documentElement): string | null {
  const saved = _getStorage()?.getItem(_PERSIST_THEME_KEY) ?? null;
  if (saved) setTheme(saved, element);
  return saved;
}

/**
 * Reads the persisted mode from storage and applies it to the element.
 * Returns the restored ThemeMode, or null if nothing was saved.
 */
export function restoreMode(element: Element = document.documentElement): ThemeMode | null {
  const saved = _getStorage()?.getItem(_PERSIST_MODE_KEY) as ThemeMode | null;
  if (saved) setMode(saved, element);
  return saved;
}

// ─── Theme ───────────────────────────────────────────────────────────────────

/** Returns the current [theme] attribute value on the given element. */
export function getTheme(element: Element = document.documentElement): string | null {
  return element.getAttribute(ATTR_THEME);
}

/** Sets the [theme] attribute on the given element and persists if configured. */
export function setTheme(theme: string, element: Element = document.documentElement): void {
  element.setAttribute(ATTR_THEME, theme);
  _saveTheme(theme);
}

/** Removes the [theme] attribute from the given element. */
export function clearTheme(element: Element = document.documentElement): void {
  element.removeAttribute(ATTR_THEME);
}

// ─── Mode ────────────────────────────────────────────────────────────────────

/** Returns the current [themeMode] attribute value, defaulting to AUTO. */
export function getMode(element: Element = document.documentElement): ThemeMode {
  const val = element.getAttribute(ATTR_MODE);
  if (val === ThemeMode.LIGHT) return ThemeMode.LIGHT;
  if (val === ThemeMode.DARK) return ThemeMode.DARK;
  if (val === ThemeMode.INVERT) return ThemeMode.INVERT;
  return ThemeMode.AUTO;
}

/** Sets the [themeMode] attribute on the given element and persists if configured. */
export function setMode(mode: ThemeMode, element: Element = document.documentElement): void {
  element.setAttribute(ATTR_MODE, mode);
  _saveMode(mode);
}

/** Returns the resolved mode — if AUTO or INVERT, reads prefers-color-scheme. */
export function getEffectiveMode(
  element: Element = document.documentElement,
): ThemeMode.LIGHT | ThemeMode.DARK {
  const mode = getMode(element);
  if (mode === ThemeMode.LIGHT) return ThemeMode.LIGHT;
  if (mode === ThemeMode.DARK) return ThemeMode.DARK;
  return getPreferredMode();
}

/** Returns the system preferred color scheme. */
export function getPreferredMode(): ThemeMode.LIGHT | ThemeMode.DARK {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? ThemeMode.DARK
    : ThemeMode.LIGHT;
}

// ─── Watch ───────────────────────────────────────────────────────────────────

/**
 * Watches for mode changes on the given element.
 * Fires when the [themeMode] attribute changes OR when prefers-color-scheme
 * changes (relevant when mode is AUTO or INVERT).
 * Returns a cleanup function — call it to stop watching.
 */
export function watchMode(
  callback: (mode: ThemeMode) => void,
  options: WatchOptions = {},
): () => void {
  const el = options.element ?? document.documentElement;
  const notify = () => callback(getMode(el));

  // Watch [themeMode] attribute changes on the element.
  const observer = new MutationObserver(notify);
  observer.observe(el, { attributes: true, attributeFilter: [ATTR_MODE] });

  // Also fire when the system color scheme changes — only relevant for AUTO / INVERT.
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  const onSystemChange = () => {
    const mode = getMode(el);
    if (mode === ThemeMode.AUTO || mode === ThemeMode.INVERT) notify();
  };
  mql.addEventListener('change', onSystemChange);

  return () => {
    observer.disconnect();
    mql.removeEventListener('change', onSystemChange);
  };
}

/**
 * Watches for [theme] attribute changes on the given element.
 * Returns a cleanup function.
 */
export function watchTheme(
  callback: (theme: string | null) => void,
  options: WatchOptions = {},
): () => void {
  const el = options.element ?? document.documentElement;
  const observer = new MutationObserver(() => callback(getTheme(el)));
  observer.observe(el, { attributes: true, attributeFilter: [ATTR_THEME] });
  return () => observer.disconnect();
}

// ─── Discovery ───────────────────────────────────────────────────────────────

/** Regex to extract theme name from a [theme="name"] selector. */
const THEME_SELECTOR_RE = /\[theme="([^"]+)"\]/;

/**
 * Scans all loaded stylesheets for `[theme="..."]` selectors and returns
 * the unique set of theme names found.
 */
export function getAvailableThemes(): ThemeDef[] {
  const names = new Set<string>();

  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      // Cross-origin stylesheet — skip
      continue;
    }
    if (!rules) continue;

    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSStyleRule)) continue;
      // Selector may contain multiple comma-separated parts
      for (const part of rule.selectorText.split(',')) {
        const match = THEME_SELECTOR_RE.exec(part);
        if (match) names.add(match[1]);
      }
    }
  }

  return Array.from(names).map((name) => ({ name }));
}

export { ThemeMode, ThemeStorage };
export type { ThemeDef, WatchOptions };
