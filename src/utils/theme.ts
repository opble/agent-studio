export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'agent-studio-theme'

/** Read saved theme from localStorage, falling back to 'light'. */
export function getSavedTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark' || saved === 'light') return saved
  } catch {
    // localStorage unavailable (e.g. SSR or private browsing restriction)
  }
  return 'light'
}

/** Persist the theme choice. */
export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // ignore
  }
}

/** Apply or remove the `dark` class on <html>. */
export function applyTheme(theme: Theme): void {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export function toggleTheme(current: Theme): Theme {
  return current === 'light' ? 'dark' : 'light'
}
