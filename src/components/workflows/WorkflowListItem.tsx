import type { Workflow } from '../../api/workflows'

interface Props {
  workflow: Workflow
  isActive: boolean
  onClick: () => void
}

export default function WorkflowListItem({ workflow, isActive, onClick }: Props) {
  const initials = workflow.name
    .split(/[\s_-]/)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

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
        <div className={`
          flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all
          ${isActive
            ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20'
            : 'bg-[var(--color-surface-overlay)] text-[var(--color-text-muted)] group-hover:bg-[var(--color-border)]'
          }
        `}>
          {initials}
        </div>
        <div className="min-w-0">
          <p className={`truncate text-sm font-semibold leading-tight ${isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-primary)]'}`}>
            {workflow.name}
          </p>
          {workflow.description && (
            <p className="mt-0.5 truncate text-[11px] leading-none text-[var(--color-text-muted)]">
              {workflow.description}
            </p>
          )}
        </div>
      </div>
    </button>
  )
}
