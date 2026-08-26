import type { Collection } from '../types/collection'
import type { Mountain } from '../types/mountain'


export function getCollectionMountains(collection: Collection, mountains: Mountain[]): Mountain[] {
  const byId = new Map(mountains.map((m) => [m.id, m]))
  return collection.peakIds
    .map((id) => byId.get(id))
    .filter((m): m is Mountain => m !== undefined)
    .sort((a, b) => b.elevation - a.elevation)
}