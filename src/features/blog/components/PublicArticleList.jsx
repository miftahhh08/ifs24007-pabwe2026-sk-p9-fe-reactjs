import { useEffect, useState } from 'react'
import { IconClock, IconSearch } from '@tabler/icons-react'
import { CATEGORIES, authorName, formatDate, linkTo, readingTime } from '../../../helpers/toolsHelper'
import { listPublicPosts } from '../api/blogApi'

export default function PublicArticleList({ navigate }) {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('Semua')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    const run = () =>
      listPublicPosts({ q: q.trim(), category: category === 'Semua' ? '' : category })
        .then((data) => {
          if (active) {
            setPosts(data)
            setError('')
          }
        })
        .catch((err) => active && setError(err.message))
        .finally(() => active && setLoading(false))
    if (!q) {
      run()
      return () => {
        active = false
      }
    }
    const timer = setTimeout(run, 300)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [q, category])

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">Artikel Terbaru</h1>
      <p className="muted mt-1">Baca artikel dari para penulis Delcom Blog.</p>

      <div className="relative mt-6">
        <label htmlFor="search-input" className="sr-only">Cari artikel</label>
        <IconSearch size={18} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input id="search-input" type="search" className="input !pl-10" placeholder="Cari artikel berdasarkan kata kunci..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div role="group" aria-label="Filter kategori" className="mt-4 flex flex-wrap gap-2">
        {['Semua', ...CATEGORIES].map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={category === name}
            onClick={() => setCategory(name)}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${category === name ? 'border-transparent bg-[var(--accent)] text-white' : 'border-slate-500 bg-transparent'}`}
          >
            {name}
          </button>
        ))}
      </div>

      {error && <p role="alert" className="mt-6 rounded-lg bg-red-100 px-3 py-2 font-medium text-red-900">{error}</p>}
      {loading && <p className="muted mt-6" role="status">Memuat artikel...</p>}
      {!loading && !error && posts.length === 0 && <p className="muted mt-6">Belum ada artikel yang cocok.</p>}

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article key={post.id} className="card flex flex-col p-5">
            <span className="mb-2 w-fit rounded-full bg-slate-200 px-3 py-0.5 text-xs font-semibold text-slate-900 dark:bg-slate-700 dark:text-slate-100">{post.category}</span>
            <h2 className="text-lg font-bold">
              <a href={`/posts/${post.slug}`} onClick={linkTo(navigate, `/posts/${post.slug}`)} className="hover:underline">{post.title}</a>
            </h2>
            <p className="muted mt-2 flex-1 text-sm">{post.excerpt}</p>
            <p className="muted mt-4 flex flex-wrap items-center gap-x-3 text-xs">
              <span>{authorName(post)}</span>
              <span>{formatDate(post.published_at)}</span>
              <span className="inline-flex items-center gap-1"><IconClock size={14} aria-hidden="true" />{readingTime(post)} menit baca</span>
            </p>
          </article>
        ))}
      </div>
    </main>
  )
}
