import { useCallback, useEffect, useState } from 'react'
import { applyTheme, getSavedTheme, saveTheme, toggleTheme, type Theme } from '../utils/theme'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getSavedTheme)

  // Apply on mount and whenever theme changes
  useEffect(() => {
    applyTheme(theme)
    saveTheme(theme)
  }, [theme])

  const toggle = useCallback(() => {
    setTheme(current => toggleTheme(current))
  }, [])

  return { theme, toggle } as const
}
