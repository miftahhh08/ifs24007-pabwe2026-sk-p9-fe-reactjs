import * as helper from '../../../helpers/apiHelper'
import { getProfile, login, logout, register, updateProfile } from './authApi'

vi.mock('../../../helpers/apiHelper')

describe('authApi', () => {
  it('login memetakan token + user (berbagai bentuk respons)', async () => {
    helper.apiRequest.mockResolvedValueOnce({ token: 't', user: { id: 1 } })
    expect(await login({ username: 'a', password: 'b' })).toEqual({ token: 't', user: { id: 1 } })
    helper.apiRequest.mockResolvedValueOnce({ access_token: 'x', id: 2 })
    expect(await login({ username: 'a', password: 'b' })).toEqual({ token: 'x', user: { access_token: 'x', id: 2 } })
    expect(helper.apiRequest).toHaveBeenCalledWith('/auth/login', { method: 'POST', body: { username: 'a', password: 'b' }, auth: false })
  })

  it('register dan logout', async () => {
    helper.apiRequest.mockResolvedValue({})
    await register({ username: 'a', email: 'e@x.id', password: 'secret' })
    expect(helper.apiRequest).toHaveBeenCalledWith('/auth/register', { method: 'POST', body: { username: 'a', email: 'e@x.id', password: 'secret' }, auth: false })
    await logout()
    expect(helper.apiRequest).toHaveBeenCalledWith('/auth/logout', { method: 'POST' })
  })

  it('getProfile dan updateProfile', async () => {
    helper.apiRequest.mockResolvedValueOnce({ user: { id: 1 } })
    expect(await getProfile()).toEqual({ id: 1 })
    helper.apiRequest.mockResolvedValueOnce({ id: 2 })
    expect(await getProfile()).toEqual({ id: 2 })
    helper.apiRequest.mockResolvedValueOnce({ user: { id: 3 } })
    expect(await updateProfile({ username: 'z' })).toEqual({ id: 3 })
    helper.apiRequest.mockResolvedValueOnce({ id: 4 })
    expect(await updateProfile({ username: 'z' })).toEqual({ id: 4 })
  })
})
