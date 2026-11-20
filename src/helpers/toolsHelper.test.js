import Swal from 'sweetalert2'
import { authorName, confirmDialog, formatDate, linkTo, pickStats, readingTime, showAlert, showToast, userCounts } from './toolsHelper'

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }))

describe('toolsHelper', () => {
  it('formatDate', () => {
    expect(formatDate(null)).toBe('-')
    expect(formatDate('bukan-tanggal')).toBe('-')
    expect(formatDate('2026-11-20T00:00:00Z')).toMatch(/2026/)
  })

  it('readingTime memakai nilai backend atau menghitung kata/200', () => {
    expect(readingTime({ reading_time: 5 })).toBe(5)
    expect(readingTime({ reading_time_minutes: 7 })).toBe(7)
    expect(readingTime({ content: '' })).toBe(1)
    expect(readingTime({})).toBe(1)
    expect(readingTime({ content: Array(401).fill('kata').join(' ') })).toBe(3)
  })

  it('authorName', () => {
    expect(authorName({ author: { username: 'a' } })).toBe('a')
    expect(authorName({ user: { username: 'u' } })).toBe('u')
    expect(authorName({ author_name: 'n' })).toBe('n')
    expect(authorName({})).toBe('Penulis')
  })

  it('linkTo', () => {
    const navigate = vi.fn()
    const preventDefault = vi.fn()
    linkTo(navigate, '/x')({ preventDefault })
    expect(navigate).toHaveBeenCalledWith('/x')
    expect(preventDefault).toHaveBeenCalled()
    linkTo(navigate, '/y')({ ctrlKey: true, preventDefault })
    linkTo(navigate, '/y')({ metaKey: true, preventDefault })
    expect(navigate).toHaveBeenCalledTimes(1)
  })

  it('pickStats dan userCounts', () => {
    expect(pickStats({ total: 3, published: 2, draft: 1 })).toEqual({ total: 3, published: 2, draft: 1 })
    expect(pickStats({ total_posts: 3, total_published: 2, total_draft: 1 })).toEqual({ total: 3, published: 2, draft: 1 })
    expect(pickStats({ total_articles: 3, total_selesai: 2, total_drafts: 1 })).toEqual({ total: 3, published: 2, draft: 1 })
    expect(pickStats({ unfinished: 4 }).draft).toBe(4)
    expect(pickStats(null)).toEqual({ total: 0, published: 0, draft: 0 })
    expect(userCounts({ total_posts: 2, total_published: 1 })).toEqual({ total: 2, published: 1 })
    expect(userCounts({ posts_count: 5, published_posts: 4 })).toEqual({ total: 5, published: 4 })
    expect(userCounts({})).toEqual({ total: 0, published: 0 })
  })

  it('dialog SweetAlert2', async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true })
    await showAlert('error', 'T', 'x')
    await showToast('success', 'ok')
    expect(await confirmDialog('a', 'b')).toBe(true)
    expect(Swal.fire).toHaveBeenCalledTimes(3)
    Swal.fire.mockResolvedValue({ isConfirmed: false })
    expect(await confirmDialog('a', 'b')).toBe(false)
  })
})
