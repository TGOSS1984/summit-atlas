import { createPortal } from 'react-dom'
import { useAuth } from '../../context/AuthContext'
import { useClimbs } from '../../context/ClimbsContext'
import { useResume } from '../../context/ResumeContext'
import { useUnit } from '../../context/UnitContext'
import { useAllMountains } from '../../hooks/useAllMountains'
import {
  getAllAscents,
  getAscentsByYear,
  getContinentsClimbedCount,
  getCountriesClimbedCount,
  getHighestClimbed,
} from '../../utils/dashboardStats'
import { foldRepeatAscents, resumeBullets } from '../../utils/resume'
import { formatElevation } from '../../utils/units'
import styles from './PrintResume.module.css'

// this is a paper output, not an app screen - it always renders in a fixed
// light/dark-independent style (like an actual printed page would), so it's
// a third documented exception to the tokens-only rule alongside the
// Google button and the favicon (see tokens.css notes)
export function PrintResume() {
  const { user } = useAuth()
  const { climbs, climbedIds } = useClimbs()
  const { resume } = useResume()
  const { unit } = useUnit()
  const mountains = useAllMountains()

  const ascents = getAllAscents(mountains, climbs)
  const byYear = getAscentsByYear(ascents)
  const highest = getHighestClimbed(mountains, climbedIds)
  const countries = getCountriesClimbedCount(mountains, climbedIds)
  const continents = getContinentsClimbedCount(mountains, climbedIds)
  const firstYear = ascents.length ? ascents[ascents.length - 1].date.slice(0, 4) : null

  const displayName = resume.name || user?.displayName || 'A climber'

  const metaLine = ascents.length
    ? [
        `${climbedIds.size} peak${climbedIds.size === 1 ? '' : 's'} · ${ascents.length} ascent${ascents.length === 1 ? '' : 's'}`,
        highest ? `high point ${formatElevation(highest.elevation, unit)} (${highest.name})` : null,
        `${countries} countr${countries === 1 ? 'y' : 'ies'} · ${continents}/7 continents`,
        firstYear ? `climbing since ${firstYear}` : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : 'No ascents logged yet'

  return createPortal(
    <div id="print-resume" className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.name}>{displayName}</h1>
        <div className={styles.role}>Climbing Résumé</div>
        <div className={styles.meta}>{metaLine}</div>
      </header>

      {resume.skills.length > 0 && (
        <section className={styles.section}>
          <h2>Skills</h2>
          <div className={styles.skills}>{resume.skills.join(' · ')}</div>
        </section>
      )}

      {resume.certs.length > 0 && (
        <section className={styles.section}>
          <h2>Certifications &amp; Training</h2>
          {resume.certs.map((cert, i) => (
            <div className={styles.cert} key={i}>
              <span className={styles.certName}>{cert.name}</span>
              {cert.org && <span className={styles.certOrg}>{cert.org}</span>}
              {cert.year && <span className={styles.certYear}>{cert.year}</span>}
            </div>
          ))}
        </section>
      )}

      <section className={styles.section}>
        <h2>Expeditions &amp; Ascents</h2>
        {ascents.length === 0 ? (
          <p className={styles.empty}>No ascents logged yet.</p>
        ) : (
          byYear.map(({ year, ascents: yearAscents }) => (
            <div key={year}>
              <h3>{year}</h3>
              {foldRepeatAscents(yearAscents).map((entry) => {
                const bullets = resumeBullets(resume.highlights, entry.mountain.id, entry.note)
                return (
                  <div className={styles.entry} key={entry.mountain.id}>
                    <div className={styles.entryHead}>
                      <span className={styles.peak}>
                        {entry.mountain.name}
                        {entry.dates.length > 1 && (
                          <span className={styles.times}> ×{entry.dates.length}</span>
                        )}
                      </span>
                      <span className={styles.peakMeta}>
                        {formatElevation(entry.mountain.elevation, unit)} · {entry.mountain.range} ·{' '}
                        {entry.mountain.country}
                      </span>
                      <span className={styles.date}>
                        {entry.dates.map((d) => (
                          <span className={styles.dateItem} key={d}>
                            {formatDate(d)}
                          </span>
                        ))}
                      </span>
                    </div>
                    {bullets.length > 0 && (
                      <ul className={styles.bullets}>
                        {bullets.map((bullet, i) => (
                          <li key={i}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          ))
        )}
      </section>

      <footer className={styles.foot}>
        <span>Generated {formatDate(todayISO())} from a Summit Atlas logbook</span>
        <span>Summit Atlas</span>
      </footer>
    </div>,
    document.body,
  )
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

// same small local formatter ClimbsTimeline/CumulativeElevationChart each
// already have their own copy of - kept consistent with that rather than
// introducing a shared util for one more caller
function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${d} ${MONTHS[m - 1]} ${y}`
}