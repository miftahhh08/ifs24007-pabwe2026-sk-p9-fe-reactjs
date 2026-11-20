import { apiRequest } from '../../../helpers/apiHelper'

export async function login({ username, password }) {
  const data = await apiRequest('/auth/login', { method: 'POST', body: { username, password }, auth: false })
  return { token: data.token ?? data.access_token, user: data.user ?? data }
}

export const register = ({ username, email, password }) =>
  apiRequest('/auth/register', { method: 'POST', body: { username, email, password }, auth: false })

export const logout = () => apiRequest('/auth/logout', { method: 'POST' })

export async function getProfile() {
  const data = await apiRequest('/auth/profile')
  return data.user ?? data
}

export async function updateProfile(body) {
  const data = await apiRequest('/auth/profile', { method: 'PUT', body })
  return data.user ?? data
}
