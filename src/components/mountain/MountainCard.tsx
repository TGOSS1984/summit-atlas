import type { Mountain } from '../../types/mountain'
import type { Collection } from '../../types/collection'
import { formatElevation } from '../../utils/units'
import { useUnit } from '../../context/UnitContext'
import { FlagIcon } from '../common/FlagIcon'
import { ProceduralMountainSvg } from './ProceduralMountainSvg'
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

  return (
    <div className={styles.card}>
      <ProceduralMountainSvg mountain={mountain} countryMaxElevation={countryMaxElevation} climbed={climbed} />

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <FlagIcon flag={mountain.flag} className={styles.flag} />
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