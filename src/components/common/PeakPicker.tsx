import { useEffect, useRef, type KeyboardEvent } from 'react'
import { useClimbs } from '../../context/ClimbsContext'
import { useUnit } from '../../context/UnitContext'
import { useAllMountains } from '../../hooks/useAllMountains'
import { usePeakSearch } from '../../hooks/usePeakSearch'
import { formatElevation } from '../../utils/units'
import type { Mountain } from '../../types/mountain'
import { Modal } from './Modal'
import styles from './PeakPicker.module.css'

interface PeakPickerProps {
  onClose: () => void
  onSelectPeak: (mountain: Mountain) => void
  onAddOwnPeak: () => void
}

export function PeakPicker({ onClose, onSelectPeak, onAddOwnPeak }: PeakPickerProps) {
  const mountains = useAllMountains()
  const { climbedIds } = useClimbs()
  const { unit } = useUnit()
  const { query, setQuery, results } = usePeakSearch(mountains, climbedIds)
  const inputRef = useRef<HTMLInputElement>(null)

  // autofocus on open, same as peakbook's own picker - this is meant to be
  // a fast keyboard-first path, not one more thing to click into
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && results[0]) onSelectPeak(results[0])
  }

  return (
    <Modal onClose={onClose}>
      <h2 className={styles.title}>Log a climb</h2>
      <p className={styles.subtitle}>Which mountain did you summit?</p>

      <input
        ref={inputRef}
        type="search"
        className={styles.input}
        placeholder="Search mountains…"
        autoComplete="off"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <div className={styles.results}>
        {results.length === 0 ? (
          <p className={styles.empty}>No mountains match.</p>
        ) : (
          results.map((mountain) => (
            <button
              type="button"
              key={mountain.id}
              className={styles.resultRow}
              onClick={() => onSelectPeak(mountain)}
            >
              <span className={styles.flag}>{mountain.flag}</span>
              <span className={styles.name}>
                {mountain.name}
                {climbedIds.has(mountain.id) && <span className={styles.climbedCheck}> ✓</span>}
              </span>
              <span className={styles.elev}>{formatElevation(mountain.elevation, unit)}</span>
            </button>
          ))
        )}
      </div>

      <button type="button" className={styles.addButton} onClick={onAddOwnPeak}>
        <span className={styles.addIcon}>+</span>
        <span>
          Not listed? <strong>Add your own peak</strong>
        </span>
      </button>
    </Modal>
  )
}