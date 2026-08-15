import type { ReactNode } from 'react'

type AlertVariant = 'error' | 'success' | 'info'

const styles: Record<AlertVariant, string> = {
  error: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  info: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
}

export function Alert({
  variant = 'info',
  children,
  onDismiss,
}: {
  variant?: AlertVariant
  children: ReactNode
  onDismiss?: () => void
}) {
  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm animate-slide-up ${styles[variant]}`}
    >
      <span>{children}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        >
          ×
        </button>
      )}
    </div>
  )
}

export function Badge({
  children,
  variant = 'default',
}: {
  children: ReactNode
  variant?: 'default' | 'cyan' | 'violet' | 'amber' | 'rose' | 'emerald'
}) {
  const colors = {
    default: 'bg-white/10 text-[color:var(--color-text-muted)]',
    cyan: 'bg-cyan-400/15 text-cyan-300 border-cyan-400/20',
    violet: 'bg-violet-400/15 text-violet-300 border-violet-400/20',
    amber: 'bg-amber-400/15 text-amber-300 border-amber-400/20',
    rose: 'bg-rose-400/15 text-rose-300 border-rose-400/20',
    emerald: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/20',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${colors[variant]}`}
    >
      {children}
    </span>
  )
}
