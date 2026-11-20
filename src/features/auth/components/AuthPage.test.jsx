import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthPage from './AuthPage'
import * as authApi from '../api/authApi'
import { showAlert } from '../../../helpers/toolsHelper'

vi.mock('../api/authApi')
vi.mock('../../../helpers/toolsHelper', async () => ({
  ...(await vi.importActual('../../../helpers/toolsHelper')),
  showAlert: vi.fn().mockResolvedValue({}),
}))

const setup = (mode) => {
  const props = { mode, navigate: vi.fn(), onAuthenticated: vi.fn() }
  render(<AuthPage {...props} />)
  return props
}

describe('AuthPage login', () => {
  it('menyediakan id wajib untuk grader', () => {
    setup('login')
    expect(document.getElementById('login-username')).toBeInTheDocument()
    expect(document.getElementById('login-password')).toBeInTheDocument()
    expect(document.getElementById('login-submit')).toBeInTheDocument()
  })

  it('validasi field kosong', async () => {
    setup('login')
    await userEvent.click(document.getElementById('login-submit'))
    expect(screen.getByRole('alert')).toHaveTextContent('wajib diisi')
  })

  it('login sukses memanggil onAuthenticated', async () => {
    const props = setup('login')
    authApi.login.mockResolvedValue({ token: 't', user: { role: 'member' } })
    await userEvent.type(document.getElementById('login-username'), ' admin ')
    await userEvent.type(document.getElementById('login-password'), 'admin')
    await userEvent.click(document.getElementById('login-submit'))
    await waitFor(() => expect(props.onAuthenticated).toHaveBeenCalledWith({ token: 't', user: { role: 'member' } }))
    expect(authApi.login).toHaveBeenCalledWith({ username: 'admin', password: 'admin' })
  })

  it('menampilkan pesan error dari backend', async () => {
    setup('login')
    authApi.login.mockRejectedValue(new Error('Kredensial salah'))
    await userEvent.type(document.getElementById('login-username'), 'a')
    await userEvent.type(document.getElementById('login-password'), 'b')
    await userEvent.click(document.getElementById('login-submit'))
    expect(await screen.findByRole('alert')).toHaveTextContent('Kredensial salah')
  })

  it('tautan ke register & beranda memakai navigate', async () => {
    const props = setup('login')
    await userEvent.click(screen.getByRole('link', { name: 'Daftar' }))
    expect(props.navigate).toHaveBeenCalledWith('/register')
    await userEvent.click(screen.getByRole('link', { name: /Kembali/ }))
    expect(props.navigate).toHaveBeenCalledWith('/')
  })
})

describe('AuthPage register', () => {
  const fill = async (u, e, p) => {
    if (u) await userEvent.type(document.getElementById('register-username'), u)
    if (e) await userEvent.type(document.getElementById('register-email'), e)
    if (p) await userEvent.type(document.getElementById('register-password'), p)
    await userEvent.click(document.getElementById('register-submit'))
  }

  it('validasi username/password, email, dan panjang password', async () => {
    setup('register')
    await fill('', '', '')
    expect(screen.getByRole('alert')).toHaveTextContent('wajib diisi')
    await fill('budi', 'salah', 'rahasia')
    expect(screen.getByRole('alert')).toHaveTextContent('email')
    await userEvent.clear(document.getElementById('register-email'))
    await userEvent.type(document.getElementById('register-email'), 'budi@del.ac.id')
    await userEvent.clear(document.getElementById('register-password'))
    await userEvent.type(document.getElementById('register-password'), '123')
    await userEvent.click(document.getElementById('register-submit'))
    expect(screen.getByRole('alert')).toHaveTextContent('minimal 6')
  })

  it('registrasi sukses menuju login', async () => {
    const props = setup('register')
    authApi.register.mockResolvedValue({})
    await fill('budi', 'budi@del.ac.id', 'rahasia')
    await waitFor(() => expect(props.navigate).toHaveBeenCalledWith('/login'))
    expect(showAlert).toHaveBeenCalled()
    await userEvent.click(screen.getByRole('link', { name: 'Masuk' }))
    expect(props.navigate).toHaveBeenCalledWith('/login')
  })
})
