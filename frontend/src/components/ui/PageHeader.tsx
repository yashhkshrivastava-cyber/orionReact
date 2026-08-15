import type { ReactNode } from 'react'

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <header className="mb-8 animate-slide-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow && (
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-3xl font-bold tracking-tight text-[color:var(--color-text)] sm:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 max-w-2xl text-sm text-[color:var(--color-text-muted)]">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
    </header>
  )
}

export function MetricCard({
  label,
  value,
  delta,
  deltaType = 'neutral',
  icon,
}: {
  label: string
  value: string
  delta?: string
  deltaType?: 'positive' | 'negative' | 'neutral'
  icon?: ReactNode
}) {
  const deltaColors = {
    positive: 'text-emerald-400',
    negative: 'text-rose-400',
    neutral: 'text-[color:var(--color-text-faint)]',
  }

  return (
    <div className="glass group rounded-2xl p-4 transition-all duration-300 hover:border-cyan-400/20 hover:bg-white/[0.05]">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wider text-[color:var(--color-text-muted)]">
          {label}
        </p>
        {icon && (
          <span className="rounded-lg bg-white/5 p-2 text-cyan-400/80 transition-colors group-hover:bg-cyan-400/10 group-hover:text-cyan-400">
            {icon}
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-2xl font-bold tracking-tight">{value}</p>
      {delta && <p className={`mt-1 text-xs font-medium ${deltaColors[deltaType]}`}>{delta}</p>}
    </div>
  )
}
