import { Copy, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import StreamOutput from '../StreamOutput'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
  /** True when the request failed and no content was received */
  failed?: boolean
}

interface Props {
  message: Message
  /** Passed only for the last assistant message — shows a Retry button */
  onRetry?: () => void
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 rounded px-1.5 py-1 text-xs text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]"
    >
      {icon}
      {label}
    </button>
  )
}

export default function ChatMessage({ message, onRetry }: Props) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    void navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const showActions = !message.streaming && (message.failed ? !!onRetry : true)

  return (
    <div className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div
          className="
            mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full
            bg-gradient-to-br from-indigo-500 to-violet-600
            text-[9px] font-bold tracking-wide text-white shadow-md shadow-indigo-500/20
          "
        >
          AI
        </div>
      )}

      <div className={`flex max-w-[78%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Bubble */}
        <div
          className={`w-full rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'rounded-tr-sm bg-gradient-to-br from-indigo-500 via-[var(--color-accent)] to-violet-600 text-white shadow-lg shadow-indigo-500/20'
              : message.failed
                ? 'rounded-tl-sm border border-[var(--color-danger)]/30 bg-red-50 text-[var(--color-danger)] dark:bg-red-950/20'
                : 'rounded-tl-sm border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] shadow-sm'
          }`}
        >
          {message.streaming && message.content === '' ? (
            <span className="flex items-center gap-1 py-0.5" aria-label="Agent is thinking">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-60 [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-60 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-60 [animation-delay:300ms]" />
            </span>
          ) : message.failed ? (
            <span>Something went wrong. Please try again.</span>
          ) : (
            <StreamOutput text={message.content} streaming={message.streaming} />
          )}
        </div>

        {/* Action row */}
        {showActions && (
          <div className="mt-1 flex items-center gap-0.5 px-1">
            {message.failed ? (
              // Failed: Retry only — no copy (no useful content)
              <ActionButton icon={<RotateCcw size={12} />} label="Retry" onClick={onRetry!} />
            ) : (
              <>
                {/* Retry — assistant messages only, when callback is provided */}
                {!isUser && onRetry && (
                  <ActionButton icon={<RotateCcw size={12} />} label="Retry" onClick={onRetry} />
                )}
                {/* Copy — always available when there is content */}
                {message.content && (
                  <ActionButton
                    icon={<Copy size={12} />}
                    label={copied ? 'Copied!' : 'Copy'}
                    onClick={handleCopy}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
