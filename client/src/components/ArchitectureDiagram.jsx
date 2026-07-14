// AI Architecture Diagram. Renders the backend-derived `architecture` graph
// ({ nodes, edges, layers }) as an interactive, top-to-bottom layered diagram
// using only neumorphic styling + SVG connectors (no external diagram library).
// Nodes are grouped into tiers; clicking a node reveals its detail and highlights
// everything it connects to.
import { useMemo, useState } from 'react'
import { Card } from './Card'

// Per-type presentation (icon + accent color).
const TYPE_META = {
  frontend: { icon: '🖥️', ring: 'text-sky-700' },
  backend: { icon: '⚙️', ring: 'text-indigo-700' },
  service: { icon: '🧩', ring: 'text-violet-700' },
  database: { icon: '🗄️', ring: 'text-rose-700' },
  auth: { icon: '🔐', ring: 'text-amber-700' },
  external: { icon: '🌐', ring: 'text-emerald-700' },
}

function Node({ node, active, dimmed, onToggle }) {
  const meta = TYPE_META[node.type] || { icon: '📦', ring: 'text-muted' }
  return (
    <button
      type="button"
      onClick={() => onToggle(node.id)}
      className={`neu-card min-w-[120px] max-w-[200px] px-3.5 py-2.5 text-left transition ${
        active ? 'neu-inset' : ''
      } ${dimmed ? 'opacity-40' : ''}`}
      title={node.detail || node.label}
    >
      <div className="flex items-center gap-2">
        <span aria-hidden className="text-base">{meta.icon}</span>
        <span className={`truncate text-sm font-bold ${meta.ring}`}>{node.label}</span>
      </div>
      {node.detail && (
        <p className={`mt-0.5 truncate text-[11px] text-muted ${active ? 'whitespace-normal' : ''}`}>
          {node.detail}
        </p>
      )}
    </button>
  )
}

export default function ArchitectureDiagram({ architecture }) {
  const [selected, setSelected] = useState(null)

  const nodesById = useMemo(() => {
    const map = new Map()
    for (const n of architecture?.nodes || []) map.set(n.id, n)
    return map
  }, [architecture])

  // Set of node ids directly connected to the selected node (either direction).
  const connected = useMemo(() => {
    if (!selected) return null
    const set = new Set([selected])
    for (const e of architecture?.edges || []) {
      if (e.from === selected) set.add(e.to)
      if (e.to === selected) set.add(e.from)
    }
    return set
  }, [selected, architecture])

  if (!architecture || !architecture.nodes?.length) {
    return (
      <Card title="🧭 Architecture">
        <p className="text-sm text-muted">Not enough signals to infer an architecture for this repository.</p>
      </Card>
    )
  }

  const layers = architecture.layers?.length
    ? architecture.layers
    : [architecture.nodes.map((n) => n.id)]

  function toggle(id) {
    setSelected((cur) => (cur === id ? null : id))
  }

  return (
    <Card title="🧭 Architecture" action={selected && (
      <button type="button" onClick={() => setSelected(null)} className="text-xs text-accent hover:underline">
        clear
      </button>
    )}>
      <div className="neu-inset neu-scroll overflow-x-auto rounded-2xl p-5">
        <div className="flex min-w-max flex-col items-center gap-1">
          {layers.map((layer, li) => (
            <div key={li} className="flex flex-col items-center">
              <div className="flex flex-wrap items-stretch justify-center gap-3">
                {layer.map((id) => {
                  const node = nodesById.get(id)
                  if (!node) return null
                  const active = selected === id
                  const dimmed = connected ? !connected.has(id) : false
                  return (
                    <Node key={id} node={node} active={active} dimmed={dimmed} onToggle={toggle} />
                  )
                })}
              </div>
              {li < layers.length - 1 && (
                <div aria-hidden className="my-1 h-5 w-px bg-[color:var(--neu-dark)]">
                  <span className="block -mb-1 text-center text-accent">▼</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs text-muted">
        Tap a box to highlight what it connects to. Derived automatically from the analysis.
      </p>
    </Card>
  )
}
