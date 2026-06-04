import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mastraFetch } from '../../src/api/client'
import { getRun, listRuns, listWorkflows, triggerWorkflow } from '../../src/api/workflows'

vi.mock('../../src/api/client', () => ({ mastraFetch: vi.fn() }))
const mockFetch = mastraFetch as ReturnType<typeof vi.fn>

beforeEach(() => mockFetch.mockReset())

// ─── listWorkflows ────────────────────────────────────────────────────────────
describe('listWorkflows', () => {
  it('normalises Record<id, config> (Mastra default shape)', async () => {
    const record = {
      weatherWorkflow: { name: 'Weather Workflow', description: 'Gets weather' },
      searchWorkflow: { name: 'Search Workflow' },
    }
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(record)))
    const result = await listWorkflows('tok')
    expect(result).toHaveLength(2)
    expect(result.find(w => w.id === 'weatherWorkflow')).toMatchObject({
      id: 'weatherWorkflow',
      name: 'Weather Workflow',
    })
  })

  it('handles plain array response', async () => {
    const arr = [{ id: 'w1', name: 'W1' }]
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(arr)))
    const result = await listWorkflows('tok')
    expect(result).toEqual(arr)
  })

  it('handles { workflows: [] } response', async () => {
    const workflows = [{ id: 'w1', name: 'W1' }]
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ workflows })))
    expect(await listWorkflows('tok')).toEqual(workflows)
  })

  it('returns empty array for empty object', async () => {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({})))
    expect(await listWorkflows('tok')).toEqual([])
  })

  it('calls GET /api/workflows', async () => {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify([])))
    await listWorkflows('tok')
    expect(mockFetch).toHaveBeenCalledWith('/api/workflows', { method: 'GET' }, 'tok')
  })
})

// ─── triggerWorkflow ──────────────────────────────────────────────────────────
describe('triggerWorkflow', () => {
  it('posts to the correct path', async () => {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ runId: 'r1' })))
    await triggerWorkflow('wf1', { city: 'Hanoi' }, 'tok')
    const [path] = mockFetch.mock.calls[0] as [string, unknown, string]
    expect(path).toBe('/api/workflows/wf1/start-async')
  })

  it('includes inputData in the body', async () => {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ runId: 'r1' })))
    await triggerWorkflow('wf1', { city: 'Hanoi' }, 'tok')
    const [, opts] = mockFetch.mock.calls[0] as [string, { body: string }, string]
    expect((JSON.parse(opts.body) as Record<string, unknown>).inputData).toEqual({ city: 'Hanoi' })
  })

  it('returns the full run result including runId, status, steps', async () => {
    const payload = { runId: 'run-abc', status: 'completed', result: { ok: true }, steps: {} }
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(payload)))
    const result = await triggerWorkflow('wf1', {}, 'tok')
    expect(result.runId).toBe('run-abc')
    expect(result.status).toBe('completed')
    expect(result.result).toEqual({ ok: true })
  })
})

// ─── listRuns ─────────────────────────────────────────────────────────────────
describe('listRuns', () => {
  it('returns runs from { runs: [] } shape', async () => {
    const runs = [{ runId: 'r1', status: 'completed' }]
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ runs, total: 1 })))
    expect(await listRuns('wf1', 'tok')).toEqual(runs)
  })

  it('returns runs from plain array', async () => {
    const runs = [{ runId: 'r1', status: 'running' }]
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(runs)))
    expect(await listRuns('wf1', 'tok')).toEqual(runs)
  })
})

// ─── getRun ───────────────────────────────────────────────────────────────────
describe('getRun', () => {
  it('calls the correct path', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ runId: 'r1', status: 'running', steps: {} }))
    )
    await getRun('wf1', 'r1', 'tok')
    const [path] = mockFetch.mock.calls[0] as [string, unknown, string]
    expect(path).toBe('/api/workflows/wf1/runs/r1')
  })

  it('returns the run object', async () => {
    const run = { runId: 'r1', status: 'completed', steps: {}, result: { ok: true } }
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(run)))
    expect(await getRun('wf1', 'r1', 'tok')).toEqual(run)
  })
})
