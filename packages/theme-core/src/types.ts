// ─────────────────────────────────────────────────────────────────────────────
// Types — public interfaces and enums for the cp-theming-core TS API.
// ─────────────────────────────────────────────────────────────────────────────

/** Controls how the theme resolves light vs dark. */
export enum ThemeMode {
  /** Follow the system prefers-color-scheme. Default. */
  AUTO = 'auto',
  LIGHT = 'light',
  DARK = 'dark',
  INVERT = 'invert',
}

/** Where theme and mode selections are persisted across page loads. */
export enum ThemeStorage {
  /** No persistence — selections reset on page reload. */
  NONE = 'none',
  /** Persist in sessionStorage — survives refresh, cleared when tab closes. */
  SESSION = 'session',
  /** Persist in localStorage — survives across tabs and browser restarts. */
  LOCAL = 'local',
}

/** A theme definition discovered from a loaded CSS stylesheet. */
export interface ThemeDef {
  /** Matches the value of the [theme] attribute, e.g. "ocean". */
  name: string;
  // TODO(phase-3): description, previewColors, availablePalettes
}

/**
 * Options for watchMode() — controls which element and callback behaviour.
 * TODO(phase-3): flesh out options
 */
export interface WatchOptions {
  element?: Element;
}
