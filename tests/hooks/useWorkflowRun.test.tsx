import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type * as WorkflowsModule from '../../src/api/workflows'
import { useWorkflowRun } from '../../src/hooks/useWorkflowRun'

// Partial mock — preserve TERMINAL_STATUSES from real module
vi.mock('../../src/api/workflows', async importOriginal => {
  const actual = await importOriginal<typeof WorkflowsModule>()
  return { ...actual, getRun: vi.fn() }
})
import { getRun } from '../../src/api/workflows'
const mockGetRun = getRun as ReturnType<typeof vi.fn>

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

describe('useWorkflowRun', () => {
  beforeEach(() => {
    mockGetRun.mockReset()
    mockUseAuth0.mockReset()
  })

  it('returns run data on success', async () => {
    mockUseAuth0.mockReturnValue({ isAuthenticated: true, getAccessTokenSilently: mockGetToken })
    const run = { runId: 'r1', workflowId: 'wf1', status: 'completed' as const, steps: {} }
    mockGetRun.mockResolvedValueOnce(run)

    const { result } = renderHook(() => useWorkflowRun('wf1', 'r1'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.runId).toBe('r1')
  })

  it('does not fetch when runId is null', () => {
    mockUseAuth0.mockReturnValue({ isAuthenticated: true, getAccessTokenSilently: mockGetToken })
    renderHook(() => useWorkflowRun('wf1', null), { wrapper })
    expect(mockGetRun).not.toHaveBeenCalled()
  })

  it('exposes isError on failure', async () => {
    mockUseAuth0.mockReturnValue({ isAuthenticated: true, getAccessTokenSilently: mockGetToken })
    mockGetRun.mockRejectedValueOnce(new Error('not found'))

    const { result } = renderHook(() => useWorkflowRun('wf1', 'r-bad'), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
