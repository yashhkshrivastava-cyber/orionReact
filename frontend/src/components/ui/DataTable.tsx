export function DataTable({
  columns,
  rows,
  emptyMessage = 'No records yet.',
}: {
  columns: string[]
  rows: Record<string, unknown>[]
  emptyMessage?: string
}) {
  if (!rows.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[color:var(--color-border-strong)] bg-white/[0.02] py-14 text-center animate-fade-in">
        <div className="mb-3 h-10 w-10 rounded-full bg-gradient-to-br from-sky-400/10 to-violet-400/10 flex items-center justify-center">
          <span className="text-lg opacity-50">—</span>
        </div>
        <p className="text-sm text-[color:var(--color-text-muted)]">{emptyMessage}</p>
      </div>
    )
  }

  const displayCols = columns.filter((c) => !c.includes('timestamp') || c === 'record_status')

  return (
    <div className="overflow-hidden rounded-xl border border-[color:var(--color-border)] animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-[color:var(--color-border)] bg-gradient-to-r from-sky-400/5 to-violet-400/5">
              {displayCols.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[color:var(--color-text-muted)]"
                >
                  {col.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-[color:var(--color-border)]/50 transition-all duration-200 last:border-0 hover:bg-sky-400/[0.04] animate-slide-up"
                style={{ animationDelay: `${i * 0.03}s`, opacity: 0 }}
              >
                {displayCols.map((col) => (
                  <td
                    key={col}
                    className="px-4 py-3.5 text-[color:var(--color-text-muted)] font-medium"
                  >
                    {String(row[col] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function LoadingState({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-24 animate-fade-in">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-2 border-sky-400/15" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-sky-400 border-r-violet-400" />
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-sky-400/10 to-violet-400/10 animate-pulse-glow" />
      </div>
      <p className="text-sm font-medium text-[color:var(--color-text-muted)] animate-pulse-glow">
        {message}
      </p>
    </div>
  )
}
