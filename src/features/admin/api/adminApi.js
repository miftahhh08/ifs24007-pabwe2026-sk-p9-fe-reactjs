import { apiRequest, asList } from '../../../helpers/apiHelper'

export const listUsers = async () => asList(await apiRequest('/admin/users'))
export const listAllPosts = async () => asList(await apiRequest('/admin/posts'))
export const listUserPosts = async (id) => asList(await apiRequest(`/admin/users/${id}/posts`))
