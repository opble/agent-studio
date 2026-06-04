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

export default function HealthIndicator() {
  const status = useHealthCheck()
  return (
    <div className="flex items-center gap-1.5" title={labels[status]}>
      <span className={`h-2 w-2 rounded-full ${dotClass[status]}`} aria-hidden />
      <span className="hidden text-xs text-[var(--color-text-muted)] sm:inline">
        {labels[status]}
      </span>
    </div>
  )
}
