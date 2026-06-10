import { MastraClient } from '@mastra/client-js'
import { getEnv } from '../utils/env'

/**
 * Returns a configured MastraClient with the Auth0 token injected as a
 * Bearer header. Create one per request — cheap to construct, token is
 * valid for the duration of the call.
 */
export function createMastraClient(token: string): MastraClient {
  return new MastraClient({
    baseUrl: getEnv('VITE_MASTRA_URL'),
    headers: { Authorization: `Bearer ${token}` },
  })
}
