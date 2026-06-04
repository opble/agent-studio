import { mastraFetch } from './client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Workflow {
  id: string
  name: string
  description?: string
  steps?: Record<string, unknown>
}

export type WorkflowRunStatus = 'running' | 'completed' | 'failed' | 'suspended' | 'cancelled'

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
  const data: unknown = await res.json()

  if (Array.isArray(data)) return data as Workflow[]

  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if (Array.isArray(obj.workflows)) return obj.workflows as Workflow[]

    return Object.entries(obj).map(([id, config]) => ({
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

/** GET /api/workflows/:workflowId/runs — list all runs for a workflow. */
export async function listRuns(workflowId: string, token: string): Promise<WorkflowRun[]> {
  const res = await mastraFetch(`/api/workflows/${workflowId}/runs`, { method: 'GET' }, token)
  const data: unknown = await res.json()
  if (Array.isArray(data)) return data as WorkflowRun[]
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if (Array.isArray(obj.runs)) return obj.runs as WorkflowRun[]
  }
  return []
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
