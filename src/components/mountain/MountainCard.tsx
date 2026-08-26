import type { Mountain } from '../../types/mountain'
import { formatElevation } from '../../utils/units'
import { buildRidgeSvg } from '../../utils/ridgeSvg'
import styles from './MountainCard.module.css'

interface MountainCardProps {
  mountain: Mountain
  // caller's job to work this out from the full dataset - keeping the card
  // itself dumb rather than having it import data/mountains.ts directly
  countryMaxElevation?: number
}

export function MountainCard({ mountain, countryMaxElevation }: MountainCardProps) {
  const ridge = buildRidgeSvg(mountain, { countryMaxElevation })

  return (
    <div className={styles.card}>
      <svg className={styles.ridge} viewBox={ridge.viewBox} preserveAspectRatio="none">
        <path d={ridge.path} fill="var(--card-hover)" />
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
        {/* hardcoded to metres for now - swaps to read the unit toggle once that lands in future */}
        <p className={styles.elevation}>{formatElevation(mountain.elevation, 'm')}</p>
      </div>
    </div>
  )
}