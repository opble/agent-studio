import { useAuth0 } from '@auth0/auth0-react'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

interface Props {
  children: ReactNode
}

/**
 * Renders children only when the user is authenticated.
 * - While Auth0 is loading → show nothing (avoids flash of redirect)
 * - Unauthenticated → redirect to /login, preserving the intended path
 */
export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuth0()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-surface)]">
        <Spinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

function Spinner() {
  return (
    <svg
      className="h-8 w-8 animate-spin text-[var(--color-accent)]"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}
