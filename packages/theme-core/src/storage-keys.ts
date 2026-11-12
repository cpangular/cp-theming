// ─────────────────────────────────────────────────────────────────────────────
// The attribute names and storage keys that make up the persistence contract.
// theme.ts and the inline head snippet (head-snippet.ts) both read them from
// here, so the snippet cannot drift from what setTheme() / setMode() write.
// ─────────────────────────────────────────────────────────────────────────────

/** Attribute holding the theme name. */
export const ATTR_THEME = 'theme';

/** Attribute holding the theme mode. */
export const ATTR_MODE = 'themeMode';

/**
 * localStorage key holding which storage theme and mode are saved in
 * (`local`, `session` or `none`). Always in localStorage so it survives sessions.
 */
export const PERSIST_CONFIG_KEY = 'cp-theming--persist';

/** Key the theme name is saved under, in the configured storage. */
export const PERSIST_THEME_KEY = 'cp-theming--theme';

/** Key the theme mode is saved under, in the configured storage. */
export const PERSIST_MODE_KEY = 'cp-theming--mode';
