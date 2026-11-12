// @vitest-environment node
//
// No DOM here: no document, no window, and Web Storage removed. This is what a
// server sees when it imports the package (PORT-PLAN.md Phase 12).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

async function load() {
  vi.resetModules();
  return await import('../../src/index.ts');
}

beforeEach(() => {
  // Node can provide its own localStorage; a server without one is the case under test.
  vi.stubGlobal('localStorage', undefined);
  vi.stubGlobal('sessionStorage', undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('import with no localStorage', () => {
  it('has no DOM and no storage in this environment', () => {
    expect(typeof document).toBe('undefined');
    expect(typeof window).toBe('undefined');
    expect(globalThis.localStorage).toBeUndefined();
  });

  it('imports without throwing', async () => {
    await expect(load()).resolves.toBeDefined();
  });

  it('reports no persistence and takes a configuration without storing it', async () => {
    const api = await load();
    expect(api.getPersistence()).toBe(api.ThemeStorage.NONE);
    expect(() => api.configurePersistence(api.ThemeStorage.LOCAL)).not.toThrow();
    expect(api.getPersistence()).toBe(api.ThemeStorage.LOCAL);
    expect(() => api.configurePersistence(api.ThemeStorage.NONE)).not.toThrow();
  });

  it('answers the system preference with LIGHT when there is no window', async () => {
    const api = await load();
    expect(api.getPreferredMode()).toBe(api.ThemeMode.LIGHT);
  });

  it('imports and works when reading localStorage itself throws', async () => {
    const blocked = {
      get() {
        throw new DOMException('The operation is insecure.', 'SecurityError');
      },
      configurable: true,
    };
    Object.defineProperty(globalThis, 'localStorage', blocked);
    Object.defineProperty(globalThis, 'sessionStorage', blocked);
    try {
      const api = await load();
      expect(api.getPersistence()).toBe(api.ThemeStorage.NONE);
      expect(() => api.configurePersistence(api.ThemeStorage.SESSION)).not.toThrow();
      expect(() => api.configurePersistence(api.ThemeStorage.NONE)).not.toThrow();
    } finally {
      Object.defineProperty(globalThis, 'localStorage', {
        value: undefined,
        configurable: true,
        writable: true,
      });
      Object.defineProperty(globalThis, 'sessionStorage', {
        value: undefined,
        configurable: true,
        writable: true,
      });
    }
  });
});
