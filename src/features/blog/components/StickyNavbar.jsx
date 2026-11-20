import { IconMoon, IconPencil, IconSun } from '@tabler/icons-react'
import { ACCENTS } from '../../../hooks/useTheme'
import { linkTo } from '../../../helpers/toolsHelper'

export default function StickyNavbar({ user, navigate, onLogin, onLogout, theme }) {
  const link = 'rounded-lg px-3 py-2 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700'
  return (
    <header className="sticky top-0 z-30 border-b border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900">
      <nav aria-label="Navigasi utama" className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <a href="/" onClick={linkTo(navigate, '/')} className="flex items-center gap-2 text-lg font-bold">
          <IconPencil size={22} aria-hidden="true" /> Delcom Blog
        </a>
        <div className="flex flex-wrap items-center gap-1">
          <a href="/" onClick={linkTo(navigate, '/')} className={link}>Beranda</a>
          {user && <a href="/author" onClick={linkTo(navigate, '/author')} className={link}>Workspace</a>}
          {user?.role === 'admin' && <a href="/admin" onClick={linkTo(navigate, '/admin')} className={link}>Admin</a>}
          {user ? (
            <button type="button" onClick={onLogout} className="btn btn-ghost">Keluar</button>
          ) : (
            <>
              <button type="button" onClick={onLogin} className="btn btn-primary">Masuk</button>
              <a href="/register" onClick={linkTo(navigate, '/register')} className={link}>Daftar</a>
            </>
          )}
          <label htmlFor="accent-select" className="sr-only">Warna aksen</label>
          <select id="accent-select" value={theme.accent} onChange={(e) => theme.setAccent(e.target.value)} className="input !w-auto !py-1.5">
            {ACCENTS.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <button type="button" onClick={theme.toggleDark} aria-label={theme.dark ? 'Aktifkan tema terang' : 'Aktifkan tema gelap'} className="btn btn-ghost !p-2">
            {theme.dark ? <IconSun size={18} aria-hidden="true" /> : <IconMoon size={18} aria-hidden="true" />}
          </button>
        </div>
      </nav>
    </header>
  )
}
