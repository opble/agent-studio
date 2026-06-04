import { NavLink as RouterNavLink } from 'react-router-dom'
import type { ReactNode } from 'react'

interface Props {
  to: string
  icon: ReactNode
  label: string
  /** Compact icon-only mode for mobile bottom nav */
  compact?: boolean
}

export default function NavLink({ to, icon, label, compact = false }: Props) {
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) =>
        compact
          ? `flex flex-col items-center gap-1 px-4 py-2.5 text-[10px] font-semibold tracking-wide transition-colors rounded-lg
             ${isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'}`
          : `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all
             ${isActive
               ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
               : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-primary)]'
             }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={`shrink-0 transition-transform ${!compact && isActive ? 'scale-110' : ''}`}>
            {icon}
          </span>
          <span>{label}</span>
        </>
      )}
    </RouterNavLink>
  )
}
