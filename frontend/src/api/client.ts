import type { AppUser, DashboardData, EntityMeta } from '../types'

const API = '/api'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = await res.json()
      detail = body.detail || detail
    } catch {
      /* ignore */
    }
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail))
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  login: (username: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

  logout: () => request('/auth/logout', { method: 'POST' }),

  me: () => request('/auth/me'),

  dashboard: () => request<DashboardData>('/dashboard'),

  entities: () => request<{ entities: EntityMeta[] }>('/entities'),

  entityPreview: (name: string) =>
    request<{ columns: string[]; rows: Record<string, unknown>[] }>(
      `/entities/${encodeURIComponent(name)}/preview`,
    ),

  entityOptions: (name: string) =>
    request<{ id: string; label: string }[]>(`/entities/${encodeURIComponent(name)}/options`),

  fieldOptions: (entity: string, field: string) =>
    request<{ id: string; label: string }[]>(
      `/entities/${encodeURIComponent(entity)}/field-options/${encodeURIComponent(field)}`,
    ),

  getRecord: (entity: string, id: string) =>
    request<Record<string, unknown>>(`/entities/${encodeURIComponent(entity)}/records/${encodeURIComponent(id)}`),

  createRecord: (entity: string, data: Record<string, unknown>) =>
    request(`/entities/${encodeURIComponent(entity)}/records`, {
      method: 'POST',
      body: JSON.stringify({ data }),
    }),

  updateRecord: (entity: string, id: string, data: Record<string, unknown>) =>
    request(`/entities/${encodeURIComponent(entity)}/records/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    }),

  deleteRecord: (entity: string, id: string) =>
    request(`/entities/${encodeURIComponent(entity)}/records/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  states: () => request<{ states: string[] }>('/location/states'),

  cities: (state: string) =>
    request<{ cities: string[] }>(`/location/cities?state=${encodeURIComponent(state)}`),

  dwDimensions: () => request<{ dimensions: string[] }>('/dw/dimensions'),

  dwPreview: (dimension: string) =>
    request<{ columns: string[]; rows: Record<string, unknown>[] }>(
      `/dw/${encodeURIComponent(dimension)}/preview`,
    ),

  dwLoad: (dimension: string) =>
    request<{ ok: boolean; stats: Record<string, number> }>(
      `/dw/${encodeURIComponent(dimension)}/load`,
      { method: 'POST' },
    ),

  users: () => request<AppUser[]>('/users'),

  usersMeta: () =>
    request<{
      roles: { id: string; label: string }[]
      default_data_access: Record<string, { ods_access: boolean; dw_access: boolean }>
    }>('/users/meta'),

  createUser: (body: Record<string, unknown>) =>
    request('/users', { method: 'POST', body: JSON.stringify(body) }),

  updateUserRole: (id: number, role: string) =>
    request(`/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),

  updateUserActive: (id: number, is_active: boolean) =>
    request(`/users/${id}/active`, { method: 'PATCH', body: JSON.stringify({ is_active }) }),

  updateUserDataAccess: (id: number, ods_access: boolean, dw_access: boolean) =>
    request(`/users/${id}/data-access`, {
      method: 'PATCH',
      body: JSON.stringify({ ods_access, dw_access }),
    }),

  updateUserPassword: (id: number, password: string) =>
    request(`/users/${id}/password`, { method: 'PATCH', body: JSON.stringify({ password }) }),

  deleteUser: (id: number) => request(`/users/${id}`, { method: 'DELETE' }),
}
