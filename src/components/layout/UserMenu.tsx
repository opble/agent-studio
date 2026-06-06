import { useAuth0 } from '@auth0/auth0-react'
import { LogOut } from 'lucide-react'
import Avatar from '../ui/Avatar'

export default function UserMenu() {
  const { user, logout } = useAuth0()

  return (
    <div className="flex items-center gap-2.5 p-3 mx-2 mb-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-overlay)]">
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
          flex h-7 w-7 shrink-0 items-center justify-center rounded-lg
          text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]
          hover:text-[var(--color-danger)] transition-colors
        "
      >
        <LogOut size={14} aria-hidden />
      </button>
    </div>
  )
}
