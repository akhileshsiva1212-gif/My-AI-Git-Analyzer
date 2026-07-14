// Shimmer skeleton primitives. `Skeleton` is a single animated block; the
// presets compose it into card- and list-shaped placeholders.
export default function Skeleton({ className = '', style }) {
  return <div className={`skeleton ${className}`} style={style} />
}

export function SkeletonLines({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3.5"
          style={{ width: `${90 - i * (60 / lines)}%` }}
        />
      ))}
    </div>
  )
}

// A neumorphic card with a shimmering title + body — used while loading.
export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="neu-card p-5">
      <Skeleton className="mb-4 h-4 w-32" />
      <SkeletonLines lines={lines} />
    </div>
  )
}

// A row of stat tiles shimmering — mirrors the Metrics header.
export function SkeletonStats({ count = 3 }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="neu-inset p-4">
          <Skeleton className="mx-auto mb-2 h-7 w-14" />
          <Skeleton className="mx-auto h-3 w-16" />
        </div>
      ))}
    </div>
  )
}
