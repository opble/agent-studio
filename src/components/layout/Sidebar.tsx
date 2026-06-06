import { Bot, Clock, GitBranch, Settings } from 'lucide-react'
import NavLink from './NavLink'
import UserMenu from './UserMenu'

export default function Sidebar() {
  return (
    <aside
      className="
      hidden md:flex flex-col w-60 shrink-0
      border-r border-[var(--color-border)] bg-[var(--color-surface-raised)]
    "
    >
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
        <NavLink to="/agents" icon={<Bot size={16} aria-hidden />} label="Agents" />
        <NavLink to="/workflows" icon={<GitBranch size={16} aria-hidden />} label="Workflows" />
        <NavLink to="/history" icon={<Clock size={16} aria-hidden />} label="History" />
        <NavLink to="/settings" icon={<Settings size={16} aria-hidden />} label="Settings" />
      </nav>

      <UserMenu />
    </aside>
  )
}

// Brand mark kept as custom SVG — not a generic icon
function BrandIcon() {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-[var(--color-accent)] to-violet-600 shadow-md shadow-indigo-500/20">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
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
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
