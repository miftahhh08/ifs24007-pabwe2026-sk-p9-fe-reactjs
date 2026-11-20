import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthorDashboard from './AuthorDashboard'
import * as api from '../api/blogApi'
import { confirmDialog, showAlert, showToast } from '../../../helpers/toolsHelper'

vi.mock('../api/blogApi')
vi.mock('../../../helpers/toolsHelper', async () => ({
  ...(await vi.importActual('../../../helpers/toolsHelper')),
  showAlert: vi.fn(),
  showToast: vi.fn(),
  confirmDialog: vi.fn(),
}))
vi.mock('../modals/PostModal', () => ({
  default: ({ post, draft, onClose, onSaved }) => (
    <div role="dialog" aria-label="post-modal">
      <span>{post ? `edit:${post.title}` : draft ? `draft:${draft.title}` : 'baru'}</span>
      <button onClick={onClose}>tutup-post</button>
      <button onClick={onSaved}>simpan-post</button>
    </div>
  ),
}))
vi.mock('../modals/AiPostGeneratorModal', () => ({
  default: ({ onClose, onApply }) => (
    <div role="dialog" aria-label="ai-modal">
      <button onClick={onClose}>tutup-ai</button>
      <button onClick={() => onApply({ title: 'Hasil AI' })}>terapkan-ai</button>
    </div>
  ),
}))

const posts = [
  { id: 1, title: 'Satu', category: 'Umum', is_published: true, created_at: '2026-11-01T00:00:00Z' },
  { id: 2, title: 'Dua', category: 'Bisnis', is_published: false, created_at: '2026-11-02T00:00:00Z' },
]

beforeEach(() => {
  api.listMyPosts.mockResolvedValue(posts)
  api.getStats.mockResolvedValue({ total: 2, published: 1, draft: 1 })
})

describe('AuthorDashboard', () => {
  it('memuat artikel dan statistik', async () => {
    render(<AuthorDashboard dark={false} />)
    expect(screen.getByText('Memuat artikel...')).toBeInTheDocument()
    expect(await screen.findByText('Satu')).toBeInTheDocument()
    expect(screen.getByText('Total Terbit').nextSibling).toHaveTextContent('1')
  })

  it('daftar kosong dan gagal memuat', async () => {
    api.listMyPosts.mockResolvedValueOnce([])
    render(<AuthorDashboard />)
    expect(await screen.findByText(/Belum ada artikel/)).toBeInTheDocument()
    api.listMyPosts.mockRejectedValueOnce(new Error('putus'))
    render(<AuthorDashboard />)
    await waitFor(() => expect(showAlert).toHaveBeenCalledWith('error', 'Gagal memuat data', 'putus'))
  })

  it('toggle status terbit/draf', async () => {
    api.togglePublish.mockResolvedValue({})
    render(<AuthorDashboard />)
    await userEvent.click(await screen.findByRole('switch', { name: 'Status terbit Satu' }))
    expect(api.togglePublish).toHaveBeenCalledWith(1)
    await waitFor(() => expect(showToast).toHaveBeenCalledWith('success', 'Dijadikan draf'))
    await userEvent.click(screen.getByRole('switch', { name: 'Status terbit Dua' }))
    await waitFor(() => expect(showToast).toHaveBeenCalledWith('success', 'Artikel diterbitkan'))
  })

  it('toggle gagal', async () => {
    api.togglePublish.mockRejectedValue(new Error('gagal toggle'))
    render(<AuthorDashboard />)
    await userEvent.click(await screen.findByRole('switch', { name: 'Status terbit Satu' }))
    await waitFor(() => expect(showAlert).toHaveBeenCalledWith('error', 'Gagal mengubah status', 'gagal toggle'))
  })

  it('menu kebab: buka-tutup, edit', async () => {
    api.getMyPost.mockResolvedValue({ id: 1, title: 'Satu Lengkap' })
    render(<AuthorDashboard />)
    const kebab = await screen.findByRole('button', { name: 'Menu aksi Satu' })
    await userEvent.click(kebab)
    expect(screen.getByRole('menu')).toBeInTheDocument()
    await userEvent.click(kebab)
    expect(screen.queryByRole('menu')).toBeNull()
    await userEvent.click(kebab)
    await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }))
    expect(await screen.findByText('edit:Satu Lengkap')).toBeInTheDocument()
    await userEvent.click(screen.getByText('tutup-post'))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('edit gagal', async () => {
    api.getMyPost.mockRejectedValue(new Error('hilang'))
    render(<AuthorDashboard />)
    await userEvent.click(await screen.findByRole('button', { name: 'Menu aksi Satu' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }))
    await waitFor(() => expect(showAlert).toHaveBeenCalledWith('error', 'Gagal membuka artikel', 'hilang'))
  })

  it('hapus: batal, sukses, gagal', async () => {
    render(<AuthorDashboard />)
    const open = async () => {
      await userEvent.click(await screen.findByRole('button', { name: 'Menu aksi Satu' }))
      await userEvent.click(screen.getByRole('menuitem', { name: 'Hapus' }))
    }
    confirmDialog.mockResolvedValueOnce(false)
    await open()
    expect(api.deletePost).not.toHaveBeenCalled()

    confirmDialog.mockResolvedValueOnce(true)
    api.deletePost.mockResolvedValueOnce({})
    await open()
    await waitFor(() => expect(showToast).toHaveBeenCalledWith('success', 'Artikel dihapus'))

    confirmDialog.mockResolvedValueOnce(true)
    api.deletePost.mockRejectedValueOnce(new Error('tidak bisa'))
    await open()
    await waitFor(() => expect(showAlert).toHaveBeenCalledWith('error', 'Gagal menghapus', 'tidak bisa'))
  })

  it('tambah artikel, simpan, dan alur AI generator -> editor', async () => {
    render(<AuthorDashboard />)
    await screen.findByText('Satu')
    await userEvent.click(screen.getByRole('button', { name: /Tambah Artikel/ }))
    expect(screen.getByText('baru')).toBeInTheDocument()
    await userEvent.click(screen.getByText('simpan-post'))
    expect(screen.queryByRole('dialog')).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: /AI Generator/ }))
    await userEvent.click(screen.getByText('tutup-ai'))
    expect(screen.queryByRole('dialog')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: /AI Generator/ }))
    await userEvent.click(screen.getByText('terapkan-ai'))
    expect(await screen.findByText('draft:Hasil AI')).toBeInTheDocument()
  })
})
