import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAgents } from '../../src/hooks/useAgents'

vi.mock('../../src/api/agents', () => ({ listAgents: vi.fn() }))
import { listAgents } from '../../src/api/agents'
const mockList = listAgents as ReturnType<typeof vi.fn>

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn(),
}))
import { useAuth0 } from '@auth0/auth0-react'
const mockUseAuth0 = useAuth0 as ReturnType<typeof vi.fn>

const mockGetToken = vi.fn().mockResolvedValue('token')

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useAgents', () => {
  beforeEach(() => {
    mockList.mockReset()
    mockUseAuth0.mockReset()
  })

  it('returns agents on success', async () => {
    const agents = [{ id: 'a1', name: 'Agent One' }]
    mockUseAuth0.mockReturnValue({ isAuthenticated: true, getAccessTokenSilently: mockGetToken })
    mockList.mockResolvedValueOnce(agents)

    const { result } = renderHook(() => useAgents(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(agents)
  })

  it('does not fetch when not authenticated', () => {
    mockUseAuth0.mockReturnValue({ isAuthenticated: false, getAccessTokenSilently: mockGetToken })
    renderHook(() => useAgents(), { wrapper })
    expect(mockList).not.toHaveBeenCalled()
  })

  it('exposes isError on failure', async () => {
    mockUseAuth0.mockReturnValue({ isAuthenticated: true, getAccessTokenSilently: mockGetToken })
    mockList.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useAgents(), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
