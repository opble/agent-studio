import type { WorkflowRun } from '../api/workflows'
import { TERMINAL_STATUSES } from '../api/workflows'
import Spinner from './ui/Spinner'
import RunStepRow from './workflows/RunStepRow'
import StepStatusBadge from './workflows/StepStatusBadge'

interface Props {
  run: WorkflowRun
}

export default function RunStatus({ run }: Props) {
  const isTerminal = TERMINAL_STATUSES.includes(run.status)
  const steps = Object.entries(run.steps ?? {})

  return (
    <div className="space-y-4">
      {/* Run summary */}
      <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3.5 shadow-sm">
        <div className="flex items-center gap-2">
          {!isTerminal && <Spinner size="sm" />}
          <StepStatusBadge status={run.status} />
        </div>
        <span className="text-xs text-[var(--color-text-muted)]">
          Run{' '}
          <span className="font-mono text-[var(--color-text-secondary)]">
            {run.runId.slice(0, 8)}…
          </span>
        </span>
        {run.updatedAt && (
          <span className="ml-auto text-xs text-[var(--color-text-muted)]">
            {new Date(run.updatedAt).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Steps */}
      {steps.length > 0 && (
        <div className="space-y-2">
          <p className="px-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
            Steps ({steps.length})
          </p>
          {steps.map(([id, step]) => (
            <RunStepRow key={id} stepId={id} step={step} />
          ))}
        </div>
      )}

      {/* Final result */}
      {(run.status === 'success' || run.status === 'completed') && run.result !== undefined && (
        <div>
          <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
            Result
          </p>
          <pre className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-4 py-4 font-mono text-xs leading-relaxed text-[var(--color-text-secondary)] whitespace-pre-wrap break-words shadow-sm">
            {JSON.stringify(run.result, null, 2)}
          </pre>
        </div>
      )}

      {/* Error */}
      {run.status === 'failed' && run.error && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-red-50 dark:bg-red-950/20 px-4 py-3 font-mono text-sm text-[var(--color-danger)]">
          {run.error}
        </div>
      )}
    </div>
  )
}
