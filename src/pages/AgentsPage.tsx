import { useState } from 'react'
import { useAgents } from '../hooks/useAgents'
import AgentChat from '../components/AgentChat'
import AgentListItem from '../components/agents/AgentListItem'
import AgentHeader from '../components/agents/AgentHeader'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import type { Agent } from '../api/agents'

export default function AgentsPage() {
  const { data: agents, isLoading, isError } = useAgents()
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
        <ErrorIcon />
        Failed to load agents. Check your Mastra server connection.
      </div>
    )
  }

  if (!agents?.length) {
    return <EmptyState icon={<AgentsIcon />} title="No agents found" description="No agents are registered on this Mastra server." />
  }

  return (
    <div className="flex min-h-0 flex-1 gap-4 md:gap-5" style={{ height: 'calc(100dvh - 7rem)' }}>
      {/* Agent list */}
      <aside className={`
        flex flex-col gap-0.5 overflow-y-auto
        ${selected ? 'hidden md:flex md:w-60 md:shrink-0' : 'flex w-full md:w-60 md:shrink-0'}
      `}>
        <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
          {agents.length} agent{agents.length !== 1 ? 's' : ''}
        </p>
        {agents.map(agent => (
          <AgentListItem
            key={agent.id}
            agent={agent}
            isActive={selected?.id === agent.id}
            onClick={() => setSelected(agent)}
          />
        ))}
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
              <ChevronIcon /> Back to agents
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

function AgentsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2z" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mt-0.5 shrink-0">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}
