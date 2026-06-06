import { useSettings } from '../../contexts/SettingsContext'

export default function MarkdownSettings() {
  const { settings, updateSettings } = useSettings()

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Chat rendering</h2>
        <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
          Control how agent responses are displayed.
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={settings.markdownEnabled}
        onClick={() => updateSettings({ markdownEnabled: !settings.markdownEnabled })}
        className="flex w-full items-center justify-between gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-4 py-3 text-left transition-colors hover:bg-[var(--color-surface-raised)]"
      >
        <div>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">Markdown rendering</p>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            Render agent responses as formatted Markdown with syntax-highlighted code blocks.
          </p>
        </div>

        {/* Toggle pill */}
        <span
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
            settings.markdownEnabled ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
              settings.markdownEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </span>
      </button>
    </section>
  )
}
