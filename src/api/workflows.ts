import { z } from 'zod'
import { mastraFetch } from './client'

// ─── Shared primitive schemas ─────────────────────────────────────────────────

export const WorkflowRunStatusSchema = z.enum([
  'running',
  'success',
  'failed',
  'suspended',
  'paused',
  'tripwire',
  // legacy aliases some Mastra versions may still emit
  'completed',
  'cancelled',
])
export type WorkflowRunStatus = z.infer<typeof WorkflowRunStatusSchema>

// Terminal states after which polling must stop
export const TERMINAL_STATUSES: WorkflowRunStatus[] = [
  'success',
  'failed',
  'tripwire',
  'completed',
  'cancelled',
]

// ─── Exported domain schemas (source of truth for TypeScript types) ──────────

export const WorkflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  steps: z.record(z.string(), z.unknown()).optional(),
})
export type Workflow = z.infer<typeof WorkflowSchema>

export const WorkflowStepResultSchema = z.object({
  status: WorkflowRunStatusSchema,
  output: z.unknown().optional(),
  error: z.string().optional(),
  /** Unix timestamp (ms) — Mastra returns a number, not an ISO string */
  startedAt: z.number().optional(),
  /** Mastra uses endedAt, not completedAt */
  endedAt: z.number().optional(),
})
export type WorkflowStepResult = z.infer<typeof WorkflowStepResultSchema>

export const WorkflowStepGraphEntrySchema = z.object({
  type: z.string(),
  step: z.object({
    id: z.string(),
    description: z.string().optional(),
    canSuspend: z.boolean().optional(),
  }),
})
export type WorkflowStepGraphEntry = z.infer<typeof WorkflowStepGraphEntrySchema>

export const WorkflowRunSchema = z.object({
  runId: z.string(),
  workflowId: z.string().optional(),
  workflowName: z.string().optional(),
  status: WorkflowRunStatusSchema,
  result: z.unknown().optional(),
  error: z.string().optional(),
  steps: z.record(z.string(), WorkflowStepResultSchema).default({}),
  /** Always present — the static step graph from the workflow definition */
  serializedStepGraph: z.array(WorkflowStepGraphEntrySchema).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})
export type WorkflowRun = z.infer<typeof WorkflowRunSchema>

export const TriggerRunResultSchema = z.object({
  runId: z.string(),
  /** Mastra echoes back the workflowId; use this (not the locally-held selected.id) for navigation */
  workflowId: z.string().optional(),
  status: WorkflowRunStatusSchema.optional(),
  result: z.unknown().optional(),
  steps: z.record(z.string(), WorkflowStepResultSchema).optional(),
})
export type TriggerRunResult = z.infer<typeof TriggerRunResultSchema>

// ─── Internal schemas for list-runs response (not exported) ──────────────────

// Parses one step entry from snapshot.context (allows extra fields like payload)
const RawStepSchema = WorkflowStepResultSchema.passthrough()

// Parses + transforms one item in the list-runs response directly into WorkflowRun.
// The list endpoint wraps everything inside a `snapshot` field:
//   { runId, workflowName, createdAt, updatedAt, snapshot: { status, result, context: { <stepId>: {...}, input: {...} } } }
const ListRunItemSchema = z
  .object({
    runId: z.string(),
    workflowName: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    snapshot: z
      .object({
        status: WorkflowRunStatusSchema.default('running'),
        result: z.unknown().optional(),
        error: z.string().optional(),
        serializedStepGraph: z.array(WorkflowStepGraphEntrySchema).optional(),
        // context keys are step IDs plus a special "input" key to skip
        context: z.record(z.string(), z.unknown()).default({}),
      })
      .optional()
      .default({ status: 'running', context: {} }),
  })
  .transform((raw): WorkflowRun => {
    const snap = raw.snapshot
    const steps: Record<string, WorkflowStepResult> = {}
    for (const [key, val] of Object.entries(snap.context)) {
      if (key === 'input') continue // skip workflow input, not a step
      const step = RawStepSchema.safeParse(val)
      if (step.success) steps[key] = step.data
    }
    return {
      runId: raw.runId,
      workflowName: raw.workflowName,
      status: snap.status,
      result: snap.result,
      error: snap.error,
      steps,
      serializedStepGraph: snap.serializedStepGraph,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }
  })

const ListRunsResponseSchema = z.object({
  runs: z.array(ListRunItemSchema).default([]),
  total: z.number().optional(),
})

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * GET /api/workflows — returns Record<id, WorkflowInfo>.
 * Normalised to Workflow[].
 */
export async function listWorkflows(token: string): Promise<Workflow[]> {
  const res = await mastraFetch('/api/workflows', { method: 'GET' }, token)
  const data: unknown = await res.json()

  if (Array.isArray(data)) return normaliseWorkflowArray(data)

  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if (Array.isArray(obj.workflows)) return normaliseWorkflowArray(obj.workflows)
    if (Array.isArray(obj.results)) return normaliseWorkflowArray(obj.results)

    // Mastra default: Record<workflowId, config>
    // Spread THEN set id so a stale id field in config cannot override the map key.
    return Object.entries(obj).map(([key, config]) => ({
      ...(config as Omit<Workflow, 'id'>),
      id: (config as Workflow).id ?? key,
    }))
  }
  return []
}

/** Ensures every workflow in a plain array has an id field. */
function normaliseWorkflowArray(arr: unknown[]): Workflow[] {
  return arr.map((item, i) => {
    const wf = item as Partial<Workflow> & Record<string, unknown>
    return {
      ...wf,
      id: (wf.id ?? wf.workflowId ?? String(i)) as string,
      name: wf.name ?? wf.id ?? 'Workflow',
    }
  })
}

/**
 * POST /api/workflows/:workflowId/start-async
 *
 * Triggers a workflow run and waits for the result.
 * Returns the full run result including runId, status, steps, and result.
 */
export async function triggerWorkflow(
  workflowId: string,
  inputData: Record<string, unknown>,
  token: string
): Promise<TriggerRunResult> {
  const res = await mastraFetch(
    `/api/workflows/${workflowId}/start-async`,
    {
      method: 'POST',
      body: JSON.stringify({ inputData }),
    },
    token
  )
  return res.json() as Promise<TriggerRunResult>
}

/**
 * GET /api/workflows/:workflowId/runs — list all runs for a workflow.
 * The list endpoint wraps each run in a `snapshot` field; we unwrap it via Zod transform.
 */
export async function listRuns(workflowId: string, token: string): Promise<WorkflowRun[]> {
  const res = await mastraFetch(`/api/workflows/${workflowId}/runs`, { method: 'GET' }, token)
  const parsed = ListRunsResponseSchema.safeParse(await res.json())
  if (!parsed.success) {
    console.warn('[listRuns] unexpected response shape', parsed.error.flatten())
    return []
  }
  return parsed.data.runs
}

/** GET /api/workflows/:workflowId/runs/:runId — get a single run's state. */
export async function getRun(
  workflowId: string,
  runId: string,
  token: string
): Promise<WorkflowRun> {
  const res = await mastraFetch(
    `/api/workflows/${workflowId}/runs/${runId}`,
    { method: 'GET' },
    token
  )
  return res.json() as Promise<WorkflowRun>
}
