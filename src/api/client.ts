import { MastraClient } from '@mastra/client-js'

/**
 * Returns a configured MastraClient with the Auth0 token injected as a
 * Bearer header. Create one per request — cheap to construct, token is
 * valid for the duration of the call.
 */
export function createMastraClient(token: string): MastraClient {
  return new MastraClient({
    baseUrl: import.meta.env.VITE_MASTRA_API_URL,
    headers: { Authorization: `Bearer ${token}` },
  })
}
