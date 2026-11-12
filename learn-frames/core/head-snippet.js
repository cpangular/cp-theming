// ─────────────────────────────────────────────────────────────────────────────
// Inline head snippet — applies the saved theme and mode before first paint.
//
// restoreTheme() / restoreMode() run when the app's bundle runs, which is after
// the browser has painted the theme written in the HTML. This snippet is plain
// JavaScript text to put in an inline <script> in <head>, where it runs before
// the first frame.
//
// It is the one place that reads the global `document`: it is not called with
// an element, it is pasted into a page, and <html> is the only element that
// exists when it runs.
// ─────────────────────────────────────────────────────────────────────────────
import { ATTR_MODE, ATTR_THEME, PERSIST_CONFIG_KEY, PERSIST_MODE_KEY, PERSIST_THEME_KEY, } from './storage-keys.js';
import { ThemeMode, ThemeStorage } from './types.js';
const q = (value) => JSON.stringify(value);
const isMode = Object.values(ThemeMode)
    .map((mode) => `m===${q(mode)}`)
    .join('||');
/**
 * JavaScript source that restores the persisted theme and mode onto `<html>`.
 * Put it in an inline `<script>` in `<head>`, before the stylesheets:
 *
 * ```html
 * <script>/* value of themeHeadSnippet *\/</script>
 * ```
 *
 * It reads the storage chosen with `configurePersistence()`; when that is
 * `local` or `session` it sets `theme` from the saved name and `themeMode`
 * from the saved mode, ignoring a mode that is not `auto`, `light`, `dark` or
 * `invert`. With nothing saved, or storage unavailable, it leaves the
 * attributes written in the HTML alone.
 *
 * Under a Content-Security-Policy without `'unsafe-inline'` the `<script>`
 * needs the page's nonce (`<script nonce="…">`) or its hash in `script-src`.
 */
export const themeHeadSnippet = `(function(){try{` +
    `var d=document.documentElement,` +
    `p=localStorage.getItem(${q(PERSIST_CONFIG_KEY)}),` +
    `s=p===${q(ThemeStorage.LOCAL)}?localStorage:p===${q(ThemeStorage.SESSION)}?sessionStorage:null;` +
    `if(!s)return;` +
    `var t=s.getItem(${q(PERSIST_THEME_KEY)}),m=s.getItem(${q(PERSIST_MODE_KEY)});` +
    `if(t)d.setAttribute(${q(ATTR_THEME)},t);` +
    `if(${isMode})d.setAttribute(${q(ATTR_MODE)},m)` +
    `}catch(e){}})();`;
//# sourceMappingURL=head-snippet.js.map