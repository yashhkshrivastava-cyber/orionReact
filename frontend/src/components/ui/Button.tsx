import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: ReactNode
}

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-110',
  secondary:
    'glass text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-hover)] border-[color:var(--color-border-strong)]',
  ghost: 'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] hover:bg-white/5',
  danger:
    'bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold shadow-lg shadow-rose-500/25 hover:brightness-110',
  gold: 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-semibold shadow-lg shadow-amber-500/25 hover:brightness-110',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-sm rounded-xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
}
