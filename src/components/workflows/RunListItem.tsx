import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Workflow, WorkflowRun } from '../../api/workflows'
import { useRunActions } from '../../hooks/useRunActions'
import StartRunModal from './StartRunModal'
import StepStatusBadge from './StepStatusBadge'

interface Props {
  run: WorkflowRun
  workflowId: string
  workflow?: Workflow | null
}

export default function RunListItem({ run, workflowId, workflow }: Props) {
  const navigate = useNavigate()
  const { start, resume, isActing } = useRunActions(workflowId, run.runId)
  const [modalOpen, setModalOpen] = useState(false)
  const date = run.createdAt ? new Date(run.createdAt) : null
  const isPending = run.status === 'pending'
  const isSuspended = run.status === 'suspended' || run.status === 'paused'
  const hasPayload = run.payload && Object.keys(run.payload).length > 0
  const runPath = `/workflows/${workflowId}/runs/${run.runId}`

  // Steps done = entries in steps map (populated as each step completes)
  const doneCount = Object.keys(run.steps ?? {}).length
  // Total steps = from the static step graph (always present in the run record)
  const totalCount = run.serializedStepGraph?.filter(e => e.type === 'step').length ?? 0
  const stepLabel =
    totalCount > 0
      ? `${doneCount}/${totalCount} step${totalCount !== 1 ? 's' : ''}`
      : doneCount > 0
        ? `${doneCount} step${doneCount !== 1 ? 's' : ''}`
        : 'no steps'

  async function handleAction(e: React.MouseEvent) {
    e.stopPropagation()
    if (isPending) {
      if (hasPayload) {
        await start(run.payload)
        navigate(runPath)
      } else {
        // No payload — open modal to collect input, then navigate on success
        setModalOpen(true)
      }
    } else if (isSuspended) {
      await resume()
      navigate(runPath)
    }
  }

  return (
    <div
      className="
        group flex w-full items-center gap-3 rounded-xl border border-[var(--color-border)]
        bg-[var(--color-surface-raised)] px-4 py-3.5
        hover:bg-[var(--color-surface-overlay)] hover:border-[var(--color-text-muted)]/30
        transition-all duration-150 shadow-sm
      "
    >
      {/* Clickable main area */}
      <button
        onClick={() => navigate(runPath)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <StepStatusBadge status={run.status} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-xs font-medium text-[var(--color-text-primary)]">
            {run.runId}
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
            {stepLabel}
            {date && <> · {date.toLocaleString()}</>}
          </p>
        </div>
      </button>

      {/* Action button for pending / suspended */}
      {isPending || isSuspended ? (
        <button
          type="button"
          disabled={isActing || (isPending && !hasPayload && !workflow)}
          onClick={handleAction}
          className="
            flex shrink-0 items-center gap-1.5 rounded-lg
            bg-gradient-to-r from-indigo-500 to-violet-600
            px-2.5 py-1 text-[11px] font-semibold text-white
            shadow shadow-indigo-500/20
            hover:opacity-90 active:scale-[0.97] transition-all duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {isPending ? <PlayIcon /> : <ResumeIcon />}
          {isPending ? 'Start' : 'Resume'}
        </button>
      ) : (
        <ChevronIcon />
      )}

      {/* Modal for pending runs with no captured payload */}
      {modalOpen && workflow && (
        <StartRunModal
          workflow={workflow}
          workflowId={workflowId}
          runId={run.runId}
          onClose={() => setModalOpen(false)}
          onStarted={() => navigate(runPath)}
        />
      )}
    </div>
  )
}

function PlayIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}

function ResumeIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polygon points="5 4 15 12 5 20 5 4" />
      <line x1="19" y1="5" x2="19" y2="19" />
    </svg>
  )
}

function ChevronIcon() {
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
      className="shrink-0 text-[var(--color-text-muted)] transition-transform group-hover:translate-x-0.5"
      aria-hidden
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
