export interface User {
  id: number
  username: string
  display_name: string
  role: string
  ods_access: boolean
  dw_access: boolean
  pages: string[]
  can_ods: boolean
  can_dw: boolean
}

export interface FormField {
  label: string
  type: string
  options?: string[]
  depends_on?: string
  source_table?: string
  source_display_column?: string
  source_pk_column?: string
  optional?: boolean
}

export interface EntityMeta {
  name: string
  primary_key: string
  display_column: string
  form_fields: Record<string, FormField>
}

export interface DashboardData {
  metrics: { label: string; value: string; delta: string; delta_type: string }[]
  clients_by_status: { type: string; count: number }[]
  clients_by_type: { type: string; count: number }[]
  headcount: { type: string; count: number }[]
  cases_by_domain: { domain: string; count: number }[]
  case_revenue: { case: string; revenue: number }[]
  snapshot: { label: string; value: string }[]
}

export interface AppUser {
  id: number
  username: string
  display_name: string
  role: string
  is_active: boolean
  ods_access: boolean
  dw_access: boolean
  created_timestamp: string
}
