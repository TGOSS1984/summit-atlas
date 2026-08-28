import type { Mountain } from '../types/mountain'
import type { Collection } from '../types/collection'
import type { ClimbsState } from '../utils/climbs'
import { metersToFeet, type ElevationUnit } from './units'

export function getClimbedMountains(mountains: Mountain[], climbedIds: Set<string>): Mountain[] {
  return mountains.filter((m) => climbedIds.has(m.id))
}

export function getHighestClimbed(
  mountains: Mountain[],
  climbedIds: Set<string>,
): Mountain | null {
  const climbed = getClimbedMountains(mountains, climbedIds)
  if (climbed.length === 0) return null
  return climbed.reduce((highest, m) => (m.elevation > highest.elevation ? m : highest))
}

export function getTotalElevationClimbed(mountains: Mountain[], climbedIds: Set<string>): number {
  return getClimbedMountains(mountains, climbedIds).reduce((sum, m) => sum + m.elevation, 0)
}

export function getCountriesClimbedCount(mountains: Mountain[], climbedIds: Set<string>): number {
  const countries = new Set(getClimbedMountains(mountains, climbedIds).map((m) => m.country))
  return countries.size
}

export function getContinentsClimbedCount(
  mountains: Mountain[],
  climbedIds: Set<string>,
): number {
  const continents = new Set(getClimbedMountains(mountains, climbedIds).map((m) => m.continent))
  return continents.size
}

export interface CollectionProgress {
  climbed: number
  total: number
}

export function getCollectionProgress(
  collection: Collection,
  climbedIds: Set<string>,
): CollectionProgress {
  const climbed = collection.peakIds.filter((id) => climbedIds.has(id)).length
  return { climbed, total: collection.peakIds.length }
}

// --- dashboard v2 additions below (hero comparison, per-year chart, altitude bands, timeline) ---

// Everest's currently accepted elevation (2020 China/Nepal joint survey) -
// hardcoded rather than pulled from the mountains dataset, so the hero
// stat's comparison line can't silently change if Everest's own entry in
// mountains.ts is ever edited
const EVEREST_ELEVATION_M = 8849

export function getEverestMultiple(totalElevationM: number): number {
  return totalElevationM / EVEREST_ELEVATION_M
}

export interface Ascent {
  mountain: Mountain
  date: string
  note?: string
}

// flattens the { mountainId: ClimbRecord[] } store into one list, newest
// first - feeds both the per-year chart and the all-climbs timeline so
// there's one shared shape for "everything ever logged"
export function getAllAscents(mountains: Mountain[], climbs: ClimbsState): Ascent[] {
  const byId = new Map(mountains.map((m) => [m.id, m]))
  const ascents: Ascent[] = []
  for (const [mountainId, records] of Object.entries(climbs)) {
    const mountain = byId.get(mountainId)
    // a custom peak that's since been removed would leave a dangling id in
    // the climbs store - skip it rather than crash the dashboard over it
    if (!mountain) continue
    for (const record of records) {
      ascents.push({ mountain, date: record.date, note: record.note })
    }
  }
  return ascents.sort((a, b) => b.date.localeCompare(a.date))
}

export interface YearCount {
  year: string
  count: number
}

export function getClimbsPerYear(ascents: Ascent[]): YearCount[] {
  const counts = new Map<string, number>()
  for (const a of ascents) {
    const year = a.date.slice(0, 4)
    counts.set(year, (counts.get(year) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year.localeCompare(b.year))
}

export interface AscentYearGroup {
  year: string
  ascents: Ascent[]
}

export function getAscentsByYear(ascents: Ascent[]): AscentYearGroup[] {
  const byYear = new Map<string, Ascent[]>()
  // ascents is already newest-first (see getAllAscents), and Map preserves
  // insertion order, so the groups come out newest-year-first for free
  for (const a of ascents) {
    const year = a.date.slice(0, 4)
    if (!byYear.has(year)) byYear.set(year, [])
    byYear.get(year)!.push(a)
  }
  return [...byYear.entries()].map(([year, yearAscents]) => ({ year, ascents: yearAscents }))
}

interface BandDef {
  label: string
  min: number
}

export interface AltitudeBand extends BandDef {
  count: number
}

// band edges are round numbers in whichever unit is on display, rather than
// a metric set run through a converter - so the ft view breaks at a clean
// 25,000 ft instead of an odd converted figure. same approach peakbook uses
const ALTITUDE_BANDS_M: BandDef[] = [
  { label: '8,000 m+', min: 8000 },
  { label: '6,000–8,000 m', min: 6000 },
  { label: '4,000–6,000 m', min: 4000 },
  { label: '2,000–4,000 m', min: 2000 },
  { label: 'Under 2,000 m', min: 0 },
]

const ALTITUDE_BANDS_FT: BandDef[] = [
  { label: '25,000 ft+', min: 25000 },
  { label: '20,000–25,000 ft', min: 20000 },
  { label: '14,000–20,000 ft', min: 14000 },
  { label: '8,000–14,000 ft', min: 8000 },
  { label: 'Under 8,000 ft', min: 0 },
]

export function getAltitudeBands(
  mountains: Mountain[],
  climbedIds: Set<string>,
  unit: ElevationUnit,
): AltitudeBand[] {
  const bands = unit === 'ft' ? ALTITUDE_BANDS_FT : ALTITUDE_BANDS_M
  const climbed = getClimbedMountains(mountains, climbedIds)
  const elevationInUnit = (m: Mountain) => (unit === 'ft' ? metersToFeet(m.elevation) : m.elevation)

  return bands.map((band, i) => {
    const upperBound = i === 0 ? Infinity : bands[i - 1].min
    const count = climbed.filter((m) => {
      const e = elevationInUnit(m)
      return e >= band.min && e < upperBound
    }).length
    return { ...band, count }
  })
}