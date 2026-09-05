import type { ClimbsState } from './climbs'
import type { Mountain } from '../types/mountain'

// dedupes by date+note per mountain, same rule peakbook's own merge uses -
// two devices logging the same ascent while offline shouldn't double up once
// both reconnect and merge
export function mergeClimbs(a: ClimbsState, b: ClimbsState): ClimbsState {
  const out: ClimbsState = {}
  const ids = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const id of ids) {
    const seen = new Set<string>()
    const merged = []
    for (const climb of [...(a[id] ?? []), ...(b[id] ?? [])]) {
      const key = `${climb.date}|${climb.note ?? ''}`
      if (seen.has(key)) continue
      seen.add(key)
      merged.push(climb)
    }
    if (merged.length) out[id] = merged.sort((x, y) => y.date.localeCompare(x.date))
  }
  return out
}

// custom peak ids are already timestamped (see customPeaks.ts), so no two
// devices can generate the same id for genuinely different peaks - a
// straight union by id is enough here, no de-dupe logic needed
export function mergeCustomPeaks(a: Mountain[], b: Mountain[]): Mountain[] {
  const byId = new Map<string, Mountain>()
  for (const peak of [...a, ...b]) byId.set(peak.id, peak)
  return [...byId.values()]
}