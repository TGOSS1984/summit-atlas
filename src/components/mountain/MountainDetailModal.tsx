import { useState, type FormEvent } from 'react'
import type { Mountain } from '../../types/mountain'
import type { Collection } from '../../types/collection'
import { useClimbs } from '../../context/ClimbsContext'
import { useUnit } from '../../context/UnitContext'
import { formatElevation } from '../../utils/units'
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
  const climbs = getClimbsFor(mountain.id)
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!date) return
    logClimb(mountain.id, { date, note: note.trim() || undefined })
    setDate('')
    setNote('')
  }

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
        <Stat label="Range" value={mountain.range} />
        <Stat label="Coordinates" value={`${mountain.lat.toFixed(4)}, ${mountain.lng.toFixed(4)}`} />
        <Stat label="First ascent" value={mountain.firstAscent ? String(mountain.firstAscent) : 'Unknown'} />
      </div>

      <div className={styles.description}>
        {/* TODO: replace with the real Wikipedia extract once commit 17's pipeline exists */}
        <p>No summary yet — this pulls from Wikipedia once the content pipeline (commit 17) is wired up.</p>
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