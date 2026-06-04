import type { ReactNode } from 'react'

type Variant = 'default' | 'accent' | 'success' | 'danger' | 'warning'

interface Props {
  children: ReactNode
  variant?: Variant
}

const styles: Record<Variant, string> = {
  default: 'bg-[var(--color-surface-overlay)] text-[var(--color-text-muted)]',
  accent: 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]',
  success: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  danger: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
}

export default function Badge({ children, variant = 'default' }: Props) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[variant]}`}>
      {children}
    </span>
  )
}
