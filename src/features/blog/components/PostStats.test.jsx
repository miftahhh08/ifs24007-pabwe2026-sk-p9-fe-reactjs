import { render, screen } from '@testing-library/react'
import PostStats from './PostStats'

it('menampilkan 3 kartu statistik', () => {
  render(<PostStats stats={{ total: 5, published: 3, draft: 2 }} />)
  expect(screen.getByText('Total Artikel').nextSibling).toHaveTextContent('5')
  expect(screen.getByText('Total Terbit').nextSibling).toHaveTextContent('3')
  expect(screen.getByText(/Draf/).nextSibling).toHaveTextContent('2')
})
