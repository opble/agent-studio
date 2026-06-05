import { useEffect, useRef } from 'react'

interface Props {
  /** The text streamed so far */
  text: string
  /** Show a blinking cursor while still streaming */
  streaming?: boolean
}

/**
 * Renders incrementally-arriving text.
 * Automatically scrolls to the bottom as new content arrives.
 */
export default function StreamOutput({ text, streaming = false }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [text])

  if (!text && !streaming) return null

  return (
    <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--color-text-primary)]">
      {text}
      {streaming && (
        <span
          className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-[var(--color-accent)]"
          aria-hidden
        />
      )}
      <div ref={bottomRef} />
    </div>
  )
}
