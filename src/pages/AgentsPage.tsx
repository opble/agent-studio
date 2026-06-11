import { AlertCircle, Bot, ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import type { Agent } from '../api/agents'
import AgentChat from '../components/AgentChat'
import AgentHeader from '../components/agents/AgentHeader'
import AgentListItem from '../components/agents/AgentListItem'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import { useAgents } from '../hooks/useAgents'
import { getApiErrorMessage } from '../utils/error'

export default function AgentsPage() {
  const { data: agents, isLoading, isError, error } = useAgents()
  const [selected, setSelected] = useState<Agent | null>(null)

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-[var(--color-danger)]/30 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-[var(--color-danger)]">
        <AlertCircle size={16} aria-hidden className="mt-0.5 shrink-0" />
        {getApiErrorMessage(error, 'Failed to load agents. Check your Mastra server connection.')}
      </div>
    )
  }

  if (!agents?.length) {
    return (
      <EmptyState
        icon={<Bot size={22} aria-hidden />}
        title="No agents found"
        description="No agents are registered on this Mastra server."
      />
    )
  }

  return (
    <div className="flex min-h-0 flex-1 gap-4 md:gap-5" style={{ height: 'calc(100dvh - 7rem)' }}>
      {/* Agent list */}
      <aside
        className={`
        flex flex-col overflow-y-auto
        ${selected ? 'hidden md:flex md:w-60 md:shrink-0' : 'flex w-full md:w-60 md:shrink-0'}
      `}
      >
        <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
          {agents.length} agent{agents.length !== 1 ? 's' : ''}
        </p>
        <div className="space-y-0.5 px-1">
          {agents.map(agent => (
            <AgentListItem
              key={agent.id}
              agent={agent}
              isActive={selected?.id === agent.id}
              onClick={() => setSelected(agent)}
            />
          ))}
        </div>
      </aside>

      {/* Chat panel */}
      {selected && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-sm">
          <AgentHeader agent={selected} />
          <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-2 md:hidden">
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-accent)]"
            >
              <ChevronLeft size={14} aria-hidden /> Back to agents
            </button>
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <AgentChat agentId={selected.id} agentName={selected.name} />
          </div>
        </div>
      )}
    </div>
  )
}
