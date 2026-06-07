import { useAuth0 } from '@auth0/auth0-react'
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMemo } from 'react'

/**
 * Creates the QueryClient inside Auth0 context so the QueryCache error
 * handler can call logout() on 401 responses from the Mastra server.
 *
 * A 401 means the Bearer token was rejected — either expired or invalid.
 * The safest recovery is to log out and let the user re-authenticate.
 */
function is401(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const msg = error.message.toLowerCase()
  return (
    msg.includes('401') ||
    msg.includes('unauthorized') ||
    // Auth0 session errors thrown by getAccessTokenSilently
    msg.includes('login_required') ||
    msg.includes('interaction_required') ||
    msg.includes('consent_required')
  )
}

export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth0()

  const queryClient = useMemo(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: error => {
            if (is401(error)) {
              void logout({ logoutParams: { returnTo: `${window.location.origin}/login` } })
            }
          },
        }),
        defaultOptions: {
          queries: {
            retry: (failureCount, error) => {
              // Never retry on auth errors — log out immediately
              if (is401(error)) return false
              return failureCount < 1
            },
            staleTime: 30_000,
          },
        },
      }),
    [logout]
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
