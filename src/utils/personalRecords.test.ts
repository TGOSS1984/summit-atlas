import { describe, expect, it } from 'vitest'
import type { Mountain } from '../types/mountain'
import type { Ascent } from './dashboardStats'
import { getPersonalRecords } from './personalRecords'

const PEAK: Mountain = {
  id: 'a',
  name: 'A',
  elevation: 1000,
  country: 'X',
  flag: '',
  continent: 'Europe',
  range: '',
  lat: 0,
  lng: 0,
}

function ascent(date: string): Ascent {
  return { mountain: PEAK, date }
}

describe('getPersonalRecords', () => {
  it('returns all nulls with no ascents', () => {
    expect(getPersonalRecords([])).toEqual({ longestStreak: null, biggestYear: null, longestGap: null })
  })

  it('finds the year with the most ascents', () => {
    const ascents = [ascent('2021-01-01'), ascent('2022-01-01'), ascent('2022-06-01'), ascent('2022-09-01')]
    expect(getPersonalRecords(ascents).biggestYear).toEqual({ year: 2022, count: 3 })
  })

  it('finds the longest run of consecutive climbing years', () => {
    const ascents = [ascent('2018-01-01'), ascent('2019-01-01'), ascent('2020-01-01'), ascent('2023-01-01')]
    expect(getPersonalRecords(ascents).longestStreak).toEqual({ startYear: 2018, endYear: 2020, length: 3 })
  })

  it('treats a single climbing year as a streak of length 1', () => {
    expect(getPersonalRecords([ascent('2024-03-01')]).longestStreak).toEqual({
      startYear: 2024,
      endYear: 2024,
      length: 1,
    })
  })

  it('finds the longest gap between two consecutive ascents', () => {
    const ascents = [ascent('2020-01-01'), ascent('2020-01-10'), ascent('2022-06-01')]
    const gap = getPersonalRecords(ascents).longestGap
    expect(gap?.fromDate).toBe('2020-01-10')
    expect(gap?.toDate).toBe('2022-06-01')
    expect(gap?.days).toBeGreaterThan(800)
  })

  it('returns no gap with only one ascent', () => {
    expect(getPersonalRecords([ascent('2024-01-01')]).longestGap).toBeNull()
  })
})