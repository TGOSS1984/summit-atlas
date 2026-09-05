import type { Ascent } from './dashboardStats'
import type { Mountain } from '../types/mountain'

export interface FoldedAscent {
  mountain: Mountain
  dates: string[]
  note?: string
}

// a peak climbed 3 times folds into one résumé row carrying all 3 dates,
// rather than 3 separate rows - ascents is expected newest-first (see
// getAllAscents), and a Map's insertion order preserves that: the first
// time a peak shows up is its most recent ascent, so the folded list comes
// out sorted by most-recent-ascent too, for free
export function foldRepeatAscents(ascents: Ascent[]): FoldedAscent[] {
  const byId = new Map<string, FoldedAscent>()
  for (const ascent of ascents) {
    const existing = byId.get(ascent.mountain.id)
    if (existing) {
      existing.dates.push(ascent.date)
      if (!existing.note && ascent.note) existing.note = ascent.note
    } else {
      byId.set(ascent.mountain.id, { mountain: ascent.mountain, dates: [ascent.date], note: ascent.note })
    }
  }
  return [...byId.values()]
}

// saved highlight bullets win; falling back to the climb's own note means a
// peak nobody's bothered to write highlights for still shows something
export function resumeBullets(
  highlights: Record<string, string[]>,
  mountainId: string,
  fallbackNote?: string,
): string[] {
  const saved = highlights[mountainId]
  if (saved && saved.length) return saved
  return fallbackNote ? [fallbackNote] : []
}