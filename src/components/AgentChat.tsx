import { useAuth0 } from '@auth0/auth0-react'
import { Bot } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import type { AgentMessage } from '../api/agents'
import { streamAgentGenerate } from '../api/agents'
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
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || isStreaming) return

    setError(null)
    setInput('')

    const userMsg: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '', streaming: true }])
    setIsStreaming(true)
    abortRef.current = new AbortController()

    try {
      const token = await getAccessTokenSilently()
      const history: AgentMessage[] = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }))
      const response = await streamAgentGenerate(agentId, { messages: history }, token)

      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            const payload = line.slice(6).trim()
            if (payload === '[DONE]') continue
            try {
              const parsed = JSON.parse(payload) as Record<string, unknown>
              const choices = parsed.choices as Array<{ delta: { content?: string } }> | undefined
              accumulated +=
                (parsed.text as string | undefined) ??
                choices?.[0]?.delta?.content ??
                (parsed.content as string | undefined) ??
                ''
            } catch {
              accumulated += payload
            }
          } else if (line && !line.startsWith(':')) {
            accumulated += line
          }
        }

        setMessages(prev => {
          const next = [...prev]
          next[next.length - 1] = { role: 'assistant', content: accumulated, streaming: true }
          return next
        })
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }

      setMessages(prev => {
        const next = [...prev]
        next[next.length - 1] = { role: 'assistant', content: accumulated, streaming: false }
        return next
      })
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }, [input, isStreaming, messages, agentId, getAccessTokenSilently])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Messages — this is the only scrolling region */}
      <div className="min-h-0 flex-1 overflow-y-auto space-y-3 px-4 py-4 md:px-5">
        {messages.length === 0 && (
          <EmptyState
            title={`Chat with ${agentName}`}
            description="Send a message to start the conversation."
            icon={<Bot size={22} aria-hidden />}
          />
        )}
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}
        {error && (
          <div className="rounded-xl border border-[var(--color-danger)]/40 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-[var(--color-danger)]">
            {error}
          </div>
        )}
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
