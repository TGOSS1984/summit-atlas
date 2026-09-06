import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { firebaseConfigured, getFirebaseDb } from '../lib/firebase'
import { useUnit } from '../context/UnitContext'
import { MOUNTAINS } from '../data/mountains'
import { isValidClimbsState, getClimbedIds, type ClimbsState } from '../utils/climbs'
import { sanitizeResume } from '../store/resumeStore'
import {
  getAllAscents,
  getAscentsByYear,
  getContinentsClimbedCount,
  getCountriesClimbedCount,
  getHighestClimbed,
} from '../utils/dashboardStats'
import { foldRepeatAscents, resumeBullets } from '../utils/resume'
import { formatElevation } from '../utils/units'
import { SummitPinIcon } from '../components/common/SummitPinIcon'
import type { Mountain } from '../types/mountain'
import type { Resume } from '../types/resume'
import styles from './PublicProfilePage.module.css'

type LoadState = 'loading' | 'unavailable' | 'ready'

interface ProfileData {
  climbs: ClimbsState
  customPeaks: Mountain[]
  resume: Resume
}

// this route lives outside the authenticated Layout shell (see App.tsx) -
// no sidebar, no sign-in state, nothing from this visitor's own local
// climbs. Everything rendered here comes from one Firestore doc fetched by
// uid, standing entirely apart from whatever the visitor is signed in as
export function PublicProfilePage() {
  const { uid } = useParams<{ uid: string }>()
  const { unit } = useUnit()
  const [state, setState] = useState<LoadState>('loading')
  const [data, setData] = useState<ProfileData | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!uid || !firebaseConfigured) {
        setState('unavailable')
        return
      }
      try {
        const snap = await getDoc(doc(getFirebaseDb(), 'logbooks', uid))
        const raw = snap.data()

        // same message whether the doc doesn't exist or just isn't shared -
        // telling the two apart would leak whether a given uid has an
        // account at all, which isn't this page's business to reveal
        if (!raw || raw.shared !== true) {
          if (!cancelled) setState('unavailable')
          return
        }

        if (!cancelled) {
          setData({
            climbs: isValidClimbsState(raw.climbs) ? raw.climbs : {},
            customPeaks: Array.isArray(raw.custom) ? raw.custom : [],
            resume: sanitizeResume(raw.resume),
          })
          setState('ready')
        }
      } catch {
        if (!cancelled) setState('unavailable')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [uid])

  if (state === 'loading') {
    return (
      <div className={styles.page}>
        <Header />
        <p className={styles.status}>Loading…</p>
      </div>
    )
  }

  if (state === 'unavailable' || !data) {
    return (
      <div className={styles.page}>
        <Header />
        <p className={styles.status}>This profile isn't available.</p>
      </div>
    )
  }

  const mountains = [...MOUNTAINS, ...data.customPeaks]
  const climbedIds = getClimbedIds(data.climbs)
  const ascents = getAllAscents(mountains, data.climbs)
  const byYear = getAscentsByYear(ascents)
  const highest = getHighestClimbed(mountains, climbedIds)
  const countries = getCountriesClimbedCount(mountains, climbedIds)
  const continents = getContinentsClimbedCount(mountains, climbedIds)
  const displayName = data.resume.name || 'A climber'

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.hero}>
        <h1 className={styles.name}>{displayName}</h1>
        <p className={styles.meta}>
          {climbedIds.size} peak{climbedIds.size === 1 ? '' : 's'} · {ascents.length} ascent
          {ascents.length === 1 ? '' : 's'}
          {highest ? ` · high point ${formatElevation(highest.elevation, unit)} (${highest.name})` : ''}
          {` · ${countries} countr${countries === 1 ? 'y' : 'ies'} · ${continents}/7 continents`}
        </p>
      </div>

      {data.resume.skills.length > 0 && (
        <section className={styles.section}>
          <h2>Skills</h2>
          <p>{data.resume.skills.join(' · ')}</p>
        </section>
      )}

      {data.resume.certs.length > 0 && (
        <section className={styles.section}>
          <h2>Certifications &amp; training</h2>
          {data.resume.certs.map((cert, i) => (
            <div className={styles.cert} key={i}>
              <strong>{cert.name}</strong>
              {cert.org && <span> · {cert.org}</span>}
              {cert.year && <span> · {cert.year}</span>}
            </div>
          ))}
        </section>
      )}

      <section className={styles.section}>
        <h2>Ascents</h2>
        {ascents.length === 0 ? (
          <p className={styles.status}>No ascents logged yet.</p>
        ) : (
          byYear.map(({ year, ascents: yearAscents }) => (
            <div key={year} className={styles.yearGroup}>
              <h3>{year}</h3>
              {foldRepeatAscents(yearAscents).map((entry) => {
                const bullets = resumeBullets(data.resume.highlights, entry.mountain.id, entry.note)
                return (
                  <div className={styles.entry} key={entry.mountain.id}>
                    <div className={styles.entryHead}>
                      <span className={styles.peak}>
                        {entry.mountain.flag} {entry.mountain.name}
                        {entry.dates.length > 1 && <span className={styles.times}> ×{entry.dates.length}</span>}
                      </span>
                      <span className={styles.elev}>{formatElevation(entry.mountain.elevation, unit)}</span>
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

      <footer className={styles.footer}>
        Built with{' '}
        <a href="/" className={styles.footerLink}>
          Summit Atlas
        </a>
      </footer>
    </div>
  )
}

function Header() {
  return (
    <div className={styles.header}>
      <SummitPinIcon className={styles.headerIcon} />
      <span>Summit Atlas</span>
    </div>
  )
}