import { useAuth0 } from '@auth0/auth0-react'
import { ChevronLeft, GitBranch } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Workflow } from '../api/workflows'
import { triggerWorkflow } from '../api/workflows'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import WorkflowForm from '../components/workflows/WorkflowForm'
import WorkflowListItem from '../components/workflows/WorkflowListItem'
import { useWorkflows } from '../hooks/useWorkflows'
import { getApiErrorMessage } from '../utils/error'

export default function WorkflowsPage() {
  const { data: workflows, isLoading, isError, error } = useWorkflows()
  const [selected, setSelected] = useState<Workflow | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { getAccessTokenSilently } = useAuth0()
  const navigate = useNavigate()

  async function handleRun(inputData: Record<string, unknown>) {
    if (!selected) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const token = await getAccessTokenSilently()
      const result = await triggerWorkflow(selected.id, inputData, token)
      // Prefer the workflowId echoed back by Mastra over selected.id — they
      // must match what the status endpoint expects, and Mastra is authoritative.
      const wfId = result.workflowId ?? selected.id
      navigate(`/workflows/${wfId}/runs/${result.runId}`)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to trigger workflow')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-[var(--color-danger)]/40 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-[var(--color-danger)]">
        {getApiErrorMessage(
          error,
          'Failed to load workflows. Check your Mastra server connection.'
        )}
      </div>
    )
  }

  if (!workflows?.length) {
    return (
      <EmptyState
        icon={<GitBranch size={22} aria-hidden />}
        title="No workflows found"
        description="No workflows are registered on this Mastra server."
      />
    )
  }

  return (
    <div className="flex min-h-0 flex-1 gap-4 md:gap-5" style={{ height: 'calc(100dvh - 7rem)' }}>
      {/* Workflow list */}
      <aside
        className={`
        flex flex-col gap-1 overflow-y-auto
        ${selected ? 'hidden md:flex md:w-56 md:shrink-0' : 'flex w-full md:w-56 md:shrink-0'}
      `}
      >
        <p className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
          {workflows.length} workflow{workflows.length !== 1 ? 's' : ''}
        </p>
        <div className="space-y-0.5 px-1">
          {workflows.map(wf => (
            <WorkflowListItem
              key={wf.id}
              workflow={wf}
              isActive={selected?.id === wf.id}
              onClick={() => {
                setSelected(wf)
                setSubmitError(null)
              }}
            />
          ))}
        </div>
      </aside>

      {/* Right panel */}
      {selected && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-sm">
          {/* Panel header */}
          <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-violet-600 text-xs font-bold text-white">
              {selected.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                {selected.name}
              </p>
              {selected.description && (
                <p className="truncate text-xs text-[var(--color-text-muted)]">
                  {selected.description}
                </p>
              )}
            </div>
          </div>

          {/* Mobile back button */}
          <div className="flex items-center border-b border-[var(--color-border)] px-4 py-2 md:hidden">
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-accent)]"
            >
              <ChevronLeft size={14} aria-hidden /> Back to workflows
            </button>
          </div>

          {/* Form body */}
          <div className="flex-1 overflow-y-auto p-4 md:p-5">
            <WorkflowForm
              workflow={selected}
              onSubmit={handleRun}
              isSubmitting={isSubmitting}
              error={submitError}
            />
          </div>
        </div>
      )}
    </div>
  )
}
