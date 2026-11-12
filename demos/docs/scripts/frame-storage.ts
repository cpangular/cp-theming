// The docs' own part of a Learn frame that runs a script: linked first in
// <head>, like frame.css is for the styles.
//
// A frame is served from the docs site's own address, so it shares the site's
// localStorage and sessionStorage. An example that saves a theme under
// cp-theming's keys would change the theme the docs site itself has saved, and
// the site's would change the example's. This gives each frame a storage of
// its own: the same two objects, with every key kept under the frame's path.
// The example's files are what a reader would write and know nothing of it.
(() => {
  const prefix = `learn-frame:${location.pathname.split('/').slice(-2).join('/')}:`;

  const scoped = (real: Storage): Storage => {
    const keys = () => Object.keys(real).filter((key) => key.startsWith(prefix));
    return {
      getItem: (key) => real.getItem(prefix + key),
      setItem: (key, value) => real.setItem(prefix + key, String(value)),
      removeItem: (key) => real.removeItem(prefix + key),
      clear: () => keys().forEach((key) => real.removeItem(key)),
      key: (index) => keys()[index]?.slice(prefix.length) ?? null,
      get length() {
        return keys().length;
      },
    };
  };

  for (const name of ['localStorage', 'sessionStorage'] as const) {
    let own: Storage | null = null;
    try {
      own = scoped(window[name]);
    } catch {
      // Storage is blocked: reading it throws for the example too, and the
      // library saves nothing.
      continue;
    }
    Object.defineProperty(window, name, { configurable: true, value: own });
  }
})();
