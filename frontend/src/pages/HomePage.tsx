import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Database, Shield, ArrowUpRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Alert } from '../components/ui/Alert'

const WORKSPACES = [
  {
    page: '/dashboard',
    pageId: 'dashboard',
    title: 'Command Center',
    tag: 'Analytics',
    description: 'Real-time KPIs, revenue trends, pipeline funnel, and performance snapshots.',
    icon: LayoutDashboard,
    gradient: 'from-cyan-400/20 via-cyan-500/5 to-transparent',
    accent: 'cyan',
    iconBg: 'from-cyan-400 to-cyan-600',
  },
  {
    page: '/data',
    pageId: 'data',
    title: 'Data Studio',
    tag: 'Operations',
    description: 'Manage clients, cases, employees, and domains. Run warehouse SCD2 loads.',
    icon: Database,
    gradient: 'from-violet-400/20 via-violet-500/5 to-transparent',
    accent: 'violet',
    iconBg: 'from-violet-400 to-violet-600',
  },
  {
    page: '/admin',
    pageId: 'admin',
    title: 'Access Control',
    tag: 'Administration',
    description: 'User accounts, roles, ODS/DW permissions, and platform security settings.',
    icon: Shield,
    gradient: 'from-amber-400/20 via-amber-500/5 to-transparent',
    accent: 'amber',
    iconBg: 'from-amber-400 to-orange-500',
  },
]

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const available = WORKSPACES.filter((w) => user?.pages.includes(w.pageId))

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <header className="mb-12 text-center">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-cyan-400 animate-slide-up">
          Orion Platform
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl animate-slide-up stagger-1">
          {greeting()},{' '}
          <span className="text-gradient">{user?.display_name?.split(' ')[0] || 'there'}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-[color:var(--color-text-muted)] animate-slide-up stagger-2">
          Choose a workspace to begin. Each module is tailored to your role and access level.
        </p>
      </header>

      {available.length === 0 ? (
        <Alert variant="error">No workspaces are available for your account. Contact an admin.</Alert>
      ) : (
        <div
          className={`grid gap-5 ${
            available.length === 1
              ? 'mx-auto max-w-md'
              : available.length === 2
                ? 'mx-auto max-w-3xl sm:grid-cols-2'
                : 'sm:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {available.map((ws, i) => {
            const Icon = ws.icon
            return (
              <button
                key={ws.page}
                type="button"
                onClick={() => navigate(ws.page)}
                className={`group relative overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-gradient-to-br ${ws.gradient} p-6 text-left transition-all duration-300 hover:border-white/15 hover:shadow-2xl hover:shadow-cyan-500/5 hover:-translate-y-1 animate-slide-up`}
                style={{ animationDelay: `${0.1 + i * 0.08}s`, opacity: 0 }}
              >
                <div className="absolute inset-0 bg-[color:var(--color-surface)] opacity-60 transition-opacity group-hover:opacity-40" />

                <div className="relative">
                  <div className="mb-5 flex items-start justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${ws.iconBg} shadow-lg transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className="h-6 w-6 text-white" strokeWidth={2} />
                    </div>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 opacity-0 transition-all duration-300 group-hover:opacity-100">
                      <ArrowUpRight className="h-4 w-4 text-[color:var(--color-text-muted)]" />
                    </span>
                  </div>

                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[color:var(--color-text-faint)]">
                    {ws.tag}
                  </p>
                  <h3 className="font-display text-xl font-bold">{ws.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-text-muted)]">
                    {ws.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-cyan-400 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    Enter workspace
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
