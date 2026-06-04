import { useAuth0 } from '@auth0/auth0-react'
import { useQuery } from '@tanstack/react-query'
import { getRun, TERMINAL_STATUSES } from '../api/workflows'
import type { WorkflowRun } from '../api/workflows'

/**
 * Polls GET /api/workflows/:workflowId/runs/:runId every 2 seconds.
 * Stops automatically once the run reaches a terminal state.
 */
export function useWorkflowRun(workflowId: string, runId: string | null) {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()

  return useQuery<WorkflowRun>({
    queryKey: ['workflow-run', workflowId, runId],
    enabled: isAuthenticated && !!runId,
    refetchInterval: query => {
      const status = query.state.data?.status
      if (status && TERMINAL_STATUSES.includes(status)) return false
      return 2_000
    },
    queryFn: async () => {
      const token = await getAccessTokenSilently()
      return getRun(workflowId, runId!, token)
    },
  })
}
