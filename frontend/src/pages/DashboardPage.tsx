import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
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
  Wallet,
} from 'lucide-react'
import { api } from '../api/client'
import type { DashboardData } from '../types'
import { PageHeader, MetricCard } from '../components/ui/PageHeader'
import { Card, CardHeader } from '../components/ui/Card'
import { LoadingState } from '../components/ui/DataTable'
import { Alert } from '../components/ui/Alert'

const CHART_COLORS = ['#38bdf8', '#a78bfa', '#fbbf24', '#34d399', '#fb7185', '#60a5fa', '#f472b6', '#2dd4bf']

const tooltipStyle = {
  background: 'rgba(15, 22, 41, 0.96)',
  border: '1px solid rgba(56, 189, 248, 0.25)',
  borderRadius: '14px',
  fontSize: '13px',
  fontWeight: 500,
  color: '#f8fafc',
  boxShadow: '0 12px 40px rgba(0,0,0,0.45), 0 0 24px rgba(56, 189, 248, 0.08)',
}

const metricIcons: Record<string, React.ReactNode> = {
  Revenue: <IndianRupee className="h-4 w-4" />,
  Expense: <Wallet className="h-4 w-4" />,
  Headcount: <Users className="h-4 w-4" />,
  'Active Cases': <Briefcase className="h-4 w-4" />,
  'KM Today': <Gauge className="h-4 w-4" />,
  'Open Opportunities': <Target className="h-4 w-4" />,
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

  const revenueData = data.revenue.months.map((m, i) => ({
    month: m,
    Prospective: data.revenue.prospective[i],
    Committed: data.revenue.committed[i],
  }))

  const expenseData = data.expense.months.map((m, i) => ({
    month: m,
    Prospective: data.expense.prospective[i],
    Committed: data.expense.committed[i],
  }))

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        eyebrow="Analytics"
        title="Command Center"
        subtitle="Real-time overview of revenue, expenses, headcount, and pipeline performance."
      />

      {/* Metrics grid */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-sky-400" />
          <h2 className="text-sm font-bold text-[color:var(--color-text-muted)]">Key metrics</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {data.metrics.map((m, i) => (
            <div key={m.label} className="min-w-0 animate-slide-up" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
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

      {/* Charts row 1 */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card glow className="animate-slide-up stagger-1">
          <CardHeader title="Revenue breakdown" subtitle="Prospective vs committed by month" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
              <Bar dataKey="Prospective" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Committed" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="animate-slide-up stagger-2">
          <CardHeader title="Expense breakdown" subtitle="Monthly spend analysis" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={expenseData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
              <Bar dataKey="Prospective" fill={CHART_COLORS[4]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Committed" fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="animate-slide-up stagger-3">
          <CardHeader title="Headcount distribution" subtitle="Active vs inactive workforce" />
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
        </Card>

        <Card className="animate-slide-up stagger-4">
          <CardHeader title="Opportunity pipeline" subtitle="Deal stage funnel" />
          <ResponsiveContainer width="100%" height={280}>
            <FunnelChart>
              <Tooltip contentStyle={tooltipStyle} />
              <Funnel dataKey="count" data={data.pipeline} isAnimationActive>
                <LabelList position="right" fill="#94a3b8" stroke="none" dataKey="stage" fontSize={12} />
                {data.pipeline.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i]} />
                ))}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Case revenue */}
      <Card>
        <CardHeader title="Case-wise revenue (YTD)" subtitle="Top performing engagements" />
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.case_revenue} layout="vertical" barSize={20}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="case" axisLine={false} tickLine={false} width={70} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
              {data.case_revenue.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Snapshot */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-violet-400" />
          <h2 className="text-sm font-bold text-[color:var(--color-text-muted)]">Performance snapshot</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {data.snapshot.map((s, i) => (
            <div
              key={s.label}
              className="glass rounded-2xl p-5 transition-all duration-300 hover:border-violet-400/30 hover:bg-white/[0.06] hover:-translate-y-1 animate-slide-up"
              style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}
            >
              <p className="text-xs font-semibold text-[color:var(--color-text-muted)]">{s.label}</p>
              <p className="mt-2.5 font-display text-2xl font-bold text-violet-300">{s.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
