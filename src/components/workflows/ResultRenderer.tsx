import { useState } from 'react'

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function isMultiLineString(v: unknown): boolean {
  return typeof v === 'string' && v.includes('\n')
}

type RenderMode = 'prose' | 'cards' | 'json'

function detectMode(result: unknown): RenderMode {
  if (typeof result === 'string') return isMultiLineString(result) ? 'prose' : 'json'
  if (isPlainObject(result) && Object.values(result).some(isMultiLineString)) return 'cards'
  return 'json'
}

interface Props {
  result: unknown
}

export default function ResultRenderer({ result }: Props) {
  const [raw, setRaw] = useState(false)
  const mode: RenderMode = raw ? 'json' : detectMode(result)

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-overlay)] shadow-sm overflow-hidden">
      {/* Toggle */}
      <div className="flex justify-end px-4 pt-3">
        <button
          onClick={() => setRaw(r => !r)}
          className="rounded-full border border-[var(--color-border)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:border-[var(--color-text-muted)] transition-colors"
        >
          {raw ? 'Formatted' : 'Raw JSON'}
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-4 pt-2">
        {mode === 'prose' && (
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {result as string}
          </p>
        )}

        {mode === 'cards' && (
          <div className="space-y-4">
            {Object.entries(result as Record<string, unknown>).map(([key, value]) => (
              <div key={key}>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
                  {key}
                </p>
                {typeof value === 'string' ? (
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {value}
                  </p>
                ) : (
                  <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-[var(--color-text-secondary)]">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}

        {mode === 'json' && (
          <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-[var(--color-text-secondary)]">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}
