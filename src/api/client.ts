// Read dynamically so vi.stubEnv works correctly in tests
function getBaseUrl(): string {
  return import.meta.env.VITE_MASTRA_API_URL ?? ''
}

export interface FetchOptions extends RequestInit {
  /** When true, the response body is returned as a ReadableStream (for streaming endpoints). */
  stream?: boolean
}

/**
 * Base fetch wrapper for all Mastra API calls.
 * Injects the Bearer token and the base URL automatically.
 *
 * Throws a {@link ApiError} for non-2xx responses.
 */
export async function mastraFetch(
  path: string,
  options: FetchOptions = {},
  token: string,
): Promise<Response> {
  const { stream: _stream, ...fetchOptions } = options

  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...fetchOptions.headers,
    },
  })

  if (!response.ok) {
    let message = `HTTP ${response.status}`
    try {
      const body = await response.clone().json()
      if (typeof body?.message === 'string') message = body.message
      else if (typeof body?.error === 'string') message = body.error
    } catch {
      // body not JSON — use status text
      message = response.statusText || message
    }
    throw new ApiError(message, response.status)
  }

  return response
}

/** Typed error thrown by mastraFetch for non-2xx responses. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
