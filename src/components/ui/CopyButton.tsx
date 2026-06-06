import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

interface Props {
  /** Text to copy to the clipboard */
  text: string
  /** When true the button is not rendered (e.g. while streaming) */
  disabled?: boolean
}

/**
 * A labelled icon button that copies `text` to the clipboard.
 * Shows "Copied!" + checkmark for 2 s after a successful copy, then resets.
 */
export default function CopyButton({ text, disabled = false }: Props) {
  const [copied, setCopied] = useState(false)

  if (disabled) return null

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API unavailable — silently ignore
    }
  }

  return (
    <button
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
      aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-2.5 py-1.5 text-xs text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-secondary)]"
    >
      {copied ? (
        <Check size={14} className="text-[var(--color-success)]" aria-hidden />
      ) : (
        <Copy size={14} aria-hidden />
      )}
      <span>{copied ? 'Copied!' : 'Copy'}</span>
    </button>
  )
}
