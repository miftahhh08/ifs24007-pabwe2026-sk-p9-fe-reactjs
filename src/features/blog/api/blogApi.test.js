import * as helper from '../../../helpers/apiHelper'
import * as api from './blogApi'

vi.mock('../../../helpers/apiHelper', async () => {
  const actual = await vi.importActual('../../../helpers/apiHelper')
  return { ...actual, apiRequest: vi.fn() }
})

describe('blogApi', () => {
  beforeEach(() => helper.apiRequest.mockResolvedValue([]))

  it('listPublicPosts membangun query string', async () => {
    await api.listPublicPosts()
    expect(helper.apiRequest).toHaveBeenLastCalledWith('/public/posts', { auth: false })
    await api.listPublicPosts({ q: 'go', category: 'Bisnis' })
    expect(helper.apiRequest).toHaveBeenLastCalledWith('/public/posts?q=go&category=Bisnis', { auth: false })
  })

  it('getPublicPost dan getMyPost membuka pembungkus post', async () => {
    helper.apiRequest.mockResolvedValueOnce({ post: { id: 1 } })
    expect(await api.getPublicPost('a b')).toEqual({ id: 1 })
    expect(helper.apiRequest).toHaveBeenLastCalledWith('/public/posts/a%20b', { auth: false })
    helper.apiRequest.mockResolvedValueOnce({ id: 2 })
    expect(await api.getPublicPost('x')).toEqual({ id: 2 })
    helper.apiRequest.mockResolvedValueOnce({ post: { id: 3 } })
    expect(await api.getMyPost(3)).toEqual({ id: 3 })
    helper.apiRequest.mockResolvedValueOnce({ id: 4 })
    expect(await api.getMyPost(4)).toEqual({ id: 4 })
  })

  it('listMyPosts dan getStats', async () => {
    helper.apiRequest.mockResolvedValueOnce({ posts: [1] })
    expect(await api.listMyPosts()).toEqual([1])
    helper.apiRequest.mockResolvedValueOnce({ total: 1, published: 1, draft: 0 })
    expect(await api.getStats()).toEqual({ total: 1, published: 1, draft: 0 })
  })

  it('operasi CRUD memakai method yang benar', async () => {
    await api.createPost({ a: 1 })
    expect(helper.apiRequest).toHaveBeenLastCalledWith('/posts', { method: 'POST', body: { a: 1 } })
    await api.updatePost(5, { a: 2 })
    expect(helper.apiRequest).toHaveBeenLastCalledWith('/posts/5', { method: 'PUT', body: { a: 2 } })
    await api.togglePublish(5)
    expect(helper.apiRequest).toHaveBeenLastCalledWith('/posts/5/toggle-publish', { method: 'PATCH' })
    await api.deletePost(5)
    expect(helper.apiRequest).toHaveBeenLastCalledWith('/posts/5', { method: 'DELETE' })
  })

  it('aiGenerate menormalkan hasil', async () => {
    helper.apiRequest.mockResolvedValueOnce({ post: { title: 'T', category: 'Bisnis', excerpt: 'E', content: 'C' }, sources: [{ url: 'u' }] })
    expect(await api.aiGenerate({ topic: 't', category: 'Umum', includeWebSearch: true })).toEqual({
      title: 'T', category: 'Bisnis', excerpt: 'E', content: 'C', sources: [{ url: 'u' }],
    })
    expect(helper.apiRequest).toHaveBeenLastCalledWith('/posts/ai-generate', { method: 'POST', body: { topic: 't', category: 'Umum', include_web_search: true } })
    helper.apiRequest.mockResolvedValueOnce({ search_sources: [1] })
    expect((await api.aiGenerate({ topic: 't', category: 'Umum', includeWebSearch: false })).sources).toEqual([1])
    helper.apiRequest.mockResolvedValueOnce({ sources: undefined, search_sources: undefined, title: 'x' })
    const bare = await api.aiGenerate({ topic: 't', category: 'Umum', includeWebSearch: false })
    expect(bare).toEqual({ title: 'x', category: 'Umum', excerpt: '', content: '', sources: [] })
    helper.apiRequest.mockResolvedValueOnce({ title: 'y', sources: undefined, search_sources: undefined })
    helper.apiRequest.mockResolvedValueOnce({ post: { sources: ['s'] } })
    expect((await api.aiGenerate({ topic: 't', category: 'Umum', includeWebSearch: false })).title).toBe('y')
    expect((await api.aiGenerate({ topic: 't', category: 'Umum', includeWebSearch: false })).sources).toEqual(['s'])
  })
})
