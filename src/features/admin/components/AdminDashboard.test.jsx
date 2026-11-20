import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminDashboard from './AdminDashboard'
import * as api from '../api/adminApi'
import { showAlert } from '../../../helpers/toolsHelper'

vi.mock('../api/adminApi')
vi.mock('../../../helpers/toolsHelper', async () => ({
  ...(await vi.importActual('../../../helpers/toolsHelper')),
  showAlert: vi.fn(),
}))

const users = [{ id: 1, username: 'sari', email: 's@x.id', role: 'member', total_posts: 2, total_published: 1 }]
const all = [{ id: 1, title: 'A', category: 'Umum', is_published: true, created_at: '2026-11-01T00:00:00Z' }, { id: 2, title: 'B', category: 'Bisnis', is_published: false }]

beforeEach(() => {
  api.listUsers.mockResolvedValue(users)
  api.listAllPosts.mockResolvedValue(all)
})

describe('AdminDashboard', () => {
  it('menampilkan direktori pengguna dan arsip artikel', async () => {
    render(<AdminDashboard />)
    expect(await screen.findByText('sari')).toBeInTheDocument()
    expect(screen.getByText('Arsip Semua Artikel (2)')).toBeInTheDocument()
    expect(screen.getByText('Terbit')).toBeInTheDocument()
    expect(screen.getByText('Draf')).toBeInTheDocument()
  })

  it('filter per pengguna lalu tampilkan semua', async () => {
    api.listUserPosts.mockResolvedValue([all[0]])
    render(<AdminDashboard />)
    await userEvent.click(await screen.findByRole('button', { name: 'Lihat artikel sari' }))
    expect(await screen.findByText('Artikel oleh sari (1)')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Tampilkan semua' }))
    expect(await screen.findByText('Arsip Semua Artikel (2)')).toBeInTheDocument()
  })

  it('error saat memuat, filter pengguna, dan tampilkan semua', async () => {
    api.listUsers.mockRejectedValueOnce(new Error('403'))
    render(<AdminDashboard />)
    await waitFor(() => expect(showAlert).toHaveBeenCalledWith('error', 'Gagal memuat data admin', '403'))

    api.listUserPosts.mockRejectedValueOnce(new Error('u'))
    render(<AdminDashboard />)
    await userEvent.click(await screen.findByRole('button', { name: 'Lihat artikel sari' }))
    await waitFor(() => expect(showAlert).toHaveBeenCalledWith('error', 'Gagal memuat artikel pengguna', 'u'))

    api.listUserPosts.mockResolvedValueOnce([all[0]])
    await userEvent.click(screen.getAllByRole('button', { name: 'Lihat artikel sari' })[1])
    await screen.findByText('Artikel oleh sari (1)')
    api.listAllPosts.mockRejectedValueOnce(new Error('a'))
    await userEvent.click(screen.getByRole('button', { name: 'Tampilkan semua' }))
    await waitFor(() => expect(showAlert).toHaveBeenCalledWith('error', 'Gagal memuat artikel', 'a'))
  })
})
