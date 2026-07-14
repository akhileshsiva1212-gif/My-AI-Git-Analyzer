// Shared "What You'll Get" feature list, used on the Home page and as the left
// panel on the Login/Register pages so the showcase stays consistent in one place.

// Every capability the analyzer offers (new features + the original ones).
export const FEATURES = [
  { icon: '🧭', title: 'AI Architecture Diagram', body: 'An automatic diagram showing how your project is structured.' },
  { icon: '🩺', title: 'Repository Health Score', body: 'Overall health across architecture, docs, maintainability & security.' },
  { icon: '📄', title: 'README Quality Score', body: 'Checks your README for completeness and flags missing sections.' },
  { icon: '💬', title: 'AI Folder Explanation', body: 'Click any folder for an AI explanation of its purpose and contents.' },
  { icon: '🤖', title: 'AI Repository Chat', body: 'Ask anything — answers grounded in the real analyzed code.' },
  { icon: '🧱', title: 'Tech Stack Detection', body: 'Languages, frameworks, package managers and build tools.' },
  { icon: '🧠', title: 'Project Intelligence', body: 'Detected database, authentication and API routes.' },
  { icon: '📊', title: 'Code Metrics', body: 'Files, lines of code, language split and largest files.' },
]

// One feature row.
function FeatureRow({ icon, title, body }) {
  return (
    <div className="neu-card flex gap-3 p-4">
      <div className="neu-inset flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg">
        <span aria-hidden>{icon}</span>
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-bold text-[color:var(--neu-text)]">{title}</h3>
        <p className="mt-0.5 text-xs text-muted">{body}</p>
      </div>
    </div>
  )
}

// The full showcase panel. `heading`/`sub` are optional overrides.
export default function FeatureShowcase({
  heading = "What You'll Get 🚀",
  sub = 'Powerful AI insights for every GitHub repository.',
  className = '',
}) {
  return (
    <aside className={`space-y-4 ${className}`}>
      <div>
        <h2 className="font-display text-xl font-extrabold text-[color:var(--neu-text)]">{heading}</h2>
        <p className="mt-1 text-sm text-muted">{sub}</p>
      </div>
      <div className="space-y-3">
        {FEATURES.map((f) => (
          <FeatureRow key={f.title} {...f} />
        ))}
      </div>
    </aside>
  )
}
