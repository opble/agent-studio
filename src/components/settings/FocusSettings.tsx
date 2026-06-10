import { Bot, GitBranch, Layers } from 'lucide-react'
import type { ReactNode } from 'react'
import { useSettings } from '../../contexts/SettingsContext'
import type { UserSettings } from '../../utils/settings'

type Focus = UserSettings['focus']

interface FocusOptionProps {
  value: Focus
  current: Focus
  label: string
  description: string
  icon: ReactNode
  onSelect: (f: Focus) => void
}

function FocusOption({ value, current, label, description, icon, onSelect }: FocusOptionProps) {
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

export default function FocusSettings() {
  const { settings, updateSettings } = useSettings()

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Focus</h2>
        <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
          Choose which features to show in the navigation. You can change this any time.
        </p>
      </div>

      <div className="flex gap-3">
        <FocusOption
          value="agent"
          current={settings.focus}
          label="Agent"
          description="Chat with agents only"
          icon={<Bot size={20} aria-hidden />}
          onSelect={f => updateSettings({ focus: f })}
        />
        <FocusOption
          value="workflow"
          current={settings.focus}
          label="Workflow"
          description="Run and monitor workflows"
          icon={<GitBranch size={20} aria-hidden />}
          onSelect={f => updateSettings({ focus: f })}
        />
        <FocusOption
          value="dual"
          current={settings.focus}
          label="Dual"
          description="Agents and workflows"
          icon={<Layers size={20} aria-hidden />}
          onSelect={f => updateSettings({ focus: f })}
        />
      </div>
    </section>
  )
}
