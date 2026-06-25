import { supabase } from '../supabaseClient'
import type { Post } from '../types'
import { sortPosts, withVoteState, type PostRow } from './board'

export async function fetchPosts(userId: string | null): Promise<Post[]> {
  const { data: rows, error } = await supabase
    .from('posts_with_votes')
    .select('*')
  if (error) throw error

  let votedPostIds = new Set<string>()
  if (userId) {
    const { data: votes } = await supabase
      .from('votes')
      .select('post_id')
      .eq('user_id', userId)
    votedPostIds = new Set((votes ?? []).map((v) => v.post_id))
  }

  return sortPosts(withVoteState((rows ?? []) as PostRow[], votedPostIds))
}

export async function createPost(title: string, description: string): Promise<void> {
  const { error } = await supabase.from('posts').insert({ title, description })
  if (error) throw error
}

export async function toggleVote(postId: string, userId: string, hasVoted: boolean): Promise<void> {
  if (hasVoted) {
    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)
    if (error) throw error
  } else {
    const { error } = await supabase.from('votes').insert({ post_id: postId, user_id: userId })
    if (error) throw error
  }
}
