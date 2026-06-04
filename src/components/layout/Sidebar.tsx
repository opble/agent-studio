import NavLink from './NavLink'
import UserMenu from './UserMenu'

export default function Sidebar() {
  return (
    <aside className="
      hidden md:flex flex-col w-56 shrink-0
      border-r border-[var(--color-border)] bg-[var(--color-surface-raised)]
    ">
      {/* Wordmark */}
      <div className="flex items-center gap-2.5 px-4 py-5">
        <BrandIcon />
        <span className="text-sm font-bold tracking-tight text-[var(--color-text-primary)]">
          Agent Studio
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-2">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
          Menu
        </p>
        <NavLink to="/agents"    icon={<AgentsIcon />}    label="Agents" />
        <NavLink to="/workflows" icon={<WorkflowsIcon />} label="Workflows" />
        <NavLink to="/history"   icon={<HistoryIcon />}   label="History" />
      </nav>

      <UserMenu />
    </aside>
  )
}

function BrandIcon() {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-violet-600 shadow-sm">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2" />
        <circle cx="12" cy="12" r="1.5" fill="white" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function AgentsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2z" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

function WorkflowsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="6" height="6" rx="1.5" />
      <rect x="15" y="3" width="6" height="6" rx="1.5" />
      <rect x="9" y="15" width="6" height="6" rx="1.5" />
      <path d="M6 9v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9" />
      <path d="M12 12v3" />
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 15" />
    </svg>
  )
}
