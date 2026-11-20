import { useCallback, useEffect, useState } from 'react'
import { getToken, setToken } from './helpers/apiHelper'
import useTheme from './hooks/useTheme'
import { getProfile, logout } from './features/auth/api/authApi'
import AuthPage from './features/auth/components/AuthPage'
import AuthModal from './features/auth/modals/AuthModal'
import StickyNavbar from './features/blog/components/StickyNavbar'
import PublicArticleList from './features/blog/components/PublicArticleList'
import PublicArticleDetail from './features/blog/components/PublicArticleDetail'
import AuthorDashboard from './features/blog/components/AuthorDashboard'
import AdminDashboard from './features/admin/components/AdminDashboard'

export function parseRoute(path) {
  if (path === '/' || path === '/public') return { name: 'list' }
  if (path === '/author') return { name: 'author' }
  if (path === '/admin') return { name: 'admin' }
  if (path === '/login') return { name: 'login' }
  if (path === '/register') return { name: 'register' }
  const match = path.match(/^\/posts\/([^/]+)$/)
  if (match) return { name: 'detail', slug: decodeURIComponent(match[1]) }
  return { name: 'notfound' }
}

export function guard(route, user) {
  if (route.name === 'author' && !user) return '/login'
  if (route.name === 'admin' && user?.role !== 'admin') return user ? '/author' : '/login'
  if ((route.name === 'login' || route.name === 'register') && user) return user.role === 'admin' ? '/admin' : '/author'
  return null
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(!getToken())
  const [showLogin, setShowLogin] = useState(false)
  const theme = useTheme()

  const navigate = useCallback((to, { replace = false } = {}) => {
    if (replace) window.history.replaceState(null, '', to)
    else window.history.pushState(null, '', to)
    setPath(to)
  }, [])

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    if (!getToken()) return
    getProfile()
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setReady(true))
  }, [])

  const route = parseRoute(path)
  const redirect = ready ? guard(route, user) : null

  useEffect(() => {
    if (redirect) navigate(redirect, { replace: true })
  }, [redirect, navigate])

  const handleAuthenticated = ({ token, user: account }) => {
    setToken(token)
    setUser(account)
    setShowLogin(false)
    navigate(account.role === 'admin' ? '/admin' : '/author')
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // sesi lokal tetap dibersihkan walau server gagal dihubungi
    }
    setToken(null)
    setUser(null)
    navigate('/')
  }

  if (!ready || redirect) return <p role="status" className="p-8">Memuat...</p>

  if (route.name === 'login' || route.name === 'register') {
    return <AuthPage mode={route.name} navigate={navigate} onAuthenticated={handleAuthenticated} />
  }

  return (
    <>
      <StickyNavbar user={user} navigate={navigate} onLogin={() => setShowLogin(true)} onLogout={handleLogout} theme={theme} />
      {route.name === 'list' && <PublicArticleList navigate={navigate} />}
      {route.name === 'detail' && <PublicArticleDetail slug={route.slug} navigate={navigate} />}
      {route.name === 'author' && <AuthorDashboard dark={theme.dark} />}
      {route.name === 'admin' && <AdminDashboard />}
      {route.name === 'notfound' && (
        <main className="px-4 py-16 text-center">
          <h1 className="text-3xl font-bold">404 - Halaman tidak ditemukan</h1>
        </main>
      )}
      {showLogin && (
        <AuthModal
          onClose={() => setShowLogin(false)}
          onAuthenticated={handleAuthenticated}
          onRegister={() => {
            setShowLogin(false)
            navigate('/register')
          }}
        />
      )}
    </>
  )
}
