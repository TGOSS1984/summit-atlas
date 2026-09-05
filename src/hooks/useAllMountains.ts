import { useMemo } from 'react'
import { MOUNTAINS } from '../data/mountains'
import { useCustomPeaks } from '../context/CustomPeaksContext'
import type { Mountain } from '../types/mountain'

// curated + custom peaks combined - DashboardPage and ExplorePage each
// build this same union inline with their own useMemo; pulled into a hook
// now that the résumé builder and print view need it too. worth eventually
// swapping those two over to this as well, not done here to keep this
// commit scoped to the résumé feature
export function useAllMountains(): Mountain[] {
  const { customPeaks } = useCustomPeaks()
  return useMemo(() => [...MOUNTAINS, ...customPeaks], [customPeaks])
}