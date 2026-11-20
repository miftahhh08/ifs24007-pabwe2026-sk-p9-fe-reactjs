import { useEffect, useState } from 'react'

export const ACCENTS = ['indigo', 'emerald', 'rose', 'amber']

export default function useTheme() {
  const [dark, setDark] = useState(() => localStorage.getItem('delcom_theme') === 'dark')
  const [accent, setAccent] = useState(() => localStorage.getItem('delcom_accent') || 'indigo')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('delcom_theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    document.documentElement.dataset.accent = accent
    localStorage.setItem('delcom_accent', accent)
  }, [accent])

  return { dark, accent, setAccent, toggleDark: () => setDark((value) => !value) }
}
