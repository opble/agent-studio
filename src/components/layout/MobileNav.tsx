import NavLink from './NavLink'

export default function MobileNav() {
  return (
    <nav className="
      fixed bottom-0 left-0 right-0 z-40
      flex items-center justify-around
      border-t border-[var(--color-border)] bg-[var(--color-surface-raised)]/90
      backdrop-blur-md px-2 pb-safe
      md:hidden
    ">
      <NavLink to="/agents" icon={<AgentsIcon />} label="Agents" compact />
      <NavLink to="/workflows" icon={<WorkflowsIcon />} label="Workflows" compact />
      <NavLink to="/history" icon={<HistoryIcon />} label="History" compact />
    </nav>
  )
}

function AgentsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2z" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

function WorkflowsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 15" />
    </svg>
  )
}
