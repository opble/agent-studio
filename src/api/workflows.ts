import { z } from 'zod'
import { mastraFetch } from './client'

// ─── Shared primitive schemas ─────────────────────────────────────────────────

export const WorkflowRunStatusSchema = z.enum([
  'pending',
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

// JSON Schema draft-07 subset — describes individual input properties
export const JsonSchemaPropertySchema = z.object({
  type: z.enum(['string', 'number', 'integer', 'boolean', 'array', 'object']),
  description: z.string().optional(),
  enum: z.array(z.unknown()).optional(),
  default: z.unknown().optional(),
})
export type JsonSchemaProperty = z.infer<typeof JsonSchemaPropertySchema>

// JSON Schema draft-07 subset — top-level object schema for workflow input
export const JsonSchemaObjectSchema = z.object({
  type: z.literal('object'),
  properties: z.record(z.string(), JsonSchemaPropertySchema),
  required: z.array(z.string()).optional(),
  additionalProperties: z.boolean().optional(),
})
export type JsonSchemaObject = z.infer<typeof JsonSchemaObjectSchema>

export const WorkflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  steps: z.record(z.string(), z.unknown()).optional(),
  /** Parsed workflow-level input schema (from the raw serialised JSON string in the API) */
  inputSchema: JsonSchemaObjectSchema.optional(),
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
  /** Workflow input data — top-level `payload` on single-run endpoint; extracted from snapshot.context.input on list endpoint */
  payload: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})
export type WorkflowRun = z.infer<typeof WorkflowRunSchema>

export const TriggerRunResultSchema = z.object({
  runId: z.string(),
  /** Mastra echoes back the workflowId; use this (not the locally-held selected.id) for navigation */
  workflowId: z.string().optional(),
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
      payload: snap.context['input'] as Record<string, unknown> | undefined,
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
    return Object.entries(obj).map(([key, config]) => {
      const c = config as Record<string, unknown>
      return {
        ...(c as Omit<Workflow, 'id' | 'inputSchema'>),
        id: (c.id as string | undefined) ?? key,
        name: (c.name as string | undefined) ?? key,
        inputSchema: parseInputSchema(c.inputSchema),
      }
    })
  }
  return []
}

/**
 * Parses the raw `inputSchema` value from the Mastra API.
 * The API serialises it as a JSON string wrapping the real schema at `.json`:
 *   "{\"json\":{\"type\":\"object\",\"properties\":{...}}}"
 * Returns the validated JsonSchemaObject or undefined if parsing fails.
 */
function parseInputSchema(raw: unknown): JsonSchemaObject | undefined {
  if (typeof raw !== 'string') return undefined
  try {
    const parsed = JSON.parse(raw) as { json?: unknown }
    const result = JsonSchemaObjectSchema.safeParse(parsed.json)
    return result.success ? result.data : undefined
  } catch {
    return undefined
  }
}

/** Ensures every workflow in a plain array has an id field. */
function normaliseWorkflowArray(arr: unknown[]): Workflow[] {
  return arr.map((item, i) => {
    const wf = item as Partial<Workflow> & Record<string, unknown>
    return {
      ...wf,
      id: (wf.id ?? wf.workflowId ?? String(i)) as string,
      name: wf.name ?? wf.id ?? 'Workflow',
      inputSchema: parseInputSchema(wf.inputSchema),
    }
  })
}

/**
 * Triggers a workflow run using the two-step Mastra pattern:
 *   1. POST /create-run          → { runId }  (creates a pending run)
 *   2. POST /start?runId=<id>    → { message } (fires the run async, returns immediately)
 *
 * We navigate to the run page after step 1 so the user sees progress in real time.
 * parse() on step 1 throws if runId is absent — better a hard error than /runs/undefined.
 */
export async function triggerWorkflow(
  workflowId: string,
  inputData: Record<string, unknown>,
  token: string
): Promise<TriggerRunResult> {
  // Step 1: create the pending run and get its id
  const createRes = await mastraFetch(
    `/api/workflows/${workflowId}/create-run`,
    { method: 'POST' },
    token
  )
  const { runId, workflowId: echoedId } = TriggerRunResultSchema.parse(await createRes.json())

  // Step 2: start the run asynchronously (fire-and-forget from the server's perspective)
  await mastraFetch(
    `/api/workflows/${workflowId}/start?runId=${encodeURIComponent(runId)}`,
    {
      method: 'POST',
      body: JSON.stringify({ inputData }),
    },
    token
  )

  return { runId, workflowId: echoedId }
}

/**
 * POST /api/workflows/:workflowId/start?runId=<id>
 * Starts a pending run asynchronously (fire-and-forget on the server).
 * inputData is the workflow input payload captured at create-run time.
 */
export async function startRun(
  workflowId: string,
  runId: string,
  inputData: Record<string, unknown>,
  token: string
): Promise<void> {
  await mastraFetch(
    `/api/workflows/${workflowId}/start?runId=${encodeURIComponent(runId)}`,
    { method: 'POST', body: JSON.stringify({ inputData }) },
    token
  )
}

/**
 * POST /api/workflows/:workflowId/resume?runId=<id>
 * Resumes a suspended or paused run asynchronously.
 * step and resumeData are optional — Mastra resumes from the current suspension point.
 */
export async function resumeRun(
  workflowId: string,
  runId: string,
  token: string,
  step?: string,
  resumeData?: unknown
): Promise<void> {
  await mastraFetch(
    `/api/workflows/${workflowId}/resume?runId=${encodeURIComponent(runId)}`,
    { method: 'POST', body: JSON.stringify({ step, resumeData }) },
    token
  )
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
