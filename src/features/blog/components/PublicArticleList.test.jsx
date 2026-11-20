import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PublicArticleList from './PublicArticleList'
import { listPublicPosts } from '../api/blogApi'

vi.mock('../api/blogApi')

const post = { id: 1, slug: 'halo', title: 'Halo Dunia', category: 'Umum', excerpt: 'Ringkas', content: 'a b c', published_at: '2026-11-01T00:00:00Z', author: { username: 'sari' } }

describe('PublicArticleList', () => {
  it('memuat dan menampilkan artikel, navigasi ke detail', async () => {
    listPublicPosts.mockResolvedValue([post])
    const navigate = vi.fn()
    render(<PublicArticleList navigate={navigate} />)
    expect(screen.getByRole('status')).toHaveTextContent('Memuat')
    await userEvent.click(await screen.findByRole('link', { name: 'Halo Dunia' }))
    expect(navigate).toHaveBeenCalledWith('/posts/halo')
    expect(screen.getByText(/1 menit baca/)).toBeInTheDocument()
    expect(listPublicPosts).toHaveBeenCalledWith({ q: '', category: '' })
  })

  it('pencarian real-time dan filter kategori', async () => {
    listPublicPosts.mockResolvedValue([post])
    render(<PublicArticleList navigate={() => {}} />)
    await screen.findByText('Halo Dunia')
    await userEvent.type(screen.getByLabelText('Cari artikel'), ' go ')
    await waitFor(() => expect(listPublicPosts).toHaveBeenLastCalledWith({ q: 'go', category: '' }))
    await userEvent.click(screen.getByRole('button', { name: 'Bisnis' }))
    await waitFor(() => expect(listPublicPosts).toHaveBeenLastCalledWith({ q: 'go', category: 'Bisnis' }))
    expect(screen.getByRole('button', { name: 'Bisnis' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'Semua' }))
    await waitFor(() => expect(listPublicPosts).toHaveBeenLastCalledWith({ q: 'go', category: '' }))
  })

  it('daftar kosong', async () => {
    listPublicPosts.mockResolvedValue([])
    render(<PublicArticleList navigate={() => {}} />)
    expect(await screen.findByText(/Belum ada artikel/)).toBeInTheDocument()
  })

  it('menampilkan error', async () => {
    listPublicPosts.mockRejectedValue(new Error('Server mati'))
    render(<PublicArticleList navigate={() => {}} />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Server mati')
  })

  it('mengabaikan respons sukses setelah unmount', async () => {
    let resolve
    listPublicPosts.mockReturnValueOnce(new Promise((r) => { resolve = r }))
    const view = render(<PublicArticleList navigate={() => {}} />)
    await waitFor(() => expect(listPublicPosts).toHaveBeenCalledTimes(1))
    view.unmount()
    await act(async () => { resolve([post]) })
  })

  it('mengabaikan respons gagal setelah unmount', async () => {
    let reject
    listPublicPosts.mockReturnValueOnce(new Promise((_, r) => { reject = r }))
    const view = render(<PublicArticleList navigate={() => {}} />)
    await waitFor(() => expect(listPublicPosts).toHaveBeenCalledTimes(1))
    view.unmount()
    await act(async () => { reject(new Error('x')) })
  })
})
