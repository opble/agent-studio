import { useState } from 'react'
import type { WorkflowRun } from '../api/workflows'
import { TERMINAL_STATUSES } from '../api/workflows'
import Spinner from './ui/Spinner'
import ResultRenderer from './workflows/ResultRenderer'
import RunStepRow from './workflows/RunStepRow'
import StepStatusBadge from './workflows/StepStatusBadge'

interface Props {
  run: WorkflowRun
}

export default function RunStatus({ run }: Props) {
  const [expanded, setExpanded] = useState(false)
  const isTerminal = TERMINAL_STATUSES.includes(run.status)
  const steps = Object.entries(run.steps ?? {})
  const runDate = run.createdAt ?? run.updatedAt

  return (
    <div className="space-y-4">
      {/* Run summary card */}
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-sm">
        {/* Header row — always visible, click to expand */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[var(--color-surface-overlay)]"
        >
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
          {runDate && (
            <span className="ml-auto shrink-0 text-xs text-[var(--color-text-muted)]">
              {new Date(runDate).toLocaleString()}
            </span>
          )}
          <ChevronIcon expanded={expanded} />
        </button>

        {/* Expandable body */}
        {expanded && (
          <div className="space-y-4 border-t border-[var(--color-border)] px-4 py-4">
            {/* Full run ID */}
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
                Run ID
              </p>
              <p className="break-all font-mono text-xs text-[var(--color-text-secondary)]">
                {run.runId}
              </p>
            </div>

            {/* Input payload */}
            {run.payload && Object.keys(run.payload).length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
                  Input
                </p>
                <ResultRenderer result={run.payload} />
              </div>
            )}
          </div>
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
          <ResultRenderer result={run.result} />
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

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 text-[var(--color-text-muted)] transition-transform ${expanded ? 'rotate-180' : ''}`}
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
