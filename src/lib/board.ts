import type { Post } from '../types'

// Pure board logic — no IO, so it's trivially unit-testable.

// Shape returned by the `posts_with_votes` view (see supabase/migrations).
export interface PostRow {
  id: string
  title: string
  description: string
  status: Post['status']
  author_id: string
  created_at: string
  vote_count: number
}

/** Sort posts by vote count desc, then newest first — the canonical board order. */
export function sortPosts(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    if (b.vote_count !== a.vote_count) return b.vote_count - a.vote_count
    return b.created_at.localeCompare(a.created_at)
  })
}

/** Merge the current user's votes into the raw rows so the UI can show "voted" state. */
export function withVoteState(rows: PostRow[], votedPostIds: Set<string>): Post[] {
  return rows.map((r) => ({ ...r, has_voted: votedPostIds.has(r.id) }))
}
