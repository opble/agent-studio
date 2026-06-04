import { useAuth0 } from '@auth0/auth0-react'
import { useQuery } from '@tanstack/react-query'
import { listAgents } from '../api/agents'
import type { Agent } from '../api/agents'

export function useAgents() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()

  return useQuery<Agent[]>({
    queryKey: ['agents'],
    enabled: isAuthenticated,
    staleTime: 60_000,
    queryFn: async () => {
      const token = await getAccessTokenSilently()
      return listAgents(token)
    },
  })
}
