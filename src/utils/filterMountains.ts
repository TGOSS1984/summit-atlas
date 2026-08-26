import type { Mountain } from '../types/mountain'
import type { Collection } from '../types/collection'

export interface MountainFilters {
  search: string
  continent: string | null // null = all continents
  collectionId: string | null // null = all collections
}

export const ALL_FILTERS: MountainFilters = {
  search: '',
  continent: null,
  collectionId: null,
}

// country and climbed-status filters aren't here yet - country needs a
// proper picker once the real dataset lands (18 peaks doesn't warrant one),
// climbed status needs the persisted store from commit 12
export function filterMountains(
  mountains: Mountain[],
  filters: MountainFilters,
  collections: Collection[],
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
// own peakIds (commit 5), so cards need this the other way round to draw their dots
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