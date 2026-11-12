// ─────────────────────────────────────────────────────────────────────────────
// Types — public interfaces and enums for the cp-theming-core TS API.
// ─────────────────────────────────────────────────────────────────────────────
/** Controls how the theme resolves light vs dark. */
export var ThemeMode;
(function (ThemeMode) {
  /** Follow the system prefers-color-scheme. Default. */
  ThemeMode['AUTO'] = 'auto';
  ThemeMode['LIGHT'] = 'light';
  ThemeMode['DARK'] = 'dark';
  ThemeMode['INVERT'] = 'invert';
})(ThemeMode || (ThemeMode = {}));
/** Where theme and mode selections are persisted across page loads. */
export var ThemeStorage;
(function (ThemeStorage) {
  /** No persistence — selections reset on page reload. */
  ThemeStorage['NONE'] = 'none';
  /** Persist in sessionStorage — survives refresh, cleared when tab closes. */
  ThemeStorage['SESSION'] = 'session';
  /** Persist in localStorage — survives across tabs and browser restarts. */
  ThemeStorage['LOCAL'] = 'local';
})(ThemeStorage || (ThemeStorage = {}));
//# sourceMappingURL=types.js.map
