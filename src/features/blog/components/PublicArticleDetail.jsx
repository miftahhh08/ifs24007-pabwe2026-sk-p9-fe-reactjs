import { useEffect, useState } from 'react'
import MarkdownViewer from '../../../components/MarkdownViewer'
import { authorName, formatDate, linkTo, readingTime } from '../../../helpers/toolsHelper'
import { getPublicPost } from '../api/blogApi'

export default function PublicArticleDetail({ slug, navigate }) {
  const [post, setPost] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setPost(null)
    setError('')
    getPublicPost(slug)
      .then((data) => active && setPost(data))
      .catch((err) => active && setError(err.message))
    return () => {
      active = false
    }
  }, [slug])

  return (
    <main className="w-full px-4 py-8 sm:px-8">
      <a href="/" onClick={linkTo(navigate, '/')} className="text-sm font-semibold underline">&larr; Kembali ke daftar artikel</a>
      {error && <p role="alert" className="mt-6 rounded-lg bg-red-100 px-3 py-2 font-medium text-red-900">{error}</p>}
      {!post && !error && <p role="status" className="muted mt-6">Memuat artikel...</p>}
      {post && (
        <article className="mt-6">
          <span className="rounded-full bg-slate-200 px-3 py-0.5 text-xs font-semibold text-slate-900 dark:bg-slate-700 dark:text-slate-100">{post.category}</span>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{post.title}</h1>
          <p className="muted mt-3 text-sm">
            Oleh {authorName(post)} &middot; {formatDate(post.published_at)} &middot; {readingTime(post)} menit baca
          </p>
          {post.cover_image_path && (
            <img src={post.cover_image_path} alt={`Sampul artikel ${post.title}`} className="mt-6 max-h-[28rem] w-full rounded-xl object-cover" />
          )}
          <div className="mt-6">
            <MarkdownViewer content={post.content ?? ''} />
          </div>
        </article>
      )}
    </main>
  )
}
