import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PostModal from './PostModal'
import { createPost, updatePost } from '../api/blogApi'
import { showToast } from '../../../helpers/toolsHelper'

vi.mock('../api/blogApi')
vi.mock('../../../helpers/toolsHelper', async () => ({
  ...(await vi.importActual('../../../helpers/toolsHelper')),
  showToast: vi.fn(),
}))
vi.mock('../../../components/MarkdownEditor', () => ({
  default: ({ value, onChange, dark }) => (
    <textarea aria-label="editor" data-dark={String(dark)} value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}))

describe('PostModal', () => {
  it('validasi judul dan isi wajib', async () => {
    render(<PostModal onClose={() => {}} onSaved={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    expect(screen.getByRole('alert')).toHaveTextContent('wajib diisi')
  })

  it('membuat artikel baru (dengan opsi terbitkan)', async () => {
    createPost.mockResolvedValue({})
    const onSaved = vi.fn()
    render(<PostModal dark onClose={() => {}} onSaved={onSaved} />)
    expect(screen.getByLabelText('editor')).toHaveAttribute('data-dark', 'true')
    await userEvent.type(screen.getByLabelText('Judul'), ' Judul Baru ')
    await userEvent.selectOptions(screen.getByLabelText('Kategori'), 'Bisnis')
    await userEvent.type(screen.getByLabelText(/Ringkasan/), 'ringkas')
    await userEvent.type(screen.getByLabelText(/gambar sampul/), '/img.png')
    await userEvent.type(screen.getByLabelText('editor'), 'isi')
    await userEvent.click(screen.getByLabelText('Langsung terbitkan'))
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    await waitFor(() => expect(onSaved).toHaveBeenCalled())
    expect(createPost).toHaveBeenCalledWith({ title: 'Judul Baru', category: 'Bisnis', excerpt: 'ringkas', content: 'isi', cover_image_path: '/img.png', is_published: true })
    expect(showToast).toHaveBeenCalledWith('success', 'Artikel dibuat')
  })

  it('mengedit artikel yang ada', async () => {
    updatePost.mockResolvedValue({})
    const onSaved = vi.fn()
    const post = { id: 9, title: 'Lama', category: 'Opini', excerpt: 'e', content: 'c', cover_image_path: 'p' }
    render(<PostModal post={post} onClose={() => {}} onSaved={onSaved} />)
    expect(screen.queryByLabelText('Langsung terbitkan')).toBeNull()
    expect(screen.getByLabelText('Judul')).toHaveValue('Lama')
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    await waitFor(() => expect(onSaved).toHaveBeenCalled())
    expect(updatePost).toHaveBeenCalledWith(9, expect.objectContaining({ title: 'Lama', content: 'c' }))
    expect(showToast).toHaveBeenCalledWith('success', 'Artikel diperbarui')
  })

  it('memakai draf dari AI sebagai nilai awal', () => {
    render(<PostModal draft={{ title: 'Draf AI', content: 'x' }} onClose={() => {}} onSaved={() => {}} />)
    expect(screen.getByLabelText('Judul')).toHaveValue('Draf AI')
    expect(screen.getByLabelText('Kategori')).toHaveValue('Umum')
  })

  it('menampilkan error simpan dan menutup lewat Batal', async () => {
    createPost.mockRejectedValue(new Error('Slug bentrok'))
    const onClose = vi.fn()
    render(<PostModal draft={{ title: 'T', content: 'C' }} onClose={onClose} onSaved={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Slug bentrok')
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }))
    expect(onClose).toHaveBeenCalled()
  })
})
