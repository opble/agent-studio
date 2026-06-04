import type { ReactNode } from 'react'

type Variant = 'default' | 'accent' | 'success' | 'danger' | 'warning'

interface Props {
  children: ReactNode
  variant?: Variant
}

const styles: Record<Variant, string> = {
  default: 'bg-[var(--color-surface-overlay)] text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)]',
  accent: 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/20',
  success: 'bg-green-50 text-green-700 ring-1 ring-green-200 dark:bg-green-950/30 dark:text-green-400 dark:ring-green-900',
  danger: 'bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-400 dark:ring-red-900',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:ring-amber-900',
}

export default function Badge({ children, variant = 'default' }: Props) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${styles[variant]}`}>
      {children}
    </span>
  )
}
