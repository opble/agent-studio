import { useParams, useNavigate } from 'react-router-dom'
import RunStatus from '../components/RunStatus'
import Spinner from '../components/ui/Spinner'
import { useWorkflowRun } from '../hooks/useWorkflowRun'

export default function WorkflowRunPage() {
  const { workflowId = '', runId = '' } = useParams()
  const navigate = useNavigate()
  const { data: run, isLoading, isError } = useWorkflowRun(workflowId, runId)

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
        <button
          onClick={() => navigate('/workflows')}
          className="font-medium hover:text-[var(--color-accent)] transition-colors"
        >
          Workflows
        </button>
        <ChevronIcon />
        <span className="font-mono text-[var(--color-text-secondary)]">{workflowId}</span>
        <ChevronIcon />
        <span className="font-mono text-[var(--color-text-muted)]">{runId.slice(0, 8)}…</span>
      </div>

      <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Run Progress</h2>

      {isLoading && (
        <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-4 shadow-sm">
          <Spinner size="sm" />
          <p className="text-sm text-[var(--color-text-muted)]">Loading run…</p>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-[var(--color-danger)]">
          Failed to load run status. It may have been deleted or the server is unreachable.
        </div>
      )}

      {run && <RunStatus run={run} />}
    </div>
  )
}

function ChevronIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
