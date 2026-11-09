import { afterEach, describe, expect, it } from 'vitest';
import path from 'node:path';
import { getAvailableThemes } from '../../src/index.ts';
import { compileFile, coreDir } from '../lib/sass.ts';

function addStyle(css: string): HTMLStyleElement {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  return style;
}

const names = () => getAvailableThemes().map((t) => t.name);

afterEach(() => {
  document.head.querySelectorAll('style').forEach((s) => s.remove());
});

describe('getAvailableThemes', () => {
  it('returns an empty list when no theme rule is loaded', () => {
    addStyle('.plain { color: red } [palette="primary"] { --x: 1 }');
    expect(names()).toEqual([]);
  });

  it('lists each [theme="name"] once, from any part of a selector list', () => {
    addStyle(`
      [theme="ocean"], body { --x: 1 }
      [theme="ocean"] [palette="primary"] { --y: 2 }
      .wrapper [theme="ember"] { --x: 2 }
      .plain { color: red }
    `);
    expect(names()).toEqual(['ocean', 'ember']);
  });

  it('collects themes across several stylesheets', () => {
    addStyle('[theme="ocean"] { --x: 1 }');
    addStyle('[theme="ember"] { --x: 2 } [theme="ocean"] { --z: 3 }');
    expect(names()).toEqual(['ocean', 'ember']);
  });

  it('finds the compiled preset themes', () => {
    for (const preset of ['azure-blue', 'rose-red']) {
      addStyle(compileFile(path.join(coreDir, 'scss', 'presets', `${preset}.scss`)).css);
    }
    expect(names()).toEqual(expect.arrayContaining(['azure-blue', 'rose-red']));
  });
});
