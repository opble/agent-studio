import { AlertCircle, Play } from 'lucide-react'
import { useState } from 'react'
import type { JsonSchemaObject } from '../../api/workflows'
import Spinner from '../ui/Spinner'

interface Props {
  schema: JsonSchemaObject
  workflowName: string
  onSubmit: (data: Record<string, unknown>) => void
  isSubmitting: boolean
  error?: string | null
}

/** Turns a camelCase or kebab-case key into a human-readable label. */
function humanise(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]/g, ' ')
    .replace(/^\s/, '')
    .replace(/\b\w/g, c => c.toUpperCase())
}

export default function SchemaForm({ schema, workflowName, onSubmit, isSubmitting, error }: Props) {
  const entries = Object.entries(schema.properties)
  const required = new Set(schema.required ?? [])

  // All field values stored as strings; coerced to the right type on submit
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(entries.map(([key]) => [key, '']))
  )
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function setValue(key: string, val: string) {
    setValues(prev => ({ ...prev, [key]: val }))
    if (fieldErrors[key]) setFieldErrors(prev => ({ ...prev, [key]: '' }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errors: Record<string, string> = {}

    // Validate required fields
    for (const key of required) {
      if (!values[key]?.trim()) {
        errors[key] = 'This field is required'
      }
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    // Coerce values to correct types
    const data: Record<string, unknown> = {}
    for (const [key, prop] of entries) {
      const raw = values[key] ?? ''
      if (raw === '' && !required.has(key)) continue // omit optional empty fields
      if (prop.type === 'number' || prop.type === 'integer') {
        data[key] = prop.type === 'integer' ? parseInt(raw, 10) : parseFloat(raw)
      } else if (prop.type === 'boolean') {
        data[key] = raw === 'true'
      } else if (prop.type === 'array' || prop.type === 'object') {
        try {
          data[key] = JSON.parse(raw) as unknown
        } catch {
          errors[key] = 'Must be valid JSON'
        }
      } else {
        data[key] = raw
      }
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {entries.map(([key, prop]) => {
        const isRequired = required.has(key)
        const fieldError = fieldErrors[key]
        const label = humanise(key)
        const inputId = `field-${key}`

        return (
          <div key={key}>
            <label
              htmlFor={inputId}
              className="mb-1.5 block text-xs font-semibold text-[var(--color-text-secondary)]"
            >
              {label}
              {isRequired && (
                <span className="ml-1 text-[var(--color-danger)]" aria-label="required">
                  *
                </span>
              )}
            </label>

            {prop.type === 'boolean' ? (
              <div className="flex items-center gap-2">
                <input
                  id={inputId}
                  type="checkbox"
                  checked={values[key] === 'true'}
                  onChange={e => setValue(key, e.target.checked ? 'true' : 'false')}
                  className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
                />
                <span className="text-sm text-[var(--color-text-muted)]">
                  {prop.description ?? label}
                </span>
              </div>
            ) : prop.type === 'array' || prop.type === 'object' ? (
              <textarea
                id={inputId}
                value={values[key]}
                onChange={e => setValue(key, e.target.value)}
                rows={4}
                spellCheck={false}
                placeholder={prop.type === 'array' ? '[]' : '{}'}
                className={inputClass(!!fieldError)}
              />
            ) : (
              <input
                id={inputId}
                type={prop.type === 'number' || prop.type === 'integer' ? 'number' : 'text'}
                value={values[key]}
                onChange={e => setValue(key, e.target.value)}
                placeholder={prop.description ?? ''}
                step={prop.type === 'integer' ? '1' : 'any'}
                className={inputClass(!!fieldError)}
              />
            )}

            {prop.description && prop.type !== 'boolean' && (
              <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">{prop.description}</p>
            )}

            {fieldError && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-[var(--color-danger)]">
                <AlertCircle size={12} aria-hidden className="shrink-0" />
                {fieldError}
              </p>
            )}
          </div>
        )
      })}

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
            <Spinner size="sm" />
            Running…
          </>
        ) : (
          <>
            <Play size={13} fill="currentColor" aria-hidden />
            Run {workflowName}
          </>
        )}
      </button>
    </form>
  )
}

function inputClass(hasError: boolean) {
  return `
    w-full rounded-xl border
    ${hasError ? 'border-[var(--color-danger)]/60' : 'border-[var(--color-border)]'}
    bg-[var(--color-surface)] px-4 py-2.5
    text-sm text-[var(--color-text-primary)]
    placeholder:text-[var(--color-text-muted)]
    focus:border-[var(--color-accent)]/60 focus:outline-none focus:ring-4 focus:ring-[var(--color-accent)]/8
    transition-all shadow-sm
  `
}
