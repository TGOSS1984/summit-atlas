import { useMemo, useState } from 'react'
import type { Mountain } from '../types/mountain'
import { ALL_FILTERS, filterMountains } from '../utils/filterMountains'

const MAX_RESULTS = 12

// same substring match ExplorePage's own search box uses (filterMountains),
// just capped and re-sorted by elevation for a compact dropdown - a picker
// showing all 2,700+ matches for an empty query would be useless anyway
export function usePeakSearch(mountains: Mountain[], climbedIds: Set<string>) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const matches = filterMountains(mountains, { ...ALL_FILTERS, search: query }, [], climbedIds)
    return [...matches].sort((a, b) => b.elevation - a.elevation).slice(0, MAX_RESULTS)
  }, [mountains, climbedIds, query])

  return { query, setQuery, results }
}