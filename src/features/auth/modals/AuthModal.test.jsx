import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthModal from './AuthModal'

vi.mock('../api/authApi')

describe('AuthModal', () => {
  it('menampilkan form login dengan id login-username', () => {
    render(<AuthModal onClose={() => {}} onAuthenticated={() => {}} onRegister={() => {}} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(document.getElementById('login-username')).toBeInTheDocument()
  })

  it('menutup lewat tombol dan tombol Escape, mengabaikan tombol lain', async () => {
    const onClose = vi.fn()
    render(<AuthModal onClose={onClose} onAuthenticated={() => {}} onRegister={() => {}} />)
    await userEvent.keyboard('a')
    expect(onClose).not.toHaveBeenCalled()
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
    await userEvent.click(screen.getByRole('button', { name: 'Tutup' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('tombol Daftar memanggil onRegister', async () => {
    const onRegister = vi.fn()
    render(<AuthModal onClose={() => {}} onAuthenticated={() => {}} onRegister={onRegister} />)
    await userEvent.click(screen.getByRole('button', { name: 'Daftar' }))
    expect(onRegister).toHaveBeenCalled()
  })
})
