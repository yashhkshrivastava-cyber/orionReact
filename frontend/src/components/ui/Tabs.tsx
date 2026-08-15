export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string }[]
  active: T
  onChange: (id: T) => void
}) {
  return (
    <div className="inline-flex gap-1 rounded-xl glass p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
            active === tab.id
              ? 'bg-white/10 text-[color:var(--color-text)] shadow-sm'
              : 'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] hover:bg-white/5'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[]
  value: T
  onChange: (id: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
            value === opt.id
              ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-300'
              : 'border-[color:var(--color-border)] text-[color:var(--color-text-muted)] hover:border-white/20 hover:bg-white/5'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
