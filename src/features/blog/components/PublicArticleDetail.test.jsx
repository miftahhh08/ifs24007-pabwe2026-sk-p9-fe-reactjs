import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PublicArticleDetail from './PublicArticleDetail'
import { getPublicPost } from '../api/blogApi'

vi.mock('../api/blogApi')
vi.mock('../../../components/MarkdownViewer', () => ({ default: ({ content }) => <div data-testid="viewer">{content}</div> }))

const post = { id: 1, slug: 's', title: 'Judul', category: 'Teknologi', content: '# isi', cover_image_path: 'http://x/y.png', published_at: '2026-11-01T00:00:00Z', user: { username: 'sari' } }

describe('PublicArticleDetail', () => {
  it('menampilkan artikel lengkap dan kembali ke daftar', async () => {
    getPublicPost.mockResolvedValue(post)
    const navigate = vi.fn()
    render(<PublicArticleDetail slug="s" navigate={navigate} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Judul' })).toBeInTheDocument()
    expect(screen.getByTestId('viewer')).toHaveTextContent('# isi')
    expect(screen.getByAltText('Sampul artikel Judul')).toBeInTheDocument()
    expect(screen.getByText(/Oleh sari/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('link', { name: /Kembali/ }))
    expect(navigate).toHaveBeenCalledWith('/')
  })

  it('tanpa sampul dan tanpa konten', async () => {
    getPublicPost.mockResolvedValue({ ...post, cover_image_path: '', content: undefined })
    render(<PublicArticleDetail slug="s" navigate={() => {}} />)
    await screen.findByRole('heading', { name: 'Judul' })
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('error dan unmount sebelum respons', async () => {
    getPublicPost.mockRejectedValue(new Error('Artikel tidak ditemukan'))
    render(<PublicArticleDetail slug="x" navigate={() => {}} />)
    expect(await screen.findByRole('alert')).toHaveTextContent('tidak ditemukan')

    let resolve
    let reject
    getPublicPost.mockReturnValueOnce(new Promise((r) => { resolve = r }))
    render(<PublicArticleDetail slug="a" navigate={() => {}} />).unmount()
    resolve(post)
    getPublicPost.mockReturnValueOnce(new Promise((_, r) => { reject = r }))
    render(<PublicArticleDetail slug="b" navigate={() => {}} />).unmount()
    reject(new Error('x'))
    await Promise.resolve()
  })
})
