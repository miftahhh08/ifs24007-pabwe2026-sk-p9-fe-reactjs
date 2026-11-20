import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StickyNavbar from './StickyNavbar'

const mkTheme = (dark = false) => ({ dark, accent: 'indigo', setAccent: vi.fn(), toggleDark: vi.fn() })
const setup = (user, dark) => {
  const props = { user, navigate: vi.fn(), onLogin: vi.fn(), onLogout: vi.fn(), theme: mkTheme(dark) }
  render(<StickyNavbar {...props} />)
  return props
}

describe('StickyNavbar', () => {
  it('guest: tombol Masuk dan tautan Daftar', async () => {
    const p = setup(null)
    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(p.onLogin).toHaveBeenCalled()
    await userEvent.click(screen.getByRole('link', { name: 'Daftar' }))
    expect(p.navigate).toHaveBeenCalledWith('/register')
    await userEvent.click(screen.getByRole('link', { name: /Delcom Blog/ }))
    expect(p.navigate).toHaveBeenCalledWith('/')
    expect(screen.queryByRole('link', { name: 'Workspace' })).toBeNull()
  })

  it('penulis: Workspace, tanpa Admin, bisa keluar', async () => {
    const p = setup({ role: 'member' })
    await userEvent.click(screen.getByRole('link', { name: 'Workspace' }))
    expect(p.navigate).toHaveBeenCalledWith('/author')
    expect(screen.queryByRole('link', { name: 'Admin' })).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Keluar' }))
    expect(p.onLogout).toHaveBeenCalled()
  })

  it('admin melihat tautan Admin', async () => {
    const p = setup({ role: 'admin' })
    await userEvent.click(screen.getByRole('link', { name: 'Admin' }))
    expect(p.navigate).toHaveBeenCalledWith('/admin')
  })

  it('tema dan aksen', async () => {
    const p = setup(null, false)
    await userEvent.click(screen.getByRole('button', { name: 'Aktifkan tema gelap' }))
    expect(p.theme.toggleDark).toHaveBeenCalled()
    await userEvent.selectOptions(screen.getByLabelText('Warna aksen'), 'rose')
    expect(p.theme.setAccent).toHaveBeenCalledWith('rose')
  })

  it('label tombol saat tema gelap', () => {
    setup(null, true)
    expect(screen.getByRole('button', { name: 'Aktifkan tema terang' })).toBeInTheDocument()
  })
})
