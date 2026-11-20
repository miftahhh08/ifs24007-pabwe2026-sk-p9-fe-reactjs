import { useEffect } from 'react'
import { IconX } from '@tabler/icons-react'
import { AuthForm } from '../components/AuthPage'

export default function AuthModal({ onClose, onAuthenticated, onRegister }) {
  useEffect(() => {
    const onKey = (event) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="login-modal-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="card w-full max-w-md p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <h2 id="login-modal-title" className="text-xl font-bold">Masuk ke Delcom Blog</h2>
          <button type="button" aria-label="Tutup" onClick={onClose} className="btn btn-ghost !p-1">
            <IconX size={18} aria-hidden="true" />
          </button>
        </div>
        <AuthForm mode="login" onAuthenticated={onAuthenticated} />
        <p className="mt-4 text-sm">
          Belum punya akun?{' '}
          <button type="button" onClick={onRegister} className="font-semibold text-indigo-700 underline dark:text-indigo-300">
            Daftar
          </button>
        </p>
      </div>
    </div>
  )
}
