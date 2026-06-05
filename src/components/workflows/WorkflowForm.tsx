import { useState } from 'react'
import type { Workflow } from '../../api/workflows'
import SchemaForm from './SchemaForm'

interface Props {
  workflow: Workflow
  onSubmit: (inputData: Record<string, unknown>) => void
  isSubmitting: boolean
  error?: string | null
}

/**
 * Routes to SchemaForm (typed fields) when the workflow exposes a parsed
 * inputSchema, otherwise falls back to the raw JSON textarea.
 */
export default function WorkflowForm({ workflow, onSubmit, isSubmitting, error }: Props) {
  if (workflow.inputSchema) {
    return (
      <SchemaForm
        schema={workflow.inputSchema}
        workflowName={workflow.name}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        error={error}
      />
    )
  }
  return (
    <JsonForm
      workflowName={workflow.name}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      error={error}
    />
  )
}

// ─── Fallback: raw JSON textarea ──────────────────────────────────────────────

interface JsonFormProps {
  workflowName: string
  onSubmit: (inputData: Record<string, unknown>) => void
  isSubmitting: boolean
  error?: string | null
}

function JsonForm({ workflowName, onSubmit, isSubmitting, error }: JsonFormProps) {
  const [raw, setRaw] = useState('{}')
  const [jsonError, setJsonError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setJsonError(null)
    try {
      const parsed: unknown = JSON.parse(raw)
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        setJsonError('Input must be a JSON object {}')
        return
      }
      onSubmit(parsed as Record<string, unknown>)
    } catch {
      setJsonError('Invalid JSON — please check your input')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="mb-2 block text-xs font-semibold text-[var(--color-text-secondary)]">
          Input Data{' '}
          <span className="font-normal text-[var(--color-text-muted)]">(JSON object)</span>
        </label>
        <textarea
          value={raw}
          onChange={e => {
            setRaw(e.target.value)
            setJsonError(null)
          }}
          rows={8}
          spellCheck={false}
          className="
            w-full rounded-xl border border-[var(--color-border)]
            bg-[var(--color-surface)] px-4 py-3
            font-mono text-sm text-[var(--color-text-primary)]
            placeholder:text-[var(--color-text-muted)]
            focus:border-[var(--color-accent)]/60 focus:outline-none focus:ring-4 focus:ring-[var(--color-accent)]/8
            transition-all resize-y shadow-sm
          "
          placeholder='{\n  "key": "value"\n}'
        />
        {jsonError && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--color-danger)]">
            <ErrorIcon />
            {jsonError}
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="
          flex items-center justify-center gap-2 rounded-xl
          bg-gradient-to-r from-indigo-500 to-violet-600
          px-4 py-2.5 text-sm font-semibold text-white
          shadow-lg shadow-indigo-500/20
          hover:opacity-90 active:scale-[0.98] transition-all duration-150
          disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
        "
      >
        {isSubmitting ? (
          <>
            <SpinnerIcon />
            Running…
          </>
        ) : (
          <>
            <PlayIcon />
            Run {workflowName}
          </>
        )}
      </button>
    </form>
  )
}

function PlayIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}
