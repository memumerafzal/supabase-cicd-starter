import { describe, it, expect } from 'vitest'
import { sortPosts, withVoteState } from './board'
import type { Post } from '../types'

const base = {
  title: 't',
  description: 'd',
  status: 'open' as const,
  author_id: 'a',
  has_voted: false,
}

describe('sortPosts', () => {
  it('orders by vote count descending', () => {
    const posts: Post[] = [
      { ...base, id: '1', created_at: '2024-01-01', vote_count: 2 },
      { ...base, id: '2', created_at: '2024-01-01', vote_count: 9 },
      { ...base, id: '3', created_at: '2024-01-01', vote_count: 5 },
    ]
    expect(sortPosts(posts).map((p) => p.id)).toEqual(['2', '3', '1'])
  })

  it('breaks ties with newest first', () => {
    const posts: Post[] = [
      { ...base, id: 'old', created_at: '2024-01-01', vote_count: 3 },
      { ...base, id: 'new', created_at: '2024-06-01', vote_count: 3 },
    ]
    expect(sortPosts(posts).map((p) => p.id)).toEqual(['new', 'old'])
  })
})

describe('withVoteState', () => {
  it('flags posts the user has voted on', () => {
    const rows = [
      { id: '1', ...base, created_at: '2024-01-01', vote_count: 1 },
      { id: '2', ...base, created_at: '2024-01-01', vote_count: 1 },
    ]
    const result = withVoteState(rows, new Set(['2']))
    expect(result.find((p) => p.id === '1')!.has_voted).toBe(false)
    expect(result.find((p) => p.id === '2')!.has_voted).toBe(true)
  })
})
