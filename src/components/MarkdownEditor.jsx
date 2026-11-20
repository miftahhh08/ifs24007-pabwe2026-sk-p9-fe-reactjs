import { useEffect, useRef } from 'react'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'

export default function MarkdownEditor({ value, onChange, dark = false }) {
  const holder = useRef(null)
  const handler = useRef(onChange)
  handler.current = onChange

  useEffect(() => {
    const editor = new Editor({
      el: holder.current,
      height: '420px',
      initialEditType: 'markdown',
      previewStyle: 'vertical',
      initialValue: value,
      theme: dark ? 'dark' : 'light',
      usageStatistics: false,
      events: { change: () => handler.current(editor.getMarkdown()) },
    })
    return () => editor.destroy()
    // Editor dibuat sekali; ganti `key` dari induk untuk memuat ulang konten.
  }, [])

  return <div ref={holder} data-testid="markdown-editor" />
}
