import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mastraFetch, ApiError } from '../../src/api/client'

// ─── fetch mock ──────────────────────────────────────────────────────────────
const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

// ─── Helpers ─────────────────────────────────────────────────────────────────
function mockOk(body: unknown = {}) {
  const resp = new Response(JSON.stringify(body), { status: 200 })
  fetchMock.mockResolvedValueOnce(resp)
}

function mockError(status: number, body: unknown = { message: 'Bad request' }) {
  const resp = new Response(JSON.stringify(body), { status })
  fetchMock.mockResolvedValueOnce(resp)
}

// ─── Tests ───────────────────────────────────────────────────────────────────
describe('mastraFetch', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubEnv('VITE_MASTRA_API_URL', 'https://api.example.com')
  })
  afterEach(() => vi.unstubAllEnvs())

  it('calls fetch with the correct URL and Bearer token', async () => {
    mockOk()
    await mastraFetch('/api/agents', {}, 'test-token')

    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.example.com/api/agents')
    expect((options.headers as Record<string, string>)['Authorization']).toBe('Bearer test-token')
  })

  it('sets Content-Type to application/json by default', async () => {
    mockOk()
    await mastraFetch('/api/agents', {}, 'tok')
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect((options.headers as Record<string, string>)['Content-Type']).toBe('application/json')
  })

  it('allows caller headers to override defaults', async () => {
    mockOk()
    await mastraFetch('/api/agents', { headers: { 'X-Custom': 'yes' } }, 'tok')
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect((options.headers as Record<string, string>)['X-Custom']).toBe('yes')
  })

  it('returns the Response for 2xx', async () => {
    mockOk({ status: 'ok' })
    const res = await mastraFetch('/api/system/status', {}, 'tok')
    expect(res.ok).toBe(true)
  })

  it('throws ApiError with status for non-2xx responses', async () => {
    mockError(404, { message: 'Not found' })
    await expect(mastraFetch('/api/missing', {}, 'tok')).rejects.toThrow(ApiError)
  })

  it('ApiError carries the HTTP status code', async () => {
    mockError(403, { message: 'Forbidden' })
    try {
      await mastraFetch('/api/restricted', {}, 'tok')
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError)
      expect((err as ApiError).status).toBe(403)
    }
  })

  it('ApiError message uses body.message when available', async () => {
    mockError(400, { message: 'Invalid input' })
    try {
      await mastraFetch('/api/bad', {}, 'tok')
    } catch (err) {
      expect((err as ApiError).message).toBe('Invalid input')
    }
  })

  it('ApiError message falls back to HTTP status when body has no message', async () => {
    mockError(500, { detail: 'crash' })
    try {
      await mastraFetch('/api/crash', {}, 'tok')
    } catch (err) {
      expect((err as ApiError).message).toMatch(/500/)
    }
  })
})
