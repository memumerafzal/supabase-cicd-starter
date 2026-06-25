export type PostStatus = 'open' | 'planned' | 'in_progress' | 'done'

export interface Post {
  id: string
  title: string
  description: string
  status: PostStatus
  author_id: string
  created_at: string
  vote_count: number
  has_voted: boolean
}
