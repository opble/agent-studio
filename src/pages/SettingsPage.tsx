import ThemeSettings from '../components/settings/ThemeSettings'

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-lg space-y-8 px-4 py-6 md:px-0">
      <div>
        <h1 className="text-lg font-bold text-[var(--color-text-primary)]">Settings</h1>
        <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
          Manage your Agent Studio preferences.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-sm">
        <ThemeSettings />
      </div>
    </div>
  )
}
