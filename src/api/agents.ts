import { mastraFetch } from './client'

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
 * GET /api/agents — returns the list of all registered agents.
 *
 * Mastra returns a Record<agentId, agentConfig> object.
 * We normalise all shapes (Record, plain array, {agents:[]}) into Agent[].
 */
export async function listAgents(token: string): Promise<Agent[]> {
  const res = await mastraFetch('/api/agents', { method: 'GET' }, token)
  const data: unknown = await res.json()

  // Shape 1: plain array
  if (Array.isArray(data)) return data as Agent[]

  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>

    // Shape 2: { agents: [...] }
    if (Array.isArray(obj.agents)) return obj.agents as Agent[]

    // Shape 3 (Mastra default): Record<agentId, agentConfig>
    return Object.entries(obj).map(([id, config]) => ({
      id,
      ...(config as Omit<Agent, 'id'>),
    }))
  }

  return []
}

/**
 * POST /api/agents/:agentId/generate — streams the agent response.
 *
 * Returns the raw Response so the caller can consume the ReadableStream.
 * Throws ApiError on non-2xx.
 */
export async function streamAgentGenerate(
  agentId: string,
  options: GenerateOptions,
  token: string
): Promise<Response> {
  return mastraFetch(
    `/api/agents/${agentId}/generate`,
    {
      method: 'POST',
      body: JSON.stringify({
        messages: options.messages,
        ...(options.threadId ? { threadId: options.threadId } : {}),
        ...(options.resourceId ? { resourceId: options.resourceId } : {}),
        stream: true,
      }),
    },
    token
  )
}
