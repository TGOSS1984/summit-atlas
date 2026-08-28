import { describe, expect, it } from 'vitest'
import type { Mountain } from '../types/mountain'
import type { Collection } from '../types/collection'
import type { ClimbsState } from './climbs'
import {
  getContinentsClimbedCount,
  getCountriesClimbedCount,
  getHighestClimbed,
  getTotalElevationClimbed,
  getCollectionProgress,
  getEverestMultiple,
  getAllAscents,
  getClimbsPerYear,
  getAscentsByYear,
  getAltitudeBands,
} from './dashboardStats'

const MOUNTAINS: Mountain[] = [
  { id: 'a', name: 'A', elevation: 1000, country: 'X', flag: '', continent: 'Europe', range: '', lat: 0, lng: 0 },
  { id: 'b', name: 'B', elevation: 3000, country: 'Y', flag: '', continent: 'Asia', range: '', lat: 0, lng: 0 },
  { id: 'c', name: 'C', elevation: 2000, country: 'X', flag: '', continent: 'Europe', range: '', lat: 0, lng: 0 },
]

describe('dashboard stats', () => {
  it('finds the highest climbed peak, not just the highest overall', () => {
    const climbed = new Set(['a', 'c'])
    expect(getHighestClimbed(MOUNTAINS, climbed)?.id).toBe('c')
  })

  it('returns null when nothing is climbed yet', () => {
    expect(getHighestClimbed(MOUNTAINS, new Set())).toBeNull()
  })

  it('sums elevation only across climbed peaks', () => {
    expect(getTotalElevationClimbed(MOUNTAINS, new Set(['a', 'b']))).toBe(4000)
  })

  it('counts distinct countries and continents, not raw peak count', () => {
    const climbed = new Set(['a', 'c']) // same country, same continent
    expect(getCountriesClimbedCount(MOUNTAINS, climbed)).toBe(1)
    expect(getContinentsClimbedCount(MOUNTAINS, climbed)).toBe(1)
  })
})

describe('getCollectionProgress', () => {
  const collection: Collection = {
    id: 'test',
    name: 'Test Collection',
    tagline: '',
    colorToken: 'accent',
    peakIds: ['a', 'b', 'c'],
  }

  it('counts how many of the collection peaks are climbed', () => {
    expect(getCollectionProgress(collection, new Set(['a', 'b', 'z']))).toEqual({
      climbed: 2,
      total: 3,
    })
  })

  it('handles nothing climbed', () => {
    expect(getCollectionProgress(collection, new Set())).toEqual({ climbed: 0, total: 3 })
  })
})

describe('getEverestMultiple', () => {
  it("divides total elevation by Everest's height", () => {
    expect(getEverestMultiple(8849)).toBeCloseTo(1)
    expect(getEverestMultiple(17698)).toBeCloseTo(2)
  })
})

describe('getAllAscents', () => {
  const climbs: ClimbsState = {
    a: [{ date: '2020-01-01' }, { date: '2022-06-15', note: 'second time up' }],
    b: [{ date: '2021-03-10' }],
    ghost: [{ date: '2019-01-01' }], // no matching mountain - simulates a removed custom peak
  }

  it("flattens every mountain's climb records into one list", () => {
    const ascents = getAllAscents(MOUNTAINS, climbs)
    // 3 real ascents - the dangling "ghost" id is dropped rather than crashing
    expect(ascents).toHaveLength(3)
  })

  it('sorts newest first', () => {
    const ascents = getAllAscents(MOUNTAINS, climbs)
    expect(ascents.map((a) => a.date)).toEqual(['2022-06-15', '2021-03-10', '2020-01-01'])
  })

  it('carries the note through', () => {
    const ascents = getAllAscents(MOUNTAINS, climbs)
    expect(ascents.find((a) => a.date === '2022-06-15')?.note).toBe('second time up')
  })
})

describe('getClimbsPerYear', () => {
  it('counts ascents per year and sorts oldest to newest', () => {
    const climbs: ClimbsState = {
      a: [{ date: '2022-01-01' }, { date: '2022-06-01' }],
      b: [{ date: '2020-01-01' }],
    }
    const ascents = getAllAscents(MOUNTAINS, climbs)
    expect(getClimbsPerYear(ascents)).toEqual([
      { year: '2020', count: 1 },
      { year: '2022', count: 2 },
    ])
  })
})

describe('getAscentsByYear', () => {
  it('groups ascents by year, newest year first', () => {
    const climbs: ClimbsState = {
      a: [{ date: '2020-01-01' }],
      b: [{ date: '2022-01-01' }],
    }
    const ascents = getAllAscents(MOUNTAINS, climbs)
    const groups = getAscentsByYear(ascents)
    expect(groups.map((g) => g.year)).toEqual(['2022', '2020'])
    expect(groups[0].ascents).toHaveLength(1)
  })
})

describe('getAltitudeBands', () => {
  const bandMountains: Mountain[] = [
    { id: 'low', name: 'Low', elevation: 1500, country: 'X', flag: '', continent: 'Europe', range: '', lat: 0, lng: 0 },
    { id: 'mid', name: 'Mid', elevation: 3500, country: 'X', flag: '', continent: 'Europe', range: '', lat: 0, lng: 0 },
    { id: 'high', name: 'High', elevation: 8200, country: 'X', flag: '', continent: 'Asia', range: '', lat: 0, lng: 0 },
  ]
  const climbed = new Set(['low', 'mid', 'high'])

  it('buckets by metre bands when unit is m', () => {
    const bands = getAltitudeBands(bandMountains, climbed, 'm')
    expect(bands.find((b) => b.label === 'Under 2,000 m')?.count).toBe(1)
    expect(bands.find((b) => b.label === '2,000–4,000 m')?.count).toBe(1)
    expect(bands.find((b) => b.label === '8,000 m+')?.count).toBe(1)
  })

  it('converts to feet and uses the ft band edges when unit is ft', () => {
    // 8200m ≈ 26,903 ft - lands in the 25,000ft+ band, not just "the same
    // band as m, relabelled" - this is the whole point of separate edges
    const bands = getAltitudeBands(bandMountains, climbed, 'ft')
    expect(bands.find((b) => b.label === '25,000 ft+')?.count).toBe(1)
  })
})