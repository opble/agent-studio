import { MastraClient } from '@mastra/client-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getRun, listRuns, listWorkflows, triggerWorkflow } from '../../src/api/workflows'

// ─── Mock SDK ─────────────────────────────────────────────────────────────────
vi.mock('@mastra/client-js', () => ({ MastraClient: vi.fn() }))

const MockMastraClient = MastraClient as ReturnType<typeof vi.fn>

beforeEach(() => MockMastraClient.mockReset())

// ─── listWorkflows ────────────────────────────────────────────────────────────
describe('listWorkflows', () => {
  function mockSDKWorkflows(
    record: Record<string, { name: string; description?: string; inputSchema?: string }>
  ) {
    MockMastraClient.mockReturnValueOnce({ listWorkflows: vi.fn().mockResolvedValueOnce(record) })
  }

  it('normalises Record<id, config> (Mastra SDK default shape)', async () => {
    mockSDKWorkflows({
      weatherWorkflow: { name: 'Weather Workflow', description: 'Gets weather' },
      searchWorkflow: { name: 'Search Workflow' },
    })
    const result = await listWorkflows('tok')
    expect(result).toHaveLength(2)
    expect(result.find(w => w.id === 'weatherWorkflow')).toMatchObject({
      id: 'weatherWorkflow',
      name: 'Weather Workflow',
    })
  })

  it('returns empty array for empty record', async () => {
    mockSDKWorkflows({})
    expect(await listWorkflows('tok')).toEqual([])
  })

  it('parses inputSchema string and attaches it to the workflow', async () => {
    const rawSchema = JSON.stringify({
      json: {
        type: 'object',
        properties: { city: { type: 'string', description: 'The city' } },
        required: ['city'],
      },
    })
    mockSDKWorkflows({ weatherWorkflow: { name: 'Weather', inputSchema: rawSchema } })
    const [wf] = await listWorkflows('tok')
    expect(wf.inputSchema).toMatchObject({
      type: 'object',
      properties: { city: { type: 'string', description: 'The city' } },
      required: ['city'],
    })
  })

  it('silently ignores a malformed inputSchema string', async () => {
    mockSDKWorkflows({ w1: { name: 'W1', inputSchema: 'not-valid-json' } })
    const [wf] = await listWorkflows('tok')
    expect(wf.inputSchema).toBeUndefined()
  })

  it('returns undefined inputSchema when property is absent', async () => {
    mockSDKWorkflows({ w1: { name: 'W1' } })
    const [wf] = await listWorkflows('tok')
    expect(wf.inputSchema).toBeUndefined()
  })
})

// ─── triggerWorkflow ──────────────────────────────────────────────────────────
describe('triggerWorkflow', () => {
  function mockTrigger(runId = 'r1') {
    const mockStart = vi.fn().mockResolvedValueOnce({ message: 'started' })
    const mockRun = { runId, start: mockStart }
    const mockCreateRun = vi.fn().mockResolvedValueOnce(mockRun)
    const mockGetWorkflow = vi.fn().mockReturnValue({ createRun: mockCreateRun })
    MockMastraClient.mockReturnValueOnce({ getWorkflow: mockGetWorkflow })
    return { mockStart, mockRun, mockCreateRun, mockGetWorkflow }
  }

  it('returns the runId from the created run', async () => {
    mockTrigger('run-abc')
    const result = await triggerWorkflow('wf1', {}, 'tok')
    expect(result.runId).toBe('run-abc')
  })

  it('echoes back the workflowId', async () => {
    mockTrigger('r1')
    const result = await triggerWorkflow('wf1', { city: 'Hanoi' }, 'tok')
    expect(result.workflowId).toBe('wf1')
  })

  it('calls run.start with the inputData', async () => {
    const { mockStart } = mockTrigger()
    await triggerWorkflow('wf1', { city: 'Hanoi' }, 'tok')
    expect(mockStart).toHaveBeenCalledWith({ inputData: { city: 'Hanoi' } })
  })

  it('calls getWorkflow with the correct workflowId', async () => {
    const { mockGetWorkflow } = mockTrigger()
    await triggerWorkflow('my-workflow', {}, 'tok')
    expect(mockGetWorkflow).toHaveBeenCalledWith('my-workflow')
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

function mockListRuns(response: unknown) {
  const mockRunsFn = vi.fn().mockResolvedValueOnce(response)
  MockMastraClient.mockReturnValueOnce({
    getWorkflow: vi.fn().mockReturnValue({ runs: mockRunsFn }),
  })
}

describe('listRuns', () => {
  it('unwraps snapshot and returns correct status', async () => {
    mockListRuns({ runs: [makeSnapshotRun()], total: 1 })
    const runs = await listRuns('wf1', 'tok')
    expect(runs).toHaveLength(1)
    expect(runs[0].status).toBe('success')
  })

  it('extracts steps from snapshot.context, skipping the input key', async () => {
    mockListRuns({ runs: [makeSnapshotRun()], total: 1 })
    const [run] = await listRuns('wf1', 'tok')
    expect(Object.keys(run.steps)).toEqual(['fetch-weather', 'plan-activities'])
    expect(run.steps['input']).toBeUndefined()
  })

  it('maps step fields correctly (status, output, startedAt, endedAt)', async () => {
    mockListRuns({ runs: [makeSnapshotRun()], total: 1 })
    const [run] = await listRuns('wf1', 'tok')
    const step = run.steps['fetch-weather']
    expect(step.status).toBe('success')
    expect(step.output).toEqual({ location: 'Ho Chi Minh City' })
    expect(step.startedAt).toBe(1780550930739)
    expect(step.endedAt).toBe(1780550933810)
  })

  it('includes serializedStepGraph from snapshot', async () => {
    mockListRuns({ runs: [makeSnapshotRun()], total: 1 })
    const [run] = await listRuns('wf1', 'tok')
    expect(run.serializedStepGraph).toHaveLength(2)
    expect(run.serializedStepGraph![0].step.id).toBe('fetch-weather')
  })

  it('preserves createdAt from the top-level item', async () => {
    mockListRuns({ runs: [makeSnapshotRun()], total: 1 })
    const [run] = await listRuns('wf1', 'tok')
    expect(run.createdAt).toBe('2026-06-04T05:29:28.669Z')
  })

  it('extracts payload from snapshot.context.input', async () => {
    mockListRuns({ runs: [makeSnapshotRun()], total: 1 })
    const [run] = await listRuns('wf1', 'tok')
    expect(run.payload).toEqual({ city: 'ho chi minh' })
  })

  it('defaults status to running when snapshot is absent', async () => {
    const bare = { runId: 'r2', workflowName: 'wf', createdAt: '2026-01-01T00:00:00.000Z' }
    mockListRuns({ runs: [bare], total: 1 })
    const [run] = await listRuns('wf1', 'tok')
    expect(run.status).toBe('running')
    expect(run.steps).toEqual({})
  })

  it('returns empty array and logs warning for completely unexpected shape', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mockListRuns('not an object')
    const result = await listRuns('wf1', 'tok')
    expect(result).toEqual([])
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[listRuns]'), expect.anything())
    warnSpy.mockRestore()
  })
})

// ─── getRun ───────────────────────────────────────────────────────────────────
describe('getRun', () => {
  it('returns the parsed run object', async () => {
    const raw = { runId: 'r1', status: 'completed', steps: {}, result: { ok: true } }
    const mockRunById = vi.fn().mockResolvedValueOnce(raw)
    MockMastraClient.mockReturnValueOnce({
      getWorkflow: vi.fn().mockReturnValue({ runById: mockRunById }),
    })

    expect(await getRun('wf1', 'r1', 'tok')).toMatchObject({ runId: 'r1', status: 'completed' })
  })

  it('calls runById with the correct runId', async () => {
    const mockRunById = vi.fn().mockResolvedValueOnce({ runId: 'r1', status: 'running', steps: {} })
    MockMastraClient.mockReturnValueOnce({
      getWorkflow: vi.fn().mockReturnValue({ runById: mockRunById }),
    })

    await getRun('wf1', 'r1', 'tok')
    expect(mockRunById).toHaveBeenCalledWith('r1')
  })
})
