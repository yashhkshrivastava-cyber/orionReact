import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Database, Shield, ArrowUpRight, Sparkles } from 'lucide-react'
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
    gradient: 'from-sky-400/25 via-blue-500/10 to-transparent',
    accentText: 'text-sky-300',
    accentBorder: 'group-hover:border-sky-400/40',
    iconBg: 'from-sky-400 via-blue-500 to-indigo-500',
    shadow: 'group-hover:shadow-sky-500/15',
  },
  {
    page: '/data',
    pageId: 'data',
    title: 'Data Studio',
    tag: 'Operations',
    description: 'Manage clients, cases, employees, and domains. Run warehouse SCD2 loads.',
    icon: Database,
    gradient: 'from-violet-400/25 via-purple-500/10 to-transparent',
    accentText: 'text-violet-300',
    accentBorder: 'group-hover:border-violet-400/40',
    iconBg: 'from-violet-400 via-purple-500 to-fuchsia-500',
    shadow: 'group-hover:shadow-violet-500/15',
  },
  {
    page: '/admin',
    pageId: 'admin',
    title: 'Access Control',
    tag: 'Administration',
    description: 'User accounts, roles, ODS/DW permissions, and platform security settings.',
    icon: Shield,
    gradient: 'from-amber-400/25 via-orange-500/10 to-transparent',
    accentText: 'text-amber-300',
    accentBorder: 'group-hover:border-amber-400/40',
    iconBg: 'from-amber-400 via-orange-500 to-rose-500',
    shadow: 'group-hover:shadow-amber-500/15',
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
      <header className="mb-14 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-sky-400/10 px-4 py-1.5 animate-slide-down">
          <Sparkles className="h-3.5 w-3.5 text-sky-400 animate-pulse-glow" />
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-sky-300">
            Orion Platform
          </p>
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl animate-slide-up stagger-1">
          {greeting()},{' '}
          <span className="text-gradient">{user?.display_name?.split(' ')[0] || 'there'}</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[color:var(--color-text-muted)] animate-slide-up stagger-2">
          Choose a workspace to begin. Each module is tailored to your role and access level.
        </p>
        <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-transparent via-sky-400 to-transparent animate-shimmer" />
      </header>

      {available.length === 0 ? (
        <Alert variant="error">No workspaces are available for your account. Contact an admin.</Alert>
      ) : (
        <div
          className={`grid gap-6 ${
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
                className={`group relative overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-gradient-to-br ${ws.gradient} p-7 text-left transition-all duration-350 hover:-translate-y-2 hover:shadow-2xl ${ws.shadow} ${ws.accentBorder} animate-slide-up interactive-scale`}
                style={{ animationDelay: `${0.12 + i * 0.1}s`, opacity: 0 }}
              >
                <div className="absolute inset-0 bg-[color:var(--color-surface)] opacity-50 transition-opacity duration-300 group-hover:opacity-25" />
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-white/10" />

                <div className="relative">
                  <div className="mb-6 flex items-start justify-between">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${ws.iconBg} shadow-xl transition-all duration-350 group-hover:scale-110 group-hover:rotate-3`}
                    >
                      <Icon className="h-7 w-7 text-white" strokeWidth={2} />
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/8 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110">
                      <ArrowUpRight className={`h-4 w-4 ${ws.accentText}`} />
                    </span>
                  </div>

                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-text-faint)]">
                    {ws.tag}
                  </p>
                  <h3 className="font-display text-2xl font-bold text-[color:var(--color-text)]">
                    {ws.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[color:var(--color-text-muted)]">
                    {ws.description}
                  </p>

                  <div
                    className={`mt-7 flex items-center gap-2 text-sm font-bold ${ws.accentText} translate-y-2 opacity-0 transition-all duration-350 group-hover:translate-y-0 group-hover:opacity-100`}
                  >
                    Enter workspace
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
