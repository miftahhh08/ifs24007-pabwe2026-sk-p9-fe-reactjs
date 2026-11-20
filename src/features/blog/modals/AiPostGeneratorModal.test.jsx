import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AiPostGeneratorModal from './AiPostGeneratorModal'
import { aiGenerate } from '../api/blogApi'

vi.mock('../api/blogApi')
vi.mock('../../../components/MarkdownViewer', () => ({ default: ({ content }) => <div data-testid="viewer">{content}</div> }))

const result = { title: 'Judul AI', category: 'Teknologi', excerpt: 'Ringkas', content: '# isi', sources: [{ title: 'Sumber A', url: 'http://a' }, { url: 'http://b' }, { title: 'Tanpa URL' }] }

describe('AiPostGeneratorModal', () => {
  it('validasi topik wajib', async () => {
    render(<AiPostGeneratorModal onClose={() => {}} onApply={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Generate' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Topik')
    expect(screen.getByRole('button', { name: 'Terapkan ke Editor' })).toBeDisabled()
  })

  it('generate lalu terapkan ke editor', async () => {
    aiGenerate.mockResolvedValue(result)
    const onApply = vi.fn()
    render(<AiPostGeneratorModal onClose={() => {}} onApply={onApply} />)
    await userEvent.type(screen.getByLabelText('Topik artikel'), ' AI kampus ')
    await userEvent.selectOptions(screen.getByLabelText('Kategori'), 'Pendidikan')
    await userEvent.click(screen.getByRole('checkbox'))
    await userEvent.click(screen.getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Generate' }))
    expect(await screen.findByText('Judul AI')).toBeInTheDocument()
    expect(aiGenerate).toHaveBeenCalledWith({ topic: 'AI kampus', category: 'Pendidikan', includeWebSearch: true })
    expect(screen.getByRole('link', { name: 'Sumber A' })).toHaveAttribute('href', 'http://a')
    expect(screen.getByRole('link', { name: 'http://b' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Terapkan ke Editor' }))
    expect(onApply).toHaveBeenCalledWith(result)
  })

  it('tanpa sumber penelusuran', async () => {
    aiGenerate.mockResolvedValue({ ...result, sources: [] })
    render(<AiPostGeneratorModal onClose={() => {}} onApply={() => {}} />)
    await userEvent.type(screen.getByLabelText('Topik artikel'), 'x')
    await userEvent.click(screen.getByRole('button', { name: 'Generate' }))
    expect(await screen.findByText('Tidak ada sumber penelusuran.')).toBeInTheDocument()
  })

  it('menampilkan error dan menutup modal', async () => {
    aiGenerate.mockRejectedValue(new Error('AI gagal'))
    const onClose = vi.fn()
    render(<AiPostGeneratorModal onClose={onClose} onApply={() => {}} />)
    await userEvent.type(screen.getByLabelText('Topik artikel'), 'x')
    await userEvent.click(screen.getByRole('button', { name: 'Generate' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('AI gagal')
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }))
    expect(onClose).toHaveBeenCalled()
  })
})
