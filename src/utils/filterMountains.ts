import type { Mountain } from '../types/mountain'
import type { Collection } from '../types/collection'

export interface MountainFilters {
  search: string
  continent: string | null // null = all continents
  collectionId: string | null // null = all collections
  // 'climbed' | 'unclimbed' | null (= all) - kept as a plain string rather
  // than a literal union so it plugs straight into FilterChips' generic
  // string|null option type without a cast, same as continent/collectionId
  climbedStatus: string | null
}

export const ALL_FILTERS: MountainFilters = {
  search: '',
  continent: null,
  collectionId: null,
  climbedStatus: null,
}

// country filter still isn't here - needs a proper picker once there's a
// reason to build one, 163 peaks across 67 countries doesn't really
// warrant it yet
export function filterMountains(
  mountains: Mountain[],
  filters: MountainFilters,
  collections: Collection[],
  climbedIds: Set<string>,
): Mountain[] {
  let result = mountains

  if (filters.continent) {
    result = result.filter((m) => m.continent === filters.continent)
  }

  if (filters.collectionId) {
    const collection = collections.find((c) => c.id === filters.collectionId)
    const peakIds = new Set(collection?.peakIds ?? [])
    result = result.filter((m) => peakIds.has(m.id))
  }

  if (filters.climbedStatus === 'climbed') {
    result = result.filter((m) => climbedIds.has(m.id))
  } else if (filters.climbedStatus === 'unclimbed') {
    result = result.filter((m) => !climbedIds.has(m.id))
  }

  const query = filters.search.trim().toLowerCase()
  if (query) {
    result = result.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.range.toLowerCase().includes(query) ||
        m.country.toLowerCase().includes(query),
    )
  }

  return result
}

// one max-elevation-per-country lookup built once per dataset rather than
// scanning the whole array per card - matters more once this is 1000+ peaks
export function getCountryMaxElevations(mountains: Mountain[]): Map<string, number> {
  const maxByCountry = new Map<string, number>()
  for (const mountain of mountains) {
    const current = maxByCountry.get(mountain.country) ?? 0
    if (mountain.elevation > current) {
      maxByCountry.set(mountain.country, mountain.elevation)
    }
  }
  return maxByCountry
}

// reverse lookup, same reasoning as getCountryMaxElevations above - collections
// own peakIds, so cards need this the other way round to draw their dots
export function getCollectionsByMountainId(collections: Collection[]): Map<string, Collection[]> {
  const map = new Map<string, Collection[]>()
  for (const collection of collections) {
    for (const peakId of collection.peakIds) {
      const existing = map.get(peakId) ?? []
      existing.push(collection)
      map.set(peakId, existing)
    }
  }
  return map
}

export type SortOption = 'name-asc' | 'elevation-desc' | 'elevation-asc'

export const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'name-asc', label: 'A–Z' },
  { id: 'elevation-desc', label: 'Elevation: High to low' },
  { id: 'elevation-asc', label: 'Elevation: Low to high' },
]

// separate from filterMountains() on purpose - filtering narrows the set,
// sorting just reorders it, and keeping them as two small pure functions
// is easier to test and reason about than one function doing both
export function sortMountains(mountains: Mountain[], sortBy: SortOption): Mountain[] {
  const sorted = [...mountains]
  switch (sortBy) {
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case 'elevation-desc':
      return sorted.sort((a, b) => b.elevation - a.elevation)
    case 'elevation-asc':
      return sorted.sort((a, b) => a.elevation - b.elevation)
  }
}