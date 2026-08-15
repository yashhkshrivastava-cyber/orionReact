import { FormEvent, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Sparkles, ArrowRight, Lock, User, Zap, Shield, BarChart3 } from 'lucide-react'
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
    <div className="relative flex min-h-screen overflow-hidden">
      <div className="mesh-bg" aria-hidden>
        <div className="orb orb-amber" />
      </div>

      {/* Left panel — brand */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-[color:var(--color-border)] p-12 lg:flex animate-slide-in-left">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/8 via-transparent to-violet-500/12" />
        <div className="absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-sky-400/12 blur-3xl animate-float" />
        <div className="absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-violet-400/12 blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/5 blur-3xl animate-pulse-glow" />

        <div className="relative flex items-center gap-3 animate-slide-down">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-violet-500 shadow-xl shadow-sky-500/30">
            <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-2xl font-bold text-gradient-static">Orion</span>
        </div>

        <div className="relative space-y-8 animate-slide-up stagger-2">
          <h1 className="font-display text-5xl font-bold leading-[1.08] tracking-tight xl:text-6xl">
            Navigate your
            <br />
            <span className="text-gradient">operations universe</span>
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-[color:var(--color-text-muted)]">
            Unified command center for clients, cases, teams, and analytics — built for modern
            professional services.
          </p>
          <div className="flex gap-8 pt-2">
            {[
              { value: '6', label: 'Entity types', icon: BarChart3 },
              { value: 'SCD2', label: 'Data warehouse', icon: Zap },
              { value: 'RBAC', label: 'Access control', icon: Shield },
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="animate-slide-up"
                  style={{ animationDelay: `${0.3 + i * 0.1}s`, opacity: 0 }}
                >
                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-sky-400/10 text-sky-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="font-display text-2xl font-bold text-sky-300">{stat.value}</p>
                  <p className="text-xs font-medium text-[color:var(--color-text-faint)]">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </div>

        <p className="relative text-xs font-medium text-[color:var(--color-text-faint)] animate-fade-in stagger-5">
          Secure session · Role-based access · PostgreSQL backed
        </p>
      </div>

      {/* Right panel — form */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px] animate-scale-in">
          {/* Mobile brand */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden animate-slide-down">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-violet-500 shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-gradient-static">Orion</span>
          </div>

          <div className="glass-strong rounded-2xl p-8 glow-accent animate-slide-up stagger-1">
            <div className="mb-8">
              <h2 className="font-display text-2xl font-bold text-[color:var(--color-text)]">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-[color:var(--color-text-muted)]">
                Sign in to your workspace
              </p>
            </div>

            {error && (
              <div className="mb-6 animate-slide-up">
                <Alert variant="error">{error}</Alert>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Username">
                <div className="relative group">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-text-faint)] transition-colors group-focus-within:text-sky-400" />
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
                <div className="relative group">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-text-faint)] transition-colors group-focus-within:text-sky-400" />
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

              <Button type="submit" size="lg" loading={submitting} className="w-full mt-3">
                Sign in to Orion
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
