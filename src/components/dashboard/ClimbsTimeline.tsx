import { useState } from 'react'
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

  // most recent year open, everything older collapsed to a summary row -
  // scales properly for someone with many years logged rather than an
  // arbitrary "show 8, then show everything" cutoff that could split a
  // single year awkwardly in half. lazy init only runs once, so reloading
  // demo data with a different newest year won't auto-re-expand it - minor
  // rough edge, not worth an effect just to handle "click regenerate demo
  // data twice in a row"
  const [expandedYears, setExpandedYears] = useState<Set<string>>(
    () => new Set(byYear[0] ? [byYear[0].year] : []),
  )

  if (byYear.length === 0) {
    return <p className={styles.empty}>Nothing logged yet - climbs you add will show up here by year.</p>
  }

  function toggleYear(year: string) {
    setExpandedYears((prev) => {
      const next = new Set(prev)
      if (next.has(year)) next.delete(year)
      else next.add(year)
      return next
    })
  }

  return (
    <div className={styles.timeline}>
      {byYear.map(({ year, ascents: yearAscents }) => {
        const expanded = expandedYears.has(year)
        return (
          <div key={year} className={styles.yearGroup}>
            <button
              type="button"
              className={styles.yearHeader}
              onClick={() => toggleYear(year)}
              aria-expanded={expanded}
            >
              <span className={styles.yearLabel}>{year}</span>
              <span className={styles.yearCount}>
                {yearAscents.length} climb{yearAscents.length === 1 ? '' : 's'}
              </span>
              <ChevronIcon className={expanded ? styles.chevronOpen : styles.chevron} />
            </button>

            {expanded && (
              <div className={styles.card}>
                {yearAscents.map((ascent, i) => (
                  <div key={`${ascent.mountain.id}-${ascent.date}-${i}`} className={styles.row}>
                    <FlagIcon flag={ascent.mountain.flag} className={styles.flag} />
                    <div className={styles.body}>
                      <div className={styles.name}>{ascent.mountain.name}</div>
                      <div className={styles.meta}>
                        {ascent.mountain.range}
                        {ascent.note && (
                          <>
                            {' '}
                            — <em>{ascent.note}</em>
                          </>
                        )}
                      </div>
                    </div>
                    <div className={styles.right}>
                      <div className={styles.elev}>{formatElevation(ascent.mountain.elevation, unit)}</div>
                      <div className={styles.date}>{formatDate(ascent.date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${d} ${MONTHS[m - 1]} ${y}`
}