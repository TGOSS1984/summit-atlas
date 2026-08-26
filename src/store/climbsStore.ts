import type { ClimbsState } from '../utils/climbs'
import { isValidClimbsState } from '../utils/climbs'

const STORAGE_KEY = 'summit-atlas-climbs'

// wrapped in try/catch throughout - localStorage throws in Safari private
// browsing and can hit quota limits, don't want either to take the app down
export function loadClimbs(): ClimbsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return isValidClimbsState(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

export function saveClimbs(state: ClimbsState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // silently drop it - a failed save shouldn't crash the UI, worst case
    // the latest climb doesn't survive a reload
  }
}

export function exportClimbsFile(state: ClimbsState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `summit-atlas-export-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export async function parseImportedFile(file: File): Promise<ClimbsState> {
  const text = await file.text()
  const parsed = JSON.parse(text)
  if (!isValidClimbsState(parsed)) {
    throw new Error("That file doesn't look like a Summit Atlas export.")
  }
  return parsed
}