import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ATTR_MODE,
  ATTR_THEME,
  PERSIST_CONFIG_KEY,
  PERSIST_MODE_KEY,
  PERSIST_THEME_KEY,
  ThemeMode,
  ThemeStorage,
  configurePersistence,
  setMode,
  setTheme,
  themeHeadSnippet,
} from '../../src/index.ts';

const root = document.documentElement;

// What a browser does with an inline <script>: run the text as a classic script.
const runSnippet = () => new Function(themeHeadSnippet)();

beforeEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
  sessionStorage.clear();
  // The attributes the page's own HTML carries.
  root.setAttribute('theme', 'html-default');
  root.setAttribute('themeMode', 'light');
});

describe('themeHeadSnippet', () => {
  it('is built from the storage keys and attribute names theme.ts uses', () => {
    for (const part of [
      PERSIST_CONFIG_KEY,
      PERSIST_THEME_KEY,
      PERSIST_MODE_KEY,
      ATTR_THEME,
      ATTR_MODE,
    ]) {
      expect(themeHeadSnippet).toContain(JSON.stringify(part));
    }
    for (const mode of Object.values(ThemeMode)) {
      expect(themeHeadSnippet).toContain(JSON.stringify(mode));
    }
  });

  it('cannot end the <script> element it is pasted into', () => {
    expect(themeHeadSnippet).not.toMatch(/<\/script|<!--/i);
    expect(themeHeadSnippet).not.toContain('\n');
  });

  it('restores theme and mode from localStorage', () => {
    localStorage.setItem(PERSIST_CONFIG_KEY, 'local');
    localStorage.setItem(PERSIST_THEME_KEY, 'rose-red');
    localStorage.setItem(PERSIST_MODE_KEY, 'dark');
    runSnippet();
    expect(root.getAttribute('theme')).toBe('rose-red');
    expect(root.getAttribute('themeMode')).toBe('dark');
  });

  it('restores theme and mode from sessionStorage', () => {
    localStorage.setItem(PERSIST_CONFIG_KEY, 'session');
    sessionStorage.setItem(PERSIST_THEME_KEY, 'cyan-orange');
    sessionStorage.setItem(PERSIST_MODE_KEY, 'invert');
    // Values left in the other storage are not the configured ones.
    localStorage.setItem(PERSIST_THEME_KEY, 'rose-red');
    localStorage.setItem(PERSIST_MODE_KEY, 'dark');
    runSnippet();
    expect(root.getAttribute('theme')).toBe('cyan-orange');
    expect(root.getAttribute('themeMode')).toBe('invert');
  });

  it('restores exactly what setTheme() and setMode() saved', () => {
    const panel = document.createElement('div');
    for (const storage of [ThemeStorage.LOCAL, ThemeStorage.SESSION]) {
      for (const mode of Object.values(ThemeMode)) {
        configurePersistence(ThemeStorage.NONE);
        configurePersistence(storage);
        setTheme(`saved-${storage}`, panel);
        setMode(mode, panel);
        root.setAttribute('theme', 'html-default');
        root.setAttribute('themeMode', 'light');
        runSnippet();
        expect(root.getAttribute('theme')).toBe(`saved-${storage}`);
        expect(root.getAttribute('themeMode')).toBe(mode);
      }
    }
    configurePersistence(ThemeStorage.NONE);
  });

  it('leaves the HTML attributes alone when persistence is none, missing or unknown', () => {
    for (const persist of ['none', null, 'cookie', '']) {
      localStorage.clear();
      if (persist !== null) localStorage.setItem(PERSIST_CONFIG_KEY, persist);
      localStorage.setItem(PERSIST_THEME_KEY, 'rose-red');
      localStorage.setItem(PERSIST_MODE_KEY, 'dark');
      sessionStorage.setItem(PERSIST_THEME_KEY, 'rose-red');
      sessionStorage.setItem(PERSIST_MODE_KEY, 'dark');
      runSnippet();
      expect(root.getAttribute('theme')).toBe('html-default');
      expect(root.getAttribute('themeMode')).toBe('light');
    }
  });

  it('ignores a saved mode that is not auto, light, dark or invert', () => {
    localStorage.setItem(PERSIST_CONFIG_KEY, 'local');
    localStorage.setItem(PERSIST_THEME_KEY, 'rose-red');
    for (const bad of ['DARK', 'dim', '', ' dark', 'dark" onload="x', 'null']) {
      localStorage.setItem(PERSIST_MODE_KEY, bad);
      runSnippet();
      expect(root.getAttribute('themeMode')).toBe('light');
    }
    // The theme beside a bad mode is still restored.
    expect(root.getAttribute('theme')).toBe('rose-red');
  });

  it('ignores an empty or missing saved theme and still restores the mode', () => {
    localStorage.setItem(PERSIST_CONFIG_KEY, 'local');
    localStorage.setItem(PERSIST_MODE_KEY, 'dark');
    runSnippet();
    expect(root.getAttribute('theme')).toBe('html-default');
    expect(root.getAttribute('themeMode')).toBe('dark');
    localStorage.setItem(PERSIST_THEME_KEY, '');
    runSnippet();
    expect(root.getAttribute('theme')).toBe('html-default');
  });

  it('writes a hostile theme name as an attribute value, nothing more', () => {
    localStorage.setItem(PERSIST_CONFIG_KEY, 'local');
    const hostile = '"><img src=x onerror=alert(1)>';
    localStorage.setItem(PERSIST_THEME_KEY, hostile);
    runSnippet();
    expect(root.getAttribute('theme')).toBe(hostile);
    expect(document.querySelector('img')).toBeNull();
  });

  it('does not throw when storage is blocked', () => {
    vi.stubGlobal('localStorage', {
      getItem() {
        throw new DOMException('The operation is insecure.', 'SecurityError');
      },
    });
    expect(runSnippet).not.toThrow();
    expect(root.getAttribute('theme')).toBe('html-default');
    expect(root.getAttribute('themeMode')).toBe('light');
  });

  it('is the inline script of the docs app, character for character', () => {
    const html = readFileSync(
      path.resolve(import.meta.dirname, '../../../../demos/docs/src/index.html'),
      'utf8',
    );
    expect(html).toContain(`<script>${themeHeadSnippet}</script>`);
    // Before any stylesheet, so no frame is painted with the HTML's own theme.
    expect(html.indexOf(themeHeadSnippet)).toBeLessThan(html.indexOf('<link'));
  });

  it('is the head of every Learn example that has one, character for character', () => {
    // demos/docs/src/examples/learn/{chapter}/head.html and X.head.html: what a
    // chapter shows as "put this in <head>" and what its frame runs.
    const learn = path.resolve(import.meta.dirname, '../../../../demos/docs/src/examples/learn');
    const heads = readdirSync(learn).flatMap((chapter) =>
      readdirSync(path.join(learn, chapter))
        .filter((file) => /(?:^|\.)head\.html$/.test(file))
        .map((file) => path.join(learn, chapter, file)),
    );
    expect(heads.length).toBeGreaterThan(0);
    for (const file of heads)
      expect(readFileSync(file, 'utf8'), file).toContain(`<script>${themeHeadSnippet}</script>`);
  });
});
