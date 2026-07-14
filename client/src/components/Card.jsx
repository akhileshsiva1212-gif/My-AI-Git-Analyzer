// A neumorphic labelled card that renders a list of soft "chips". Used across
// the dashboard for languages, frameworks, databases, auth, etc.
export function Card({ title, action, children }) {
  return (
    <div className="neu-card p-5">
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && (
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</h3>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

export function Chips({ items, empty = 'None detected', color = 'indigo' }) {
  const colors = {
    indigo: 'text-indigo-700',
    green: 'text-emerald-700',
    amber: 'text-amber-700',
    sky: 'text-sky-700',
    rose: 'text-rose-700',
    violet: 'text-violet-700',
  }
  if (!items?.length) return <p className="text-sm text-muted">{empty}</p>
  return (
    <div className="flex flex-wrap gap-2.5">
      {items.map((item) => (
        <span
          key={item}
          className={`neu-pill px-3 py-1.5 text-xs font-semibold ${colors[color] || colors.indigo}`}
        >
          {item}
        </span>
      ))}
    </div>
  )
}
