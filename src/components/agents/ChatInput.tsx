import { useRef } from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  onStop: () => void
  isStreaming: boolean
  placeholder?: string
}

export default function ChatInput({ value, onChange, onSend, onStop, isStreaming, placeholder }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  function handleInput(e: React.FormEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  return (
    <div className="border-t border-[var(--color-border)] p-3 md:p-4">
      <div className="
        flex items-end gap-2 rounded-2xl border border-[var(--color-border)]
        bg-[var(--color-surface-raised)] px-3 py-2.5
        focus-within:border-[var(--color-accent)] focus-within:ring-2 focus-within:ring-[var(--color-accent)]/10
        transition-all
      ">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={placeholder ?? 'Send a message… (Enter to send)'}
          disabled={isStreaming}
          className="
            flex-1 resize-none bg-transparent text-sm
            text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]
            outline-none disabled:opacity-60
          "
          style={{ maxHeight: '160px' }}
        />
        {isStreaming ? (
          <button
            onClick={onStop}
            title="Stop"
            className="
              flex h-8 w-8 shrink-0 items-center justify-center rounded-xl
              bg-[var(--color-danger)]/10 text-[var(--color-danger)]
              hover:bg-[var(--color-danger)]/20 transition-colors
            "
          >
            <StopIcon />
          </button>
        ) : (
          <button
            onClick={onSend}
            disabled={!value.trim()}
            title="Send"
            className="
              flex h-8 w-8 shrink-0 items-center justify-center rounded-xl
              bg-gradient-to-br from-[var(--color-accent)] to-violet-600 text-white shadow-sm
              hover:opacity-90 transition-opacity
              disabled:opacity-30 disabled:cursor-not-allowed
            "
          >
            <SendIcon />
          </button>
        )}
      </div>
      <p className="mt-1.5 text-center text-[10px] text-[var(--color-text-muted)]">
        Shift+Enter for new line
      </p>
    </div>
  )
}

function SendIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  )
}
