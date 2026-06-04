import { useParams, useNavigate } from 'react-router-dom'
import { useWorkflowRun } from '../hooks/useWorkflowRun'
import RunStatus from '../components/RunStatus'
import Spinner from '../components/ui/Spinner'

export default function WorkflowRunPage() {
  const { workflowId = '', runId = '' } = useParams()
  const navigate = useNavigate()
  const { data: run, isLoading, isError } = useWorkflowRun(workflowId, runId)

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
        <button
          onClick={() => navigate('/workflows')}
          className="hover:text-[var(--color-accent)] transition-colors"
        >
          Workflows
        </button>
        <span>/</span>
        <span className="font-mono text-[var(--color-text-secondary)]">{workflowId}</span>
        <span>/</span>
        <span className="font-mono text-[var(--color-text-muted)]">{runId.slice(0, 8)}…</span>
      </div>

      <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Run Progress</h2>

      {isLoading && (
        <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-4">
          <Spinner size="sm" />
          <p className="text-sm text-[var(--color-text-muted)]">Loading run…</p>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-[var(--color-danger)]/40 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-[var(--color-danger)]">
          Failed to load run status. It may have been deleted or the server is unreachable.
        </div>
      )}

      {run && <RunStatus run={run} />}
    </div>
  )
}
