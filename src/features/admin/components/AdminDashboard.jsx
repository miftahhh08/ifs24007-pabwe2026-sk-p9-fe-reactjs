import { useEffect, useState } from 'react'
import { formatDate, showAlert, userCounts } from '../../../helpers/toolsHelper'
import { listAllPosts, listUserPosts, listUsers } from '../api/adminApi'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([listUsers(), listAllPosts()])
      .then(([u, p]) => {
        setUsers(u)
        setPosts(p)
      })
      .catch((err) => showAlert('error', 'Gagal memuat data admin', err.message))
      .finally(() => setLoading(false))
  }, [])

  const showUser = async (user) => {
    try {
      setPosts(await listUserPosts(user.id))
      setSelected(user)
    } catch (err) {
      showAlert('error', 'Gagal memuat artikel pengguna', err.message)
    }
  }

  const showAll = async () => {
    try {
      setPosts(await listAllPosts())
      setSelected(null)
    } catch (err) {
      showAlert('error', 'Gagal memuat artikel', err.message)
    }
  }

  const th = 'px-4 py-3'
  return (
    <main className="w-full space-y-8 px-4 py-8 sm:px-8">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      {loading && <p role="status" className="muted">Memuat data...</p>}

      <section aria-labelledby="users-title">
        <h2 id="users-title" className="mb-3 text-xl font-semibold">Direktori Pengguna ({users.length})</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Daftar pengguna sistem</caption>
            <thead className="bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
              <tr>
                {['ID', 'Username', 'Email', 'Role', 'Total Artikel', 'Total Terbit'].map((name) => (
                  <th key={name} scope="col" className={th}>{name}</th>
                ))}
                <th scope="col" className={th}><span className="sr-only">Aksi</span></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const counts = userCounts(user)
                return (
                  <tr key={user.id} className="border-t border-slate-300 dark:border-slate-700">
                    <td className={th}>{user.id}</td>
                    <td className={`${th} font-semibold`}>{user.username}</td>
                    <td className={th}>{user.email}</td>
                    <td className={th}>{user.role}</td>
                    <td className={th}>{counts.total}</td>
                    <td className={th}>{counts.published}</td>
                    <td className={th}>
                      <button type="button" onClick={() => showUser(user)} className="btn btn-ghost !py-1" aria-label={`Lihat artikel ${user.username}`}>Lihat artikel</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="posts-title">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 id="posts-title" className="text-xl font-semibold">
            {selected ? `Artikel oleh ${selected.username}` : 'Arsip Semua Artikel'} ({posts.length})
          </h2>
          {selected && <button type="button" onClick={showAll} className="btn btn-ghost">Tampilkan semua</button>}
        </div>
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Arsip artikel</caption>
            <thead className="bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
              <tr>
                {['Judul', 'Kategori', 'Status', 'Dibuat'].map((name) => (
                  <th key={name} scope="col" className={th}>{name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-t border-slate-300 dark:border-slate-700">
                  <td className={`${th} font-semibold`}>{post.title}</td>
                  <td className={th}>{post.category}</td>
                  <td className={th}>{post.is_published ? 'Terbit' : 'Draf'}</td>
                  <td className={th}>{formatDate(post.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
