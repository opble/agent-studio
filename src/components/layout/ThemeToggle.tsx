import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      className="
        flex h-8 w-8 items-center justify-center rounded-lg
        text-[var(--color-text-muted)] hover:bg-[var(--color-surface-overlay)]
        hover:text-[var(--color-text-primary)] transition-all
      "
    >
      {theme === 'light' ? <Moon size={15} aria-hidden /> : <Sun size={15} aria-hidden />}
    </button>
  )
}
