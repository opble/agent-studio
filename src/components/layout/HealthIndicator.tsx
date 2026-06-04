import { useHealthCheck } from '../../hooks/useHealthCheck'
import type { HealthStatus } from '../../hooks/useHealthCheck'

const labels: Record<HealthStatus, string> = {
  checking: 'Connecting…',
  connected: 'Connected',
  disconnected: 'Disconnected',
}

const dotClass: Record<HealthStatus, string> = {
  checking: 'bg-[var(--color-warning)] animate-pulse',
  connected: 'bg-[var(--color-success)]',
  disconnected: 'bg-[var(--color-danger)]',
}

const textClass: Record<HealthStatus, string> = {
  checking: 'text-[var(--color-warning)]',
  connected: 'text-[var(--color-success)]',
  disconnected: 'text-[var(--color-danger)]',
}

export default function HealthIndicator() {
  const status = useHealthCheck()
  return (
    <div
      className="flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-2.5 py-1"
      title={labels[status]}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass[status]}`} aria-hidden />
      <span className={`hidden text-[11px] font-medium sm:inline ${textClass[status]}`}>
        {labels[status]}
      </span>
    </div>
  )
}
