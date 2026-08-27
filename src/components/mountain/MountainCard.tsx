import type { Mountain } from '../../types/mountain'
import type { Collection } from '../../types/collection'
import { formatElevation } from '../../utils/units'
import { buildRidgeSvg } from '../../utils/ridgeSvg'
import { useUnit } from '../../context/UnitContext'
import styles from './MountainCard.module.css'

interface MountainCardProps {
  mountain: Mountain
  countryMaxElevation?: number
  collections?: Collection[]
  climbed?: boolean
}

export function MountainCard({
  mountain,
  countryMaxElevation,
  collections = [],
  climbed = false,
}: MountainCardProps) {
  const { unit } = useUnit()
  const ridge = buildRidgeSvg(mountain, { countryMaxElevation })
  const ridgeClassName = climbed ? styles.ridgeClimbed : styles.ridge

  return (
    <div className={styles.card}>
      <svg className={ridgeClassName} viewBox={ridge.viewBox} preserveAspectRatio="none">
        <path d={ridge.fillPath} className={styles.ridgeFill} />
        <path d={ridge.strokePath} fill="none" className={styles.ridgeStroke} />
        {ridge.worldLineY !== null && (
          <line
            x1={0}
            y1={ridge.worldLineY}
            x2={160}
            y2={ridge.worldLineY}
            className={styles.referenceLine}
          />
        )}
        {ridge.countryLineY !== null && (
          <line
            x1={0}
            y1={ridge.countryLineY}
            x2={160}
            y2={ridge.countryLineY}
            className={styles.referenceLineCountry}
          />
        )}
      </svg>

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <span className={styles.flag}>{mountain.flag}</span>
          <h3 className={styles.name}>{mountain.name}</h3>
        </div>
        <p className={styles.meta}>
          {mountain.range} · {mountain.country}
        </p>
        <div className={styles.footer}>
          <p className={styles.elevation}>{formatElevation(mountain.elevation, unit)}</p>
          {collections.length > 0 && (
            <div className={styles.dots}>
              {collections.map((collection) => (
                <span
                  key={collection.id}
                  className={styles.dot}
                  style={{ background: `var(--${collection.colorToken})` }}
                  title={collection.name}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}