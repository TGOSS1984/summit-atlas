import type { ReactNode } from 'react'
import styles from './StatCard.module.css'

interface StatCardProps {
  label: string
  value: ReactNode
  sublabel?: string
}

export function StatCard({ label, value, sublabel }: StatCardProps) {
  return (
    <div className={styles.card}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
      {sublabel && <p className={styles.sublabel}>{sublabel}</p>}
    </div>
  )
}