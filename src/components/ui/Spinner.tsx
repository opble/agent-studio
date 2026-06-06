import { Loader2 } from 'lucide-react'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const sizes = { sm: 16, md: 24, lg: 32 }

export default function Spinner({ size = 'md', label = 'Loading' }: Props) {
  return (
    <Loader2
      size={sizes[size]}
      className="animate-spin text-[var(--color-accent)]"
      aria-label={label}
      role="status"
    />
  )
}
