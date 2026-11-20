const TOKEN_KEY = 'delcom_blog_token'
const USER_KEY = 'delcom_blog_user'

/* global __API_BASE__ */
// Diisi saat build dari VITE_API_BASE_URL (mis. https://backend.s1if.cloud). Kosong = relatif (/api).
const API_BASE = __API_BASE__

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY))
  } catch {
    return null
  }
}

export const setToken = (token, user = null) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }
}

/**
 * Wrapper fetch terpusat. Semua respons backend berbentuk {status, message, data?}.
 * Mengembalikan `data` bila sukses, melempar ApiError bila gagal.
 */
export async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' }
  const hasBody = body !== undefined
  if (hasBody) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (auth && token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_BASE}/api${path}`, {
      method,
      headers,
      body: hasBody ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server. Pastikan backend berjalan.', 0)
  }

  let json = null
  try {
    json = await response.json()
  } catch {
    json = null
  }

  if (!response.ok) {
    throw new ApiError(json?.message || `Permintaan gagal (${response.status})`, response.status, json?.data ?? null)
  }
  return json?.data ?? null
}

export const asList = (data) => (Array.isArray(data) ? data : (data?.posts ?? data?.items ?? data?.users ?? []))
