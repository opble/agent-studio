import HealthIndicator from './HealthIndicator'
import ThemeToggle from './ThemeToggle'

interface Props {
  /** Page title shown on mobile where the sidebar is hidden */
  title?: string
}

export default function Header({ title }: Props) {
  return (
    <header className="
      flex h-14 shrink-0 items-center justify-between gap-4
      border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 md:px-6
    ">
      {/* Mobile: show page title; desktop: health indicator fills the left */}
      <div className="flex items-center gap-3">
        {title && (
          <h1 className="text-base font-semibold text-[var(--color-text-primary)] md:hidden">
            {title}
          </h1>
        )}
        <div className="hidden md:block">
          <HealthIndicator />
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Health dot visible on mobile too */}
        <div className="md:hidden">
          <HealthIndicator />
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
