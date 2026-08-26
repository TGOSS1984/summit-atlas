import { describe, expect, it } from 'vitest'
import type { Mountain } from '../types/mountain'
import type { Collection } from '../types/collection'
import { filterMountains, getCountryMaxElevations, ALL_FILTERS } from './filterMountains'

const MOUNTAINS: Mountain[] = [
  { id: 'a', name: 'Alpha Peak', elevation: 1000, country: 'Testland', flag: '', continent: 'Europe', range: 'Alpha Range', lat: 0, lng: 0 },
  { id: 'b', name: 'Beta Peak', elevation: 3000, country: 'Testland', flag: '', continent: 'Europe', range: 'Beta Range', lat: 0, lng: 0 },
  { id: 'c', name: 'Gamma Peak', elevation: 2000, country: 'Otherland', flag: '', continent: 'Asia', range: 'Gamma Range', lat: 0, lng: 0 },
]

const COLLECTIONS: Collection[] = [
  { id: 'test-collection', name: 'Test Collection', tagline: '', colorToken: 'accent', peakIds: ['a', 'c'] },
]

describe('filterMountains', () => {
  it('returns everything when filters are empty', () => {
    expect(filterMountains(MOUNTAINS, ALL_FILTERS, COLLECTIONS)).toHaveLength(3)
  })

  it('filters by continent', () => {
    const result = filterMountains(MOUNTAINS, { ...ALL_FILTERS, continent: 'Asia' }, COLLECTIONS)
    expect(result.map((m) => m.id)).toEqual(['c'])
  })

  it('filters by collection membership', () => {
    const result = filterMountains(
      MOUNTAINS,
      { ...ALL_FILTERS, collectionId: 'test-collection' },
      COLLECTIONS,
    )
    expect(result.map((m) => m.id).sort()).toEqual(['a', 'c'])
  })

  it('searches across name, range and country, case-insensitively', () => {
    expect(filterMountains(MOUNTAINS, { ...ALL_FILTERS, search: 'beta' }, COLLECTIONS)).toHaveLength(1)
    expect(filterMountains(MOUNTAINS, { ...ALL_FILTERS, search: 'OTHERLAND' }, COLLECTIONS)).toHaveLength(1)
  })

  it('combines filters', () => {
    const result = filterMountains(
      MOUNTAINS,
      { ...ALL_FILTERS, continent: 'Europe', collectionId: 'test-collection' },
      COLLECTIONS,
    )
    expect(result.map((m) => m.id)).toEqual(['a'])
  })
})

describe('getCountryMaxElevations', () => {
  it('tracks the highest peak per country', () => {
    const result = getCountryMaxElevations(MOUNTAINS)
    expect(result.get('Testland')).toBe(3000)
    expect(result.get('Otherland')).toBe(2000)
  })
})