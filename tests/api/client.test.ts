import { MastraClient } from '@mastra/client-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMastraClient } from '../../src/api/client'

vi.mock('@mastra/client-js', () => ({
  MastraClient: vi.fn(),
}))

const MockMastraClient = MastraClient as ReturnType<typeof vi.fn>

describe('createMastraClient', () => {
  beforeEach(() => {
    MockMastraClient.mockReset()
    vi.stubEnv('VITE_MASTRA_API_URL', 'https://api.example.com')
  })
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('constructs MastraClient with the base URL from env', () => {
    createMastraClient('tok')
    expect(MockMastraClient).toHaveBeenCalledWith(
      expect.objectContaining({ baseUrl: 'https://api.example.com' })
    )
  })

  it('injects the token as a Bearer Authorization header', () => {
    createMastraClient('my-token')
    const opts = MockMastraClient.mock.calls[0][0] as { headers: Record<string, string> }
    expect(opts.headers['Authorization']).toBe('Bearer my-token')
  })

  it('returns the MastraClient instance', () => {
    const fakeInstance = {}
    MockMastraClient.mockReturnValueOnce(fakeInstance)
    expect(createMastraClient('tok')).toBe(fakeInstance)
  })
})
