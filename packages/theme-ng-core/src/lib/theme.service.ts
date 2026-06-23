// TODO(phase-5): Signal-based Angular service wrapping @cpangular/cp-theming-core.
//
// Will expose:
//   theme        = signal<string | null>       — current [theme] attribute value
//   mode         = signal<ThemeMode>           — current [themeMode] attribute value
//   effectiveMode = computed<ThemeMode.LIGHT | ThemeMode.DARK>
//                                              — resolved mode (auto → system pref)
//
// Implementation notes:
//   - Use Angular inject(DOCUMENT) not direct window/document references
//   - Wire to watchMode() / watchTheme() from @cpangular/cp-theming-core in ngOnInit
//   - Use takeUntilDestroyed() for cleanup
//   - Expose setTheme() and setMode() as methods (delegate to core functions)

import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, Signal, computed, inject, signal } from '@angular/core';
import {
  ThemeDef,
  ThemeMode,
  ThemeStorage,
  clearTheme,
  configurePersistence,
  getAvailableThemes,
  getEffectiveMode,
  getMode,
  getPersistence,
  getTheme,
  restoreMode,
  restoreTheme,
  setMode,
  setTheme,
  watchMode,
  watchTheme,
} from '@cpangular/cp-theming-core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _doc = inject<Document>(DOCUMENT);
  private readonly _destroyRef = inject(DestroyRef);

  private get _root(): Element {
    return this._doc.documentElement;
  }

  // ─── Writable internal signals ─────────────────────────────────────────────

  private readonly _theme = signal<string | null>(getTheme(this._root));
  private readonly _mode = signal<ThemeMode>(getMode(this._root));
  private readonly _availableThemes = signal<ThemeDef[]>(getAvailableThemes());

  // ─── Public readonly signals ───────────────────────────────────────────────

  /** The active [theme] attribute on the root element. */
  readonly theme: Signal<string | null> = this._theme.asReadonly();

  /** The current [themeMode] on the root element (may be AUTO / INVERT). */
  readonly mode: Signal<ThemeMode> = this._mode.asReadonly();

  /**
   * The resolved mode — never AUTO or INVERT.
   * Derived from `mode`; also reacts to prefers-color-scheme via watchMode.
   */
  readonly effectiveMode: Signal<ThemeMode.LIGHT | ThemeMode.DARK> = computed(() =>
    getEffectiveMode(this._root),
  );

  /** Themes found in loaded stylesheets. Refreshed on init; call refreshAvailableThemes() to rescan. */
  readonly availableThemes: Signal<ThemeDef[]> = this._availableThemes.asReadonly();

  // ─── Init ─────────────────────────────────────────────────────────────────

  constructor() {
    const stopWatchMode = watchMode(
      (mode) => {
        this._mode.set(mode);
        // effectiveMode is computed — no explicit set needed; it will recompute.
      },
      { element: this._root },
    );

    const stopWatchTheme = watchTheme(
      (theme) => {
        this._theme.set(theme);
      },
      { element: this._root },
    );

    this._destroyRef.onDestroy(() => {
      stopWatchMode();
      stopWatchTheme();
    });
  }

  // ─── Mutation methods ─────────────────────────────────────────────────────

  /** Sets the active theme on the root element. Pass null to clear. */
  setTheme(name: string | null): void {
    if (name === null) {
      clearTheme(this._root);
    } else {
      setTheme(name, this._root);
    }
    // watchTheme will sync the signal; no manual set needed.
  }

  /** Sets the theme mode on the root element. */
  setMode(mode: ThemeMode): void {
    setMode(mode, this._root);
    // watchMode will sync the signal.
  }

  // ─── Persistence ─────────────────────────────────────────────────────────

  /** Configures where theme and mode are persisted across sessions. */
  configurePersistence(storage: ThemeStorage): void {
    configurePersistence(storage);
  }

  /** Returns the current persistence setting. */
  getPersistence(): ThemeStorage {
    return getPersistence();
  }

  /**
   * Restores the previously persisted theme and mode, applying both to the root element.
   * Call once at app startup after configurePersistence().
   */
  restorePersistedState(): void {
    restoreTheme(this._root);
    restoreMode(this._root);
  }

  // ─── Discovery ───────────────────────────────────────────────────────────

  /** Re-scans loaded stylesheets and updates the availableThemes signal. */
  refreshAvailableThemes(): void {
    this._availableThemes.set(getAvailableThemes());
  }
}
