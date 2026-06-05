import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import ProtectedRoute from '../../src/auth/ProtectedRoute'

// ─── Mock @auth0/auth0-react ─────────────────────────────────────────────────
const mockUseAuth0 = vi.fn()
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => mockUseAuth0() as unknown,
}))

// ─── Helpers ─────────────────────────────────────────────────────────────────
function renderWithRouter(
  auth: { isAuthenticated: boolean; isLoading: boolean },
  initialPath = '/protected'
) {
  mockUseAuth0.mockReturnValue(auth)

  return render(
    <MemoryRouter
      initialEntries={[initialPath]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  )
}

// ─── Tests ───────────────────────────────────────────────────────────────────
describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    renderWithRouter({ isAuthenticated: true, isLoading: false })
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to /login when not authenticated', () => {
    renderWithRouter({ isAuthenticated: false, isLoading: false })
    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('shows a spinner while Auth0 is loading', () => {
    renderWithRouter({ isAuthenticated: false, isLoading: true })
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })
})
