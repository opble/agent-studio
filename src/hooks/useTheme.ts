import { useCallback, useEffect, useState } from 'react'
import { loadSettings, saveSettings } from '../utils/settings'
import { applyTheme, toggleTheme, type Theme } from '../utils/theme'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => loadSettings().theme)

  // Apply on mount and whenever theme changes
  useEffect(() => {
    applyTheme(theme)
    saveSettings({ theme })
  }, [theme])

  const toggle = useCallback(() => {
    setTheme(current => toggleTheme(current))
  }, [])

  return { theme, toggle } as const
}
