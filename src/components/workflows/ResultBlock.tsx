import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import CopyButton from '../ui/CopyButton'

interface Props {
  title: string
  copyText: string
  children: React.ReactNode
  /** Start expanded. Defaults to false. */
  defaultExpanded?: boolean
}

/**
 * A collapsible titled block used by ResultRenderer for each result prop.
 * Collapsed by default; pass `defaultExpanded` to start open.
 */
export default function ResultBlock({ title, copyText, children, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-overlay)]">
      {/* Header — click to toggle */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--color-surface-raised)]"
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
          {title}
        </span>

        <span className="flex shrink-0 items-center gap-2">
          <CopyButton text={copyText} />
          <ChevronDown
            size={14}
            aria-hidden
            className={`text-[var(--color-text-muted)] transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {/* Expandable content */}
      {expanded && (
        <div className="border-t border-[var(--color-border)] px-4 py-3">{children}</div>
      )}
    </div>
  )
}
