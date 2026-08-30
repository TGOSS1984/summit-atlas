import type { Collection } from '../../types/collection'
import type { Mountain } from '../../types/mountain'
import { formatElevation } from '../../utils/units'
import { useUnit } from '../../context/UnitContext'
import { getCollectionWikiExtract } from '../../utils/wiki'
import { FlagIcon } from '../common/FlagIcon'
import { CollectionIcon } from './CollectionIcon'
import { COLLECTION_ICONS } from '../../data/collectionIcons'
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
  const icon = COLLECTION_ICONS[collection.id] ?? { peaks: 'single' as const, accent: 'none' as const }

  const climbedCount = mountains.filter((m) => climbedIds.has(m.id)).length
  const total = mountains.length
  const percent = total === 0 ? 0 : Math.round((climbedCount / total) * 100)

  // tallest-first reads better than dataset order once a list runs to
  // hundreds of entries (Wainwrights, Munros etc.)
  const sorted = [...mountains].sort((a, b) => b.elevation - a.elevation)

  return (
    <div>
      <div
        className={styles.hero}
        style={{
          background: `linear-gradient(160deg, color-mix(in srgb, var(--${collection.colorToken}) 18%, transparent), transparent 60%)`,
        }}
      >
        <CollectionIcon
          peaks={icon.peaks}
          accent={icon.accent}
          className={styles.heroIcon}
          style={{ color: icon.color }}
        />
        <h2 className={styles.title}>{collection.name}</h2>
        <p className={styles.tagline}>{collection.tagline}</p>

        <div className={styles.facts}>
          <div className={styles.fact}>
            <div className={styles.factValue} style={{ color: `var(--${collection.colorToken})` }}>
              {climbedCount} of {total}
            </div>
            <div className={styles.factLabel}>Climbed</div>
          </div>
          <div className={styles.fact}>
            <div className={styles.factValue}>{percent}%</div>
            <div className={styles.factLabel}>Progress</div>
          </div>
        </div>

        <div className={styles.track}>
          <div
            className={styles.fill}
            style={{ width: `${percent}%`, background: `var(--${collection.colorToken})` }}
          />
        </div>
      </div>

      <div className={styles.body}>
        {wiki && (
          <div className={styles.description}>
            <p>{wiki.extract}</p>
            <a href={wiki.url} target="_blank" rel="noreferrer" className={styles.wikiLink}>
              Read more on Wikipedia
            </a>
          </div>
        )}

        <ul className={styles.list}>
          {sorted.map((mountain) => {
            const climbed = climbedIds.has(mountain.id)
            return (
              <li key={mountain.id} className={styles.row}>
                <FlagIcon flag={mountain.flag} className={styles.flag} />
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
    </div>
  )
}