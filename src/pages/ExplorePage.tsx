import { useMemo, useState } from 'react'
import { MOUNTAINS } from '../data/mountains'
import { COLLECTIONS } from '../data/collections'
import { COLLECTIONS_BY_MOUNTAIN } from '../data/collectionsByMountain'
import { useClimbs } from '../context/ClimbsContext'
import { useCustomPeaks } from '../context/CustomPeaksContext'
import {
  filterMountains,
  getCountryMaxElevations,
  sortMountains,
  SORT_OPTIONS,
  type MountainFilters,
  type SortOption,
} from '../utils/filterMountains'
import { MountainCard } from '../components/mountain/MountainCard'
import { FilterChips } from '../components/explore/FilterChips'
import { MountainDetailModal } from '../components/mountain/MountainDetailModal'
import { AddPeakModal } from '../components/mountain/AddPeakModal'
import type { Mountain } from '../types/mountain'
import styles from './ExplorePage.module.css'

const PAGE_SIZE = 24

const CONTINENT_OPTIONS = [
  { id: null, label: 'All continents' },
  ...Array.from(new Set(MOUNTAINS.map((m) => m.continent)))
    .sort()
    .map((continent) => ({ id: continent, label: continent })),
]

const COLLECTION_OPTIONS = [
  { id: null, label: 'All collections' },
  ...COLLECTIONS.map((c) => ({ id: c.id, label: c.name })),
]

const CLIMBED_STATUS_OPTIONS = [
  { id: null, label: 'All' },
  { id: 'climbed', label: 'Climbed' },
  { id: 'unclimbed', label: 'Unclimbed' },
]

export function ExplorePage() {
  const { climbedIds } = useClimbs()
  const { customPeaks } = useCustomPeaks()
  const [filters, setFilters] = useState<MountainFilters>({
    search: '',
    continent: null,
    collectionId: null,
    climbedStatus: null,
  })
  const [sortBy, setSortBy] = useState<SortOption>('elevation-desc')
  const [page, setPage] = useState(1)
  const [selectedMountain, setSelectedMountain] = useState<Mountain | null>(null)
  const [showAddPeak, setShowAddPeak] = useState(false)

  // custom peaks fold straight into the same browsable set - filters,
  // pagination and the max-elevation lookup below all just see one array
  const allMountains = useMemo(() => [...MOUNTAINS, ...customPeaks], [customPeaks])

  const countryMaxElevations = useMemo(() => getCountryMaxElevations(allMountains), [allMountains])

  const filtered = useMemo(
    () => filterMountains(allMountains, filters, COLLECTIONS, climbedIds),
    [allMountains, filters, climbedIds],
  )

  const sorted = useMemo(() => sortMountains(filtered, sortBy), [filtered, sortBy])

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const visible = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function updateFilters(next: Partial<MountainFilters>) {
    setFilters((prev) => ({ ...prev, ...next }))
    setPage(1)
  }

  function updateSort(next: SortOption) {
    setSortBy(next)
    setPage(1)
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Explore</h1>
        <button type="button" className={styles.addPeakButton} onClick={() => setShowAddPeak(true)}>
          + Add a peak
        </button>
      </div>

      <input
        type="search"
        placeholder="Search by name, range or country..."
        value={filters.search}
        onChange={(e) => updateFilters({ search: e.target.value })}
        className={styles.search}
      />

      <div className={styles.filterGroup}>
        <FilterChips
          options={CONTINENT_OPTIONS}
          activeId={filters.continent}
          onSelect={(continent) => updateFilters({ continent })}
        />
        <FilterChips
          options={COLLECTION_OPTIONS}
          activeId={filters.collectionId}
          onSelect={(collectionId) => updateFilters({ collectionId })}
        />
      </div>

      <div className={styles.countRow}>
        <div className={styles.countAndSort}>
          <p className={styles.count}>
            {filtered.length} peak{filtered.length === 1 ? '' : 's'}
          </p>

          <select
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => updateSort(e.target.value as SortOption)}
            aria-label="Sort peaks"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* explains the two dashed lines on each card's ridge graphic - easy
            to miss otherwise, and easy to mix up which line means what */}
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={styles.legendLineWorld} /> World's highest
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendLineCountry} /> Country's highest
          </span>
        </div>
      </div>

      <div className={styles.grid}>
        {visible.map((mountain) => (
          <div
            key={mountain.id}
            style={{ cursor: 'pointer' }}
            onClick={() => setSelectedMountain(mountain)}
          >
            <MountainCard
              mountain={mountain}
              countryMaxElevation={countryMaxElevations.get(mountain.country)}
              collections={COLLECTIONS_BY_MOUNTAIN.get(mountain.id)}
              climbed={climbedIds.has(mountain.id)}
            />
          </div>
        ))}
      </div>

      {visible.length === 0 && <p className={styles.empty}>Nothing matches those filters.</p>}

      {/* climbed/unclimbed sits down here with pagination rather than up
          with the continent/collection chips - Tom's call, keeps it right
          next to the thing it actually changes (how many pages there are).
          stays outside the pageCount > 1 check so it's still there to fix
          an over-filtered "nothing matches" state above */}
      <div className={styles.bottomBar}>
        <FilterChips
          options={CLIMBED_STATUS_OPTIONS}
          activeId={filters.climbedStatus}
          onSelect={(climbedStatus) => updateFilters({ climbedStatus })}
        />

        {pageCount > 1 && (
          <div className={styles.pagination}>
            <button type="button" disabled={currentPage === 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </button>
            <span>
              Page {currentPage} of {pageCount}
            </span>
            <button
              type="button"
              disabled={currentPage === pageCount}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {selectedMountain && (
        <MountainDetailModal
          mountain={selectedMountain}
          collections={COLLECTIONS_BY_MOUNTAIN.get(selectedMountain.id) ?? []}
          onClose={() => setSelectedMountain(null)}
        />
      )}

      {showAddPeak && <AddPeakModal onClose={() => setShowAddPeak(false)} />}
    </div>
  )
}