import { useMemo, useState } from 'react'
import { MOUNTAINS } from '../data/mountains'
import { COLLECTIONS } from '../data/collections'
import {
  filterMountains,
  getCountryMaxElevations,
  getCollectionsByMountainId,
  type MountainFilters,
} from '../utils/filterMountains'
import { MountainCard } from '../components/mountain/MountainCard'
import { FilterChips } from '../components/explore/FilterChips'
import styles from './ExplorePage.module.css'

const PAGE_SIZE = 12

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

// built once, not per-card - see getCountryMaxElevations/getCollectionsByMountainId
const COUNTRY_MAX_ELEVATIONS = getCountryMaxElevations(MOUNTAINS)
const COLLECTIONS_BY_MOUNTAIN = getCollectionsByMountainId(COLLECTIONS)

export function ExplorePage() {
  const [filters, setFilters] = useState<MountainFilters>({
    search: '',
    continent: null,
    collectionId: null,
  })
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => filterMountains(MOUNTAINS, filters, COLLECTIONS), [filters])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function updateFilters(next: Partial<MountainFilters>) {
    setFilters((prev) => ({ ...prev, ...next }))
    setPage(1)
  }

  return (
    <div>
      <h1>Explore</h1>

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

      <p className={styles.count}>
        {filtered.length} peak{filtered.length === 1 ? '' : 's'}
      </p>

      <div className={styles.grid}>
        {visible.map((mountain) => (
          <MountainCard
            key={mountain.id}
            mountain={mountain}
            countryMaxElevation={COUNTRY_MAX_ELEVATIONS.get(mountain.country)}
            collections={COLLECTIONS_BY_MOUNTAIN.get(mountain.id)}
          />
        ))}
      </div>

      {visible.length === 0 && <p className={styles.empty}>Nothing matches those filters.</p>}

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
  )
}