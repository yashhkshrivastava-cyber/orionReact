import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const fieldClass =
  'w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-surface)]/60 px-3.5 py-2.5 text-sm text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-faint)] transition-all duration-250 focus:border-sky-400/60 focus:bg-[color:var(--color-bg-surface)] focus:ring-2 focus:ring-sky-400/25 focus:shadow-[0_0_20px_rgba(56,189,248,0.08)]'

export function Field({
  label,
  children,
  className = '',
}: {
  label?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-[color:var(--color-text-muted)] tracking-wide">
          {label}
        </label>
      )}
      {children}
    </div>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={fieldClass} {...props} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${fieldClass} cursor-pointer`} {...props} />
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${fieldClass} min-h-[88px] resize-y`} {...props} />
}

export function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 ${
          checked
            ? 'border-sky-400 bg-sky-400/25 text-sky-300 scale-105 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
            : 'border-[color:var(--color-border-strong)] bg-white/[0.03] group-hover:border-sky-400/50 group-hover:bg-sky-400/5'
        }`}
      >
        {checked && (
          <svg
            className="h-3 w-3 animate-scale-in"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-sm text-[color:var(--color-text-muted)] group-hover:text-[color:var(--color-text)] transition-colors">
        {label}
      </span>
    </label>
  )
}
