import { Send, Square } from 'lucide-react'
import { useRef } from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  onStop: () => void
  isStreaming: boolean
  placeholder?: string
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  onStop,
  isStreaming,
  placeholder,
}: Props) {
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
    <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3 md:p-4">
      <div
        className="
        flex items-end gap-2.5 rounded-2xl border border-[var(--color-border)]
        bg-[var(--color-surface)] px-4 py-3
        focus-within:border-[var(--color-accent)]/50 focus-within:ring-4 focus-within:ring-[var(--color-accent)]/8
        shadow-sm transition-all duration-200
      "
      >
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
            <Square size={11} fill="currentColor" aria-hidden />
          </button>
        ) : (
          <button
            onClick={onSend}
            disabled={!value.trim()}
            title="Send"
            className="
              flex h-8 w-8 shrink-0 items-center justify-center rounded-xl
              bg-gradient-to-br from-indigo-500 to-violet-600 text-white
              shadow-md shadow-indigo-500/25
              hover:opacity-90 active:scale-95 transition-all duration-150
              disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none
            "
          >
            <Send size={13} aria-hidden />
          </button>
        )}
      </div>
      <p className="mt-2 text-center text-[10px] text-[var(--color-text-muted)]">
        <kbd className="font-mono">Shift+Enter</kbd> for new line
      </p>
    </div>
  )
}
