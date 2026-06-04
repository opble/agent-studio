import { useEffect } from 'react'
import type { Workflow } from '../../api/workflows'
import { useRunActions } from '../../hooks/useRunActions'
import WorkflowForm from './WorkflowForm'

interface Props {
  workflow: Workflow
  workflowId: string
  runId: string
  onClose: () => void
  /** Called after the run has been successfully started */
  onStarted: () => void
}

export default function StartRunModal({ workflow, workflowId, runId, onClose, onStarted }: Props) {
  const { start, isActing, error } = useRunActions(workflowId, runId)

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  async function handleSubmit(inputData: Record<string, unknown>) {
    await start(inputData)
    onStarted()
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Start ${workflow.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Start Run</p>
            <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{workflow.name}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Form body */}
        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
          <WorkflowForm
            workflow={workflow}
            onSubmit={handleSubmit}
            isSubmitting={isActing}
            error={error}
          />
        </div>
      </div>
    </div>
  )
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
