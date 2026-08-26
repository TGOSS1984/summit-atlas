import type { Mountain } from '../types/mountain'
import type { Collection } from '../types/collection'



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