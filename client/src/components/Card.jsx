// A small labelled card that renders a list of "chips". Used across the
// dashboard for languages, frameworks, databases, auth, etc.
export function Card({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h3>
      {children}
    </div>
  )
}

export function Chips({ items, empty = 'None detected', color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    green: 'bg-green-50 text-green-700 ring-green-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    sky: 'bg-sky-50 text-sky-700 ring-sky-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200',
  }
  if (!items?.length) return <p className="text-sm text-gray-400">{empty}</p>
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${colors[color]}`}
        >
          {item}
        </span>
      ))}
    </div>
  )
}
