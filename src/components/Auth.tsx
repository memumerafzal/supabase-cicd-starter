import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fn = mode === 'signin' ? supabase.auth.signInWithPassword : supabase.auth.signUp
    const { error } = await fn({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="auth-card">
      <h1>Feedback Board</h1>
      <p className="muted">Sign in to post ideas and vote.</p>
      <form onSubmit={submit}>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          data-testid="email"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          data-testid="password"
        />
        <button type="submit" disabled={loading} data-testid="submit-auth">
          {loading ? '…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <button
        className="link"
        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
      >
        {mode === 'signin' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
      </button>
    </div>
  )
}
