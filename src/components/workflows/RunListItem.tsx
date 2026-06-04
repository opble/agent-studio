import { useNavigate } from 'react-router-dom'
import StepStatusBadge from './StepStatusBadge'
import type { WorkflowRun } from '../../api/workflows'

interface Props {
  run: WorkflowRun
  workflowId: string
}

export default function RunListItem({ run, workflowId }: Props) {
  const navigate = useNavigate()
  const stepCount = Object.keys(run.steps ?? {}).length
  const date = run.createdAt ? new Date(run.createdAt) : null

  return (
    <button
      onClick={() => navigate(`/workflows/${workflowId}/runs/${run.runId}`)}
      className="
        group flex w-full items-center gap-3 rounded-xl border border-[var(--color-border)]
        bg-[var(--color-surface-raised)] px-4 py-3.5 text-left
        hover:bg-[var(--color-surface-overlay)] hover:border-[var(--color-text-muted)]/30
        transition-all duration-150 shadow-sm
      "
    >
      <StepStatusBadge status={run.status} />

      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-xs font-medium text-[var(--color-text-primary)]">
          {run.runId}
        </p>
        <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
          {stepCount} step{stepCount !== 1 ? 's' : ''}
          {date && <> · {date.toLocaleString()}</>}
        </p>
      </div>

      <ChevronIcon />
    </button>
  )
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[var(--color-text-muted)] transition-transform group-hover:translate-x-0.5" aria-hidden>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
