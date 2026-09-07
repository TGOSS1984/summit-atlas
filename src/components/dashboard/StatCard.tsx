import type { ReactNode } from 'react'
import styles from './StatCard.module.css'

interface StatCardProps {
  label: string
  value: ReactNode
  sublabel?: string
  // the one "hero" card gets the bigger value, tinted background and the
  // mountain photo - every other card stays the plain version from commit 7
  featured?: boolean
}

export function StatCard({ label, value, sublabel, featured }: StatCardProps) {
  return (
    <div className={featured ? `${styles.card} ${styles.featured}` : styles.card}>
      {featured && (
        <img
          src="/images/dashboard-stat-hero-mountain.webp"
          alt=""
          aria-hidden="true"
          className={styles.textureImage}
        />
      )}
      <p className={styles.label}>{label}</p>
      <p className={featured ? `${styles.value} ${styles.valueFeatured}` : styles.value}>{value}</p>
      {sublabel && <p className={styles.sublabel}>{sublabel}</p>}
    </div>
  )
}