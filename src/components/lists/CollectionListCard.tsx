import type { Collection } from '../../types/collection'
import { CollectionIcon } from './CollectionIcon'
import { COLLECTION_ICONS } from '../../data/collectionIcons'
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
  const icon = COLLECTION_ICONS[collection.id] ?? {
    peaks: 'single' as const,
    accent: 'none' as const,
    color: 'var(--accent)',
  }

  return (
    <button type="button" className={active ? styles.cardActive : styles.card} onClick={onSelect}>
      <div className={styles.header}>
        <CollectionIcon
          peaks={icon.peaks}
          accent={icon.accent}
          className={styles.icon}
          style={{ color: icon.color }}
        />
        <span className={styles.name}>{collection.name}</span>
      </div>
      <p className={styles.tagline}>{collection.tagline}</p>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${percent}%`, background: icon.color }} />
      </div>
      <p className={styles.progressLabel}>
        {climbed}/{total} climbed
      </p>
    </button>
  )
}