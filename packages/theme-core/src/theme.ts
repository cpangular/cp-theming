// ─────────────────────────────────────────────────────────────────────────────
// Theme API — read/write the active theme and mode on the DOM.
//
// All functions accept an optional `element` parameter. When omitted they
// operate on `document.documentElement` (the <html> element).
// ─────────────────────────────────────────────────────────────────────────────

import { ThemeMode, type ThemeDef, type WatchOptions } from './types.js';

const ATTR_THEME = 'theme';
const ATTR_MODE = 'themeMode';

// ─── Theme ───────────────────────────────────────────────────────────────────

/** Returns the current [theme] attribute value on the given element. */
export function getTheme(element: Element = document.documentElement): string | null {
  return element.getAttribute(ATTR_THEME);
}

/** Sets the [theme] attribute on the given element. */
export function setTheme(theme: string, element: Element = document.documentElement): void {
  element.setAttribute(ATTR_THEME, theme);
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
  return ThemeMode.AUTO;
}

/** Sets the [themeMode] attribute on the given element. */
export function setMode(mode: ThemeMode, element: Element = document.documentElement): void {
  element.setAttribute(ATTR_MODE, mode);
}

/** Returns the resolved mode — if AUTO, reads prefers-color-scheme. */
export function getEffectiveMode(element: Element = document.documentElement): ThemeMode.LIGHT | ThemeMode.DARK {
  const mode = getMode(element);
  if (mode !== ThemeMode.AUTO) return mode;
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
 * Watches for theme or mode changes on the given element.
 * Returns a cleanup function — call it to stop watching.
 * TODO(phase-3): also watch prefers-color-scheme changes via MediaQueryList
 */
export function watchMode(
  callback: (mode: ThemeMode) => void,
  options: WatchOptions = {},
): () => void {
  const el = options.element ?? document.documentElement;
  const observer = new MutationObserver(() => callback(getMode(el)));
  observer.observe(el, { attributes: true, attributeFilter: [ATTR_MODE] });
  return () => observer.disconnect();
}

/**
 * Watches for [theme] attribute changes on the given element.
 * Returns a cleanup function.
 * TODO(phase-3): scan available themes from loaded stylesheets
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

/**
 * Scans loaded stylesheets for available theme definitions.
 * TODO(phase-3): implement stylesheet scanning via CSSStyleSheet API
 */
export function getAvailableThemes(): ThemeDef[] {
  // TODO(phase-3): iterate document.styleSheets, look for [theme="*"] rules
  return [];
}

export { ThemeMode };
export type { ThemeDef, WatchOptions };
