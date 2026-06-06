interface Props {
  /** The text streamed so far */
  text: string
  /** Show a blinking cursor while still streaming */
  streaming?: boolean
}

/**
 * Renders incrementally-arriving text with a blinking cursor while streaming.
 * Copy actions are handled by the parent (ChatMessage action row).
 */
export default function StreamOutput({ text, streaming = false }: Props) {
  if (!text && !streaming) return null

  return (
    <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
      {text}
      {streaming && (
        <span
          className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-[var(--color-accent)]"
          aria-hidden
        />
      )}
    </div>
  )
}
