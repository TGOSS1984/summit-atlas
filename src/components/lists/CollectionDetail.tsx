import type { Collection } from '../../types/collection'
import type { Mountain } from '../../types/mountain'
import { formatElevation } from '../../utils/units'
import { useUnit } from '../../context/UnitContext'
import { getCollectionWikiExtract } from '../../utils/wiki'
import styles from './CollectionDetail.module.css'

interface CollectionDetailProps {
  collection: Collection
  mountains: Mountain[]
  climbedIds: Set<string>
}

export function CollectionDetail({ collection, mountains, climbedIds }: CollectionDetailProps) {
  const { unit } = useUnit()
  const wiki = getCollectionWikiExtract(collection.id)
  const missingCount = collection.peakIds.length - mountains.length

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>{collection.name}</h2>
      <p className={styles.tagline}>{collection.tagline}</p>

      <div className={styles.description}>
        {wiki ? (
          <>
            <p>{wiki.extract}</p>
            <a href={wiki.url} target="_blank" rel="noreferrer" className={styles.wikiLink}>
              Read more on Wikipedia
            </a>
          </>
        ) : (
          // either no wikipediaTitle set for this one (a curated grouping
          // rather than a real named list) or the fetch script hasn't
          // pulled it in yet - both look the same to a viewer, which is fine
          <p className={styles.noDescription}>No summary available.</p>
        )}
      </div>

      <ul className={styles.list}>
        {mountains.map((mountain) => {
          const climbed = climbedIds.has(mountain.id)
          return (
            <li key={mountain.id} className={styles.row}>
              <span className={styles.flag}>{mountain.flag}</span>
              <span className={styles.name}>{mountain.name}</span>
              <span className={styles.country}>{mountain.country}</span>
              <span className={styles.elevation}>{formatElevation(mountain.elevation, unit)}</span>
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