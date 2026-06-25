import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'
import { fetchPosts, toggleVote } from './lib/posts'
import type { Post } from './types'
import Auth from './components/Auth'
import NewPostForm from './components/NewPostForm'
import PostCard from './components/PostCard'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const userId = session?.user.id ?? null

  const load = useCallback(async () => {
    try {
      setPosts(await fetchPosts(userId))
    } catch (err) {
      console.error('Failed to load posts', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    load()
    // Realtime: any change to votes or posts refreshes the board live.
    const channel = supabase
      .channel('board')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, load)
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [load])

  async function onVote(post: Post) {
    if (!userId) return
    // Optimistic update for snappy UX; realtime will reconcile the truth.
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? { ...p, has_voted: !p.has_voted, vote_count: p.vote_count + (p.has_voted ? -1 : 1) }
          : p,
      ),
    )
    try {
      await toggleVote(post.id, userId, post.has_voted)
    } catch (err) {
      console.error('Vote failed', err)
      load()
    }
  }

  if (!session) return <Auth />

  return (
    <div className="app">
      <header>
        <h1>Feedback Board</h1>
        <div className="user">
          <span className="muted">{session.user.email}</span>
          <button className="link" onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
      </header>

      <NewPostForm onCreated={load} />

      {loading ? (
        <p className="muted">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="muted">No ideas yet — be the first to post one.</p>
      ) : (
        <div className="board">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} onVote={onVote} />
          ))}
        </div>
      )}
    </div>
  )
}
