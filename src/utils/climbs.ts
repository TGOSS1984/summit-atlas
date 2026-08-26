import type { ClimbRecord } from '../types/climb'

export type ClimbsState = Record<string, ClimbRecord[]>

// newest first, same ordering the modal's throwaway local state used in commit 11
export function addClimb(state: ClimbsState, mountainId: string, climb: ClimbRecord): ClimbsState {
  const existing = state[mountainId] ?? []
  const updated = [...existing, climb].sort((a, b) => b.date.localeCompare(a.date))
  return { ...state, [mountainId]: updated }
}

export function removeClimb(state: ClimbsState, mountainId: string, index: number): ClimbsState {
  const existing = state[mountainId] ?? []
  const updated = existing.filter((_, i) => i !== index)
  // drop the key entirely once empty rather than leaving `[]` sitting around -
  // keeps getClimbedIds() in sync without a separate "has any climbs" check
  if (updated.length === 0) {
    const next = { ...state }
    delete next[mountainId]
    return next
  }
  return { ...state, [mountainId]: updated }
}

export function getClimbedIds(state: ClimbsState): Set<string> {
  return new Set(Object.keys(state))
}

// guards both localStorage reads and imported files - either one could hand
// us garbage, don't want a corrupted value taking the whole app down
export function isValidClimbsState(value: unknown): value is ClimbsState {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  return Object.values(value).every(
    (entries) =>
      Array.isArray(entries) &&
      entries.every(
        (entry) =>
          typeof entry === 'object' &&
          entry !== null &&
          typeof (entry as ClimbRecord).date === 'string' &&
          ((entry as ClimbRecord).note === undefined || typeof (entry as ClimbRecord).note === 'string'),
      ),
  )
}