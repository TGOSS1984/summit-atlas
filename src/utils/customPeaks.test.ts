import { describe, expect, it } from 'vitest'
import type { Mountain } from '../types/mountain'
import {
  addCustomPeak,
  createCustomPeak,
  isValidCustomPeaksState,
  removeCustomPeak,
} from './customPeaks'

describe('createCustomPeak', () => {
  it('fills in NaN coordinates when none are given', () => {
    const peak = createCustomPeak({
      name: 'Sgurr Dubh Mor',
      elevation: 944,
      continent: 'Europe',
      country: 'United Kingdom',
      flag: '🇬🇧',
      range: 'Black Cuillin',
    })
    expect(Number.isNaN(peak.lat)).toBe(true)
    expect(Number.isNaN(peak.lng)).toBe(true)
  })

  it('keeps given coordinates', () => {
    const peak = createCustomPeak({
      name: 'Sgurr Dubh Mor',
      elevation: 944,
      continent: 'Europe',
      country: 'United Kingdom',
      flag: '🇬🇧',
      range: '',
      lat: 57.19,
      lng: -6.24,
    })
    expect(peak.lat).toBe(57.19)
    expect(peak.lng).toBe(-6.24)
  })

  it('marks itself as custom and prefixes its id', () => {
    const peak = createCustomPeak({
      name: 'Test Peak',
      elevation: 100,
      continent: 'Europe',
      country: 'United Kingdom',
      flag: '🇬🇧',
      range: '',
    })
    expect(peak.isCustom).toBe(true)
    expect(peak.id.startsWith('custom-test-peak-')).toBe(true)
  })
})

describe('addCustomPeak / removeCustomPeak', () => {
  it('adds a peak without mutating the original state', () => {
    const original: Mountain[] = []
    const peak = createCustomPeak({
      name: 'Test Peak',
      elevation: 100,
      continent: 'Europe',
      country: 'United Kingdom',
      flag: '🇬🇧',
      range: '',
    })
    const result = addCustomPeak(original, peak)
    expect(original).toEqual([])
    expect(result).toEqual([peak])
  })

  it('removes a peak by id', () => {
    const peak = createCustomPeak({
      name: 'Test Peak',
      elevation: 100,
      continent: 'Europe',
      country: 'United Kingdom',
      flag: '🇬🇧',
      range: '',
    })
    const result = removeCustomPeak([peak], peak.id)
    expect(result).toEqual([])
  })
})

describe('isValidCustomPeaksState', () => {
  it('accepts a well-formed array', () => {
    const peak = createCustomPeak({
      name: 'Test Peak',
      elevation: 100,
      continent: 'Europe',
      country: 'United Kingdom',
      flag: '🇬🇧',
      range: '',
    })
    expect(isValidCustomPeaksState([peak])).toBe(true)
  })

  it('rejects non-arrays and malformed entries', () => {
    expect(isValidCustomPeaksState({})).toBe(false)
    expect(isValidCustomPeaksState(null)).toBe(false)
    expect(isValidCustomPeaksState([{ name: 'missing everything else' }])).toBe(false)
  })
})