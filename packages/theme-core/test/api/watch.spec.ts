import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeMode, setMode, setTheme, watchMode, watchTheme } from '../../src/index.ts';

// watchMode() and watchTheme() report a change of the attribute, whoever made
// it. An HTML document stores an attribute's name in lower case (`thememode`),
// and a MutationObserver's attributeFilter is compared with the stored name:
// filtered on `themeMode` alone the callback never ran in a browser. The same
// is checked in real engines by demos/docs/test/learn.ts (chapter 9).

/** MutationObserver callbacks run in a microtask. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  document.documentElement.removeAttribute('theme');
  document.documentElement.removeAttribute('themeMode');
});

describe('watching the attributes', () => {
  it('the mode attribute is stored in lower case in an HTML document', () => {
    setMode(ThemeMode.DARK);
    expect(document.documentElement.getAttributeNames()).toContain('thememode');
  });

  it('watchMode runs when setMode changes the mode', async () => {
    const seen: ThemeMode[] = [];
    const stop = watchMode((mode) => seen.push(mode));
    setMode(ThemeMode.DARK);
    await settle();
    expect(seen).toEqual([ThemeMode.DARK]);
    stop();
  });

  it('watchMode runs when the attribute is set by something else', async () => {
    const seen: ThemeMode[] = [];
    const stop = watchMode((mode) => seen.push(mode));
    document.documentElement.setAttribute('themeMode', 'light');
    await settle();
    expect(seen).toEqual([ThemeMode.LIGHT]);
    stop();
  });

  it('watchMode stops when its cleanup is called', async () => {
    const seen: ThemeMode[] = [];
    watchMode((mode) => seen.push(mode))();
    setMode(ThemeMode.DARK);
    await settle();
    expect(seen).toEqual([]);
  });

  it('watchMode ignores other attributes', async () => {
    const seen: ThemeMode[] = [];
    const stop = watchMode((mode) => seen.push(mode));
    setTheme('ocean');
    await settle();
    expect(seen).toEqual([]);
    stop();
  });

  it('watchTheme runs when the theme changes', async () => {
    const seen: (string | null)[] = [];
    const stop = watchTheme((theme) => seen.push(theme));
    setTheme('ocean');
    await settle();
    expect(seen).toEqual(['ocean']);
    stop();
  });
});
