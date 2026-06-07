import { useAuth0 } from '@auth0/auth0-react'
import { useState } from 'react'
import { resumeRun, startRun, triggerWorkflow } from '../api/workflows'

interface UseRunActionsResult {
  start: (inputData?: Record<string, unknown>) => Promise<void>
  rerun: (inputData?: Record<string, unknown>) => Promise<string | null>
  resume: (step?: string, resumeData?: unknown) => Promise<void>
  isActing: boolean
  error: string | null
}

/**
 * Provides start, rerun, and resume actions for a specific workflow run.
 * Both calls are fire-and-forget (server returns immediately); callers
 * should rely on polling to observe the resulting state change.
 */
export function useRunActions(workflowId: string, runId: string): UseRunActionsResult {
  const { getAccessTokenSilently } = useAuth0()
  const [isActing, setIsActing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function start(inputData: Record<string, unknown> = {}): Promise<void> {
    setIsActing(true)
    setError(null)
    try {
      const token = await getAccessTokenSilently()
      await startRun(workflowId, runId, inputData, token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start run')
    } finally {
      setIsActing(false)
    }
  }

  /** Creates a brand-new run with the same input and returns the new runId, or null on error. */
  async function rerun(inputData: Record<string, unknown> = {}): Promise<string | null> {
    setIsActing(true)
    setError(null)
    try {
      const token = await getAccessTokenSilently()
      const result = await triggerWorkflow(workflowId, inputData, token)
      return result.runId
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to re-run workflow')
      return null
    } finally {
      setIsActing(false)
    }
  }

  async function resume(step?: string, resumeData?: unknown): Promise<void> {
    setIsActing(true)
    setError(null)
    try {
      const token = await getAccessTokenSilently()
      await resumeRun(workflowId, runId, token, step, resumeData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume run')
    } finally {
      setIsActing(false)
    }
  }

  return { start, rerun, resume, isActing, error }
}
