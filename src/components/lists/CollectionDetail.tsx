import type { Collection } from '../../types/collection'
import type { Mountain } from '../../types/mountain'
import { formatElevation } from '../../utils/units'
import styles from './CollectionDetail.module.css'

interface CollectionDetailProps {
  collection: Collection
  mountains: Mountain[]
  climbedIds: Set<string>
}

export function CollectionDetail({ collection, mountains, climbedIds }: CollectionDetailProps) {
  const missingCount = collection.peakIds.length - mountains.length

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>{collection.name}</h2>
      {/* TODO: swap for the real Wikipedia-sourced summary once commit 18's pipeline exists */}
      <p className={styles.tagline}>{collection.tagline}</p>

      <ul className={styles.list}>
        {mountains.map((mountain) => {
          const climbed = climbedIds.has(mountain.id)
          return (
            <li key={mountain.id} className={styles.row}>
              <span className={styles.flag}>{mountain.flag}</span>
              <span className={styles.name}>{mountain.name}</span>
              <span className={styles.country}>{mountain.country}</span>
              <span className={styles.elevation}>{formatElevation(mountain.elevation, 'm')}</span>
              <span className={climbed ? styles.badgeClimbed : styles.badge}>
                {climbed ? '✓ Climbed' : 'Not yet'}
              </span>
            </li>
          )
        })}
      </ul>

      {missingCount > 0 && (
        <p className={styles.missingNote}>
          {`${missingCount} of the peaks in this collection aren't in the dataset yet.`}
        </p>
      )}
    </div>
  )
}