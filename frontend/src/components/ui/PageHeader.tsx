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
            <p className="mb-2 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-sky-400 animate-slide-down">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse-glow" />
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-3xl font-bold tracking-tight text-[color:var(--color-text)] sm:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-[color:var(--color-text-muted)]">
              {subtitle}
            </p>
          )}
          <div className="mt-4 h-0.5 w-16 rounded-full bg-gradient-to-r from-sky-400 via-violet-400 to-transparent" />
        </div>
        {action && <div className="animate-scale-in stagger-2">{action}</div>}
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
    <div className="glass group rounded-2xl p-4 transition-all duration-300 hover:border-sky-400/25 hover:bg-white/[0.07] hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-500/5">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-text-muted)]">
          {label}
        </p>
        {icon && (
          <span className="rounded-xl bg-gradient-to-br from-sky-400/15 to-violet-400/10 p-2 text-sky-400 transition-all duration-300 group-hover:scale-110 group-hover:from-sky-400/25 group-hover:to-violet-400/20 group-hover:text-sky-300">
            {icon}
          </span>
        )}
      </div>
      <p className="mt-2.5 font-display text-2xl font-bold tracking-tight text-[color:var(--color-text)]">
        {value}
      </p>
      {delta && (
        <p className={`mt-1.5 text-xs font-semibold ${deltaColors[deltaType]}`}>{delta}</p>
      )}
    </div>
  )
}
