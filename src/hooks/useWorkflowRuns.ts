import { useAuth0 } from '@auth0/auth0-react'
import { useQuery } from '@tanstack/react-query'
import type { WorkflowRun } from '../api/workflows'
import { TERMINAL_STATUSES, listRuns } from '../api/workflows'

/** Fetches all runs for a given workflow. Polls every 3 s while any run is non-terminal. */
export function useWorkflowRuns(workflowId: string | null) {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()

  return useQuery<WorkflowRun[]>({
    queryKey: ['workflow-runs', workflowId],
    enabled: isAuthenticated && !!workflowId,
    staleTime: 0,
    refetchInterval: query => {
      const runs = query.state.data
      if (!runs?.length) return false
      const hasLiveRun = runs.some(r => !TERMINAL_STATUSES.includes(r.status))
      return hasLiveRun ? 3_000 : false
    },
    queryFn: async () => {
      const token = await getAccessTokenSilently()
      return listRuns(workflowId!, token)
    },
  })
}
