import { getPersonalRecords } from '../../utils/personalRecords'
import type { Ascent } from '../../utils/dashboardStats'
import { StatCard } from './StatCard'
import styles from './PersonalRecords.module.css'

interface PersonalRecordsProps {
  ascents: Ascent[]
}

export function PersonalRecords({ ascents }: PersonalRecordsProps) {
  // fewer than 2 ascents means there's nothing streak/gap-worthy yet - a
  // single climb technically "is" a 1-year streak, but showing that reads
  // as noise on someone's very first entry rather than an earned record
  if (ascents.length < 2) return null

  const { longestStreak, biggestYear, longestGap } = getPersonalRecords(ascents)

  return (
    <div className={styles.grid}>
      {longestStreak && (
        <StatCard
          label="Longest streak"
          value={`${longestStreak.length} year${longestStreak.length === 1 ? '' : 's'}`}
          sublabel={
            longestStreak.startYear === longestStreak.endYear
              ? `${longestStreak.startYear}`
              : `${longestStreak.startYear}–${longestStreak.endYear}`
          }
        />
      )}
      {biggestYear && (
        <StatCard
          label="Biggest year"
          value={`${biggestYear.count} ascent${biggestYear.count === 1 ? '' : 's'}`}
          sublabel={`${biggestYear.year}`}
        />
      )}
      {longestGap && (
        <StatCard
          label="Longest gap"
          value={formatGapLength(longestGap.days)}
          sublabel={`${formatDate(longestGap.fromDate)} → ${formatDate(longestGap.toDate)}`}
        />
      )}
    </div>
  )
}

// rough on purpose - "2y 3m" is more relatable than "812 days" here, and
// nobody needs day-level precision for a gap this size
function formatGapLength(days: number): string {
  if (days >= 365) {
    const years = Math.floor(days / 365)
    const remainderMonths = Math.round((days % 365) / 30)
    if (remainderMonths >= 12) return `${years + 1} years`
    return remainderMonths > 0 ? `${years}y ${remainderMonths}m` : `${years} year${years === 1 ? '' : 's'}`
  }
  if (days >= 30) {
    const months = Math.round(days / 30)
    return `${months} month${months === 1 ? '' : 's'}`
  }
  return `${days} day${days === 1 ? '' : 's'}`
}

// same small local formatter ClimbsTimeline/CumulativeElevationChart/
// PrintResume each already have their own copy of
function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${d} ${MONTHS[m - 1]} ${y}`
}