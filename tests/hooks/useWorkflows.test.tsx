import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useWorkflows } from '../../src/hooks/useWorkflows'

vi.mock('../../src/api/workflows', () => ({ listWorkflows: vi.fn() }))
import { listWorkflows } from '../../src/api/workflows'
const mockList = listWorkflows as ReturnType<typeof vi.fn>

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

describe('useWorkflows', () => {
  beforeEach(() => {
    mockList.mockReset()
    mockUseAuth0.mockReset()
  })

  it('returns workflows on success', async () => {
    mockUseAuth0.mockReturnValue({ isAuthenticated: true, getAccessTokenSilently: mockGetToken })
    mockList.mockResolvedValueOnce([{ id: 'w1', name: 'W1' }])

    const { result } = renderHook(() => useWorkflows(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
  })

  it('does not fetch when not authenticated', () => {
    mockUseAuth0.mockReturnValue({ isAuthenticated: false, getAccessTokenSilently: mockGetToken })
    renderHook(() => useWorkflows(), { wrapper })
    expect(mockList).not.toHaveBeenCalled()
  })

  it('exposes isError on failure', async () => {
    mockUseAuth0.mockReturnValue({ isAuthenticated: true, getAccessTokenSilently: mockGetToken })
    mockList.mockRejectedValueOnce(new Error('fail'))

    const { result } = renderHook(() => useWorkflows(), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
