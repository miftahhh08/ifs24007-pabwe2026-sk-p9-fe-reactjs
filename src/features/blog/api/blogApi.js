import { apiRequest, asList } from '../../../helpers/apiHelper'
import { pickStats } from '../../../helpers/toolsHelper'

export async function listPublicPosts({ q = '', category = '' } = {}) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (category) params.set('category', category)
  const query = params.toString()
  return asList(await apiRequest(`/public/posts${query ? `?${query}` : ''}`, { auth: false }))
}

export async function getPublicPost(slug) {
  const data = await apiRequest(`/public/posts/${encodeURIComponent(slug)}`, { auth: false })
  return data.post ?? data
}

export async function listMyPosts() {
  return asList(await apiRequest('/posts'))
}

export async function getMyPost(id) {
  const data = await apiRequest(`/posts/${id}`)
  return data.post ?? data
}

export async function getStats() {
  return pickStats(await apiRequest('/posts/stats'))
}

export const createPost = (body) => apiRequest('/posts', { method: 'POST', body })
export const updatePost = (id, body) => apiRequest(`/posts/${id}`, { method: 'PUT', body })
export const togglePublish = (id) => apiRequest(`/posts/${id}/toggle-publish`, { method: 'PATCH' })
export const deletePost = (id) => apiRequest(`/posts/${id}`, { method: 'DELETE' })

export async function aiGenerate({ topic, category, includeWebSearch }) {
  const data = await apiRequest('/posts/ai-generate', {
    method: 'POST',
    body: { topic, category, include_web_search: includeWebSearch },
  })
  const draft = data.post ?? data
  return {
    title: draft.title ?? '',
    category: draft.category ?? category,
    excerpt: draft.excerpt ?? '',
    content: draft.content ?? '',
    sources: data.sources ?? data.search_sources ?? draft.sources ?? [],
  }
}
