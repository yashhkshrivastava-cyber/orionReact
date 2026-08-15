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
    <div className="inline-flex gap-1 rounded-xl glass p-1.5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`relative rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-250 ${
            active === tab.id
              ? 'bg-gradient-to-r from-sky-400/20 to-violet-400/15 text-[color:var(--color-text)] shadow-md shadow-sky-500/10 border border-sky-400/25'
              : 'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] hover:bg-white/6 border border-transparent'
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
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-250 ${
            value === opt.id
              ? 'border-sky-400/50 bg-gradient-to-r from-sky-400/15 to-violet-400/10 text-sky-200 shadow-[0_0_16px_rgba(56,189,248,0.12)] scale-[1.02]'
              : 'border-[color:var(--color-border)] text-[color:var(--color-text-muted)] hover:border-sky-400/30 hover:bg-white/6 hover:text-[color:var(--color-text)]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
