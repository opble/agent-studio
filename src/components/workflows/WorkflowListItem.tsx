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
        w-full rounded-xl px-3 py-3 text-left transition-all border-l-2
        ${isActive
          ? 'bg-[var(--color-accent-subtle)] border-[var(--color-accent)]'
          : 'border-transparent hover:bg-[var(--color-surface-overlay)]'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div className={`
          flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold
          ${isActive
            ? 'bg-gradient-to-br from-[var(--color-accent)] to-violet-600 text-white'
            : 'bg-[var(--color-surface-overlay)] text-[var(--color-text-muted)]'
          }
        `}>
          {initials}
        </div>
        <div className="min-w-0">
          <p className={`truncate text-sm font-semibold ${isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-primary)]'}`}>
            {workflow.name}
          </p>
          {workflow.description && (
            <p className="truncate text-[11px] text-[var(--color-text-muted)]">
              {workflow.description}
            </p>
          )}
        </div>
      </div>
    </button>
  )
}
