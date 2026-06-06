import { useAuth0 } from '@auth0/auth0-react'
import { Bot } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import type { AgentMessage } from '../api/agents'
import { getAgentStream } from '../api/agents'
import ChatInput from './agents/ChatInput'
import type { Message } from './agents/ChatMessage'
import ChatMessage from './agents/ChatMessage'
import EmptyState from './ui/EmptyState'

interface Props {
  agentId: string
  agentName: string
}

export default function AgentChat({ agentId, agentName }: Props) {
  const { getAccessTokenSilently } = useAuth0()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  /**
   * Core streaming logic. `history` is the full conversation to send to the agent,
   * already including the new user message (or the same history on retry).
   * Before calling, callers must have already updated `messages` state to include
   * a pending assistant bubble.
   */
  const runStream = useCallback(
    async (history: AgentMessage[]) => {
      setIsStreaming(true)
      abortRef.current = new AbortController()

      try {
        const token = await getAccessTokenSilently()
        const stream = await getAgentStream(agentId, history, token)
        let accumulated = ''

        await stream.processDataStream({
          onChunk: chunk => {
            if (chunk.type === 'text-delta') {
              accumulated += (chunk as { type: 'text-delta'; payload: { text: string } }).payload
                .text
              setMessages(prev => {
                const next = [...prev]
                next[next.length - 1] = { role: 'assistant', content: accumulated, streaming: true }
                return next
              })
              bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
            }
          },
        })

        // Mark complete
        setMessages(prev => {
          const next = [...prev]
          next[next.length - 1] = { role: 'assistant', content: accumulated, streaming: false }
          return next
        })
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        // Encode failure in the message itself — no separate error state
        setMessages(prev => {
          const next = [...prev]
          next[next.length - 1] = { role: 'assistant', content: '', streaming: false, failed: true }
          return next
        })
      } finally {
        setIsStreaming(false)
        abortRef.current = null
      }
    },
    [agentId, getAccessTokenSilently]
  )

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || isStreaming) return

    setInput('')
    const userMsg: Message = { role: 'user', content: text }

    // Drop any lingering failed message, append user turn + pending assistant bubble
    setMessages(prev => [
      ...prev.filter(m => !m.failed),
      userMsg,
      { role: 'assistant', content: '', streaming: true },
    ])

    const history: AgentMessage[] = [...messages.filter(m => !m.failed), userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }))

    await runStream(history)
  }, [input, isStreaming, messages, runStream])

  const retry = useCallback(async () => {
    if (isStreaming) return

    // Replace failed bubble with a fresh pending one; history stays the same
    setMessages(prev => [
      ...prev.filter(m => !m.failed),
      { role: 'assistant', content: '', streaming: true },
    ])

    const history: AgentMessage[] = messages
      .filter(m => !m.failed)
      .map(m => ({ role: m.role, content: m.content }))

    await runStream(history)
  }, [isStreaming, messages, runStream])

  const lastIdx = messages.length - 1

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Messages — this is the only scrolling region */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 md:px-5">
        {messages.length === 0 && (
          <EmptyState
            title={`Chat with ${agentName}`}
            description="Send a message to start the conversation."
            icon={<Bot size={22} aria-hidden />}
          />
        )}
        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            message={msg}
            onRetry={msg.role === 'assistant' && i === lastIdx ? retry : undefined}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <ChatInput
        value={input}
        onChange={setInput}
        onSend={send}
        onStop={() => abortRef.current?.abort()}
        isStreaming={isStreaming}
        placeholder={`Message ${agentName}…`}
      />
    </div>
  )
}
