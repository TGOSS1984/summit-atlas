import type { Continent, Mountain } from '../types/mountain'

export type CustomPeaksState = Mountain[]

export interface CustomPeakInput {
  name: string
  elevation: number
  continent: Continent
  country: string
  flag: string
  range: string
  lat?: number
  lng?: number
}

// lat/lng stay required on Mountain rather than optional so every existing
// consumer that reads mountain.lat directly doesn't need an undefined check -
// NaN is the sentinel for "no coordinates given" (see types/mountain.ts)
export function createCustomPeak(input: CustomPeakInput): Mountain {
  return {
    id: generateCustomPeakId(input.name),
    name: input.name.trim(),
    elevation: input.elevation,
    country: input.country,
    flag: input.flag,
    continent: input.continent,
    range: input.range.trim(),
    lat: input.lat ?? NaN,
    lng: input.lng ?? NaN,
    isCustom: true,
  }
}

// prefixed so a custom peak's id can never collide with anything in
// mountains.ts, timestamped so two custom peaks sharing a name don't collide
// with each other either
function generateCustomPeakId(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return `custom-${slug || 'peak'}-${Date.now()}`
}

export function addCustomPeak(state: CustomPeaksState, peak: Mountain): CustomPeaksState {
  return [...state, peak]
}

export function removeCustomPeak(state: CustomPeaksState, id: string): CustomPeaksState {
  return state.filter((peak) => peak.id !== id)
}

// guards the localStorage read - same reasoning as isValidClimbsState in
// utils/climbs.ts, a corrupted value shouldn't take the app down
export function isValidCustomPeaksState(value: unknown): value is CustomPeaksState {
  if (!Array.isArray(value)) return false
  return value.every(
    (entry) =>
      typeof entry === 'object' &&
      entry !== null &&
      typeof (entry as Mountain).id === 'string' &&
      typeof (entry as Mountain).name === 'string' &&
      typeof (entry as Mountain).elevation === 'number' &&
      typeof (entry as Mountain).country === 'string' &&
      typeof (entry as Mountain).continent === 'string',
  )
}