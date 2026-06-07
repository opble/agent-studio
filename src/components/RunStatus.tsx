import { ChevronDown, Play, PlusCircle, StepForward } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Workflow, WorkflowRun } from '../api/workflows'
import { TERMINAL_STATUSES } from '../api/workflows'
import { useRunActions } from '../hooks/useRunActions'
import Spinner from './ui/Spinner'
import ResultRenderer from './workflows/ResultRenderer'
import RunStepRow from './workflows/RunStepRow'
import StartRunModal from './workflows/StartRunModal'
import StepStatusBadge from './workflows/StepStatusBadge'

interface Props {
  run: WorkflowRun
  workflowId: string
  /** Workflow definition — needed to render the input form when starting a payload-less pending run */
  workflow?: Workflow | null
}

export default function RunStatus({ run, workflowId, workflow }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const isTerminal = TERMINAL_STATUSES.includes(run.status)
  const isPending = run.status === 'pending'
  const isSuspended = run.status === 'suspended' || run.status === 'paused'
  const hasPayload = run.payload && Object.keys(run.payload).length > 0
  const steps = Object.entries(run.steps ?? {})
  const runDate = run.createdAt ?? run.updatedAt
  // Derive actual completion time from step timestamps (createdAt/updatedAt are both
  // set at run-creation time and don't reflect when the workflow finished).
  const stepValues = Object.values(run.steps ?? {})
  const firstStartMs = stepValues.reduce<number | null>(
    (min, s) =>
      s.startedAt != null ? (min == null ? s.startedAt : Math.min(min, s.startedAt)) : min,
    null
  )
  const lastEndMs = stepValues.reduce<number | null>(
    (max, s) => (s.endedAt != null ? (max == null ? s.endedAt : Math.max(max, s.endedAt)) : max),
    null
  )
  const completionTime =
    isTerminal && firstStartMs != null && lastEndMs != null && lastEndMs > firstStartMs
      ? formatDuration(new Date(firstStartMs), new Date(lastEndMs))
      : null
  const navigate = useNavigate()
  const { start, rerun, resume, isActing } = useRunActions(workflowId, run.runId)

  function handleStartClick() {
    if (hasPayload) {
      void start(run.payload)
    } else {
      setModalOpen(true)
    }
  }

  async function handleRerun() {
    const newRunId = await rerun(run.payload ?? {})
    if (newRunId) {
      navigate(`/workflows/${workflowId}/runs/${newRunId}`)
    }
  }

  return (
    <div className="space-y-4">
      {/* Run summary card */}
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-sm">
        {/* Header row — always visible, click to expand */}
        <div className="flex w-full items-center gap-3 px-4 py-3.5">
          {/* Left: expand toggle */}
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex min-w-0 flex-1 items-center gap-3 text-left transition-colors hover:opacity-80"
          >
            <div className="flex items-center gap-2">
              {!isTerminal && !isPending && <Spinner size="sm" />}
              <StepStatusBadge status={run.status} />
            </div>
            <span className="text-xs text-[var(--color-text-muted)]">
              Run{' '}
              <span className="font-mono text-[var(--color-text-secondary)]">
                {run.runId.slice(0, 8)}…
              </span>
            </span>
            <span className="ml-auto flex shrink-0 flex-col items-end gap-0.5">
              {runDate && (
                <span className="text-xs text-[var(--color-text-muted)]">
                  {new Date(runDate).toLocaleString()}
                </span>
              )}
              {completionTime && (
                <span className="text-[11px] text-[var(--color-text-muted)]">
                  completed in {completionTime}
                </span>
              )}
            </span>
          </button>

          {/* Right: action button or chevron */}
          {isPending && (
            <ActionButton
              label="Start"
              icon="play"
              isLoading={isActing}
              disabled={!hasPayload && !workflow}
              onClick={handleStartClick}
            />
          )}
          {isSuspended && (
            <ActionButton
              label="Resume"
              icon="resume"
              isLoading={isActing}
              disabled={false}
              onClick={() => void resume()}
            />
          )}
          <button
            onClick={() => setExpanded(v => !v)}
            className="shrink-0 p-0.5 text-[var(--color-text-muted)] hover:opacity-80 transition-opacity"
          >
            <ChevronDown
              size={14}
              aria-hidden
              className={`shrink-0 text-[var(--color-text-muted)] transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

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

      {/* Error — show generic message with retry + new-run options */}
      {run.status === 'failed' && (
        <div className="flex flex-col gap-3 rounded-xl border border-[var(--color-danger)]/30 bg-red-50 px-4 py-4 dark:bg-red-950/20">
          <p className="text-sm text-[var(--color-danger)]">
            This run didn&apos;t complete successfully. Try again with the same input, or start a
            new run with different settings.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleRerun()}
              disabled={isActing}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow shadow-indigo-500/20 transition-all duration-150 hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isActing ? (
                <Spinner size="sm" />
              ) : (
                <Play size={11} fill="currentColor" aria-hidden />
              )}
              Run again
            </button>
            <Link
              to="/workflows"
              className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]"
            >
              <PlusCircle size={12} aria-hidden />
              New run
            </Link>
          </div>
        </div>
      )}

      {/* Start modal — shown when pending run has no captured payload */}
      {modalOpen && workflow && (
        <StartRunModal
          workflow={workflow}
          workflowId={workflowId}
          runId={run.runId}
          onClose={() => setModalOpen(false)}
          onStarted={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}

function ActionButton({
  label,
  icon,
  isLoading,
  disabled,
  onClick,
}: {
  label: string
  icon: 'play' | 'resume'
  isLoading: boolean
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={isLoading || disabled}
      onClick={e => {
        e.stopPropagation()
        onClick()
      }}
      className="
        flex items-center gap-1.5 rounded-lg
        bg-gradient-to-r from-indigo-500 to-violet-600
        px-3 py-1.5 text-xs font-semibold text-white
        shadow shadow-indigo-500/20
        hover:opacity-90 active:scale-[0.97] transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
      "
    >
      {isLoading ? (
        <Spinner size="sm" />
      ) : icon === 'play' ? (
        <Play size={11} fill="currentColor" aria-hidden />
      ) : (
        <StepForward size={12} aria-hidden />
      )}
      {label}
    </button>
  )
}

function formatDuration(start: Date, end: Date): string {
  const ms = end.getTime() - start.getTime()
  if (ms < 0) return ''
  if (ms < 1000) return `${ms}ms`
  const secs = ms / 1000
  if (secs < 60) return `${secs.toFixed(1)}s`
  const mins = Math.floor(secs / 60)
  const rem = Math.round(secs % 60)
  return rem > 0 ? `${mins}m ${rem}s` : `${mins}m`
}
