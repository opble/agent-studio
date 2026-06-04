import { useAuth0 } from '@auth0/auth0-react'
import Avatar from '../ui/Avatar'

export default function UserMenu() {
  const { user, logout } = useAuth0()

  return (
    <div className="flex items-center gap-2.5 p-3 border-t border-[var(--color-border)]">
      <Avatar src={user?.picture} name={user?.name} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-[var(--color-text-primary)]">
          {user?.name ?? 'User'}
        </p>
        <p className="truncate text-[11px] text-[var(--color-text-muted)]">{user?.email}</p>
      </div>
      <button
        onClick={() => logout({ logoutParams: { returnTo: `${window.location.origin}/login` } })}
        title="Sign out"
        className="
          flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
          text-[var(--color-text-muted)] hover:bg-[var(--color-surface-overlay)]
          hover:text-[var(--color-danger)] transition-colors
        "
      >
        <LogoutIcon />
      </button>
    </div>
  )
}

function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}
