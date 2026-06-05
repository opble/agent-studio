import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listAgents, streamAgentGenerate } from '../../src/api/agents'

// ─── Mock client ──────────────────────────────────────────────────────────────
vi.mock('../../src/api/client', () => ({
  mastraFetch: vi.fn(),
}))

import { mastraFetch } from '../../src/api/client'
const mockFetch = mastraFetch as ReturnType<typeof vi.fn>

// ─── Tests ───────────────────────────────────────────────────────────────────
describe('listAgents', () => {
  beforeEach(() => mockFetch.mockReset())

  it('returns agents from a plain array response', async () => {
    const agents = [{ id: 'a1', name: 'Agent One' }]
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(agents)))

    const result = await listAgents('tok')
    expect(result).toEqual(agents)
  })

  it('returns agents from a { agents: [...] } response', async () => {
    const agents = [{ id: 'a1', name: 'Agent One' }]
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ agents })))

    const result = await listAgents('tok')
    expect(result).toEqual(agents)
  })

  it('returns an empty array when response has no agents key', async () => {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({})))
    const result = await listAgents('tok')
    expect(result).toEqual([])
  })

  it('normalises a Record<agentId, config> response (Mastra default shape)', async () => {
    const record = {
      weatherAgent: { name: 'Weather Agent', description: 'Gets weather', model: 'gpt-4o' },
      searchAgent: { name: 'Search Agent' },
    }
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(record)))
    const result = await listAgents('tok')
    expect(result).toHaveLength(2)
    expect(result.find(a => a.id === 'weatherAgent')).toMatchObject({
      id: 'weatherAgent',
      name: 'Weather Agent',
    })
    expect(result.find(a => a.id === 'searchAgent')).toMatchObject({
      id: 'searchAgent',
      name: 'Search Agent',
    })
  })

  it('calls mastraFetch with correct path and GET method', async () => {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify([])))
    await listAgents('test-token')

    expect(mockFetch).toHaveBeenCalledWith('/api/agents', { method: 'GET' }, 'test-token')
  })
})

describe('streamAgentGenerate', () => {
  beforeEach(() => mockFetch.mockReset())

  it('calls mastraFetch with the correct agent path', async () => {
    const fakeResponse = new Response('', { status: 200 })
    mockFetch.mockResolvedValueOnce(fakeResponse)

    await streamAgentGenerate('agent-42', { messages: [{ role: 'user', content: 'hi' }] }, 'tok')

    expect(mockFetch).toHaveBeenCalledOnce()
    const [path] = mockFetch.mock.calls[0] as [string, unknown, string]
    expect(path).toBe('/api/agents/agent-42/generate')
  })

  it('includes messages in the request body', async () => {
    mockFetch.mockResolvedValueOnce(new Response(''))
    const messages = [{ role: 'user' as const, content: 'Hello' }]
    await streamAgentGenerate('a1', { messages }, 'tok')

    const [, opts] = mockFetch.mock.calls[0] as [string, { body: string }, string]
    const body = JSON.parse(opts.body) as Record<string, unknown>
    expect(body.messages).toEqual(messages)
    expect(body.stream).toBe(true)
  })

  it('omits threadId/resourceId when not provided', async () => {
    mockFetch.mockResolvedValueOnce(new Response(''))
    await streamAgentGenerate('a1', { messages: [] }, 'tok')

    const [, opts] = mockFetch.mock.calls[0] as [string, { body: string }, string]
    const body = JSON.parse(opts.body) as Record<string, unknown>
    expect(body.threadId).toBeUndefined()
    expect(body.resourceId).toBeUndefined()
  })

  it('includes threadId when provided', async () => {
    mockFetch.mockResolvedValueOnce(new Response(''))
    await streamAgentGenerate('a1', { messages: [], threadId: 't-1' }, 'tok')

    const [, opts] = mockFetch.mock.calls[0] as [string, { body: string }, string]
    expect((JSON.parse(opts.body) as Record<string, unknown>).threadId).toBe('t-1')
  })

  it('returns the raw Response', async () => {
    const fake = new Response('stream data', { status: 200 })
    mockFetch.mockResolvedValueOnce(fake)

    const res = await streamAgentGenerate('a1', { messages: [] }, 'tok')
    expect(res).toBe(fake)
  })
})
