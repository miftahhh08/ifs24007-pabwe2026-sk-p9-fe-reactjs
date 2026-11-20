import * as helper from '../../../helpers/apiHelper'
import { listAllPosts, listUserPosts, listUsers } from './adminApi'

vi.mock('../../../helpers/apiHelper', async () => {
  const actual = await vi.importActual('../../../helpers/apiHelper')
  return { ...actual, apiRequest: vi.fn() }
})

describe('adminApi', () => {
  it('memanggil endpoint admin', async () => {
    helper.apiRequest.mockResolvedValue([1])
    expect(await listUsers()).toEqual([1])
    expect(helper.apiRequest).toHaveBeenLastCalledWith('/admin/users')
    expect(await listAllPosts()).toEqual([1])
    expect(helper.apiRequest).toHaveBeenLastCalledWith('/admin/posts')
    expect(await listUserPosts(7)).toEqual([1])
    expect(helper.apiRequest).toHaveBeenLastCalledWith('/admin/users/7/posts')
  })
})
