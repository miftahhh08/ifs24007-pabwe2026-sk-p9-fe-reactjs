import { act, renderHook } from '@testing-library/react'
import useTheme from './useTheme'

describe('useTheme', () => {
  it('default terang + aksen indigo', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.dark).toBe(false)
    expect(result.current.accent).toBe('indigo')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('toggle gelap dan ganti aksen tersimpan', () => {
    const { result } = renderHook(() => useTheme())
    act(() => result.current.toggleDark())
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('delcom_theme')).toBe('dark')
    act(() => result.current.setAccent('rose'))
    expect(document.documentElement.dataset.accent).toBe('rose')
    expect(localStorage.getItem('delcom_accent')).toBe('rose')
  })

  it('membaca preferensi tersimpan', () => {
    localStorage.setItem('delcom_theme', 'dark')
    localStorage.setItem('delcom_accent', 'amber')
    const { result } = renderHook(() => useTheme())
    expect(result.current.dark).toBe(true)
    expect(result.current.accent).toBe('amber')
  })
})
