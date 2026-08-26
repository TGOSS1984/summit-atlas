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