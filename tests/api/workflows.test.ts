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

  it('parses inputSchema string and attaches it to the workflow (Record shape)', async () => {
    const rawSchema = JSON.stringify({
      json: {
        type: 'object',
        properties: { city: { type: 'string', description: 'The city' } },
        required: ['city'],
      },
    })
    const record = { weatherWorkflow: { name: 'Weather', inputSchema: rawSchema } }
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(record)))
    const [wf] = await listWorkflows('tok')
    expect(wf.inputSchema).toMatchObject({
      type: 'object',
      properties: { city: { type: 'string', description: 'The city' } },
      required: ['city'],
    })
  })

  it('silently ignores a malformed inputSchema string', async () => {
    const record = { w1: { name: 'W1', inputSchema: 'not-valid-json' } }
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(record)))
    const [wf] = await listWorkflows('tok')
    expect(wf.inputSchema).toBeUndefined()
  })

  it('returns undefined inputSchema when property is absent', async () => {
    const record = { w1: { name: 'W1' } }
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(record)))
    const [wf] = await listWorkflows('tok')
    expect(wf.inputSchema).toBeUndefined()
  })
})

// ─── triggerWorkflow ──────────────────────────────────────────────────────────
describe('triggerWorkflow', () => {
  // Helper: mock both the create-run call and the start call
  function mockTwoStep(runId = 'r1', workflowId?: string) {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ runId, workflowId })) // create-run response
    )
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Workflow run started' })) // start response
    )
  }

  it('calls create-run first', async () => {
    mockTwoStep()
    await triggerWorkflow('wf1', { city: 'Hanoi' }, 'tok')
    const [path] = mockFetch.mock.calls[0] as [string, unknown, string]
    expect(path).toBe('/api/workflows/wf1/create-run')
  })

  it('calls start with runId as query param', async () => {
    mockTwoStep('run-xyz')
    await triggerWorkflow('wf1', { city: 'Hanoi' }, 'tok')
    const [path] = mockFetch.mock.calls[1] as [string, unknown, string]
    expect(path).toBe('/api/workflows/wf1/start?runId=run-xyz')
  })

  it('passes inputData in the start body', async () => {
    mockTwoStep()
    await triggerWorkflow('wf1', { city: 'Hanoi' }, 'tok')
    const [, opts] = mockFetch.mock.calls[1] as [string, { body: string }, string]
    expect((JSON.parse(opts.body) as Record<string, unknown>).inputData).toEqual({ city: 'Hanoi' })
  })

  it('returns runId from create-run response', async () => {
    mockTwoStep('run-abc')
    const result = await triggerWorkflow('wf1', {}, 'tok')
    expect(result.runId).toBe('run-abc')
  })

  it('surfaces workflowId when present in create-run response', async () => {
    mockTwoStep('r1', 'wf1')
    const result = await triggerWorkflow('wf1', {}, 'tok')
    expect(result.workflowId).toBe('wf1')
  })

  it('throws if create-run response has no runId', async () => {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ status: 'pending' })))
    await expect(triggerWorkflow('wf1', {}, 'tok')).rejects.toThrow()
  })
})

// ─── listRuns ─────────────────────────────────────────────────────────────────

/** Builds a realistic snapshot-wrapped run item as returned by Mastra list endpoint */
function makeSnapshotRun(overrides: Record<string, unknown> = {}) {
  return {
    runId: 'r1',
    workflowName: 'weather-workflow',
    createdAt: '2026-06-04T05:29:28.669Z',
    updatedAt: '2026-06-04T05:29:28.669Z',
    snapshot: {
      status: 'success',
      result: { activities: 'plan text' },
      serializedStepGraph: [
        { type: 'step', step: { id: 'fetch-weather', canSuspend: false } },
        { type: 'step', step: { id: 'plan-activities', canSuspend: false } },
      ],
      context: {
        input: { city: 'ho chi minh' },
        'fetch-weather': {
          status: 'success',
          output: { location: 'Ho Chi Minh City' },
          startedAt: 1780550930739,
          endedAt: 1780550933810,
        },
        'plan-activities': {
          status: 'success',
          output: { activities: 'plan text' },
          startedAt: 1780550933812,
          endedAt: 1780550968668,
        },
      },
    },
    ...overrides,
  }
}

describe('listRuns', () => {
  it('unwraps snapshot and returns correct status', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ runs: [makeSnapshotRun()], total: 1 }))
    )
    const runs = await listRuns('wf1', 'tok')
    expect(runs).toHaveLength(1)
    expect(runs[0].status).toBe('success')
  })

  it('extracts steps from snapshot.context, skipping the input key', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ runs: [makeSnapshotRun()], total: 1 }))
    )
    const [run] = await listRuns('wf1', 'tok')
    expect(Object.keys(run.steps)).toEqual(['fetch-weather', 'plan-activities'])
    expect(run.steps['input']).toBeUndefined()
  })

  it('maps step fields correctly (status, output, startedAt, endedAt)', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ runs: [makeSnapshotRun()], total: 1 }))
    )
    const [run] = await listRuns('wf1', 'tok')
    const step = run.steps['fetch-weather']
    expect(step.status).toBe('success')
    expect(step.output).toEqual({ location: 'Ho Chi Minh City' })
    expect(step.startedAt).toBe(1780550930739)
    expect(step.endedAt).toBe(1780550933810)
  })

  it('includes serializedStepGraph from snapshot', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ runs: [makeSnapshotRun()], total: 1 }))
    )
    const [run] = await listRuns('wf1', 'tok')
    expect(run.serializedStepGraph).toHaveLength(2)
    expect(run.serializedStepGraph![0].step.id).toBe('fetch-weather')
  })

  it('preserves createdAt and updatedAt from the top-level item', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ runs: [makeSnapshotRun()], total: 1 }))
    )
    const [run] = await listRuns('wf1', 'tok')
    expect(run.createdAt).toBe('2026-06-04T05:29:28.669Z')
  })

  it('extracts payload from snapshot.context.input', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ runs: [makeSnapshotRun()], total: 1 }))
    )
    const [run] = await listRuns('wf1', 'tok')
    expect(run.payload).toEqual({ city: 'ho chi minh' })
  })

  it('defaults status to running when snapshot is absent', async () => {
    const bare = { runId: 'r2', workflowName: 'wf', createdAt: '2026-01-01T00:00:00.000Z' }
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ runs: [bare], total: 1 })))
    const [run] = await listRuns('wf1', 'tok')
    expect(run.status).toBe('running')
    expect(run.steps).toEqual({})
  })

  it('returns empty array and logs warning for completely unexpected shape', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify('not an object')))
    const result = await listRuns('wf1', 'tok')
    expect(result).toEqual([])
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[listRuns]'), expect.anything())
    warnSpy.mockRestore()
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
