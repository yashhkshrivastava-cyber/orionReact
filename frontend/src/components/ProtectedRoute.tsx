import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LoadingState } from './ui/DataTable'

export function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState message="Authenticating…" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return <Outlet />
}

export function AdminRoute() {
  const { user } = useAuth()
  if (user?.role !== 'admin') return <Navigate to="/" replace />
  return <Outlet />
}

export function DataRoute() {
  const { user } = useAuth()
  if (!user?.can_ods && !user?.can_dw) return <Navigate to="/" replace />
  return <Outlet />
}
