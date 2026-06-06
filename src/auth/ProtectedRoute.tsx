import { useAuth0 } from '@auth0/auth0-react'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import Spinner from '../components/ui/Spinner'

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
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
