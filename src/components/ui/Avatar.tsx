interface Props {
  src?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const sizes = {
  xs: 'h-5 w-5 text-[9px]',
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
}

export default function Avatar({ src, name, size = 'sm' }: Props) {
  const initials = name
    ? name
        .split(/[\s_-]/)
        .map(w => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?'

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'Avatar'}
        className={`${sizes[size]} shrink-0 rounded-full object-cover ring-2 ring-[var(--color-border)]`}
      />
    )
  }

  return (
    <div
      className={`
        ${sizes[size]} shrink-0 flex items-center justify-center rounded-full font-bold
        bg-gradient-to-br from-indigo-500 to-violet-600
        text-white shadow-md shadow-indigo-500/20
      `}
    >
      {initials}
    </div>
  )
}
