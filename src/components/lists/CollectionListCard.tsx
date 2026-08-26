import type { Collection } from '../../types/collection'
import styles from './CollectionListCard.module.css'

interface CollectionListCardProps {
  collection: Collection
  climbed: number
  total: number
  active: boolean
  onSelect: () => void
}

export function CollectionListCard({
  collection,
  climbed,
  total,
  active,
  onSelect,
}: CollectionListCardProps) {
  const percent = total === 0 ? 0 : Math.round((climbed / total) * 100)

  return (
    <button type="button" className={active ? styles.cardActive : styles.card} onClick={onSelect}>
      <div className={styles.header}>
        <span className={styles.dot} style={{ background: `var(--${collection.colorToken})` }} />
        <span className={styles.name}>{collection.name}</span>
      </div>
      <p className={styles.tagline}>{collection.tagline}</p>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${percent}%`, background: `var(--${collection.colorToken})` }}
        />
      </div>
      <p className={styles.progressLabel}>
        {climbed}/{total} climbed
      </p>
    </button>
  )
}