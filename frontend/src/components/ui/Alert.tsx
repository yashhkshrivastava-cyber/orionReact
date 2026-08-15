import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

type AlertVariant = 'error' | 'success' | 'info'

const styles: Record<AlertVariant, string> = {
  error: 'border-rose-400/40 bg-rose-500/12 text-rose-100 shadow-[0_4px_20px_rgba(244,63,94,0.1)]',
  success: 'border-emerald-400/40 bg-emerald-500/12 text-emerald-100 shadow-[0_4px_20px_rgba(16,185,129,0.1)]',
  info: 'border-sky-400/40 bg-sky-500/12 text-sky-100 shadow-[0_4px_20px_rgba(56,189,248,0.1)]',
}

const icons: Record<AlertVariant, ReactNode> = {
  error: <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />,
  success: <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />,
  info: <Info className="h-4 w-4 shrink-0 text-sky-400" />,
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
      className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 text-sm animate-slide-up ${styles[variant]}`}
      role="alert"
    >
      {icons[variant]}
      <span className="flex-1 leading-relaxed">{children}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-md px-1.5 py-0.5 opacity-70 hover:opacity-100 hover:bg-white/10 transition-all"
          aria-label="Dismiss"
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
    default: 'bg-white/10 text-[color:var(--color-text-muted)] border-white/10',
    cyan: 'bg-sky-400/18 text-sky-200 border-sky-400/30 shadow-[0_0_12px_rgba(56,189,248,0.1)]',
    violet: 'bg-violet-400/18 text-violet-200 border-violet-400/30',
    amber: 'bg-amber-400/18 text-amber-200 border-amber-400/30',
    rose: 'bg-rose-400/18 text-rose-200 border-rose-400/30',
    emerald: 'bg-emerald-400/18 text-emerald-200 border-emerald-400/30',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-transform hover:scale-105 ${colors[variant]}`}
    >
      {children}
    </span>
  )
}
