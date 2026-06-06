import { createMastraClient } from './client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Agent {
  id: string
  name: string
  description?: string
  model?: string
}

export interface AgentMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface GenerateOptions {
  messages: AgentMessage[]
  /** Passed through to the Mastra agent (optional) */
  threadId?: string
  resourceId?: string
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * Lists all registered agents via the SDK.
 * SDK returns Record<agentId, GetAgentResponse> — normalised to Agent[].
 */
export async function listAgents(token: string): Promise<Agent[]> {
  const data = await createMastraClient(token).listAgents()
  return Object.entries(data).map(([id, config]) => ({
    id: config.id ?? id,
    name: config.name,
    description: config.description,
  }))
}

/**
 * Opens a streaming agent response via the SDK.
 * Returns a Response object augmented with `processDataStream()` for
 * consuming SSE chunks. Text content arrives as:
 *   chunk.type === 'text-delta' → chunk.payload.text
 */
export async function getAgentStream(agentId: string, messages: AgentMessage[], token: string) {
  const client = createMastraClient(token)
  const agent = client.getAgent(agentId)
  // MessageListInput is a wide union that includes {role, content} objects at runtime.
  // TypeScript cannot narrow our AgentMessage[] to that union, so we extract the
  // exact parameter type from the overloaded stream() signature via Parameters/typeof.
  type StreamInput = Parameters<typeof agent.stream>[0]
  return agent.stream(messages as unknown as StreamInput)
}
