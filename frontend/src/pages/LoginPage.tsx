import { FormEvent, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Sparkles, ArrowRight, Lock, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Field, Input } from '../components/ui/Field'
import { Alert } from '../components/ui/Alert'

export function LoginPage() {
  const { user, login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password) {
      setError('Enter both username and password.')
      return
    }
    setSubmitting(true)
    try {
      await login(username.trim(), password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen">
      <div className="mesh-bg" aria-hidden />

      {/* Left panel — brand */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-[color:var(--color-border)] p-12 lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/10" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-violet-400/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg shadow-cyan-500/30">
            <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-bold">Orion</span>
        </div>

        <div className="relative space-y-6">
          <h1 className="font-display text-5xl font-bold leading-[1.1] tracking-tight">
            Navigate your
            <br />
            <span className="text-gradient">operations universe</span>
          </h1>
          <p className="max-w-md text-base leading-relaxed text-[color:var(--color-text-muted)]">
            Unified command center for clients, cases, teams, and analytics — built for modern
            professional services.
          </p>
          <div className="flex gap-6 pt-4">
            {[
              { value: '6', label: 'Entity types' },
              { value: 'SCD2', label: 'Data warehouse' },
              { value: 'RBAC', label: 'Access control' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-2xl font-bold text-cyan-400">{stat.value}</p>
                <p className="text-xs text-[color:var(--color-text-faint)]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-[color:var(--color-text-faint)]">
          Secure session · Role-based access · PostgreSQL backed
        </p>
      </div>

      {/* Right panel — form */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px] animate-scale-in">
          {/* Mobile brand */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold">Orion</span>
          </div>

          <div className="glass-strong rounded-2xl p-8 glow-accent">
            <div className="mb-8">
              <h2 className="font-display text-2xl font-bold">Welcome back</h2>
              <p className="mt-1.5 text-sm text-[color:var(--color-text-muted)]">
                Sign in to your workspace
              </p>
            </div>

            {error && (
              <div className="mb-6">
                <Alert variant="error">{error}</Alert>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Username">
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-text-faint)]" />
                  <Input
                    className="pl-10"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                  />
                </div>
              </Field>

              <Field label="Password">
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-text-faint)]" />
                  <Input
                    className="pl-10"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                </div>
              </Field>

              <Button type="submit" size="lg" loading={submitting} className="w-full mt-2">
                Sign in to Orion
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
