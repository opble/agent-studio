import { mastraFetch } from './client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Workflow {
  id: string
  name: string
  description?: string
  steps?: Record<string, unknown>
}

export type WorkflowRunStatus =
  | 'running'
  | 'completed'
  | 'failed'
  | 'suspended'
  | 'cancelled'

export const TERMINAL_STATUSES: WorkflowRunStatus[] = ['completed', 'failed', 'cancelled']

export interface WorkflowStepResult {
  status: WorkflowRunStatus
  output?: unknown
  error?: string
  startedAt?: string
  completedAt?: string
}

export interface WorkflowRun {
  runId: string
  workflowId: string
  status: WorkflowRunStatus
  result?: unknown
  error?: string
  steps: Record<string, WorkflowStepResult>
  createdAt?: string
  updatedAt?: string
}

export interface TriggerRunResult {
  runId: string
  status?: WorkflowRunStatus
  result?: unknown
  steps?: Record<string, WorkflowStepResult>
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * GET /api/workflows — returns Record<id, WorkflowInfo>.
 * Normalised to Workflow[].
 */
export async function listWorkflows(token: string): Promise<Workflow[]> {
  const res = await mastraFetch('/api/workflows', { method: 'GET' }, token)
  const data = await res.json()

  if (Array.isArray(data)) return data
  if (Array.isArray(data?.workflows)) return data.workflows

  if (data && typeof data === 'object') {
    return Object.entries(data).map(([id, config]) => ({
      id,
      ...(config as Omit<Workflow, 'id'>),
    }))
  }
  return []
}

/**
 * POST /api/workflows/:workflowId/start-async
 *
 * Triggers a workflow run and waits for the result.
 * Returns the full run result including runId, status, steps, and result.
 *
 * Current Mastra API (latest):
 *   POST /start-async  { inputData }  →  { runId, status, result, steps }
 */
export async function triggerWorkflow(
  workflowId: string,
  inputData: Record<string, unknown>,
  token: string,
): Promise<TriggerRunResult> {
  const res = await mastraFetch(
    `/api/workflows/${workflowId}/start-async`,
    {
      method: 'POST',
      body: JSON.stringify({ inputData }),
    },
    token,
  )
  return res.json()
}

/** GET /api/workflows/:workflowId/runs — list all runs for a workflow. */
export async function listRuns(workflowId: string, token: string): Promise<WorkflowRun[]> {
  const res = await mastraFetch(`/api/workflows/${workflowId}/runs`, { method: 'GET' }, token)
  const data = await res.json()
  // Mastra returns { runs: [...], total, page, perPage } or plain array
  return Array.isArray(data) ? data : (data?.runs ?? [])
}

/** GET /api/workflows/:workflowId/runs/:runId — get a single run's state. */
export async function getRun(
  workflowId: string,
  runId: string,
  token: string,
): Promise<WorkflowRun> {
  const res = await mastraFetch(
    `/api/workflows/${workflowId}/runs/${runId}`,
    { method: 'GET' },
    token,
  )
  return res.json()
}
