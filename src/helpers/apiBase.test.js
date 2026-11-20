// __API_BASE__ kosong saat test: request memakai path relatif /api
import { apiRequest } from './apiHelper'

it('memakai path relatif ketika __API_BASE__ kosong', async () => {
  global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ data: 1 }) })
  await apiRequest('/ping')
  expect(fetch.mock.calls[0][0]).toBe('/api/ping')
})
