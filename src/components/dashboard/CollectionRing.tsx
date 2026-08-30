import type { Collection } from '../../types/collection'
import { CollectionIcon } from '../lists/CollectionIcon'
import { COLLECTION_ICONS } from '../../data/collectionIcons'
import styles from './CollectionRing.module.css'

interface CollectionRingProps {
  collection: Collection
  climbedCount: number
  onSelect: () => void
}

const RADIUS = 28
const STROKE_WIDTH = 5
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function CollectionRing({ collection, climbedCount, onSelect }: CollectionRingProps) {
  const total = collection.peakIds.length
  const percent = total === 0 ? 0 : climbedCount / total
  const offset = CIRCUMFERENCE * (1 - percent)
  const icon = COLLECTION_ICONS[collection.id] ?? {
    peaks: 'single' as const,
    accent: 'none' as const,
    color: 'var(--accent)',
  }

  return (
    <button type="button" className={styles.ring} onClick={onSelect}>
      <div className={styles.ringVisual}>
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
            stroke={icon.color}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 36 36)" // start the progress at 12 o'clock, not 3
          />
        </svg>
        <CollectionIcon
          peaks={icon.peaks}
          accent={icon.accent}
          className={styles.centerIcon}
          style={{ color: icon.color }}
        />
      </div>
      <div className={styles.label}>
        <span className={styles.count}>
          {climbedCount}/{total}
        </span>
        <span className={styles.name}>{collection.name}</span>
      </div>
    </button>
  )
}