import { useState } from 'react'
import MarkdownViewer from '../../../components/MarkdownViewer'
import useInput from '../../../hooks/useInput'
import { CATEGORIES } from '../../../helpers/toolsHelper'
import { aiGenerate } from '../api/blogApi'

export default function AiPostGeneratorModal({ onClose, onApply }) {
  const topic = useInput('')
  const category = useInput('Teknologi')
  const [includeWebSearch, setIncludeWebSearch] = useState(true)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const generate = async (event) => {
    event.preventDefault()
    if (!topic.value.trim()) {
      setError('Topik artikel wajib diisi.')
      return
    }
    setBusy(true)
    setError('')
    setResult(null)
    try {
      setResult(await aiGenerate({ topic: topic.value.trim(), category: category.value, includeWebSearch }))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="ai-modal-title" className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-2">
      <div className="flex max-h-[96vh] w-full max-w-[96vw] flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-slate-900">
        <header className="bg-violet-800 px-5 py-3 text-white">
          <h2 id="ai-modal-title" className="text-lg font-bold">AI Blog Generator</h2>
        </header>
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <form id="ai-form" onSubmit={generate} noValidate className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label htmlFor="ai-topic" className="mb-1 block text-sm font-medium">Topik artikel</label>
              <input id="ai-topic" className="input" placeholder="Contoh: Tren AI generatif di pendidikan tinggi" value={topic.value} onChange={topic.onChange} />
            </div>
            <div>
              <label htmlFor="ai-category" className="mb-1 block text-sm font-medium">Kategori</label>
              <select id="ai-category" className="input" value={category.value} onChange={category.onChange}>
                {CATEGORIES.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium md:col-span-3">
              <input type="checkbox" checked={includeWebSearch} onChange={(e) => setIncludeWebSearch(e.target.checked)} />
              Sertakan penelusuran Search Engine (informasi terkini + sumber rujukan)
            </label>
          </form>
          {error && <p role="alert" className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-900">{error}</p>}
          {busy && <p role="status" className="muted">AI sedang menyusun artikel, mohon tunggu...</p>}
          {result && (
            <section aria-label="Pratinjau hasil AI" className="card space-y-3 p-4">
              <h3 className="text-xl font-bold">{result.title}</h3>
              <p className="muted text-sm">{result.category} &middot; {result.excerpt}</p>
              <MarkdownViewer content={result.content} />
              <div>
                <h4 className="font-semibold">Sumber Rujukan Penelusuran</h4>
                {result.sources.length === 0 ? (
                  <p className="muted text-sm">Tidak ada sumber penelusuran.</p>
                ) : (
                  <ul className="list-disc pl-5 text-sm">
                    {result.sources.map((source, index) => (
                      <li key={source.url ?? index}>
                        <a href={source.url} target="_blank" rel="noreferrer" className="font-medium text-indigo-700 underline dark:text-indigo-300">
                          {source.title ?? source.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          )}
        </div>
        <footer className="flex justify-end gap-2 bg-slate-200 px-5 py-3 dark:bg-slate-800">
          <button type="button" onClick={onClose} className="btn btn-ghost">Batal</button>
          <button type="submit" form="ai-form" disabled={busy} className="btn btn-primary">Generate</button>
          <button type="button" disabled={!result} onClick={() => onApply(result)} className="btn btn-primary">Terapkan ke Editor</button>
        </footer>
      </div>
    </div>
  )
}
