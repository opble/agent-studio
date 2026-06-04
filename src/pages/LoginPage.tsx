import { useAuth0 } from '@auth0/auth0-react'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/layout/ThemeToggle'
import Spinner from '../components/ui/Spinner'

export default function LoginPage() {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate(from, { replace: true })
  }, [isAuthenticated, isLoading, navigate, from])

  function handleLogin() {
    loginWithRedirect({ appState: { returnTo: from } })
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[var(--color-surface)] px-4">
      {/* Theme toggle top-right */}
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      {/* Decorative background blob */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[var(--color-accent)] opacity-[0.06] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-violet-500 opacity-[0.05] blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm space-y-8">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 text-center">
          <BrandMark />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
              Agent Studio
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Self-hosted Mastra agent UI
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6 shadow-sm">
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="
              flex w-full items-center justify-center gap-2.5 rounded-xl
              bg-gradient-to-r from-[var(--color-accent)] to-violet-600
              px-4 py-3 text-sm font-semibold text-white shadow-sm
              hover:opacity-90 active:scale-[0.98] transition-all
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {isLoading ? (
              <Spinner size="sm" label="Signing in" />
            ) : (
              <>
                <Auth0Icon />
                Continue with Auth0
              </>
            )}
          </button>

          <div className="mt-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--color-border)]" />
            <span className="text-[11px] text-[var(--color-text-muted)]">secured by Auth0</span>
            <div className="h-px flex-1 bg-[var(--color-border)]" />
          </div>

          <p className="mt-3 text-center text-xs text-[var(--color-text-muted)]">
            Your token is kept in memory only — never written to disk.
          </p>
        </div>
      </div>
    </div>
  )
}

function BrandMark() {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-violet-600 shadow-lg shadow-[var(--color-accent)]/20">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2" />
        <circle cx="12" cy="12" r="1.5" fill="white" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M5.6 5.6l1.4 1.4M16.9 16.9l1.4 1.4M5.6 18.4l1.4-1.4M16.9 7.1l1.4-1.4" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function Auth0Icon() {
  return (
    <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor" aria-hidden>
      <path d="M16 2L2 10v12l14 8 14-8V10L16 2zm0 3.09L27.09 11 24 18.73l-8 4.62-8-4.62L4.91 11 16 5.09zM8 20.27l4 2.31V28l-8-4.62V14.35l4 2.31v3.61zm16 0v-3.61l4-2.31v9.03L20 28v-5.42l4-2.31z" />
    </svg>
  )
}
