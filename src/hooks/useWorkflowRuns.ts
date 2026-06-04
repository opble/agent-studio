import { useAuth0 } from '@auth0/auth0-react'
import { useQuery } from '@tanstack/react-query'
import { listRuns } from '../api/workflows'
import type { WorkflowRun } from '../api/workflows'

/** Fetches all runs for a given workflow. Only runs when workflowId is provided. */
export function useWorkflowRuns(workflowId: string | null) {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()

  return useQuery<WorkflowRun[]>({
    queryKey: ['workflow-runs', workflowId],
    enabled: isAuthenticated && !!workflowId,
    staleTime: 15_000,
    queryFn: async () => {
      const token = await getAccessTokenSilently()
      return listRuns(workflowId!, token)
    },
  })
}
