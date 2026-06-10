import { getEnv } from '../utils/env'

/** Probes GET /health — returns true on success, throws on non-2xx or network error. */
export async function checkHealth(token: string): Promise<true> {
  const res = await fetch(`${getEnv('VITE_MASTRA_API_URL')}/health`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`)
  return true
}
