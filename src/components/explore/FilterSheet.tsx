import { FilterChips } from './FilterChips'
import styles from './FilterSheet.module.css'

interface ChipOption {
  id: string | null
  label: string
}

interface FilterSheetProps {
  continentOptions: ChipOption[]
  collectionOptions: ChipOption[]
  climbedStatusOptions: ChipOption[]
  continent: string | null
  collectionId: string | null
  climbedStatus: string | null
  resultCount: number
  onSelectContinent: (id: string | null) => void
  onSelectCollection: (id: string | null) => void
  onSelectClimbedStatus: (id: string | null) => void
  onClose: () => void
}

// filters apply live as each chip is tapped, same as desktop - "Show N
// peaks" at the bottom is just a friendly way to close the sheet with the
// live count visible, not a separate pending/apply step. Keeping filters
// instant everywhere else in the app made a staged apply-on-confirm flow
// feel like the odd one out here
export function FilterSheet({
  continentOptions,
  collectionOptions,
  climbedStatusOptions,
  continent,
  collectionId,
  climbedStatus,
  resultCount,
  onSelectContinent,
  onSelectCollection,
  onSelectClimbedStatus,
  onClose,
}: FilterSheetProps) {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.handle} />
        <div className={styles.header}>
          <h2>Filters</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close filters">
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <section className={styles.group}>
            <h3>Continent</h3>
            <FilterChips options={continentOptions} activeId={continent} onSelect={onSelectContinent} />
          </section>
          <section className={styles.group}>
            <h3>Collection</h3>
            <FilterChips options={collectionOptions} activeId={collectionId} onSelect={onSelectCollection} />
          </section>
          <section className={styles.group}>
            <h3>Climbed status</h3>
            <FilterChips options={climbedStatusOptions} activeId={climbedStatus} onSelect={onSelectClimbedStatus} />
          </section>
        </div>

        <button type="button" className={styles.applyButton} onClick={onClose}>
          Show {resultCount} peak{resultCount === 1 ? '' : 's'}
        </button>
      </div>
    </div>
  )
}