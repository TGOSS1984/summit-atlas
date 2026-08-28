import { useState, type FormEvent } from 'react'
import type { Mountain } from '../../types/mountain'
import type { Collection } from '../../types/collection'
import { useClimbs } from '../../context/ClimbsContext'
import { useUnit } from '../../context/UnitContext'
import { useCustomPeaks } from '../../context/CustomPeaksContext'
import { formatElevation } from '../../utils/units'
import { getWikiExtract } from '../../utils/wiki'
import { Modal } from '../common/Modal'
import styles from './MountainDetailModal.module.css'

interface MountainDetailModalProps {
  mountain: Mountain
  collections: Collection[]
  onClose: () => void
}

export function MountainDetailModal({ mountain, collections, onClose }: MountainDetailModalProps) {
  const { getClimbsFor, logClimb, removeClimb } = useClimbs()
  const { unit } = useUnit()
  const { removePeak } = useCustomPeaks()
  const climbs = getClimbsFor(mountain.id)
  const wiki = getWikiExtract(mountain.id)
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!date) return
    logClimb(mountain.id, { date, note: note.trim() || undefined })
    setDate('')
    setNote('')
  }

  function handleRemove() {
    removePeak(mountain.id)
    onClose()
  }

  const hasCoordinates = !Number.isNaN(mountain.lat) && !Number.isNaN(mountain.lng)

  return (
    <Modal onClose={onClose}>
      <div className={styles.header}>
        <span className={styles.flag}>{mountain.flag}</span>
        <h2 className={styles.name}>{mountain.name}</h2>
      </div>
      <p className={styles.meta}>
        {mountain.range} · {mountain.country}
      </p>

      {collections.length > 0 && (
        <div className={styles.collectionPills}>
          {collections.map((collection) => (
            <span
              key={collection.id}
              className={styles.pill}
              style={{
                borderColor: `var(--${collection.colorToken})`,
                color: `var(--${collection.colorToken})`,
              }}
            >
              {collection.name}
            </span>
          ))}
        </div>
      )}

      <div className={styles.statGrid}>
        <Stat label="Elevation" value={formatElevation(mountain.elevation, unit)} />
        <Stat
          label="Prominence"
          value={mountain.prominence ? formatElevation(mountain.prominence, unit) : '—'}
        />
        <Stat label="Continent" value={mountain.continent} />
        <Stat label="Range" value={mountain.range || '—'} />
        <Stat
          label="Coordinates"
          value={hasCoordinates ? `${mountain.lat.toFixed(4)}, ${mountain.lng.toFixed(4)}` : 'Not set'}
        />
        <Stat label="First ascent" value={mountain.firstAscent ? String(mountain.firstAscent) : 'Unknown'} />
      </div>

      <div className={styles.description}>
        {wiki ? (
          <>
            <p>{wiki.extract}</p>
            <a href={wiki.url} target="_blank" rel="noreferrer" className={styles.wikiLink}>
              Read more on Wikipedia
            </a>
          </>
        ) : mountain.isCustom ? (
          <p className={styles.noDescription}>
            {"No Wikipedia summary for peaks you've added yourself."}
          </p>
        ) : (
          // cache miss - either the fetch script hasn't run yet, or this
          // peak needs a wikipediaTitle override to resolve correctly
          <p className={styles.noDescription}>No summary cached yet.</p>
        )}
      </div>

      <div className={styles.logSection}>
        <h3 className={styles.sectionTitle}>Log a climb</h3>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className={styles.dateInput}
          />
          <input
            type="text"
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={styles.noteInput}
          />
          <button type="submit" className={styles.submitButton}>
            Log climb
          </button>
        </form>

        {climbs.length > 0 ? (
          <ul className={styles.climbList}>
            {climbs.map((climb, index) => (
              <li key={`${climb.date}-${index}`} className={styles.climbRow}>
                <span className={styles.climbDate}>{climb.date}</span>
                {climb.note && <span className={styles.climbNote}>{climb.note}</span>}
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => removeClimb(mountain.id, index)}
                  aria-label="Remove this climb"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyClimbs}>No ascents logged yet.</p>
        )}
      </div>

      {mountain.isCustom && (
        <div className={styles.customActions}>
          <button type="button" className={styles.removeCustomButton} onClick={handleRemove}>
            Remove this custom peak
          </button>
        </div>
      )}
    </Modal>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.stat}>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{value}</p>
    </div>
  )
}