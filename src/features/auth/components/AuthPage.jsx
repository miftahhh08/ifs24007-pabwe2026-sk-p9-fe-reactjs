import { useState } from 'react'
import useInput from '../../../hooks/useInput'
import { showAlert, linkTo } from '../../../helpers/toolsHelper'
import { login, register } from '../api/authApi'

export function AuthForm({ mode, onAuthenticated, onRegistered }) {
  const username = useInput('')
  const email = useInput('')
  const password = useInput('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const isLogin = mode === 'login'
  const prefix = isLogin ? 'login' : 'register'

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (!username.value.trim() || !password.value) {
      setError('Username dan password wajib diisi.')
      return
    }
    if (!isLogin && !/^\S+@\S+\.\S+$/.test(email.value)) {
      setError('Format email tidak valid.')
      return
    }
    if (!isLogin && password.value.length < 6) {
      setError('Password minimal 6 karakter.')
      return
    }
    setBusy(true)
    try {
      if (isLogin) {
        onAuthenticated(await login({ username: username.value.trim(), password: password.value }))
      } else {
        await register({ username: username.value.trim(), email: email.value.trim(), password: password.value })
        await showAlert('success', 'Registrasi berhasil', 'Silakan masuk dengan akun baru Anda.')
        onRegistered()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {error && (
        <p role="alert" className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-900">
          {error}
        </p>
      )}
      <div>
        <label htmlFor={`${prefix}-username`} className="mb-1 block text-sm font-medium">Username</label>
        <input id={`${prefix}-username`} className="input" autoComplete="username" value={username.value} onChange={username.onChange} />
      </div>
      {!isLogin && (
        <div>
          <label htmlFor="register-email" className="mb-1 block text-sm font-medium">Email</label>
          <input id="register-email" type="email" className="input" autoComplete="email" value={email.value} onChange={email.onChange} />
        </div>
      )}
      <div>
        <label htmlFor={`${prefix}-password`} className="mb-1 block text-sm font-medium">Password</label>
        <input
          id={`${prefix}-password`}
          type="password"
          className="input"
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          value={password.value}
          onChange={password.onChange}
        />
      </div>
      <button id={`${prefix}-submit`} type="submit" disabled={busy} className="btn btn-primary w-full">
        {busy ? 'Memproses...' : isLogin ? 'Masuk' : 'Daftar'}
      </button>
    </form>
  )
}

export default function AuthPage({ mode, navigate, onAuthenticated }) {
  const isLogin = mode === 'login'
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="card w-full max-w-md p-6 shadow-sm" aria-labelledby="auth-title">
        <a href="/" onClick={linkTo(navigate, '/')} className="mb-4 inline-block text-sm font-semibold underline">
          &larr; Kembali ke beranda
        </a>
        <h1 id="auth-title" className="mb-1 text-2xl font-bold">{isLogin ? 'Masuk ke Delcom Blog' : 'Daftar Akun Penulis'}</h1>
        <p className="muted mb-5 text-sm">
          {isLogin ? 'Gunakan akun penulis atau admin Anda.' : 'Buat akun untuk mulai menulis artikel.'}
        </p>
        <AuthForm mode={mode} onAuthenticated={onAuthenticated} onRegistered={() => navigate('/login')} />
        <p className="mt-5 text-sm">
          {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <a
            href={isLogin ? '/register' : '/login'}
            onClick={linkTo(navigate, isLogin ? '/register' : '/login')}
            className="font-semibold text-indigo-700 underline dark:text-indigo-300"
          >
            {isLogin ? 'Daftar' : 'Masuk'}
          </a>
        </p>
      </section>
    </main>
  )
}
