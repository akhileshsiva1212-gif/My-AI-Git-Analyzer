// Recursive, collapsible folder tree. Renders the nested `tree` array the
// backend produces ({ name, type, children | size }).
// Optional `onExplain(path)` adds a per-folder "✨ Explain" button that hands the
// folder's full path up to an AI explanation panel — existing behavior is
// unchanged when the prop is omitted.
import { useState } from 'react'

function formatBytes(bytes) {
  if (!bytes) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let n = bytes
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024
    i++
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`
}

function TreeNode({ node, depth, path, onExplain }) {
  const [open, setOpen] = useState(depth < 1) // top level expanded by default
  const nodePath = path ? `${path}/${node.name}` : node.name

  if (node.type === 'file') {
    return (
      <div
        className="flex items-center justify-between rounded-lg py-1 pr-2 text-sm text-[color:var(--neu-text)] hover:bg-white/40"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <span className="truncate">📄 {node.name}</span>
        <span className="ml-2 shrink-0 text-xs text-muted">{formatBytes(node.size)}</span>
      </div>
    )
  }

  return (
    <div>
      <div
        className="group flex items-center rounded-lg hover:bg-white/40"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-center py-1 text-left text-sm font-semibold text-[color:var(--neu-text)]"
        >
          <span className="mr-1 inline-block w-3 text-accent">{open ? '▾' : '▸'}</span>
          <span className="truncate">📁 {node.name}</span>
        </button>
        {onExplain && (
          <button
            type="button"
            onClick={() => onExplain(nodePath)}
            className="mr-2 shrink-0 rounded-md px-2 py-0.5 text-xs font-medium text-accent opacity-0 transition hover:underline group-hover:opacity-100 focus:opacity-100"
            title={`Explain ${nodePath} with AI`}
          >
            ✨ Explain
          </button>
        )}
      </div>
      {open && node.children?.map((child) => (
        <TreeNode
          key={child.name + child.type}
          node={child}
          depth={depth + 1}
          path={nodePath}
          onExplain={onExplain}
        />
      ))}
    </div>
  )
}

export default function FolderTree({ tree, onExplain }) {
  if (!tree?.length) return <p className="text-sm text-muted">No files found.</p>
  return (
    <div className="neu-inset neu-scroll max-h-[28rem] overflow-auto p-3">
      {tree.map((node) => (
        <TreeNode key={node.name + node.type} node={node} depth={0} path="" onExplain={onExplain} />
      ))}
    </div>
  )
}
