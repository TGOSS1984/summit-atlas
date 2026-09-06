import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClimbs } from '../../context/ClimbsContext'
import { useUnit } from '../../context/UnitContext'
import { useAllMountains } from '../../hooks/useAllMountains'
import { usePeakSearch } from '../../hooks/usePeakSearch'
import { formatElevation } from '../../utils/units'
import { NAV_ITEMS } from '../layout/navItems'
import type { Mountain } from '../../types/mountain'
import { Modal } from './Modal'
import styles from './CommandPalette.module.css'

interface CommandPaletteProps {
  onClose: () => void
  onSelectPeak: (mountain: Mountain) => void
}

type PaletteItem = { kind: 'nav'; nav: (typeof NAV_ITEMS)[number] } | { kind: 'peak'; mountain: Mountain }

const MAX_PEAK_RESULTS = 8

export function CommandPalette({ onClose, onSelectPeak }: CommandPaletteProps) {
  const navigate = useNavigate()
  const mountains = useAllMountains()
  const { climbedIds } = useClimbs()
  const { unit } = useUnit()
  const { query, setQuery, results } = usePeakSearch(mountains, climbedIds)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const navMatches = NAV_ITEMS.filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase()))
  const peakMatches = results.slice(0, MAX_PEAK_RESULTS)

  const items: PaletteItem[] = [
    ...navMatches.map((nav) => ({ kind: 'nav' as const, nav })),
    ...peakMatches.map((mountain) => ({ kind: 'peak' as const, mountain })),
  ]

  // clamp on every result-set change rather than resetting to 0 - keeps the
  // highlight roughly where it was instead of always snapping back to the
  // top match while someone's still typing
  useEffect(() => {
    setActiveIndex((i) => Math.min(i, Math.max(items.length - 1, 0)))
  }, [items.length])

  function selectItem(item: PaletteItem) {
    if (item.kind === 'nav') navigate(item.nav.to)
    else onSelectPeak(item.mountain)
    onClose()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (items.length ? (i + 1) % items.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (items.length ? (i - 1 + items.length) % items.length : 0))
    } else if (e.key === 'Enter' && items[activeIndex]) {
      selectItem(items[activeIndex])
    }
  }

  return (
    <Modal onClose={onClose}>
      <input
        ref={inputRef}
        type="search"
        className={styles.input}
        placeholder="Jump to a page or search mountains…"
        autoComplete="off"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setActiveIndex(0)
        }}
        onKeyDown={handleKeyDown}
      />

      <div className={styles.results}>
        {items.length === 0 && <p className={styles.empty}>Nothing matches.</p>}

        {navMatches.length > 0 && (
          <div className={styles.group}>
            <span className={styles.groupLabel}>Go to</span>
            {navMatches.map((navItem, i) => {
              const Icon = navItem.icon
              return (
                <button
                  type="button"
                  key={navItem.to}
                  className={i === activeIndex ? `${styles.row} ${styles.rowActive}` : styles.row}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => selectItem({ kind: 'nav', nav: navItem })}
                >
                  <Icon />
                  <span>{navItem.label}</span>
                </button>
              )
            })}
          </div>
        )}

        {peakMatches.length > 0 && (
          <div className={styles.group}>
            <span className={styles.groupLabel}>Mountains</span>
            {peakMatches.map((mountain, i) => {
              const index = navMatches.length + i
              return (
                <button
                  type="button"
                  key={mountain.id}
                  className={index === activeIndex ? `${styles.row} ${styles.rowActive}` : styles.row}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectItem({ kind: 'peak', mountain })}
                >
                  <span>{mountain.flag}</span>
                  <span className={styles.rowName}>
                    {mountain.name}
                    {climbedIds.has(mountain.id) && <span className={styles.climbedCheck}> ✓</span>}
                  </span>
                  <span className={styles.rowElev}>{formatElevation(mountain.elevation, unit)}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className={styles.hints}>
        <span>
          <kbd>↑</kbd>
          <kbd>↓</kbd> navigate
        </span>
        <span>
          <kbd>Enter</kbd> select
        </span>
        <span>
          <kbd>Esc</kbd> close
        </span>
      </div>
    </Modal>
  )
}