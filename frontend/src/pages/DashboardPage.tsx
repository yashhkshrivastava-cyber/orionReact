import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  Gauge,
  Target,
  IndianRupee,
  Globe,
} from 'lucide-react'
import { api } from '../api/client'
import type { DashboardData } from '../types'
import { PageHeader, MetricCard } from '../components/ui/PageHeader'
import { Card, CardHeader } from '../components/ui/Card'
import { LoadingState } from '../components/ui/DataTable'
import { Alert } from '../components/ui/Alert'

const CHART_COLORS = ['#22d3ee', '#a78bfa', '#fbbf24', '#34d399', '#fb7185', '#60a5fa']

const tooltipStyle = {
  background: 'rgba(12, 12, 18, 0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  fontSize: '12px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
}

const metricIcons: Record<string, React.ReactNode> = {
  'Expected monthly revenue': <IndianRupee className="h-4 w-4" />,
  'Active clients': <Target className="h-4 w-4" />,
  'Active cases': <Briefcase className="h-4 w-4" />,
  Headcount: <Users className="h-4 w-4" />,
  'Monthly allowed KM': <Gauge className="h-4 w-4" />,
  'Business domains': <Globe className="h-4 w-4" />,
}

function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-[color:var(--color-border)] text-center">
      <p className="text-sm text-[color:var(--color-text-muted)]">{message}</p>
    </div>
  )
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .dashboard()
      .then(setData)
      .catch((e) => setError(e.message))
  }, [])

  if (error) return <Alert variant="error">{error}</Alert>
  if (!data) return <LoadingState message="Loading command center…" />

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        eyebrow="Analytics"
        title="Command Center"
        subtitle="Live counts and totals from orion_ods. Charts stay empty until matching records exist."
      />

      <section>
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-[color:var(--color-text-muted)]">Key metrics</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {data.metrics.map((m, i) => (
            <div key={m.label} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
              <MetricCard
                label={m.label}
                value={m.value}
                delta={m.delta}
                deltaType={m.delta_type as 'positive' | 'negative' | 'neutral'}
                icon={metricIcons[m.label]}
              />
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card glow className="animate-slide-up stagger-1">
          <CardHeader title="Clients by status" subtitle="Active vs inactive in ODS" />
          {data.clients_by_status.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.clients_by_status}
                  dataKey="count"
                  nameKey="type"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={4}
                >
                  {data.clients_by_status.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmpty message="No client records yet." />
          )}
        </Card>

        <Card className="animate-slide-up stagger-2">
          <CardHeader title="Clients by type" subtitle="Govt, Private, MSME" />
          {data.clients_by_type.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.clients_by_type} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="type" axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.clients_by_type.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmpty message="No client records yet." />
          )}
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="animate-slide-up stagger-3">
          <CardHeader title="Headcount distribution" subtitle="Active vs inactive employees" />
          {data.headcount.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.headcount}
                  dataKey="count"
                  nameKey="type"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={4}
                >
                  {data.headcount.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i + 3]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmpty message="No employee records yet." />
          )}
        </Card>

        <Card className="animate-slide-up stagger-4">
          <CardHeader title="Cases by business domain" subtitle="Counts from ODS cases" />
          {data.cases_by_domain.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.cases_by_domain} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="domain" axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.cases_by_domain.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmpty message="No case records yet." />
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Case-wise expected monthly revenue" subtitle="Top 10 cases in ODS" />
        {data.case_revenue.length ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.case_revenue} layout="vertical" barSize={20}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="case" axisLine={false} tickLine={false} width={120} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                {data.case_revenue.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty message="No case records yet." />
        )}
      </Card>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-violet-400" />
          <h2 className="text-sm font-semibold text-[color:var(--color-text-muted)]">Performance snapshot</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {data.snapshot.map((s) => (
            <div
              key={s.label}
              className="glass rounded-2xl p-5 transition-all hover:border-violet-400/20 hover:bg-white/[0.04]"
            >
              <p className="text-xs text-[color:var(--color-text-muted)]">{s.label}</p>
              <p className="mt-2 font-display text-xl font-bold text-violet-300">{s.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
