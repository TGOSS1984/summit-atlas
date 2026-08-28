import type { CustomPeaksState } from '../utils/customPeaks'
import { isValidCustomPeaksState } from '../utils/customPeaks'

const STORAGE_KEY = 'summit-atlas-custom-peaks'

// wrapped in try/catch throughout, same reasoning as climbsStore -
// localStorage throws in Safari private browsing and can hit quota limits
export function loadCustomPeaks(): CustomPeaksState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return isValidCustomPeaksState(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveCustomPeaks(state: CustomPeaksState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // silently drop it - a failed save shouldn't crash the UI
  }
}