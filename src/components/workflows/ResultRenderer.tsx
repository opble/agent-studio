import { useState } from 'react'
import CopyButton from '../ui/CopyButton'
import ResultBlock from './ResultBlock'

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

function valueToCopyText(value: unknown): string {
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2)
}

interface Props {
  result: unknown
}

export default function ResultRenderer({ result }: Props) {
  const [raw, setRaw] = useState(false)
  const mode: RenderMode = raw ? 'json' : detectMode(result)

  /* ── Prose: single collapsible block ─────────────────────────────── */
  if (mode === 'prose') {
    return (
      <ResultBlock title="Result" copyText={result as string} defaultExpanded>
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {result as string}
        </p>
      </ResultBlock>
    )
  }

  /* ── Cards: one collapsible block per prop ────────────────────────── */
  if (mode === 'cards') {
    return (
      <div className="space-y-2">
        {Object.entries(result as Record<string, unknown>).map(([key, value], i) => (
          <ResultBlock
            key={key}
            title={key}
            copyText={valueToCopyText(value)}
            defaultExpanded={i === 0}
          >
            {typeof value === 'string' ? (
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {value}
              </p>
            ) : (
              <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-[var(--color-text-secondary)]">
                {JSON.stringify(value, null, 2)}
              </pre>
            )}
          </ResultBlock>
        ))}
      </div>
    )
  }

  /* ── JSON: single block with toolbar ──────────────────────────────── */
  const jsonText = JSON.stringify(result, null, 2)
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-overlay)] shadow-sm">
      <div className="flex items-center justify-end gap-2 px-4 pt-3">
        <CopyButton text={jsonText} />
        <button
          onClick={() => setRaw(r => !r)}
          className="rounded-full border border-[var(--color-border)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
        >
          {raw ? 'Formatted' : 'Raw JSON'}
        </button>
      </div>
      <div className="px-4 pb-4 pt-2">
        <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-[var(--color-text-secondary)]">
          {jsonText}
        </pre>
      </div>
    </div>
  )
}
