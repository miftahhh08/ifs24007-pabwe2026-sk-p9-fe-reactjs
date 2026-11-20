import Swal from 'sweetalert2'

export const CATEGORIES = ['Teknologi', 'Pendidikan', 'Gaya Hidup', 'Bisnis', 'Opini', 'Umum']

export function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** Estimasi waktu baca (menit): pakai nilai dari backend bila ada, jika tidak hitung kata / 200 wpm. */
export function readingTime(post) {
  const given = post.reading_time ?? post.reading_time_minutes
  if (typeof given === 'number') return given
  const words = (post.content || '').trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export const authorName = (post) => post.author?.username ?? post.user?.username ?? post.author_name ?? 'Penulis'

export const linkTo = (navigate, path) => (event) => {
  if (event.metaKey || event.ctrlKey) return
  event.preventDefault()
  navigate(path)
}

export const pickStats = (data) => ({
  total: data?.total ?? data?.total_posts ?? data?.total_articles ?? 0,
  published: data?.published ?? data?.total_published ?? data?.total_selesai ?? 0,
  draft: data?.draft ?? data?.total_draft ?? data?.total_drafts ?? data?.unfinished ?? 0,
})

export const userCounts = (user) => ({
  total: user.total_posts ?? user.posts_count ?? 0,
  published: user.total_published ?? user.published_posts ?? 0,
})

export const showAlert = (icon, title, text) => Swal.fire({ icon, title, text, confirmButtonColor: '#4338ca' })

export const showToast = (icon, title) =>
  Swal.fire({ toast: true, position: 'top-end', icon, title, showConfirmButton: false, timer: 2500 })

export async function confirmDialog(title, text) {
  const result = await Swal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: 'Ya, lanjutkan',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#b91c1c',
  })
  return result.isConfirmed
}
