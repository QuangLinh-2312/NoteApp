/** Theme preference persisted for NoteApp (syncs with UserSettings.theme). */

export const THEME_STORAGE_KEY = "noteapp-theme";
export const LEGACY_DARK_MODE_KEY = "darkMode";

export const THEME_LIGHT = "light";
export const THEME_DARK = "dark";
export const THEME_AUTO = "auto";

export function isValidThemePreference(value) {
  return (
    value === THEME_LIGHT || value === THEME_DARK || value === THEME_AUTO
  );
}

export function readThemePreferenceFromStorage() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (isValidThemePreference(stored)) return stored;

    const legacy = localStorage.getItem(LEGACY_DARK_MODE_KEY);
    if (legacy === "true") {
      localStorage.setItem(THEME_STORAGE_KEY, THEME_DARK);
      localStorage.removeItem(LEGACY_DARK_MODE_KEY);
      return THEME_DARK;
    }
    if (legacy === "false") {
      localStorage.setItem(THEME_STORAGE_KEY, THEME_LIGHT);
      localStorage.removeItem(LEGACY_DARK_MODE_KEY);
      return THEME_LIGHT;
    }
  } catch (_) {
    /* ignore */
  }
  return THEME_LIGHT;
}

export function writeThemePreferenceToStorage(preference) {
  try {
    if (isValidThemePreference(preference)) {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
      localStorage.removeItem(LEGACY_DARK_MODE_KEY);
    }
  } catch (_) {
    /* ignore */
  }
}

export function resolveEffectiveDark(preference) {
  if (preference === THEME_DARK) return true;
  if (preference === THEME_LIGHT) return false;
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return false;
}

export function applyDarkClassToDocument(isDark) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", isDark);
}

export function bootstrapThemeFromStorage() {
  const pref = readThemePreferenceFromStorage();
  applyDarkClassToDocument(resolveEffectiveDark(pref));
}
