import { useState } from 'react'
import StepStatusBadge from './StepStatusBadge'
import type { WorkflowStepResult } from '../../api/workflows'

interface Props {
  stepId: string
  step: WorkflowStepResult
}

export default function RunStepRow({ stepId, step }: Props) {
  const [expanded, setExpanded] = useState(false)
  const hasOutput = step.output !== undefined && step.output !== null
  const hasError = !!step.error

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] overflow-hidden">
      {/* Step header */}
      <button
        onClick={() => (hasOutput || hasError) && setExpanded(v => !v)}
        className={`
          flex w-full items-center gap-3 px-4 py-3 text-left
          ${(hasOutput || hasError) ? 'cursor-pointer hover:bg-[var(--color-surface-overlay)]' : 'cursor-default'}
          transition-colors
        `}
      >
        <StepStatusBadge status={step.status} />
        <span className="flex-1 truncate font-mono text-sm font-medium text-[var(--color-text-primary)]">
          {stepId}
        </span>
        {step.completedAt && step.startedAt && (
          <span className="shrink-0 text-[11px] text-[var(--color-text-muted)]">
            {duration(step.startedAt, step.completedAt)}
          </span>
        )}
        {(hasOutput || hasError) && (
          <ChevronIcon expanded={expanded} />
        )}
      </button>

      {/* Expandable output */}
      {expanded && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-4 py-3">
          {hasError ? (
            <p className="font-mono text-xs text-[var(--color-danger)]">{step.error}</p>
          ) : (
            <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs text-[var(--color-text-secondary)]">
              {JSON.stringify(step.output, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}

function duration(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`shrink-0 text-[var(--color-text-muted)] transition-transform ${expanded ? 'rotate-180' : ''}`}
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
