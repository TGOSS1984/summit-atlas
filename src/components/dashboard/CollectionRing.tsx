import type { Collection } from '../../types/collection'
import styles from './CollectionRing.module.css'

interface CollectionRingProps {
  collection: Collection
  climbedCount: number
}

const RADIUS = 28
const STROKE_WIDTH = 5
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function CollectionRing({ collection, climbedCount }: CollectionRingProps) {
  const total = collection.peakIds.length
  const percent = total === 0 ? 0 : climbedCount / total
  const offset = CIRCUMFERENCE * (1 - percent)

  return (
    <div className={styles.ring}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle
          cx="36"
          cy="36"
          r={RADIUS}
          fill="none"
          stroke="var(--border)"
          strokeWidth={STROKE_WIDTH}
        />
        <circle
          cx="36"
          cy="36"
          r={RADIUS}
          fill="none"
          // colorToken names match the token names 1:1 (see collection.ts) so
          // this can just interpolate straight into a var() reference
          stroke={`var(--${collection.colorToken})`}
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 36 36)" // start the progress at 12 o'clock, not 3
        />
      </svg>
      <div className={styles.label}>
        <span className={styles.count}>
          {climbedCount}/{total}
        </span>
        <span className={styles.name}>{collection.name}</span>
      </div>
    </div>
  )
}