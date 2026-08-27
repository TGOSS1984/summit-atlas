import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ClimbRecord } from '../types/climb'
import {
  addClimb,
  removeClimb as removeClimbFromState,
  getClimbedIds,
  type ClimbsState,
} from '../utils/climbs'
import { loadClimbs, saveClimbs, loadIsDemo, saveIsDemo } from '../store/climbsStore'
import { DEMO_CLIMBS } from '../data/demoClimbs'

interface ClimbsContextValue {
  climbs: ClimbsState
  climbedIds: Set<string>
  isDemoData: boolean
  getClimbsFor: (mountainId: string) => ClimbRecord[]
  logClimb: (mountainId: string, climb: ClimbRecord) => void
  removeClimb: (mountainId: string, index: number) => void
  replaceAll: (state: ClimbsState) => void
  loadDemoData: () => void
}

const ClimbsContext = createContext<ClimbsContextValue | null>(null)

export function ClimbsProvider({ children }: { children: ReactNode }) {
  const [climbs, setClimbs] = useState<ClimbsState>(() => loadClimbs())
  const [isDemoData, setIsDemoData] = useState<boolean>(() => loadIsDemo())

  useEffect(() => {
    saveClimbs(climbs)
  }, [climbs])

  useEffect(() => {
    saveIsDemo(isDemoData)
  }, [isDemoData])

  const climbedIds = useMemo(() => getClimbedIds(climbs), [climbs])

  const value = useMemo<ClimbsContextValue>(
    () => ({
      climbs,
      climbedIds,
      isDemoData,
      getClimbsFor: (mountainId) => climbs[mountainId] ?? [],
      // any real edit (log, remove, import) clears the demo flag - once
      // someone's touched the data it's not "just sample data" any more
      logClimb: (mountainId, climb) => {
        setClimbs((prev) => addClimb(prev, mountainId, climb))
        setIsDemoData(false)
      },
      removeClimb: (mountainId, index) => {
        setClimbs((prev) => removeClimbFromState(prev, mountainId, index))
        setIsDemoData(false)
      },
      replaceAll: (state) => {
        setClimbs(state)
        setIsDemoData(false)
      },
      loadDemoData: () => {
        setClimbs(DEMO_CLIMBS)
        setIsDemoData(true)
      },
    }),
    [climbs, climbedIds, isDemoData],
  )

  return <ClimbsContext.Provider value={value}>{children}</ClimbsContext.Provider>
}

export function useClimbs(): ClimbsContextValue {
  const context = useContext(ClimbsContext)
  if (!context) {
    throw new Error('useClimbs must be used inside a ClimbsProvider')
  }
  return context
}