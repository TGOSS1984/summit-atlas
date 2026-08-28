import { getClimbsPerYear, type Ascent } from '../../utils/dashboardStats'
import styles from './ClimbsPerYearChart.module.css'

interface ClimbsPerYearChartProps {
  ascents: Ascent[]
}

// capped to the most recent 7 years so the bars stay legible - matches
// peakbook's own cap on the same chart
const YEARS_SHOWN = 7

export function ClimbsPerYearChart({ ascents }: ClimbsPerYearChartProps) {
  const years = getClimbsPerYear(ascents).slice(-YEARS_SHOWN)

  if (years.length === 0) {
    return <p className={styles.empty}>Nothing logged yet.</p>
  }

  const max = Math.max(...years.map((y) => y.count))

  return (
    <div className={styles.card}>
      <div className={styles.bars}>
        {years.map(({ year, count }) => (
          <div key={year} className={styles.col}>
            <span className={styles.barValue}>{count}</span>
            <div className={styles.barTrack}>
              {/* min height keeps a count of 1 from rendering as an invisible sliver */}
              <div className={styles.bar} style={{ height: `${Math.max(6, (count / max) * 100)}%` }} />
            </div>
            <span className={styles.yearLabel}>{year}</span>
          </div>
        ))}
      </div>
    </div>
  )
}