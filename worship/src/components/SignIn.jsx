import { useState } from 'react'

export default function SignIn({ supabase }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.href },
    })
    setBusy(false)
    if (err) setError(err.message)
    else setSent(true)
  }

  return (
    <div className="signin">
      <h1>Worship Scheduler</h1>
      {sent ? (
        <p>Check your email — we sent a sign-in link to <strong>{email}</strong>.</p>
      ) : (
        <form onSubmit={submit}>
          <p>Sign in with your email to continue.</p>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send sign-in link'}</button>
          {error && <p className="error">{error}</p>}
        </form>
      )}
    </div>
  )
}
