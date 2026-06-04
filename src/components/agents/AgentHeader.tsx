import type { Agent } from '../../api/agents'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'

interface Props {
  agent: Agent
}

export default function AgentHeader({ agent }: Props) {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 md:px-5">
      <Avatar name={agent.name} size="md" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-tight text-[var(--color-text-primary)]">
          {agent.name}
        </p>
        {agent.description && (
          <p className="mt-0.5 truncate text-[11px] leading-none text-[var(--color-text-muted)]">
            {agent.description}
          </p>
        )}
      </div>
      {agent.model && <Badge variant="accent">{agent.model.split('/').pop()}</Badge>}
    </div>
  )
}
