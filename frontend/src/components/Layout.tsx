import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Database,
  Shield,
  Home,
  LogOut,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/', label: 'Home', page: 'home', icon: Home },
  { to: '/dashboard', label: 'Dashboard', page: 'dashboard', icon: LayoutDashboard },
  { to: '/data', label: 'Data', page: 'data', icon: Database },
  { to: '/admin', label: 'Admin', page: 'admin', icon: Shield },
]

const roleColors: Record<string, string> = {
  admin: 'from-rose-400 via-orange-400 to-amber-400',
  editor: 'from-sky-400 via-blue-400 to-indigo-400',
  viewer: 'from-violet-400 via-purple-400 to-fuchsia-400',
}

export function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const currentNav = NAV.find(
    (n) => n.to === location.pathname || (n.to !== '/' && location.pathname.startsWith(n.to)),
  )

  return (
    <div className="relative flex min-h-screen">
      <div className="mesh-bg" aria-hidden>
        <div className="orb orb-amber" />
      </div>

      {/* Sidebar */}
      <aside className="relative z-10 flex w-[272px] shrink-0 flex-col border-r border-[color:var(--color-border)] glass-strong animate-slide-in-left">
        <div className="flex h-full flex-col p-4">
          {/* Brand */}
          <div className="mb-8 flex items-center gap-3 px-2 pt-2 animate-slide-down">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-violet-500 shadow-lg shadow-sky-500/30 transition-transform duration-300 hover:scale-105">
              <Sparkles className="h-5 w-5 text-white animate-pulse-glow" strokeWidth={2.5} />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            <div>
              <p className="font-display text-xl font-bold tracking-tight text-gradient-static">Orion</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-text-faint)]">
                Platform
              </p>
            </div>
          </div>

          {/* User */}
          {user && (
            <div className="mb-6 rounded-xl border border-[color:var(--color-border-strong)] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-3.5 animate-slide-up stagger-1 hover:border-sky-400/20 transition-colors duration-300">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${roleColors[user.role] || roleColors.viewer} text-sm font-bold text-white shadow-lg shadow-violet-500/20 ring-2 ring-white/10`}
                >
                  {user.display_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[color:var(--color-text)]">
                    {user.display_name}
                  </p>
                  <p className="text-[11px] capitalize font-medium text-sky-400/80">{user.role}</p>
                </div>
              </div>
            </div>
          )}

          {/* Nav */}
          <nav className="flex flex-1 flex-col gap-1.5">
            {NAV.filter((item) => user?.pages.includes(item.page)).map((item, i) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-250 animate-slide-up ${
                      isActive
                        ? 'bg-gradient-to-r from-sky-400/18 via-sky-400/10 to-violet-400/8 text-sky-200 border border-sky-400/25 shadow-[0_4px_20px_rgba(56,189,248,0.1)]'
                        : 'text-[color:var(--color-text-muted)] hover:bg-white/6 hover:text-[color:var(--color-text)] border border-transparent hover:border-white/10 hover:translate-x-0.5'
                    }`
                  }
                  style={{ animationDelay: `${0.08 + i * 0.05}s`, opacity: 0 }}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <span className="nav-indicator" />}
                      <Icon
                        className={`h-[18px] w-[18px] shrink-0 transition-all duration-250 ${
                          isActive
                            ? 'text-sky-400 scale-110'
                            : 'opacity-75 group-hover:opacity-100 group-hover:text-sky-400'
                        }`}
                      />
                      {item.label}
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-[color:var(--color-text-muted)] transition-all duration-250 hover:bg-rose-500/12 hover:text-rose-300 hover:border hover:border-rose-400/20 animate-slide-up stagger-5"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="relative z-10 flex-1 overflow-auto">
        {/* Top bar breadcrumb */}
        {currentNav && location.pathname !== '/' && (
          <div className="sticky top-0 z-20 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)]/85 backdrop-blur-xl px-8 py-3.5 animate-slide-down">
            <div className="flex items-center gap-2 text-xs font-medium text-[color:var(--color-text-faint)]">
              <span className="text-sky-400/70">Orion</span>
              <ChevronRight className="h-3.5 w-3.5 text-[color:var(--color-text-faint)]" />
              <span className="text-[color:var(--color-text-muted)]">{currentNav.label}</span>
            </div>
          </div>
        )}

        <div
          key={location.pathname}
          className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:py-10 animate-fade-in"
        >
          <Outlet />
        </div>
      </main>
    </div>
  )
}
