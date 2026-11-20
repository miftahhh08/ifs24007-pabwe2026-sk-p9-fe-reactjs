import { useCallback, useEffect, useState } from 'react'
import { IconDotsVertical, IconPlus, IconSparkles } from '@tabler/icons-react'
import { confirmDialog, formatDate, showAlert, showToast } from '../../../helpers/toolsHelper'
import { deletePost, getMyPost, getStats, listMyPosts, togglePublish } from '../api/blogApi'
import PostStats from './PostStats'
import PostModal from '../modals/PostModal'
import AiPostGeneratorModal from '../modals/AiPostGeneratorModal'

export default function AuthorDashboard({ dark }) {
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0 })
  const [loading, setLoading] = useState(true)
  const [menuId, setMenuId] = useState(null)
  const [modal, setModal] = useState(null) // {type:'post', post?, draft?} | {type:'ai'}

  const load = useCallback(async () => {
    try {
      const [list, summary] = await Promise.all([listMyPosts(), getStats()])
      setPosts(list)
      setStats(summary)
    } catch (err) {
      showAlert('error', 'Gagal memuat data', err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const edit = async (id) => {
    setMenuId(null)
    try {
      setModal({ type: 'post', post: await getMyPost(id) })
    } catch (err) {
      showAlert('error', 'Gagal membuka artikel', err.message)
    }
  }

  const remove = async (post) => {
    setMenuId(null)
    if (!(await confirmDialog('Hapus artikel?', `"${post.title}" akan dihapus permanen.`))) return
    try {
      await deletePost(post.id)
      showToast('success', 'Artikel dihapus')
      load()
    } catch (err) {
      showAlert('error', 'Gagal menghapus', err.message)
    }
  }

  const toggle = async (post) => {
    try {
      await togglePublish(post.id)
      showToast('success', post.is_published ? 'Dijadikan draf' : 'Artikel diterbitkan')
      load()
    } catch (err) {
      showAlert('error', 'Gagal mengubah status', err.message)
    }
  }

  const saved = () => {
    setModal(null)
    load()
  }

  return (
    <main className="w-full space-y-6 px-4 py-8 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Workspace Penulis</h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => setModal({ type: 'ai' })} className="btn btn-ghost">
            <IconSparkles size={18} aria-hidden="true" /> AI Generator
          </button>
          <button type="button" onClick={() => setModal({ type: 'post' })} className="btn btn-primary">
            <IconPlus size={18} aria-hidden="true" /> Tambah Artikel
          </button>
        </div>
      </div>

      <PostStats stats={stats} />

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Daftar artikel milik Anda</caption>
          <thead className="bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
            <tr>
              <th scope="col" className="px-4 py-3">Judul</th>
              <th scope="col" className="px-4 py-3">Kategori</th>
              <th scope="col" className="px-4 py-3">Terbit</th>
              <th scope="col" className="px-4 py-3">Dibuat</th>
              <th scope="col" className="px-4 py-3"><span className="sr-only">Aksi</span></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="muted px-4 py-6">Memuat artikel...</td></tr>
            )}
            {!loading && posts.length === 0 && (
              <tr><td colSpan={5} className="muted px-4 py-6">Belum ada artikel. Klik "Tambah Artikel" atau gunakan AI Generator.</td></tr>
            )}
            {posts.map((post) => (
              <tr key={post.id} className="border-t border-slate-300 dark:border-slate-700">
                <td className="px-4 py-3 font-semibold">{post.title}</td>
                <td className="px-4 py-3">{post.category}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={post.is_published}
                    aria-label={`Status terbit ${post.title}`}
                    onClick={() => toggle(post)}
                    className={`relative h-6 w-11 rounded-full ${post.is_published ? 'bg-emerald-700' : 'bg-slate-500'}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${post.is_published ? 'left-5' : 'left-0.5'}`} />
                  </button>
                  <span className="ml-2 text-xs font-medium">{post.is_published ? 'Terbit' : 'Draf'}</span>
                </td>
                <td className="px-4 py-3">{formatDate(post.created_at)}</td>
                <td className="relative px-4 py-3 text-right">
                  <button
                    type="button"
                    aria-label={`Menu aksi ${post.title}`}
                    aria-haspopup="menu"
                    aria-expanded={menuId === post.id}
                    onClick={() => setMenuId(menuId === post.id ? null : post.id)}
                    className="btn btn-ghost !p-1.5"
                  >
                    <IconDotsVertical size={18} aria-hidden="true" />
                  </button>
                  {menuId === post.id && (
                    <div role="menu" className="card absolute right-4 top-12 z-10 w-36 p-1 text-left shadow-lg">
                      <button type="button" role="menuitem" onClick={() => edit(post.id)} className="block w-full rounded px-3 py-2 text-left hover:bg-slate-200 dark:hover:bg-slate-700">Edit</button>
                      <button type="button" role="menuitem" onClick={() => remove(post)} className="block w-full rounded px-3 py-2 text-left text-red-800 hover:bg-red-100 dark:text-red-300 dark:hover:bg-slate-700">Hapus</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal?.type === 'post' && <PostModal key={modal.draft?.title ?? modal.post?.id ?? 'new'} post={modal.post ?? null} draft={modal.draft ?? null} dark={dark} onClose={() => setModal(null)} onSaved={saved} />}
      {modal?.type === 'ai' && <AiPostGeneratorModal onClose={() => setModal(null)} onApply={(draft) => setModal({ type: 'post', draft })} />}
    </main>
  )
}
