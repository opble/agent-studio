import { ChevronRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import RunStatus from '../components/RunStatus'
import Spinner from '../components/ui/Spinner'
import ResultRenderer from '../components/workflows/ResultRenderer'
import { useSettings } from '../contexts/SettingsContext'
import { useWorkflowRun } from '../hooks/useWorkflowRun'
import { useWorkflows } from '../hooks/useWorkflows'
import { getApiErrorMessage } from '../utils/error'

function Breadcrumb({ workflowId, runId }: { workflowId: string; runId: string }) {
  return (
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
  )
}

export default function WorkflowRunPage() {
  const { workflowId = '', runId = '' } = useParams()
  const { data: run, isLoading, isError, error } = useWorkflowRun(workflowId, runId)
  const { data: workflows } = useWorkflows()
  const workflow = workflows?.find(w => w.id === workflowId) ?? null
  const { settings } = useSettings()
  const is3Pane = settings.layout === '3panes'

  const hasResult =
    run !== undefined &&
    (run.status === 'success' || run.status === 'completed') &&
    run.result !== undefined

  /* ── 2-pane (default) ─────────────────────────────────────────────── */
  if (!is3Pane) {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <Breadcrumb workflowId={workflowId} runId={runId} />
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Run Progress</h2>
        {isLoading && (
          <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-4 shadow-sm">
            <Spinner size="sm" />
            <p className="text-sm text-[var(--color-text-muted)]">Loading run…</p>
          </div>
        )}
        {isError && (
          <div className="rounded-xl border border-[var(--color-danger)]/30 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-[var(--color-danger)]">
            {getApiErrorMessage(
              error,
              'Failed to load run status. It may have been deleted or the server is unreachable.'
            )}
          </div>
        )}
        {run && <RunStatus run={run} workflowId={workflowId} workflow={workflow} />}
      </div>
    )
  }

  /* ── 3-pane: stacked on mobile, side-by-side on desktop ─────────────── */
  return (
    <div className="flex flex-col gap-5 md:flex-row md:[height:calc(100dvh-7rem)]">
      {/* Pane 2 — run summary + steps */}
      <div className="flex flex-col gap-5 md:w-[30%] md:overflow-y-auto">
        <Breadcrumb workflowId={workflowId} runId={runId} />
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Run Progress</h2>
        {isLoading && (
          <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-4 shadow-sm">
            <Spinner size="sm" />
            <p className="text-sm text-[var(--color-text-muted)]">Loading run…</p>
          </div>
        )}
        {isError && (
          <div className="rounded-xl border border-[var(--color-danger)]/30 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-[var(--color-danger)]">
            {getApiErrorMessage(
              error,
              'Failed to load run status. It may have been deleted or the server is unreachable.'
            )}
          </div>
        )}
        {run && <RunStatus run={run} workflowId={workflowId} workflow={workflow} hideResult />}
      </div>

      {/* Pane 3 — result: stacked below on mobile, right column on desktop */}
      <div className="flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-4 md:flex-1 md:overflow-y-auto">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
          Result
        </p>
        {hasResult ? (
          <ResultRenderer result={run.result} />
        ) : (
          <div className="flex flex-1 items-center justify-center py-8">
            <p className="text-center text-sm text-[var(--color-text-muted)]">
              {isLoading || (run && run.status !== 'success' && run.status !== 'completed')
                ? 'Result will appear here when the run completes.'
                : 'No result available.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
