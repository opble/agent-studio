import { useAuth0 } from '@auth0/auth0-react'
import { Lock } from 'lucide-react'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/layout/ThemeToggle'
import Spinner from '../components/ui/Spinner'

const persistent = import.meta.env.VITE_AUTH0_CACHE_LOCATION === 'localstorage'

export default function LoginPage() {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate(from, { replace: true })
  }, [isAuthenticated, isLoading, navigate, from])

  function handleLogin() {
    void loginWithRedirect({ appState: { returnTo: from } })
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[var(--color-surface)] px-4">
      {/* Theme toggle */}
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-500 opacity-[0.07] blur-[80px]" />
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-violet-500 opacity-[0.06] blur-[60px]" />
        <div className="absolute bottom-1/3 -left-20 h-48 w-48 rounded-full bg-indigo-400 opacity-[0.05] blur-[50px]" />
      </div>

      <div className="relative w-full max-w-[360px] space-y-7">
        {/* Brand */}
        <div className="flex flex-col items-center gap-4 text-center">
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
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-xl shadow-black/5">
          <div className="p-6">
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="
                flex w-full items-center justify-center gap-2.5 rounded-xl
                bg-gradient-to-r from-indigo-500 via-[var(--color-accent)] to-violet-600
                px-4 py-3 text-sm font-semibold text-white
                shadow-lg shadow-indigo-500/25
                hover:opacity-90 active:scale-[0.98] transition-all duration-150
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
          </div>

          <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-6 py-4">
            <div className="flex items-center gap-2.5">
              <Lock size={12} aria-hidden className="shrink-0 text-[var(--color-text-muted)]" />
              <p className="text-[11px] text-[var(--color-text-muted)]">
                {persistent
                  ? 'Your session is persisted locally so you stay logged in across reloads.'
                  : 'Your token is kept in memory only — never written to disk.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Brand mark kept as custom SVG — it's the product logo, not a generic icon
function BrandMark() {
  return (
    <div className="relative flex h-16 w-16 items-center justify-center">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 opacity-20 blur-lg" />
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-[var(--color-accent)] to-violet-600 shadow-xl shadow-indigo-500/30">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="3.5" stroke="white" strokeWidth="2" />
          <circle cx="12" cy="12" r="1.2" fill="white" />
          <path
            d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M5.9 5.9l1.8 1.8M16.3 16.3l1.8 1.8M5.9 18.1l1.8-1.8M16.3 7.7l1.8-1.8"
            stroke="white"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  )
}

// Auth0 logo — no lucide equivalent, keep as custom SVG
function Auth0Icon() {
  return (
    <svg width="15" height="15" viewBox="0 0 32 32" fill="currentColor" aria-hidden>
      <path d="M16 2L2 10v12l14 8 14-8V10L16 2zm0 3.09L27.09 11 24 18.73l-8 4.62-8-4.62L4.91 11 16 5.09zM8 20.27l4 2.31V28l-8-4.62V14.35l4 2.31v3.61zm16 0v-3.61l4-2.31v9.03L20 28v-5.42l4-2.31z" />
    </svg>
  )
}
