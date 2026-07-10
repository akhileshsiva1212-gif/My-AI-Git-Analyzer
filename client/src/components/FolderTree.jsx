// Recursive, collapsible folder tree. Renders the nested `tree` array the
// backend produces ({ name, type, children | size }).
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

function TreeNode({ node, depth }) {
  const [open, setOpen] = useState(depth < 1) // top level expanded by default

  if (node.type === 'file') {
    return (
      <div
        className="flex items-center justify-between py-0.5 pr-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <span className="truncate">📄 {node.name}</span>
        <span className="ml-2 shrink-0 text-xs text-gray-400">{formatBytes(node.size)}</span>
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center py-0.5 text-left text-sm font-medium text-gray-800 hover:bg-gray-50 rounded"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <span className="mr-1 inline-block w-3 text-gray-400">{open ? '▾' : '▸'}</span>
        <span className="truncate">📁 {node.name}</span>
      </button>
      {open && node.children?.map((child) => (
        <TreeNode key={child.name + child.type} node={child} depth={depth + 1} />
      ))}
    </div>
  )
}

export default function FolderTree({ tree }) {
  if (!tree?.length) return <p className="text-sm text-gray-400">No files found.</p>
  return (
    <div className="max-h-[28rem] overflow-auto rounded-lg border border-gray-200 bg-white p-2">
      {tree.map((node) => (
        <TreeNode key={node.name + node.type} node={node} depth={0} />
      ))}
    </div>
  )
}
