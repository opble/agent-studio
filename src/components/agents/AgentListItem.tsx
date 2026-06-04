import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import type { Agent } from '../../api/agents'

interface Props {
  agent: Agent
  isActive: boolean
  onClick: () => void
}

export default function AgentListItem({ agent, isActive, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`
        group w-full rounded-xl px-3 py-2.5 text-left transition-all duration-150
        ${isActive
          ? 'bg-[var(--color-accent-subtle)] ring-1 ring-[var(--color-accent)]/20'
          : 'hover:bg-[var(--color-surface-overlay)]'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <Avatar name={agent.name} size="md" />
        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-semibold leading-tight ${isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-primary)]'}`}>
            {agent.name}
          </p>
          {agent.description && (
            <p className="mt-0.5 truncate text-[11px] leading-none text-[var(--color-text-muted)]">
              {agent.description}
            </p>
          )}
        </div>
        {agent.model && (
          <Badge variant="accent">{agent.model.split('/').pop()}</Badge>
        )}
      </div>
    </button>
  )
}
