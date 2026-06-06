import { Moon, Sun } from 'lucide-react'
import { useSettings } from '../../contexts/SettingsContext'
import { useTheme } from '../../hooks/useTheme'
import type { Theme } from '../../utils/theme'

interface ThemeOptionProps {
  value: Theme
  current: Theme
  icon: React.ReactNode
  label: string
  description: string
  onSelect: (t: Theme) => void
}

function ThemeOption({ value, current, icon, label, description, onSelect }: ThemeOptionProps) {
  const isActive = value === current
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={isActive}
      className={`
        flex min-h-[44px] flex-1 flex-col items-center gap-2 rounded-xl border px-4 py-4
        transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]
        ${
          isActive
            ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
            : 'border-[var(--color-border)] bg-[var(--color-surface-overlay)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-surface-raised)]'
        }
      `}
    >
      <span className="flex h-8 w-8 items-center justify-center">{icon}</span>
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-center text-xs text-[var(--color-text-muted)]">{description}</span>
    </button>
  )
}

export default function ThemeSettings() {
  const { theme, toggle } = useTheme()
  const { updateSettings } = useSettings()

  function select(t: Theme) {
    if (t !== theme) {
      toggle()
      updateSettings({ theme: t })
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Appearance</h2>
        <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
          Choose how Agent Studio looks on this device.
        </p>
      </div>

      <div className="flex gap-3">
        <ThemeOption
          value="light"
          current={theme}
          icon={<Sun size={20} aria-hidden />}
          label="Light"
          description="Clean and bright"
          onSelect={select}
        />
        <ThemeOption
          value="dark"
          current={theme}
          icon={<Moon size={20} aria-hidden />}
          label="Dark"
          description="Easy on the eyes"
          onSelect={select}
        />
      </div>
    </section>
  )
}
