import { getAscentsByYear, type Ascent } from '../../utils/dashboardStats'
import { formatElevation, type ElevationUnit } from '../../utils/units'
import { FlagIcon } from '../common/FlagIcon'
import styles from './ClimbsTimeline.module.css'

interface ClimbsTimelineProps {
  ascents: Ascent[]
  unit: ElevationUnit
}

export function ClimbsTimeline({ ascents, unit }: ClimbsTimelineProps) {
  const byYear = getAscentsByYear(ascents)

  if (byYear.length === 0) {
    return <p className={styles.empty}>Nothing logged yet - climbs you add will show up here by year.</p>
  }

  return (
    <div className={styles.timeline}>
      {byYear.map(({ year, ascents: yearAscents }) => (
        <div key={year} className={styles.yearGroup}>
          <div className={styles.yearLabel}>{year}</div>
          <div className={styles.card}>
            {yearAscents.map((ascent, i) => (
              <div key={`${ascent.mountain.id}-${ascent.date}-${i}`} className={styles.row}>
                <FlagIcon flag={ascent.mountain.flag} className={styles.flag} />
                <div className={styles.body}>
                  <div className={styles.name}>{ascent.mountain.name}</div>
                  <div className={styles.meta}>
                    {ascent.mountain.range}
                    {ascent.note && <> — <em>{ascent.note}</em></>}
                  </div>
                </div>
                <div className={styles.right}>
                  <div className={styles.elev}>{formatElevation(ascent.mountain.elevation, unit)}</div>
                  <div className={styles.date}>{formatDate(ascent.date)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${d} ${MONTHS[m - 1]} ${y}`
}