export default function AboutSettings() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">About</h2>
        <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
          Agent Studio build information.
        </p>
      </div>

      <dl className="space-y-2">
        <Row label="Version" value={`v${__APP_VERSION__}`} />
        <Row label="Build" value={__COMMIT_HASH__} mono />
      </dl>
    </section>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-[var(--color-surface-overlay)] px-3 py-2">
      <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
      <span
        className={`text-xs font-medium text-[var(--color-text-secondary)] ${mono ? 'font-mono' : ''}`}
      >
        {value}
      </span>
    </div>
  )
}
