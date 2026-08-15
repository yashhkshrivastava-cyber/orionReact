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
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[color:var(--color-border)] py-12 text-center">
        <p className="text-sm text-[color:var(--color-text-muted)]">{emptyMessage}</p>
      </div>
    )
  }

  const displayCols = columns.filter((c) => !c.includes('timestamp') || c === 'record_status')

  return (
    <div className="overflow-hidden rounded-xl border border-[color:var(--color-border)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-[color:var(--color-border)] bg-white/[0.02]">
              {displayCols.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-text-muted)]"
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
                className="border-b border-[color:var(--color-border)]/50 transition-colors last:border-0 hover:bg-white/[0.02]"
              >
                {displayCols.map((col) => (
                  <td key={col} className="px-4 py-3 text-[color:var(--color-text-muted)]">
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
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-cyan-400" />
      </div>
      <p className="text-sm text-[color:var(--color-text-muted)]">{message}</p>
    </div>
  )
}
