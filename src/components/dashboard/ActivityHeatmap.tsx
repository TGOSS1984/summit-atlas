import { useMemo } from 'react'
import { getActivityByDay, type Ascent } from '../../utils/dashboardStats'
import styles from './ActivityHeatmap.module.css'

interface ActivityHeatmapProps {
  ascents: Ascent[]
}

interface DayCell {
  date: string
  count: number
}

const WEEKS_SHOWN = 52
const DAY_MS = 24 * 60 * 60 * 1000

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10)
}

// builds a full 52-week grid ending today, regardless of whether every day
// has data - empty days just render as the lowest intensity cell. starts
// on a Sunday so every column is a clean 7-day week rather than a partial one
function buildWeeks(counts: Map<string, number>): DayCell[][] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(today.getTime() - WEEKS_SHOWN * 7 * DAY_MS)
  start.setDate(start.getDate() - start.getDay())

  const weeks: DayCell[][] = []
  let cursor = new Date(start)
  while (cursor <= today) {
    const week: DayCell[] = []
    for (let d = 0; d < 7; d++) {
      const dateStr = toDateString(cursor)
      week.push({ date: dateStr, count: counts.get(dateStr) ?? 0 })
      cursor = new Date(cursor.getTime() + DAY_MS)
    }
    weeks.push(week)
  }
  return weeks
}

function intensityClass(count: number, max: number): string {
  if (count === 0) return styles.level0
  const ratio = count / max
  if (ratio > 0.75) return styles.level4
  if (ratio > 0.5) return styles.level3
  if (ratio > 0.25) return styles.level2
  return styles.level1
}

export function ActivityHeatmap({ ascents }: ActivityHeatmapProps) {
  const weeks = useMemo(() => buildWeeks(getActivityByDay(ascents)), [ascents])

  if (ascents.length === 0) {
    return <p className={styles.empty}>Nothing logged yet.</p>
  }

  const max = Math.max(1, ...weeks.flat().map((d) => d.count))

  return (
    <div className={styles.card}>
      {/* horizontal scroll on narrow screens rather than a mobile-specific
          redesign - 52 weeks doesn't compress meaningfully smaller and
          still needs to stay legible as a grid, same trade-off most
          contribution-graph implementations make */}
      <div className={styles.scrollArea}>
        <div className={styles.grid}>
          {weeks.map((week, i) => (
            <div key={i} className={styles.week}>
              {week.map((day) => (
                <div
                  key={day.date}
                  className={`${styles.cell} ${intensityClass(day.count, max)}`}
                  title={`${day.date}: ${day.count} climb${day.count === 1 ? '' : 's'}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.legend}>
        <span>Less</span>
        <span className={`${styles.cell} ${styles.level0}`} />
        <span className={`${styles.cell} ${styles.level1}`} />
        <span className={`${styles.cell} ${styles.level2}`} />
        <span className={`${styles.cell} ${styles.level3}`} />
        <span className={`${styles.cell} ${styles.level4}`} />
        <span>More</span>
      </div>
    </div>
  )
}