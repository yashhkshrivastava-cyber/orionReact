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
  admin: 'from-rose-400 to-orange-400',
  editor: 'from-cyan-400 to-blue-400',
  viewer: 'from-violet-400 to-purple-400',
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
      <div className="mesh-bg" aria-hidden />

      {/* Sidebar */}
      <aside className="relative z-10 flex w-[260px] shrink-0 flex-col border-r border-[color:var(--color-border)] glass-strong">
        <div className="flex h-full flex-col p-4">
          {/* Brand */}
          <div className="mb-8 flex items-center gap-3 px-2 pt-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg shadow-cyan-500/20">
              <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-display text-lg font-bold tracking-tight">Orion</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[color:var(--color-text-faint)]">
                Platform
              </p>
            </div>
          </div>

          {/* User */}
          {user && (
            <div className="mb-6 rounded-xl border border-[color:var(--color-border)] bg-white/[0.03] p-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${roleColors[user.role] || roleColors.viewer} text-xs font-bold text-white shadow-md`}
                >
                  {user.display_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{user.display_name}</p>
                  <p className="text-[11px] capitalize text-[color:var(--color-text-faint)]">{user.role}</p>
                </div>
              </div>
            </div>
          )}

          {/* Nav */}
          <nav className="flex flex-1 flex-col gap-1">
            {NAV.filter((item) => user?.pages.includes(item.page)).map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-400/15 to-violet-400/10 text-cyan-300 border border-cyan-400/20'
                        : 'text-[color:var(--color-text-muted)] hover:bg-white/5 hover:text-[color:var(--color-text)] border border-transparent'
                    }`
                  }
                >
                  <Icon className="h-[18px] w-[18px] shrink-0 opacity-80 group-hover:opacity-100" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[color:var(--color-text-muted)] transition-all hover:bg-rose-500/10 hover:text-rose-300"
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
          <div className="sticky top-0 z-20 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)]/80 backdrop-blur-xl px-8 py-3">
            <div className="flex items-center gap-2 text-xs text-[color:var(--color-text-faint)]">
              <span>Orion</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-[color:var(--color-text-muted)]">{currentNav.label}</span>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
