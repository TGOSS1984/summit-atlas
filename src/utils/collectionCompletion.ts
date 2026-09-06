import type { Collection } from '../types/collection'
import { getCollectionProgress } from './dashboardStats'

// ids of every collection that's fully climbed right now - reuses the same
// getCollectionProgress() the dashboard rings and Lists page already call
export function getCompletedCollectionIds(collections: Collection[], climbedIds: Set<string>): Set<string> {
  const completed = new Set<string>()
  for (const collection of collections) {
    const { climbed, total } = getCollectionProgress(collection, climbedIds)
    if (total > 0 && climbed === total) completed.add(collection.id)
  }
  return completed
}

const CELEBRATED_KEY = 'summit-atlas-celebrated-collections'

// a plain localStorage flag rather than a full context - this is one tiny
// one-off value with no reactive state anything else needs to read
export function loadCelebratedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(CELEBRATED_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? new Set(parsed.filter((id): id is string => typeof id === 'string'))
      : new Set()
  } catch {
    return new Set()
  }
}

export function saveCelebratedIds(ids: Set<string>): void {
  try {
    localStorage.setItem(CELEBRATED_KEY, JSON.stringify([...ids]))
  } catch {
    // same reasoning as every other store here - a failed save just means
    // the celebration might fire again later, not a crash
  }
}