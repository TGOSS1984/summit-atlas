import { describe, expect, it } from 'vitest'
import type { Mountain } from '../types/mountain'
import type { Collection } from '../types/collection'
import {
  filterMountains,
  getCountryMaxElevations,
  getCollectionsByMountainId,
  ALL_FILTERS,
} from './filterMountains'

const MOUNTAINS: Mountain[] = [
  { id: 'a', name: 'Alpha Peak', elevation: 1000, country: 'Testland', flag: '', continent: 'Europe', range: 'Alpha Range', lat: 0, lng: 0 },
  { id: 'b', name: 'Beta Peak', elevation: 3000, country: 'Testland', flag: '', continent: 'Europe', range: 'Beta Range', lat: 0, lng: 0 },
  { id: 'c', name: 'Gamma Peak', elevation: 2000, country: 'Otherland', flag: '', continent: 'Asia', range: 'Gamma Range', lat: 0, lng: 0 },
]

const COLLECTIONS: Collection[] = [
  { id: 'test-collection', name: 'Test Collection', tagline: '', colorToken: 'accent', peakIds: ['a', 'c'] },
  { id: 'second-collection', name: 'Second Collection', tagline: '', colorToken: 'ice', peakIds: ['a'] },
]

// only 'a' is climbed - reused across the whole suite below, not just the
// climbed-status describe block, since every filterMountains() call needs
// a climbedIds set now regardless of whether that particular test cares
const CLIMBED_IDS = new Set(['a'])

describe('filterMountains', () => {
  it('returns everything when filters are empty', () => {
    expect(filterMountains(MOUNTAINS, ALL_FILTERS, COLLECTIONS, CLIMBED_IDS)).toHaveLength(3)
  })

  it('filters by continent', () => {
    const result = filterMountains(
      MOUNTAINS,
      { ...ALL_FILTERS, continent: 'Asia' },
      COLLECTIONS,
      CLIMBED_IDS,
    )
    expect(result.map((m) => m.id)).toEqual(['c'])
  })

  it('filters by collection membership', () => {
    const result = filterMountains(
      MOUNTAINS,
      { ...ALL_FILTERS, collectionId: 'test-collection' },
      COLLECTIONS,
      CLIMBED_IDS,
    )
    expect(result.map((m) => m.id).sort()).toEqual(['a', 'c'])
  })

  it('searches across name, range and country, case-insensitively', () => {
    expect(
      filterMountains(MOUNTAINS, { ...ALL_FILTERS, search: 'beta' }, COLLECTIONS, CLIMBED_IDS),
    ).toHaveLength(1)
    expect(
      filterMountains(MOUNTAINS, { ...ALL_FILTERS, search: 'OTHERLAND' }, COLLECTIONS, CLIMBED_IDS),
    ).toHaveLength(1)
  })

  it('combines filters', () => {
    const result = filterMountains(
      MOUNTAINS,
      { ...ALL_FILTERS, continent: 'Europe', collectionId: 'test-collection' },
      COLLECTIONS,
      CLIMBED_IDS,
    )
    expect(result.map((m) => m.id)).toEqual(['a'])
  })
})

describe('filterMountains - climbed status', () => {
  it('shows only climbed peaks', () => {
    const result = filterMountains(
      MOUNTAINS,
      { ...ALL_FILTERS, climbedStatus: 'climbed' },
      COLLECTIONS,
      CLIMBED_IDS,
    )
    expect(result.map((m) => m.id)).toEqual(['a'])
  })

  it('shows only unclimbed peaks', () => {
    const result = filterMountains(
      MOUNTAINS,
      { ...ALL_FILTERS, climbedStatus: 'unclimbed' },
      COLLECTIONS,
      CLIMBED_IDS,
    )
    expect(result.map((m) => m.id).sort()).toEqual(['b', 'c'])
  })

  it('combines with other filters', () => {
    const result = filterMountains(
      MOUNTAINS,
      { ...ALL_FILTERS, continent: 'Europe', climbedStatus: 'unclimbed' },
      COLLECTIONS,
      CLIMBED_IDS,
    )
    expect(result.map((m) => m.id)).toEqual(['b'])
  })
})

describe('getCountryMaxElevations', () => {
  it('tracks the highest peak per country', () => {
    const result = getCountryMaxElevations(MOUNTAINS)
    expect(result.get('Testland')).toBe(3000)
    expect(result.get('Otherland')).toBe(2000)
  })
})

describe('getCollectionsByMountainId', () => {
  it('lists every collection a peak belongs to', () => {
    const result = getCollectionsByMountainId(COLLECTIONS)
    expect(result.get('a')?.map((c) => c.id).sort()).toEqual(['second-collection', 'test-collection'])
    expect(result.get('c')?.map((c) => c.id)).toEqual(['test-collection'])
  })

  it('omits peaks that belong to nothing', () => {
    const result = getCollectionsByMountainId(COLLECTIONS)
    expect(result.get('b')).toBeUndefined()
  })
})