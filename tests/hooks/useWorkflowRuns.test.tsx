import { useAuth0 } from '@auth0/auth0-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type * as WorkflowsModule from '../../src/api/workflows'
import { listRuns } from '../../src/api/workflows'
import { useWorkflowRuns } from '../../src/hooks/useWorkflowRuns'

// Partial mock — preserve other exports from real module
vi.mock('../../src/api/workflows', async importOriginal => {
  const actual = await importOriginal<typeof WorkflowsModule>()
  return { ...actual, listRuns: vi.fn() }
})
const mockListRuns = listRuns as ReturnType<typeof vi.fn>

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn(),
}))
const mockUseAuth0 = useAuth0 as ReturnType<typeof vi.fn>

const mockGetToken = vi.fn().mockResolvedValue('token')

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useWorkflowRuns', () => {
  beforeEach(() => {
    mockListRuns.mockReset()
    mockUseAuth0.mockReset()
  })

  it('returns runs on success', async () => {
    mockUseAuth0.mockReturnValue({ isAuthenticated: true, getAccessTokenSilently: mockGetToken })
    const runs = [{ runId: 'r1', workflowId: 'wf1', status: 'completed' as const, steps: {} }]
    mockListRuns.mockResolvedValueOnce(runs)

    const { result } = renderHook(() => useWorkflowRuns('wf1'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
  })

  it('does not fetch when workflowId is null', () => {
    mockUseAuth0.mockReturnValue({ isAuthenticated: true, getAccessTokenSilently: mockGetToken })
    renderHook(() => useWorkflowRuns(null), { wrapper })
    expect(mockListRuns).not.toHaveBeenCalled()
  })

  it('exposes isError on failure', async () => {
    mockUseAuth0.mockReturnValue({ isAuthenticated: true, getAccessTokenSilently: mockGetToken })
    mockListRuns.mockRejectedValueOnce(new Error('fail'))

    const { result } = renderHook(() => useWorkflowRuns('wf1'), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
