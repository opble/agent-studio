import type { ReactNode } from 'react'

interface Props {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center px-4">
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-overlay)] text-[var(--color-text-muted)] shadow-sm">
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</p>
        {description && (
          <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-[var(--color-text-muted)]">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
