import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const fieldClass =
  'w-full rounded-xl border border-[color:var(--color-border)] bg-white/[0.03] px-3.5 py-2.5 text-sm text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-faint)] transition-all duration-200 focus:border-cyan-400/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-cyan-400/20'

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
        <label className="block text-xs font-medium text-[color:var(--color-text-muted)]">
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
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
          checked
            ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400'
            : 'border-[color:var(--color-border-strong)] bg-white/[0.02] group-hover:border-cyan-400/40'
        }`}
      >
        {checked && (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
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
      <span className="text-sm text-[color:var(--color-text-muted)] group-hover:text-[color:var(--color-text)]">
        {label}
      </span>
    </label>
  )
}
