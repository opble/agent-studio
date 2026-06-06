import MarkdownContent from './ui/MarkdownContent'

interface Props {
  /** The text streamed so far */
  text: string
  /** Show a blinking cursor while still streaming */
  streaming?: boolean
}

/**
 * Renders incrementally-arriving Markdown text with a blinking cursor while streaming.
 * Copy actions are handled by the parent (ChatMessage action row).
 */
export default function StreamOutput({ text, streaming = false }: Props) {
  if (!text && !streaming) return null

  return <MarkdownContent streaming={streaming}>{text}</MarkdownContent>
}
