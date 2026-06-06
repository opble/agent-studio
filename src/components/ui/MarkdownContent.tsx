import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import { useSettings } from '../../contexts/SettingsContext'

interface Props {
  children: string
  /** Show a blinking cursor at the end (for streaming). */
  streaming?: boolean
}

const cursor = (
  <span
    className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-[var(--color-accent)]"
    aria-hidden
  />
)

/**
 * Renders a Markdown string with GFM support and syntax-highlighted code blocks.
 * Falls back to plain pre-wrapped text when the user has disabled Markdown rendering.
 */
export default function MarkdownContent({ children, streaming = false }: Props) {
  const { settings } = useSettings()

  if (!settings.markdownEnabled) {
    return (
      <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
        {children}
        {streaming && cursor}
      </div>
    )
  }

  return (
    <div className="markdown-body text-sm leading-relaxed">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeHighlight]}>
        {children}
      </ReactMarkdown>
      {streaming && cursor}
    </div>
  )
}
