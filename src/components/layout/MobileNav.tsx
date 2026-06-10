import { Bot, Clock, GitBranch, Settings } from 'lucide-react'
import { useSettings } from '../../contexts/SettingsContext'
import NavLink from './NavLink'

export default function MobileNav() {
  const { settings } = useSettings()
  const focus = settings.focus

  return (
    <nav
      className="
      fixed bottom-0 left-0 right-0 z-40
      flex items-center justify-around
      border-t border-[var(--color-border)] bg-[var(--color-surface-raised)]/90
      backdrop-blur-md px-2 pb-safe
      md:hidden
    "
    >
      {(focus === 'agent' || focus === 'dual') && (
        <NavLink to="/agents" icon={<Bot size={20} aria-hidden />} label="Agents" compact />
      )}
      {(focus === 'workflow' || focus === 'dual') && (
        <NavLink
          to="/workflows"
          icon={<GitBranch size={20} aria-hidden />}
          label="Workflows"
          compact
        />
      )}
      {(focus === 'workflow' || focus === 'dual') && (
        <NavLink to="/history" icon={<Clock size={20} aria-hidden />} label="History" compact />
      )}
      <NavLink to="/settings" icon={<Settings size={20} aria-hidden />} label="Settings" compact />
    </nav>
  )
}
