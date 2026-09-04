import type { ReactNode } from 'react'
import styles from './StatCard.module.css'

interface StatCardProps {
  label: string
  value: ReactNode
  sublabel?: string
  // the one "hero" card gets the bigger value, tinted background and the
  // topo texture - every other card stays the plain version from commit 7
  featured?: boolean
  // optional trend line under the value - kept intentionally rough (no
  // axis, no labels), just meant to give a sense of "recent pace" at a
  // glance rather than be read as precise data
  sparkline?: number[]
}

export function StatCard({ label, value, sublabel, featured, sparkline }: StatCardProps) {
  return (
    <div className={featured ? `${styles.card} ${styles.featured}` : styles.card}>
      {featured && <TopoTexture className={styles.texture} />}
      <p className={styles.label}>{label}</p>
      <p className={featured ? `${styles.value} ${styles.valueFeatured}` : styles.value}>{value}</p>
      {sublabel && <p className={styles.sublabel}>{sublabel}</p>}
      {sparkline && sparkline.length > 1 && <Sparkline data={sparkline} />}
    </div>
  )
}

// loose concentric contour lines standing in for a topographic map - purely
// decorative (aria-hidden), sits behind the card's text since it's the first
// child in the DOM. currentColor so it just inherits --accent from the card
function TopoTexture({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" className={className} aria-hidden="true">
      <path d="M100 14c48 3 86 38 89 82 3 46-33 92-89 96S12 154 9 100 52 11 100 14z" />
      <path d="M101 40c36 3 64 30 66 62 2 35-25 70-66 73S39 149 37 106 65 37 101 40z" />
      <path d="M102 66c24 2 43 20 44 43 2 24-17 47-44 49S60 143 59 112 78 64 102 66z" />
      <path d="M103 92c12 1 21 11 22 24 1 13-9 25-22 26S82 130 81 111 91 91 103 92z" />
    </svg>
  )
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(1, ...data)
  const w = 100
  const h = 24
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - (v / max) * h
    return [x, y] as const
  })
  const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={styles.sparkline} preserveAspectRatio="none" aria-hidden="true">
      <path d={path} fill="none" />
    </svg>
  )
}