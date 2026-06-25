import { useState } from 'react'
import { createPost } from '../lib/posts'

export default function NewPostForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setBusy(true)
    setError(null)
    try {
      await createPost(title.trim(), description.trim())
      setTitle('')
      setDescription('')
      onCreated()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="new-post" onSubmit={submit}>
      <input
        placeholder="Suggest a feature…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        data-testid="new-title"
      />
      <textarea
        placeholder="Add some detail (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        data-testid="new-description"
      />
      <button type="submit" disabled={busy || !title.trim()} data-testid="new-submit">
        {busy ? 'Posting…' : 'Post idea'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  )
}
