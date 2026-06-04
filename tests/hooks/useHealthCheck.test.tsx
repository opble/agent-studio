import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useHealthCheck } from '../../src/hooks/useHealthCheck'

vi.mock('../../src/api/client', () => ({ mastraFetch: vi.fn() }))
import { mastraFetch } from '../../src/api/client'
const mockFetch = mastraFetch as ReturnType<typeof vi.fn>

vi.mock('@auth0/auth0-react', () => ({ useAuth0: vi.fn() }))
import { useAuth0 } from '@auth0/auth0-react'
const mockUseAuth0 = useAuth0 as ReturnType<typeof vi.fn>

const mockGetToken = vi.fn().mockResolvedValue('token')

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useHealthCheck', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    mockUseAuth0.mockReset()
  })

  it('returns "checking" while not authenticated', () => {
    mockUseAuth0.mockReturnValue({ isAuthenticated: false, getAccessTokenSilently: mockGetToken })
    const { result } = renderHook(() => useHealthCheck(), { wrapper })
    expect(result.current).toBe('checking')
  })

  it('returns "connected" after a successful status call', async () => {
    mockUseAuth0.mockReturnValue({ isAuthenticated: true, getAccessTokenSilently: mockGetToken })
    mockFetch.mockResolvedValueOnce(new Response('{}', { status: 200 }))

    const { result } = renderHook(() => useHealthCheck(), { wrapper })
    await waitFor(() => expect(result.current).toBe('connected'))
  })

  it('returns "disconnected" when the status call fails', async () => {
    mockUseAuth0.mockReturnValue({ isAuthenticated: true, getAccessTokenSilently: mockGetToken })
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useHealthCheck(), { wrapper })
    await waitFor(() => expect(result.current).toBe('disconnected'))
  })
})
