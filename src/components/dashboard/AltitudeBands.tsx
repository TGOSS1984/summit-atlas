import { getAltitudeBands } from '../../utils/dashboardStats'
import type { ElevationUnit } from '../../utils/units'
import type { Mountain } from '../../types/mountain'
import styles from './AltitudeBands.module.css'

interface AltitudeBandsProps {
  mountains: Mountain[]
  climbedIds: Set<string>
  unit: ElevationUnit
}

export function AltitudeBands({ mountains, climbedIds, unit }: AltitudeBandsProps) {
  const bands = getAltitudeBands(mountains, climbedIds, unit)
  const max = Math.max(...bands.map((b) => b.count), 1)

  return (
    <div className={styles.card}>
      {bands.map((band) => (
        <div key={band.label} className={styles.row}>
          <span className={styles.label}>{band.label}</span>
          <div className={styles.track}>
            <div className={styles.fill} style={{ width: `${(band.count / max) * 100}%` }} />
          </div>
          <span className={styles.count}>{band.count}</span>
        </div>
      ))}
    </div>
  )
}