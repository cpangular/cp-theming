(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
var ThemeMode = /* @__PURE__ */ ((ThemeMode2) => {
  ThemeMode2["AUTO"] = "auto";
  ThemeMode2["LIGHT"] = "light";
  ThemeMode2["DARK"] = "dark";
  ThemeMode2["INVERT"] = "invert";
  return ThemeMode2;
})(ThemeMode || {});
var ThemeStorage = /* @__PURE__ */ ((ThemeStorage2) => {
  ThemeStorage2["NONE"] = "none";
  ThemeStorage2["SESSION"] = "session";
  ThemeStorage2["LOCAL"] = "local";
  return ThemeStorage2;
})(ThemeStorage || {});
const ATTR_THEME = "theme";
const ATTR_MODE = "themeMode";
const PERSIST_CONFIG_KEY = "cp-theming--persist";
const PERSIST_THEME_KEY = "cp-theming--theme";
const PERSIST_MODE_KEY = "cp-theming--mode";
function _webStorage(kind) {
  try {
    return globalThis[kind] ?? null;
  } catch {
    return null;
  }
}
function _read(storage, key) {
  try {
    return (storage == null ? void 0 : storage.getItem(key)) ?? null;
  } catch {
    return null;
  }
}
function _write(storage, key, value) {
  try {
    storage == null ? void 0 : storage.setItem(key, value);
  } catch {
  }
}
function _remove(storage, key) {
  try {
    storage == null ? void 0 : storage.removeItem(key);
  } catch {
  }
}
function _isStorage(value) {
  return Object.values(ThemeStorage).includes(value ?? "");
}
function _isMode(value) {
  return Object.values(ThemeMode).includes(value ?? "");
}
let _persistStorage;
function _persistence() {
  if (_persistStorage === void 0) {
    const saved = _read(_webStorage("localStorage"), PERSIST_CONFIG_KEY);
    _persistStorage = _isStorage(saved) ? saved : ThemeStorage.NONE;
  }
  return _persistStorage;
}
function _getStorage() {
  const persistence = _persistence();
  if (persistence === ThemeStorage.LOCAL) return _webStorage("localStorage");
  if (persistence === ThemeStorage.SESSION) return _webStorage("sessionStorage");
  return null;
}
function _saveTheme(theme) {
  _write(_getStorage(), PERSIST_THEME_KEY, theme);
}
function _saveMode(mode) {
  _write(_getStorage(), PERSIST_MODE_KEY, mode);
}
function configurePersistence(storage) {
  _persistStorage = storage;
  const local = _webStorage("localStorage");
  _write(local, PERSIST_CONFIG_KEY, storage);
  if (storage === ThemeStorage.NONE) {
    const session = _webStorage("sessionStorage");
    _remove(local, PERSIST_THEME_KEY);
    _remove(local, PERSIST_MODE_KEY);
    _remove(session, PERSIST_THEME_KEY);
    _remove(session, PERSIST_MODE_KEY);
  }
}
function restoreTheme(element = document.documentElement) {
  const saved = _read(_getStorage(), PERSIST_THEME_KEY);
  if (!saved) return null;
  setTheme(saved, element);
  return saved;
}
function restoreMode(element = document.documentElement) {
  const saved = _read(_getStorage(), PERSIST_MODE_KEY);
  if (!_isMode(saved)) return null;
  setMode(saved, element);
  return saved;
}
function getTheme(element = document.documentElement) {
  return element.getAttribute(ATTR_THEME);
}
function setTheme(theme, element = document.documentElement) {
  element.setAttribute(ATTR_THEME, theme);
  _saveTheme(theme);
}
function setMode(mode, element = document.documentElement) {
  element.setAttribute(ATTR_MODE, mode);
  _saveMode(mode);
}
function watchTheme(callback, options = {}) {
  const el = options.element ?? document.documentElement;
  const observer = new MutationObserver(() => callback(getTheme(el)));
  observer.observe(el, { attributes: true, attributeFilter: [ATTR_THEME] });
  return () => observer.disconnect();
}
const THEME_SELECTOR_RE = /\[theme="([^"]+)"\]/;
function getAvailableThemes(doc = document) {
  const names = /* @__PURE__ */ new Set();
  for (const sheet of Array.from(doc.styleSheets ?? [])) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    if (!rules) continue;
    for (const rule of Array.from(rules)) {
      const selector = rule.selectorText;
      if (typeof selector !== "string") continue;
      for (const part of selector.split(",")) {
        const match = THEME_SELECTOR_RE.exec(part);
        if (match) names.add(match[1]);
      }
    }
  }
  return Array.from(names).map((name) => ({ name }));
}
const q = (value) => JSON.stringify(value);
const isMode = Object.values(ThemeMode).map((mode) => `m===${q(mode)}`).join("||");
`(function(){try{var d=document.documentElement,p=localStorage.getItem(${q(PERSIST_CONFIG_KEY)}),s=p===${q(ThemeStorage.LOCAL)}?localStorage:p===${q(ThemeStorage.SESSION)}?sessionStorage:null;if(!s)return;var t=s.getItem(${q(PERSIST_THEME_KEY)}),m=s.getItem(${q(PERSIST_MODE_KEY)});if(t)d.setAttribute(${q(ATTR_THEME)},t);if(${isMode})d.setAttribute(${q(ATTR_MODE)},m)}catch(e){}})();`;
configurePersistence(ThemeStorage.SESSION);
const forcedPanels = Array.from(
  document.querySelectorAll("[data-forced-theme-panel]")
);
function syncForcedPanels(theme) {
  forcedPanels.forEach((el) => {
    if (theme) el.setAttribute("theme", theme);
    else el.removeAttribute("theme");
  });
}
const restoredTheme = restoreTheme(document.body) ?? "ocean";
if (!getTheme(document.body)) setTheme(restoredTheme, document.body);
if (!restoreMode()) setMode(ThemeMode.AUTO);
syncForcedPanels(restoredTheme);
const select = document.getElementById("theme-select");
function populateThemeSelect() {
  const themes = getAvailableThemes();
  const current = getTheme(document.body);
  select.innerHTML = themes.map(
    (t) => `<option value="${t.name}"${t.name === current ? " selected" : ""}>${t.name}</option>`
  ).join("");
}
populateThemeSelect();
watchTheme(
  (theme) => {
    if (theme && select.value !== theme) select.value = theme;
    syncForcedPanels(theme);
  },
  { element: document.body }
);
window.switchMode = (mode) => {
  setMode(mode);
};
window.switchTheme = (theme) => {
  setTheme(theme, document.body);
};
