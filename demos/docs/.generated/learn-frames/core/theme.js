// ─────────────────────────────────────────────────────────────────────────────
// Theme API — read/write the active theme and mode on the DOM.
//
// All functions accept an optional `element` parameter. When omitted they
// operate on `document.documentElement` (the <html> element).
// ─────────────────────────────────────────────────────────────────────────────
import { ThemeMode, ThemeStorage } from './types.js';
import {
  ATTR_MODE,
  ATTR_THEME,
  PERSIST_CONFIG_KEY,
  PERSIST_MODE_KEY,
  PERSIST_THEME_KEY,
} from './storage-keys.js';
/** The named Web Storage, or null where it does not exist or may not be used. */
function _webStorage(kind) {
  try {
    // Reading the property itself throws a SecurityError when storage is blocked.
    return globalThis[kind] ?? null;
  } catch {
    return null;
  }
}
function _read(storage, key) {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}
function _write(storage, key, value) {
  try {
    storage?.setItem(key, value);
  } catch {
    // Blocked or over quota: the selection is not saved.
  }
}
function _remove(storage, key) {
  try {
    storage?.removeItem(key);
  } catch {
    // Blocked: nothing to remove.
  }
}
function _isStorage(value) {
  return Object.values(ThemeStorage).includes(value ?? '');
}
function _isMode(value) {
  return Object.values(ThemeMode).includes(value ?? '');
}
// Read from localStorage on first use, not at import. The persist config itself
// is always stored in localStorage so it survives sessions.
let _persistStorage;
function _persistence() {
  if (_persistStorage === undefined) {
    const saved = _read(_webStorage('localStorage'), PERSIST_CONFIG_KEY);
    _persistStorage = _isStorage(saved) ? saved : ThemeStorage.NONE;
  }
  return _persistStorage;
}
function _getStorage() {
  const persistence = _persistence();
  if (persistence === ThemeStorage.LOCAL) return _webStorage('localStorage');
  if (persistence === ThemeStorage.SESSION) return _webStorage('sessionStorage');
  return null;
}
function _saveTheme(theme) {
  _write(_getStorage(), PERSIST_THEME_KEY, theme);
}
function _saveMode(mode) {
  _write(_getStorage(), PERSIST_MODE_KEY, mode);
}
/**
 * Configures where theme and mode selections are persisted.
 * Call once at app startup before restoreTheme/restoreMode.
 * Switching to NONE clears any previously saved values.
 */
export function configurePersistence(storage) {
  _persistStorage = storage;
  const local = _webStorage('localStorage');
  _write(local, PERSIST_CONFIG_KEY, storage);
  if (storage === ThemeStorage.NONE) {
    const session = _webStorage('sessionStorage');
    _remove(local, PERSIST_THEME_KEY);
    _remove(local, PERSIST_MODE_KEY);
    _remove(session, PERSIST_THEME_KEY);
    _remove(session, PERSIST_MODE_KEY);
  }
}
/** Returns the currently configured persistence storage. */
export function getPersistence() {
  return _persistence();
}
/**
 * Reads the persisted theme from storage and applies it to the element.
 * Returns the restored theme name, or null if nothing was saved.
 */
export function restoreTheme(element = document.documentElement) {
  const saved = _read(_getStorage(), PERSIST_THEME_KEY);
  if (!saved) return null;
  setTheme(saved, element);
  return saved;
}
/**
 * Reads the persisted mode from storage and applies it to the element.
 * Returns the restored ThemeMode, or null if nothing was saved or the saved
 * value is not a ThemeMode (the head snippet ignores the same values).
 */
export function restoreMode(element = document.documentElement) {
  const saved = _read(_getStorage(), PERSIST_MODE_KEY);
  if (!_isMode(saved)) return null;
  setMode(saved, element);
  return saved;
}
// ─── Theme ───────────────────────────────────────────────────────────────────
/** Returns the current [theme] attribute value on the given element. */
export function getTheme(element = document.documentElement) {
  return element.getAttribute(ATTR_THEME);
}
/** Sets the [theme] attribute on the given element and persists if configured. */
export function setTheme(theme, element = document.documentElement) {
  element.setAttribute(ATTR_THEME, theme);
  _saveTheme(theme);
}
/** Removes the [theme] attribute from the given element. */
export function clearTheme(element = document.documentElement) {
  element.removeAttribute(ATTR_THEME);
}
// ─── Mode ────────────────────────────────────────────────────────────────────
/** Returns the current [themeMode] attribute value, defaulting to AUTO. */
export function getMode(element = document.documentElement) {
  const val = element.getAttribute(ATTR_MODE);
  if (val === ThemeMode.LIGHT) return ThemeMode.LIGHT;
  if (val === ThemeMode.DARK) return ThemeMode.DARK;
  if (val === ThemeMode.INVERT) return ThemeMode.INVERT;
  return ThemeMode.AUTO;
}
/** Sets the [themeMode] attribute on the given element and persists if configured. */
export function setMode(mode, element = document.documentElement) {
  element.setAttribute(ATTR_MODE, mode);
  _saveMode(mode);
}
/** Returns the resolved mode — if AUTO or INVERT, reads prefers-color-scheme. */
export function getEffectiveMode(element = document.documentElement) {
  const mode = getMode(element);
  if (mode === ThemeMode.LIGHT) return ThemeMode.LIGHT;
  if (mode === ThemeMode.DARK) return ThemeMode.DARK;
  return getPreferredMode(element);
}
/**
 * Returns the system preferred color scheme, read from the window of the given
 * element's document. LIGHT where there is no window to ask (a server).
 */
export function getPreferredMode(element) {
  return _darkQuery(element)?.matches ? ThemeMode.DARK : ThemeMode.LIGHT;
}
/** The prefers-color-scheme query of the element's window, or null without one. */
function _darkQuery(element) {
  const view = element
    ? element.ownerDocument.defaultView
    : typeof window === 'undefined'
      ? null
      : window;
  return typeof view?.matchMedia === 'function'
    ? view.matchMedia('(prefers-color-scheme: dark)')
    : null;
}
// ─── Watch ───────────────────────────────────────────────────────────────────
/**
 * Watches for mode changes on the given element.
 * Fires when the [themeMode] attribute changes OR when prefers-color-scheme
 * changes (relevant when mode is AUTO or INVERT).
 * Returns a cleanup function — call it to stop watching.
 */
export function watchMode(callback, options = {}) {
  const el = options.element ?? document.documentElement;
  const notify = () => callback(getMode(el));
  // Watch [themeMode] attribute changes on the element. An HTML document
  // stores the attribute's name in lower case and the filter is compared with
  // the stored name, so `themeMode` alone never matches there; an XML document
  // (SVG) keeps the case it was written in.
  const observer = new MutationObserver(notify);
  observer.observe(el, {
    attributes: true,
    attributeFilter: [ATTR_MODE, ATTR_MODE.toLowerCase()],
  });
  // Also fire when the system color scheme changes — only relevant for AUTO / INVERT.
  const mql = _darkQuery(el);
  const onSystemChange = () => {
    const mode = getMode(el);
    if (mode === ThemeMode.AUTO || mode === ThemeMode.INVERT) notify();
  };
  mql?.addEventListener('change', onSystemChange);
  return () => {
    observer.disconnect();
    mql?.removeEventListener('change', onSystemChange);
  };
}
/**
 * Watches for [theme] attribute changes on the given element.
 * Returns a cleanup function.
 */
export function watchTheme(callback, options = {}) {
  const el = options.element ?? document.documentElement;
  const observer = new MutationObserver(() => callback(getTheme(el)));
  observer.observe(el, { attributes: true, attributeFilter: [ATTR_THEME] });
  return () => observer.disconnect();
}
// ─── Discovery ───────────────────────────────────────────────────────────────
/** Regex to extract theme name from a [theme="name"] selector. */
const THEME_SELECTOR_RE = /\[theme="([^"]+)"\]/;
/**
 * Scans the stylesheets loaded in the given document (default: `document`) for
 * `[theme="..."]` selectors and returns the unique set of theme names found.
 */
export function getAvailableThemes(doc = document) {
  const names = new Set();
  for (const sheet of Array.from(doc.styleSheets ?? [])) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch {
      // Cross-origin stylesheet — skip
      continue;
    }
    if (!rules) continue;
    for (const rule of Array.from(rules)) {
      // Style rules only, without relying on the global CSSStyleRule (the
      // document may belong to another window).
      const selector = rule.selectorText;
      if (typeof selector !== 'string') continue;
      // Selector may contain multiple comma-separated parts
      for (const part of selector.split(',')) {
        const match = THEME_SELECTOR_RE.exec(part);
        if (match) names.add(match[1]);
      }
    }
  }
  return Array.from(names).map((name) => ({ name }));
}
export { ThemeMode, ThemeStorage };
//# sourceMappingURL=theme.js.map
