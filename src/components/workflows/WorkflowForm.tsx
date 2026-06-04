import { useState } from 'react'
import type { Workflow } from '../../api/workflows'

interface Props {
  workflow: Workflow
  onSubmit: (inputData: Record<string, unknown>) => void
  isSubmitting: boolean
  error?: string | null
}

export default function WorkflowForm({ workflow, onSubmit, isSubmitting, error }: Props) {
  const [raw, setRaw] = useState('{}')
  const [jsonError, setJsonError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setJsonError(null)
    try {
      const parsed = JSON.parse(raw)
      if (typeof parsed !== 'object' || Array.isArray(parsed)) {
        setJsonError('Input must be a JSON object {}')
        return
      }
      onSubmit(parsed)
    } catch {
      setJsonError('Invalid JSON — please check your input')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[var(--color-text-secondary)]">
          Input Data <span className="font-normal text-[var(--color-text-muted)]">(JSON)</span>
        </label>
        <textarea
          value={raw}
          onChange={e => { setRaw(e.target.value); setJsonError(null) }}
          rows={8}
          spellCheck={false}
          className="
            w-full rounded-xl border border-[var(--color-border)]
            bg-[var(--color-surface-overlay)] px-4 py-3
            font-mono text-sm text-[var(--color-text-primary)]
            placeholder:text-[var(--color-text-muted)]
            focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/10
            transition-all resize-y
          "
          placeholder='{\n  "key": "value"\n}'
        />
        {jsonError && (
          <p className="mt-1.5 text-xs text-[var(--color-danger)]">{jsonError}</p>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-[var(--color-danger)]/40 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="
          flex items-center justify-center gap-2 rounded-xl
          bg-gradient-to-r from-[var(--color-accent)] to-violet-600
          px-4 py-2.5 text-sm font-semibold text-white shadow-sm
          hover:opacity-90 active:scale-[0.98] transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
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
            Run {workflow.name}
          </>
        )}
      </button>
    </form>
  )
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
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
