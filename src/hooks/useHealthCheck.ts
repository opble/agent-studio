import { useAuth0 } from '@auth0/auth0-react'
import { useQuery } from '@tanstack/react-query'
import { listAgents } from '../api/agents'

export type HealthStatus = 'checking' | 'connected' | 'disconnected'

/**
 * Polls GET /api/agents every 30 seconds as a connectivity probe.
 * Returns a simplified status string consumed by the UI indicator.
 */
export function useHealthCheck(): HealthStatus {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()

  const { isLoading, isError, isSuccess } = useQuery({
    queryKey: ['health'],
    enabled: isAuthenticated,
    refetchInterval: 30_000,
    retry: false,
    queryFn: async () => {
      const token = await getAccessTokenSilently()
      return listAgents(token)
    },
  })

  if (!isAuthenticated || isLoading) return 'checking'
  if (isError) return 'disconnected'
  if (isSuccess) return 'connected'
  return 'checking'
}
