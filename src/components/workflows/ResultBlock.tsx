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
      {/* Header row: title (left) | copy + chevron (right) */}
      <div className="flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--color-surface-raised)]">
        {/* Title — clicking it also toggles */}
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="flex-1 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]"
        >
          {title}
        </button>

        {/* Right-side controls: copy first, chevron last (right-most) */}
        <div className="flex items-center gap-1">
          <CopyButton text={copyText} />
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            aria-label={expanded ? 'Collapse' : 'Expand'}
            className="flex items-center justify-center rounded p-1 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]"
          >
            <ChevronDown
              size={14}
              aria-hidden
              className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Expandable content */}
      {expanded && (
        <div className="border-t border-[var(--color-border)] px-4 py-3">{children}</div>
      )}
    </div>
  )
}
