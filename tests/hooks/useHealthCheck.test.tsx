import { useAuth0 } from '@auth0/auth0-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listAgents } from '../../src/api/agents'
import { useHealthCheck } from '../../src/hooks/useHealthCheck'

vi.mock('../../src/api/agents', () => ({ listAgents: vi.fn() }))
const mockListAgents = listAgents as ReturnType<typeof vi.fn>

vi.mock('@auth0/auth0-react', () => ({ useAuth0: vi.fn() }))
const mockUseAuth0 = useAuth0 as ReturnType<typeof vi.fn>

const mockGetToken = vi.fn().mockResolvedValue('token')

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useHealthCheck', () => {
  beforeEach(() => {
    mockListAgents.mockReset()
    mockUseAuth0.mockReset()
  })

  it('returns "checking" while not authenticated', () => {
    mockUseAuth0.mockReturnValue({ isAuthenticated: false, getAccessTokenSilently: mockGetToken })
    const { result } = renderHook(() => useHealthCheck(), { wrapper })
    expect(result.current).toBe('checking')
  })

  it('returns "connected" after a successful agent list call', async () => {
    mockUseAuth0.mockReturnValue({ isAuthenticated: true, getAccessTokenSilently: mockGetToken })
    mockListAgents.mockResolvedValueOnce([])

    const { result } = renderHook(() => useHealthCheck(), { wrapper })
    await waitFor(() => expect(result.current).toBe('connected'))
  })

  it('returns "disconnected" when the agent list call fails', async () => {
    mockUseAuth0.mockReturnValue({ isAuthenticated: true, getAccessTokenSilently: mockGetToken })
    mockListAgents.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useHealthCheck(), { wrapper })
    await waitFor(() => expect(result.current).toBe('disconnected'))
  })
})
