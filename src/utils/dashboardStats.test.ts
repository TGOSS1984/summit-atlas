import { describe, expect, it } from 'vitest'
import type { Mountain } from '../types/mountain'
import type { Collection } from '../types/collection'
import {
  getContinentsClimbedCount,
  getCountriesClimbedCount,
  getHighestClimbed,
  getTotalElevationClimbed,
  getCollectionProgress,
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