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
        w-full rounded-xl px-3 py-3 text-left transition-all border-l-2
        ${isActive
          ? 'bg-[var(--color-accent-subtle)] border-[var(--color-accent)]'
          : 'border-transparent hover:bg-[var(--color-surface-overlay)]'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <Avatar name={agent.name} size="md" />
        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-semibold ${isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-primary)]'}`}>
            {agent.name}
          </p>
          {agent.description && (
            <p className="truncate text-[11px] text-[var(--color-text-muted)]">
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
