import HealthIndicator from './HealthIndicator'

interface Props {
  /** Page title shown on mobile where the sidebar is hidden */
  title?: string
}

export default function Header({ title }: Props) {
  return (
    <header
      className="
      flex h-14 shrink-0 items-center justify-between gap-4
      border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]/80
      backdrop-blur-md px-4 md:px-6
    "
    >
      <div className="flex items-center gap-3">
        {title && (
          <h1 className="text-[15px] font-semibold text-[var(--color-text-primary)] md:hidden">
            {title}
          </h1>
        )}
        <div className="hidden md:block">
          <HealthIndicator />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <div className="md:hidden">
          <HealthIndicator />
        </div>
      </div>
    </header>
  )
}
