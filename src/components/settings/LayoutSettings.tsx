import { useSettings } from '../../contexts/SettingsContext'
import type { UserSettings } from '../../utils/settings'

type Layout = UserSettings['layout']

interface LayoutOptionProps {
  value: Layout
  current: Layout
  label: string
  description: string
  diagram: React.ReactNode
  onSelect: (l: Layout) => void
}

function LayoutOption({
  value,
  current,
  label,
  description,
  diagram,
  onSelect,
}: LayoutOptionProps) {
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
      <span className="flex h-10 w-full items-center justify-center">{diagram}</span>
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-center text-xs text-[var(--color-text-muted)]">{description}</span>
    </button>
  )
}

/** Mini diagram for 2-pane: nav | content */
function TwoPaneDiagram() {
  return (
    <svg width="72" height="40" viewBox="0 0 72 40" fill="none" aria-hidden>
      <rect x="1" y="1" width="70" height="38" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <line x1="18" y1="1" x2="18" y2="39" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

/** Mini diagram for 3-pane: nav | steps | result */
function ThreePaneDiagram() {
  return (
    <svg width="72" height="40" viewBox="0 0 72 40" fill="none" aria-hidden>
      <rect x="1" y="1" width="70" height="38" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <line x1="18" y1="1" x2="18" y2="39" stroke="currentColor" strokeWidth="1.5" />
      <line x1="45" y1="1" x2="45" y2="39" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export default function LayoutSettings() {
  const { settings, updateSettings } = useSettings()

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Layout</h2>
        <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
          Choose how the workflow run view is arranged. 3-pane shows steps and result side by side.
        </p>
      </div>

      <div className="flex gap-3">
        <LayoutOption
          value="2panes"
          current={settings.layout}
          label="2 Panes"
          description="Stacked, single column"
          diagram={<TwoPaneDiagram />}
          onSelect={l => updateSettings({ layout: l })}
        />
        <LayoutOption
          value="3panes"
          current={settings.layout}
          label="3 Panes"
          description="Steps and result side by side"
          diagram={<ThreePaneDiagram />}
          onSelect={l => updateSettings({ layout: l })}
        />
      </div>
    </section>
  )
}
