import { render } from '@testing-library/react'
import MarkdownEditor from './MarkdownEditor'
import MarkdownViewer from './MarkdownViewer'

const editorInstance = { getMarkdown: vi.fn(() => '# isi'), destroy: vi.fn() }
const viewerInstance = { setMarkdown: vi.fn(), destroy: vi.fn() }
let editorOptions

vi.mock('@toast-ui/editor', () => ({
  default: vi.fn(function (options) {
    editorOptions = options
    return editorInstance
  }),
}))
vi.mock('@toast-ui/editor/dist/toastui-editor-viewer', () => ({ default: vi.fn(function () { return viewerInstance }) }))

describe('MarkdownEditor', () => {
  it('membuat editor, meneruskan perubahan, dan menghancurkannya saat unmount', () => {
    const onChange = vi.fn()
    const { unmount } = render(<MarkdownEditor value="awal" onChange={onChange} />)
    expect(editorOptions.initialValue).toBe('awal')
    expect(editorOptions.theme).toBe('light')
    editorOptions.events.change()
    expect(onChange).toHaveBeenCalledWith('# isi')
    unmount()
    expect(editorInstance.destroy).toHaveBeenCalled()
  })

  it('memakai tema gelap', () => {
    render(<MarkdownEditor value="" onChange={() => {}} dark />)
    expect(editorOptions.theme).toBe('dark')
  })
})

describe('MarkdownViewer', () => {
  it('menampilkan dan memperbarui konten', () => {
    const { rerender, unmount } = render(<MarkdownViewer content="a" />)
    expect(viewerInstance.setMarkdown).toHaveBeenCalledWith('a')
    rerender(<MarkdownViewer content="b" />)
    expect(viewerInstance.setMarkdown).toHaveBeenCalledWith('b')
    unmount()
    expect(viewerInstance.destroy).toHaveBeenCalled()
  })
})
