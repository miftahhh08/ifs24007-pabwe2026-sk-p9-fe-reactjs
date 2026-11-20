import { ApiError, apiRequest, asList, getToken, setToken } from './apiHelper'

const okResponse = (data, status = 200) => ({ ok: status < 400, status, json: async () => data })

describe('apiHelper', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  it('menyimpan dan menghapus token', () => {
    setToken('abc')
    expect(getToken()).toBe('abc')
    setToken(null)
    expect(getToken()).toBeNull()
  })

  it('mengirim GET tanpa body dan mengembalikan data', async () => {
    fetch.mockResolvedValue(okResponse({ status: 'success', data: { a: 1 } }))
    await expect(apiRequest('/x')).resolves.toEqual({ a: 1 })
    expect(fetch).toHaveBeenCalledWith('/api/x', expect.objectContaining({ method: 'GET', body: undefined }))
    expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined()
  })

  it('menyuntikkan bearer token dan body JSON', async () => {
    setToken('tok')
    fetch.mockResolvedValue(okResponse({ data: null }))
    await apiRequest('/y', { method: 'POST', body: { a: 1 } })
    const [, init] = fetch.mock.calls[0]
    expect(init.headers.Authorization).toBe('Bearer tok')
    expect(init.headers['Content-Type']).toBe('application/json')
    expect(init.body).toBe('{"a":1}')
  })

  it('tidak mengirim token bila auth=false', async () => {
    setToken('tok')
    fetch.mockResolvedValue(okResponse({}))
    await expect(apiRequest('/z', { auth: false })).resolves.toBeNull()
    expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined()
  })

  it('melempar ApiError dengan pesan backend', async () => {
    fetch.mockResolvedValue(okResponse({ message: 'Ditolak', data: { f: 1 } }, 403))
    await expect(apiRequest('/x')).rejects.toMatchObject({ name: 'ApiError', message: 'Ditolak', status: 403, data: { f: 1 } })
  })

  it('memakai pesan default bila respons bukan JSON', async () => {
    fetch.mockResolvedValue({ ok: false, status: 500, json: async () => { throw new Error('bad') } })
    await expect(apiRequest('/x')).rejects.toMatchObject({ message: 'Permintaan gagal (500)', data: null })
  })

  it('melempar ApiError saat jaringan gagal', async () => {
    fetch.mockRejectedValue(new TypeError('network'))
    await expect(apiRequest('/x')).rejects.toBeInstanceOf(ApiError)
  })

  it('asList menormalkan berbagai bentuk data', () => {
    expect(asList([1])).toEqual([1])
    expect(asList({ posts: [2] })).toEqual([2])
    expect(asList({ items: [3] })).toEqual([3])
    expect(asList({ users: [4] })).toEqual([4])
    expect(asList(null)).toEqual([])
  })

  it('ApiError punya nilai default', () => {
    const err = new ApiError('x')
    expect(err.status).toBe(0)
    expect(err.data).toBeNull()
  })
})
