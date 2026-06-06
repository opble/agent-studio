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
      {/* Header — click title/chevron area to toggle; CopyButton is a sibling, not nested */}
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-[var(--color-surface-raised)]">
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
            {title}
          </span>
          <ChevronDown
            size={14}
            aria-hidden
            className={`ml-auto text-[var(--color-text-muted)] transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </button>

        <CopyButton text={copyText} />
      </div>

      {/* Expandable content */}
      {expanded && (
        <div className="border-t border-[var(--color-border)] px-4 py-3">{children}</div>
      )}
    </div>
  )
}
