import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App, { guard, parseRoute } from './App'
import { getToken, setToken } from './helpers/apiHelper'
import * as authApi from './features/auth/api/authApi'

vi.mock('./features/auth/api/authApi')
vi.mock('./features/auth/components/AuthPage', () => ({
  default: ({ mode, navigate, onAuthenticated }) => (
    <div>
      <p>auth:{mode}</p>
      <button onClick={() => onAuthenticated({ token: 'T', user: { role: 'member' } })}>do-login-member</button>
      <button onClick={() => onAuthenticated({ token: 'T', user: { role: 'admin' } })}>do-login-admin</button>
      <button onClick={() => navigate('/')}>go-home</button>
    </div>
  ),
}))
vi.mock('./features/auth/modals/AuthModal', () => ({
  default: ({ onClose, onAuthenticated, onRegister }) => (
    <div role="dialog">
      <button onClick={onClose}>modal-close</button>
      <button onClick={onRegister}>modal-register</button>
      <button onClick={() => onAuthenticated({ token: 'M', user: { role: 'member' } })}>modal-login</button>
    </div>
  ),
}))
vi.mock('./features/blog/components/StickyNavbar', () => ({
  default: ({ user, navigate, onLogin, onLogout }) => (
    <nav>
      <span>user:{user ? user.role : 'guest'}</span>
      <button onClick={onLogin}>nav-login</button>
      <button onClick={onLogout}>nav-logout</button>
      <button onClick={() => navigate('/posts/a%20b')}>nav-detail</button>
      <button onClick={() => navigate('/zzz')}>nav-404</button>
      <button onClick={() => navigate('/public')}>nav-public</button>
    </nav>
  ),
}))
vi.mock('./features/blog/components/PublicArticleList', () => ({ default: () => <p>page:list</p> }))
vi.mock('./features/blog/components/PublicArticleDetail', () => ({ default: ({ slug }) => <p>page:detail:{slug}</p> }))
vi.mock('./features/blog/components/AuthorDashboard', () => ({ default: () => <p>page:author</p> }))
vi.mock('./features/admin/components/AdminDashboard', () => ({ default: () => <p>page:admin</p> }))

const go = (path) => window.history.replaceState(null, '', path)

beforeEach(() => go('/'))

describe('parseRoute & guard', () => {
  it('parseRoute', () => {
    expect(parseRoute('/')).toEqual({ name: 'list' })
    expect(parseRoute('/public')).toEqual({ name: 'list' })
    expect(parseRoute('/author')).toEqual({ name: 'author' })
    expect(parseRoute('/admin')).toEqual({ name: 'admin' })
    expect(parseRoute('/login')).toEqual({ name: 'login' })
    expect(parseRoute('/register')).toEqual({ name: 'register' })
    expect(parseRoute('/posts/a%20b')).toEqual({ name: 'detail', slug: 'a b' })
    expect(parseRoute('/nope')).toEqual({ name: 'notfound' })
  })

  it('guard', () => {
    expect(guard({ name: 'author' }, null)).toBe('/login')
    expect(guard({ name: 'author' }, { role: 'member' })).toBeNull()
    expect(guard({ name: 'admin' }, null)).toBe('/login')
    expect(guard({ name: 'admin' }, { role: 'member' })).toBe('/author')
    expect(guard({ name: 'admin' }, { role: 'admin' })).toBeNull()
    expect(guard({ name: 'login' }, { role: 'admin' })).toBe('/admin')
    expect(guard({ name: 'register' }, { role: 'member' })).toBe('/author')
    expect(guard({ name: 'login' }, null)).toBeNull()
    expect(guard({ name: 'list' }, null)).toBeNull()
  })
})

describe('App', () => {
  it('beranda dan rute detail / 404 / public', async () => {
    render(<App />)
    expect(screen.getByText('page:list')).toBeInTheDocument()
    await userEvent.click(screen.getByText('nav-detail'))
    expect(screen.getByText('page:detail:a b')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/posts/a%20b')
    await userEvent.click(screen.getByText('nav-404'))
    expect(screen.getByRole('heading', { name: /404/ })).toBeInTheDocument()
    await userEvent.click(screen.getByText('nav-public'))
    expect(screen.getByText('page:list')).toBeInTheDocument()
  })

  it('sinkron dengan tombol back (popstate)', () => {
    render(<App />)
    go('/posts/x')
    act(() => window.dispatchEvent(new PopStateEvent('popstate')))
    expect(screen.getByText('page:detail:x')).toBeInTheDocument()
  })

  it('/author tanpa login diarahkan ke /login', async () => {
    go('/author')
    render(<App />)
    expect(await screen.findByText('auth:login')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/login')
    await userEvent.click(screen.getByText('go-home'))
    expect(screen.getByText('page:list')).toBeInTheDocument()
  })

  it('/register menampilkan halaman daftar', () => {
    go('/register')
    render(<App />)
    expect(screen.getByText('auth:register')).toBeInTheDocument()
  })

  it('login sebagai penulis lalu logout', async () => {
    go('/login')
    authApi.logout.mockResolvedValue({})
    render(<App />)
    await userEvent.click(screen.getByText('do-login-member'))
    expect(await screen.findByText('page:author')).toBeInTheDocument()
    expect(getToken()).toBe('T')
    await userEvent.click(screen.getByText('nav-logout'))
    expect(await screen.findByText('page:list')).toBeInTheDocument()
    expect(getToken()).toBeNull()
  })

  it('login admin ke /admin; logout tetap bersih walau API gagal', async () => {
    go('/login')
    authApi.logout.mockRejectedValue(new Error('offline'))
    render(<App />)
    await userEvent.click(screen.getByText('do-login-admin'))
    expect(await screen.findByText('page:admin')).toBeInTheDocument()
    await userEvent.click(screen.getByText('nav-logout'))
    await waitFor(() => expect(screen.getByText('user:guest')).toBeInTheDocument())
    expect(getToken()).toBeNull()
  })

  it('modal login: buka, tutup, daftar, dan login', async () => {
    render(<App />)
    await userEvent.click(screen.getByText('nav-login'))
    await userEvent.click(screen.getByText('modal-close'))
    expect(screen.queryByRole('dialog')).toBeNull()
    await userEvent.click(screen.getByText('nav-login'))
    await userEvent.click(screen.getByText('modal-register'))
    expect(screen.getByText('auth:register')).toBeInTheDocument()
    go('/')
    act(() => window.dispatchEvent(new PopStateEvent('popstate')))
    await userEvent.click(screen.getByText('nav-login'))
    await userEvent.click(screen.getByText('modal-login'))
    expect(await screen.findByText('page:author')).toBeInTheDocument()
  })

  it('memulihkan sesi dari token tersimpan', async () => {
    setToken('abc')
    go('/author')
    authApi.getProfile.mockResolvedValue({ role: 'member' })
    render(<App />)
    expect(screen.getByRole('status')).toHaveTextContent('Memuat')
    expect(await screen.findByText('page:author')).toBeInTheDocument()
  })

  it('token tidak valid dibersihkan', async () => {
    setToken('basi')
    authApi.getProfile.mockRejectedValue(new Error('401'))
    render(<App />)
    expect(await screen.findByText('page:list')).toBeInTheDocument()
    expect(getToken()).toBeNull()
  })
})
