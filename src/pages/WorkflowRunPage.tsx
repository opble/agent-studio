import { ChevronRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import RunStatus from '../components/RunStatus'
import Spinner from '../components/ui/Spinner'
import { useWorkflowRun } from '../hooks/useWorkflowRun'
import { useWorkflows } from '../hooks/useWorkflows'

export default function WorkflowRunPage() {
  const { workflowId = '', runId = '' } = useParams()
  const { data: run, isLoading, isError } = useWorkflowRun(workflowId, runId)
  const { data: workflows } = useWorkflows()
  const workflow = workflows?.find(w => w.id === workflowId) ?? null

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
        <Link
          to="/workflows"
          className="font-medium transition-colors hover:text-[var(--color-accent)]"
        >
          Workflows
        </Link>
        <ChevronRight size={12} aria-hidden />
        <Link
          to={`/history?workflowId=${workflowId}`}
          className="font-mono transition-colors hover:text-[var(--color-accent)]"
        >
          {workflowId}
        </Link>
        <ChevronRight size={12} aria-hidden />
        <span className="font-mono text-[var(--color-text-muted)]">{runId.slice(0, 8)}…</span>
      </nav>

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

      {run && <RunStatus run={run} workflowId={workflowId} workflow={workflow} />}
    </div>
  )
}
