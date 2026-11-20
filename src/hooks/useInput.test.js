import { act, renderHook } from '@testing-library/react'
import useInput from './useInput'

describe('useInput', () => {
  it('mengelola nilai, onChange, setValue, dan reset', () => {
    const { result } = renderHook(() => useInput('awal'))
    expect(result.current.value).toBe('awal')
    act(() => result.current.onChange({ target: { value: 'baru' } }))
    expect(result.current.value).toBe('baru')
    act(() => result.current.setValue('lain'))
    expect(result.current.value).toBe('lain')
    act(() => result.current.reset())
    expect(result.current.value).toBe('awal')
  })

  it('nilai awal default string kosong', () => {
    expect(renderHook(() => useInput()).result.current.value).toBe('')
  })
})
