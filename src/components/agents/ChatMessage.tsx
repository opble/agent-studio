import StreamOutput from '../StreamOutput'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

interface Props {
  message: Message
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="
          mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full
          bg-gradient-to-br from-indigo-500 to-violet-600
          text-[9px] font-bold tracking-wide text-white shadow-md shadow-indigo-500/20
        ">
          AI
        </div>
      )}
      <div
        className={`
          max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${isUser
            ? 'bg-gradient-to-br from-indigo-500 via-[var(--color-accent)] to-violet-600 text-white rounded-tr-sm shadow-lg shadow-indigo-500/20'
            : 'border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] rounded-tl-sm shadow-sm'
          }
        `}
      >
        <StreamOutput text={message.content} streaming={message.streaming} />
      </div>
    </div>
  )
}
