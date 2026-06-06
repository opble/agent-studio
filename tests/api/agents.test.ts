import { MastraClient } from '@mastra/client-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAgentStream, listAgents } from '../../src/api/agents'

// ─── Mock SDK ─────────────────────────────────────────────────────────────────
vi.mock('@mastra/client-js', () => ({ MastraClient: vi.fn() }))

const MockMastraClient = MastraClient as ReturnType<typeof vi.fn>

// ─── Tests ───────────────────────────────────────────────────────────────────
describe('listAgents', () => {
  beforeEach(() => MockMastraClient.mockReset())

  function mockSDKAgents(
    record: Record<string, { name: string; description?: string; id?: string }>
  ) {
    MockMastraClient.mockReturnValueOnce({ listAgents: vi.fn().mockResolvedValueOnce(record) })
  }

  it('normalises a Record<agentId, config> response (Mastra SDK default)', async () => {
    const record = {
      weatherAgent: { name: 'Weather Agent', description: 'Gets weather' },
      searchAgent: { name: 'Search Agent' },
    }
    mockSDKAgents(record)
    const result = await listAgents('tok')
    expect(result).toHaveLength(2)
    expect(result.find(a => a.id === 'weatherAgent')).toMatchObject({
      id: 'weatherAgent',
      name: 'Weather Agent',
      description: 'Gets weather',
    })
    expect(result.find(a => a.id === 'searchAgent')).toMatchObject({
      id: 'searchAgent',
      name: 'Search Agent',
    })
  })

  it('prefers the id field on the config over the record key', async () => {
    mockSDKAgents({ agent_key: { id: 'real-id', name: 'Agent' } })
    const [agent] = await listAgents('tok')
    expect(agent.id).toBe('real-id')
  })

  it('falls back to the record key when config has no id field', async () => {
    mockSDKAgents({ my_agent: { name: 'My Agent' } })
    const [agent] = await listAgents('tok')
    expect(agent.id).toBe('my_agent')
  })

  it('returns an empty array for an empty record', async () => {
    mockSDKAgents({})
    expect(await listAgents('tok')).toEqual([])
  })

  it('includes description when present', async () => {
    mockSDKAgents({ a1: { name: 'A', description: 'Desc' } })
    const [a] = await listAgents('tok')
    expect(a.description).toBe('Desc')
  })
})

describe('getAgentStream', () => {
  beforeEach(() => MockMastraClient.mockReset())

  it('calls client.getAgent with the agentId and returns the stream response', async () => {
    const mockStream = { processDataStream: vi.fn() }
    const mockStreamFn = vi.fn().mockResolvedValueOnce(mockStream)
    const mockGetAgent = vi.fn().mockReturnValue({ stream: mockStreamFn })
    MockMastraClient.mockReturnValueOnce({ getAgent: mockGetAgent })

    const messages = [{ role: 'user' as const, content: 'hello' }]
    const result = await getAgentStream('agent-42', messages, 'tok')

    expect(mockGetAgent).toHaveBeenCalledWith('agent-42')
    expect(mockStreamFn).toHaveBeenCalledOnce()
    expect(result).toBe(mockStream)
  })
})
