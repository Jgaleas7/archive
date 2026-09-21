import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/login')({
  component: Login,
})

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: signInError } = await authClient.signIn.email({
        email,
        password,
      })

      if (signInError) {
        setError(
          signInError.message ||
            'Failed to sign in. Please check your credentials.',
        )
      } else {
        navigate({ to: '/' })
      }
    } catch (err) {
      setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="vbg-section"
      style={{
        maxWidth: '400px',
        margin: '0 auto',
        marginTop: 'var(--vbg-space-16)',
      }}
    >
      <div className="vbg-opening">
        <h1 className="vbg-title">Newsroom Login</h1>
        <p className="vbg-lede">Sign in to access the Legacy News Archive.</p>
      </div>

      <div className="vbg-calculator">
        <form className="vbg-calculator-inputs" onSubmit={handleLogin}>
          {error && (
            <div
              className="vbg-error"
              style={{
                color: 'var(--vbg-color-error)',
                marginBottom: 'var(--vbg-space-4)',
              }}
            >
              {error}
            </div>
          )}

          <div className="vbg-field">
            <label className="vbg-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="newsroom@chekmedia.ca"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>

          <div
            className="vbg-field"
            style={{ marginTop: 'var(--vbg-space-4)' }}
          >
            <label className="vbg-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div style={{ marginTop: 'var(--vbg-space-6)' }}>
            <button
              className="vbg-button"
              type="submit"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
