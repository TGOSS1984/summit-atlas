import { COLLECTION_ICONS } from '../../data/collectionIcons'
import { CollectionIcon } from './CollectionIcon'
import type { Collection } from '../../types/collection'
import { Modal } from '../common/Modal'
import styles from './CollectionCompleteModal.module.css'

interface CollectionCompleteModalProps {
  collection: Collection
  onClose: () => void
}

export function CollectionCompleteModal({ collection, onClose }: CollectionCompleteModalProps) {
  const icon = COLLECTION_ICONS[collection.id] ?? {
    peaks: 'single' as const,
    accent: 'none' as const,
    color: 'var(--accent)',
  }

  return (
    <Modal onClose={onClose}>
      <div
        className={styles.hero}
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, ${icon.color} 22%, transparent), transparent 65%)`,
        }}
      >
        <CollectionIcon peaks={icon.peaks} accent={icon.accent} className={styles.heroIcon} style={{ color: icon.color }} />
        <p className={styles.eyebrow}>Collection complete</p>
        <h2 className={styles.title}>{collection.name}</h2>
        <p className={styles.tagline}>
          All {collection.peakIds.length} peak{collection.peakIds.length === 1 ? '' : 's'} climbed.
        </p>
      </div>
      <button type="button" className={styles.doneButton} onClick={onClose}>
        Nice
      </button>
    </Modal>
  )
}