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
          mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full
          bg-gradient-to-br from-[var(--color-accent)] to-violet-600 text-[9px] font-bold text-white
        ">
          AI
        </div>
      )}
      <div
        className={`
          max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed
          ${isUser
            ? 'bg-gradient-to-br from-[var(--color-accent)] to-violet-600 text-white rounded-br-sm shadow-sm'
            : 'bg-[var(--color-surface-overlay)] text-[var(--color-text-primary)] rounded-bl-sm'
          }
        `}
      >
        <StreamOutput text={message.content} streaming={message.streaming} />
      </div>
    </div>
  )
}
