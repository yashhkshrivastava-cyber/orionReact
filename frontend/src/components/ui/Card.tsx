import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  glow?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

const paddingMap = { sm: 'p-4', md: 'p-5', lg: 'p-6' }

export function Card({ children, className = '', glow, padding = 'md' }: CardProps) {
  return (
    <div
      className={`glass rounded-2xl ${paddingMap[padding]} ${glow ? 'glow-accent' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <h3 className="text-sm font-semibold text-[color:var(--color-text)]">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-[color:var(--color-text-muted)]">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  )
}
