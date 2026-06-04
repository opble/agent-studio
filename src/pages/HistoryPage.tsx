import { useState } from 'react'
import type { Workflow } from '../api/workflows'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import RunListItem from '../components/workflows/RunListItem'
import WorkflowListItem from '../components/workflows/WorkflowListItem'
import { useWorkflowRuns } from '../hooks/useWorkflowRuns'
import { useWorkflows } from '../hooks/useWorkflows'

export default function HistoryPage() {
  const { data: workflows, isLoading: loadingWorkflows } = useWorkflows()
  const [selected, setSelected] = useState<Workflow | null>(null)

  if (loadingWorkflows) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!workflows?.length) {
    return (
      <EmptyState
        icon={<HistoryIcon />}
        title="No workflows found"
        description="No workflows are registered on this Mastra server."
      />
    )
  }

  return (
    <div className="flex min-h-0 flex-1 gap-4 md:gap-5" style={{ height: 'calc(100dvh - 7rem)' }}>
      {/* Workflow selector */}
      <aside
        className={`
        flex flex-col gap-1 overflow-y-auto
        ${selected ? 'hidden md:flex md:w-56 md:shrink-0' : 'flex w-full md:w-56 md:shrink-0'}
      `}
      >
        <p className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
          Workflows
        </p>
        <div className="space-y-0.5 px-1">
          {workflows.map(wf => (
            <WorkflowListItem
              key={wf.id}
              workflow={wf}
              isActive={selected?.id === wf.id}
              onClick={() => setSelected(wf)}
            />
          ))}
        </div>
      </aside>

      {/* Runs panel */}
      {selected && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-sm">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-violet-600 text-xs font-bold text-white">
              {selected.name.slice(0, 2).toUpperCase()}
            </div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              {selected.name}
            </p>
          </div>

          {/* Mobile back */}
          <div className="flex items-center border-b border-[var(--color-border)] px-4 py-2 md:hidden">
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-accent)]"
            >
              <ChevronLeftIcon /> Back to workflows
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-5">
            <RunsList workflowId={selected.id} />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── RunsList — isolated so it only mounts when a workflow is selected ────────

function RunsList({ workflowId }: { workflowId: string }) {
  const { data: runs, isLoading, isError, refetch } = useWorkflowRuns(workflowId)

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Spinner size="md" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-danger)]">Failed to load runs.</p>
        <button
          onClick={() => refetch()}
          className="text-xs font-medium text-[var(--color-accent)] hover:underline"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!runs?.length) {
    return (
      <EmptyState
        icon={<HistoryIcon />}
        title="No runs yet"
        description="Trigger a run from the Workflows page to see it here."
      />
    )
  }

  return (
    <div className="space-y-2">
      <p className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
        {runs.length} run{runs.length !== 1 ? 's' : ''}
      </p>
      {runs.map(run => (
        <RunListItem key={run.runId} run={run} workflowId={workflowId} />
      ))}
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function HistoryIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 15" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}
