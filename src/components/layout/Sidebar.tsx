import NavLink from './NavLink'
import UserMenu from './UserMenu'

export default function Sidebar() {
  return (
    <aside className="
      hidden md:flex flex-col w-60 shrink-0
      border-r border-[var(--color-border)] bg-[var(--color-surface-raised)]
    ">
      {/* Wordmark */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--color-border)]">
        <BrandIcon />
        <div>
          <span className="block text-[13px] font-bold tracking-tight text-[var(--color-text-primary)]">
            Agent Studio
          </span>
          <span className="block text-[10px] text-[var(--color-text-muted)]">Mastra Runtime</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 pt-4">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
          Navigation
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
    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-[var(--color-accent)] to-violet-600 shadow-md shadow-indigo-500/20">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="3.5" stroke="white" strokeWidth="2" />
        <circle cx="12" cy="12" r="1.2" fill="white" />
        <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M5.9 5.9l1.8 1.8M16.3 16.3l1.8 1.8M5.9 18.1l1.8-1.8M16.3 7.7l1.8-1.8" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
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
