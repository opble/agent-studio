import { useAuth0 } from '@auth0/auth0-react'
import { useQuery } from '@tanstack/react-query'
import { listWorkflows } from '../api/workflows'
import type { Workflow } from '../api/workflows'

export function useWorkflows() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()

  return useQuery<Workflow[]>({
    queryKey: ['workflows'],
    enabled: isAuthenticated,
    staleTime: 60_000,
    queryFn: async () => {
      const token = await getAccessTokenSilently()
      return listWorkflows(token)
    },
  })
}
