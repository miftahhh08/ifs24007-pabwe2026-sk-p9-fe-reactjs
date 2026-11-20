import { useEffect, useRef } from 'react'
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer'
import '@toast-ui/editor/dist/toastui-editor-viewer.css'

export default function MarkdownViewer({ content }) {
  const holder = useRef(null)
  const viewer = useRef(null)

  useEffect(() => {
    viewer.current = new Viewer({ el: holder.current, initialValue: content, usageStatistics: false })
    return () => viewer.current.destroy()
  }, [])

  useEffect(() => {
    viewer.current.setMarkdown(content)
  }, [content])

  return <div ref={holder} data-testid="markdown-viewer" className="prose max-w-none" />
}
