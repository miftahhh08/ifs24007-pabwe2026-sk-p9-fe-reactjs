import { useState } from 'react'
import MarkdownEditor from '../../../components/MarkdownEditor'
import useInput from '../../../hooks/useInput'
import { CATEGORIES, showToast } from '../../../helpers/toolsHelper'
import { createPost, updatePost } from '../api/blogApi'

export default function PostModal({ post = null, draft = null, dark = false, onClose, onSaved }) {
  const source = post ?? draft ?? {}
  const title = useInput(source.title ?? '')
  const category = useInput(source.category ?? 'Umum')
  const excerpt = useInput(source.excerpt ?? '')
  const cover = useInput(source.cover_image_path ?? '')
  const [content, setContent] = useState(source.content ?? '')
  const [publish, setPublish] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const isEdit = post !== null

  const submit = async (event) => {
    event.preventDefault()
    if (!title.value.trim() || !content.trim()) {
      setError('Judul dan isi artikel wajib diisi.')
      return
    }
    setBusy(true)
    setError('')
    const body = {
      title: title.value.trim(),
      category: category.value,
      excerpt: excerpt.value.trim(),
      content,
      cover_image_path: cover.value.trim(),
    }
    try {
      if (isEdit) await updatePost(post.id, body)
      else await createPost({ ...body, is_published: publish })
      showToast('success', isEdit ? 'Artikel diperbarui' : 'Artikel dibuat')
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="post-modal-title" className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-2">
      <div className="flex max-h-[96vh] w-full max-w-[96vw] flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-slate-900">
        <header className="bg-indigo-800 px-5 py-3 text-white">
          <h2 id="post-modal-title" className="text-lg font-bold">{isEdit ? 'Edit Artikel' : 'Tambah Artikel'}</h2>
        </header>
        <form id="post-form" onSubmit={submit} noValidate className="flex-1 space-y-4 overflow-y-auto p-5">
          {error && <p role="alert" className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-900">{error}</p>}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label htmlFor="post-title" className="mb-1 block text-sm font-medium">Judul</label>
              <input id="post-title" className="input" value={title.value} onChange={title.onChange} />
            </div>
            <div>
              <label htmlFor="post-category" className="mb-1 block text-sm font-medium">Kategori</label>
              <select id="post-category" className="input" value={category.value} onChange={category.onChange}>
                {CATEGORIES.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="post-excerpt" className="mb-1 block text-sm font-medium">Ringkasan (excerpt)</label>
            <textarea id="post-excerpt" rows={2} className="input" value={excerpt.value} onChange={excerpt.onChange} />
          </div>
          <div>
            <label htmlFor="post-cover" className="mb-1 block text-sm font-medium">Lokasi gambar sampul (opsional)</label>
            <input id="post-cover" className="input" value={cover.value} onChange={cover.onChange} />
          </div>
          <div>
            <p className="mb-1 text-sm font-medium">Isi artikel (Markdown)</p>
            <MarkdownEditor value={content} onChange={setContent} dark={dark} />
          </div>
          {!isEdit && (
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} /> Langsung terbitkan
            </label>
          )}
        </form>
        <footer className="flex justify-end gap-2 bg-slate-200 px-5 py-3 dark:bg-slate-800">
          <button type="button" onClick={onClose} className="btn btn-ghost">Batal</button>
          <button type="submit" form="post-form" disabled={busy} className="btn btn-primary">{busy ? 'Menyimpan...' : 'Simpan'}</button>
        </footer>
      </div>
    </div>
  )
}
