import type { WorkflowRunStatus } from '../../api/workflows'

interface Props {
  status: WorkflowRunStatus
}

const config: Record<WorkflowRunStatus, { label: string; classes: string; icon: string }> = {
  running:   { label: 'Running',   classes: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',   icon: '⟳' },
  completed: { label: 'Completed', classes: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400', icon: '✓' },
  failed:    { label: 'Failed',    classes: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',       icon: '✕' },
  suspended: { label: 'Suspended', classes: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400', icon: '⏸' },
  cancelled: { label: 'Cancelled', classes: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',      icon: '○' },
}

export default function StepStatusBadge({ status }: Props) {
  const { label, classes, icon } = config[status] ?? config.running
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${classes}`}>
      <span className={status === 'running' ? 'animate-spin inline-block' : ''}>{icon}</span>
      {label}
    </span>
  )
}
