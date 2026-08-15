import { FormEvent, useEffect, useState } from 'react'
import { Users, UserPlus, Settings, ShieldAlert } from 'lucide-react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { AppUser } from '../types'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Alert, Badge } from '../components/ui/Alert'
import { Tabs } from '../components/ui/Tabs'
import { Field, Input, Select, Checkbox } from '../components/ui/Field'
import { DataTable } from '../components/ui/DataTable'

type Tab = 'users' | 'create' | 'manage'

const roleBadge: Record<string, 'cyan' | 'violet' | 'amber' | 'rose'> = {
  admin: 'rose',
  editor: 'cyan',
  viewer: 'violet',
}

export function AdminPage() {
  const { user: currentUser, refresh } = useAuth()
  const [tab, setTab] = useState<Tab>('users')
  const [users, setUsers] = useState<AppUser[]>([])
  const [roles, setRoles] = useState<{ id: string; label: string }[]>([])
  const [defaults, setDefaults] = useState<Record<string, { ods_access: boolean; dw_access: boolean }>>({})
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [createForm, setCreateForm] = useState({
    username: '',
    display_name: '',
    password: '',
    role: 'viewer',
    ods_access: false,
    dw_access: false,
  })

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [manageRole, setManageRole] = useState('viewer')
  const [manageOds, setManageOds] = useState(false)
  const [manageDw, setManageDw] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    api.users().then(setUsers).catch((e) => setError(e.message))
    api.usersMeta().then((m) => {
      setRoles(m.roles)
      setDefaults(m.default_data_access)
    })
  }

  useEffect(() => {
    load()
  }, [])

  const selected = users.find((u) => u.id === selectedId)

  useEffect(() => {
    if (selected) {
      setManageRole(selected.role)
      setManageOds(selected.ods_access)
      setManageDw(selected.dw_access)
    }
  }, [selected])

  useEffect(() => {
    const d = defaults[createForm.role]
    if (d) setCreateForm((f) => ({ ...f, ods_access: d.ods_access, dw_access: d.dw_access }))
  }, [createForm.role, defaults])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)
    try {
      await api.createUser(createForm)
      setMessage(`User "${createForm.username}" created.`)
      setCreateForm({ username: '', display_name: '', password: '', role: 'viewer', ods_access: false, dw_access: false })
      load()
      setTab('users')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setSubmitting(false)
    }
  }

  const runAction = async (fn: () => Promise<unknown>, success: string, refreshSelf = false) => {
    setError('')
    setMessage('')
    setSubmitting(true)
    try {
      await fn()
      setMessage(success)
      load()
      if (refreshSelf) await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setSubmitting(false)
    }
  }

  const userTableRows = users.map((u) => ({
    Username: u.username,
    'Display Name': u.display_name,
    Role: u.role,
    ODS: u.ods_access ? 'Yes' : '—',
    DW: u.dw_access ? 'Yes' : '—',
    Status: u.is_active ? 'Active' : 'Disabled',
  }))

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Administration"
        title="Access Control"
        subtitle="Manage user accounts, roles, and platform permissions."
        action={
          <div className="flex items-center gap-2 rounded-xl glass px-4 py-2.5 border border-sky-400/20 bg-gradient-to-r from-sky-400/10 to-violet-400/5 animate-scale-in">
            <Users className="h-4 w-4 text-sky-400" />
            <span className="text-sm font-bold text-[color:var(--color-text)]">{users.length} users</span>
          </div>
        }
      />

      <Tabs
        tabs={[
          { id: 'users' as Tab, label: 'All users' },
          { id: 'create' as Tab, label: 'Create user' },
          { id: 'manage' as Tab, label: 'Manage user' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {error && <Alert variant="error" onDismiss={() => setError('')}>{error}</Alert>}
      {message && <Alert variant="success" onDismiss={() => setMessage('')}>{message}</Alert>}

      {tab === 'users' && (
        <Card>
          <CardHeader title="User directory" subtitle="All accounts on the platform" />
          <DataTable
            columns={['Username', 'Display Name', 'Role', 'ODS', 'DW', 'Status']}
            rows={userTableRows}
            emptyMessage="No users found."
          />
        </Card>
      )}

      {tab === 'create' && (
        <Card glow>
          <CardHeader
            title="Create new user"
            subtitle="Add an account with role and data access"
            action={<UserPlus className="h-5 w-5 text-cyan-400" />}
          />
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Username">
                <Input
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  placeholder="jane.doe"
                />
              </Field>
              <Field label="Display name">
                <Input
                  value={createForm.display_name}
                  onChange={(e) => setCreateForm({ ...createForm, display_name: e.target.value })}
                  placeholder="Jane Doe"
                />
              </Field>
              <Field label="Password">
                <Input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                />
              </Field>
              <Field label="Role">
                <Select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="flex flex-wrap gap-6 rounded-xl border border-[color:var(--color-border)] bg-white/[0.02] p-4">
              <Checkbox
                label="Operational database (ODS)"
                checked={createForm.ods_access}
                onChange={(v) => setCreateForm({ ...createForm, ods_access: v })}
              />
              <Checkbox
                label="Data warehouse (DW)"
                checked={createForm.dw_access}
                onChange={(v) => setCreateForm({ ...createForm, dw_access: v })}
              />
            </div>
            <Button type="submit" loading={submitting}>
              Create user
            </Button>
          </form>
        </Card>
      )}

      {tab === 'manage' && (
        <>
          <Card padding="sm">
            <Field label="Select user">
              <Select
                value={selectedId ?? ''}
                onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">— Choose a user —</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.display_name} ({u.username})
                  </option>
                ))}
              </Select>
            </Field>
          </Card>

          {selected && (
            <div className="grid gap-5 lg:grid-cols-2">
              {/* Profile card */}
              <Card className="lg:col-span-2">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-blue-500 to-violet-500 font-display text-xl font-bold text-white shadow-xl ring-2 ring-white/10">
                    {selected.display_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold">{selected.display_name}</h3>
                    <p className="text-sm text-[color:var(--color-text-muted)]">@{selected.username}</p>
                    <div className="mt-2 flex gap-2">
                      <Badge variant={roleBadge[selected.role] || 'default'}>{selected.role}</Badge>
                      <Badge variant={selected.is_active ? 'emerald' : 'rose'}>
                        {selected.is_active ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <CardHeader title="Role & status" subtitle="Access level and account state" action={<Settings className="h-4 w-4 text-[color:var(--color-text-faint)]" />} />
                <Field label="Role" className="mb-4">
                  <Select value={manageRole} onChange={(e) => setManageRole(e.target.value)}>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </Select>
                </Field>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    loading={submitting}
                    onClick={() =>
                      runAction(
                        () => api.updateUserRole(selected.id, manageRole),
                        'Role updated.',
                        selected.id === currentUser?.id,
                      )
                    }
                  >
                    Update role
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={submitting}
                    onClick={() =>
                      runAction(
                        () => api.updateUserActive(selected.id, !selected.is_active),
                        selected.is_active ? 'User disabled.' : 'User enabled.',
                      )
                    }
                  >
                    {selected.is_active ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </Card>

              <Card>
                <CardHeader title="Data access" subtitle="ODS and DW permissions" />
                <div className="mb-4 space-y-3">
                  <Checkbox label="Operational database (ODS)" checked={manageOds} onChange={setManageOds} />
                  <Checkbox label="Data warehouse (DW)" checked={manageDw} onChange={setManageDw} />
                </div>
                <Button
                  size="sm"
                  loading={submitting}
                  onClick={() =>
                    runAction(
                      () => api.updateUserDataAccess(selected.id, manageOds, manageDw),
                      'Data access updated.',
                      selected.id === currentUser?.id,
                    )
                  }
                >
                  Update data access
                </Button>
              </Card>

              <Card>
                <CardHeader title="Reset password" subtitle="Set a new credential" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="New password">
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </Field>
                  <Field label="Confirm password">
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </Field>
                </div>
                <Button
                  size="sm"
                  className="mt-4"
                  loading={submitting}
                  onClick={() => {
                    if (newPassword !== confirmPassword) {
                      setError('Passwords do not match.')
                      return
                    }
                    runAction(() => api.updateUserPassword(selected.id, newPassword), 'Password updated.')
                  }}
                >
                  Update password
                </Button>
              </Card>

              <Card className="border-rose-500/20">
                <CardHeader
                  title="Danger zone"
                  subtitle="Irreversible account deletion"
                  action={<ShieldAlert className="h-4 w-4 text-rose-400" />}
                />
                <Checkbox
                  label="I confirm permanent deletion of this user"
                  checked={confirmDelete}
                  onChange={setConfirmDelete}
                />
                <Button
                  variant="danger"
                  size="sm"
                  className="mt-4"
                  disabled={!confirmDelete}
                  loading={submitting}
                  onClick={() =>
                    runAction(() => api.deleteUser(selected.id), 'User deleted.').then(() => {
                      setSelectedId(null)
                      setConfirmDelete(false)
                    })
                  }
                >
                  Delete user
                </Button>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}
