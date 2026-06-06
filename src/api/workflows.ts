import { z } from 'zod'
import { createMastraClient } from './client'

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * Lists all registered workflows via the SDK.
 * SDK returns Record<workflowId, GetWorkflowResponse> — normalised to Workflow[].
 */
export async function listWorkflows(token: string): Promise<Workflow[]> {
  const data = await createMastraClient(token).listWorkflows()
  return Object.entries(data).map(([id, wf]) => ({
    id,
    name: wf.name,
    description: wf.description,
    inputSchema: parseInputSchema(wf.inputSchema),
  }))
}

/**
 * Triggers a new workflow run via the SDK two-step pattern:
 *   1. workflow.createRun()          → Run instance with runId
 *   2. run.start({ inputData })      → fires the run asynchronously
 */
export async function triggerWorkflow(
  workflowId: string,
  inputData: Record<string, unknown>,
  token: string
): Promise<TriggerRunResult> {
  const client = createMastraClient(token)
  const run = await client.getWorkflow(workflowId).createRun()
  await run.start({ inputData })
  return { runId: run.runId, workflowId }
}

/**
 * Starts an existing pending run (created by Mastra internally) via the SDK.
 * We pass the known runId to createRun so the SDK wraps it in a Run instance,
 * then call run.start() to fire the run asynchronously.
 */
export async function startRun(
  workflowId: string,
  runId: string,
  inputData: Record<string, unknown>,
  token: string
): Promise<void> {
  const client = createMastraClient(token)
  const run = await client.getWorkflow(workflowId).createRun({ runId })
  await run.start({ inputData })
}

/**
 * Resumes a suspended or paused run via the SDK.
 */
export async function resumeRun(
  workflowId: string,
  runId: string,
  token: string,
  step?: string,
  resumeData?: unknown
): Promise<void> {
  const client = createMastraClient(token)
  const run = await client.getWorkflow(workflowId).createRun({ runId })
  await run.resume({ step, resumeData: resumeData as Record<string, unknown> | undefined })
}

/**
 * Lists all runs for a workflow via the SDK.
 * The list endpoint wraps each run in a `snapshot` field; we unwrap it via Zod transform.
 */
export async function listRuns(workflowId: string, token: string): Promise<WorkflowRun[]> {
  const data = await createMastraClient(token).getWorkflow(workflowId).runs()
  const parsed = ListRunsResponseSchema.safeParse(data)
  if (!parsed.success) {
    console.warn('[listRuns] unexpected response shape', parsed.error.flatten())
    return []
  }
  return parsed.data.runs
}

/** Gets a single run's state via the SDK. */
export async function getRun(
  workflowId: string,
  runId: string,
  token: string
): Promise<WorkflowRun> {
  const data = await createMastraClient(token).getWorkflow(workflowId).runById(runId)
  return WorkflowRunSchema.parse(data)
}
