import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ClimbRecord } from '../types/climb'
import {
  addClimb,
  removeClimb as removeClimbFromState,
  getClimbedIds,
  type ClimbsState,
} from '../utils/climbs'
import { loadClimbs, saveClimbs } from '../store/climbsStore'

interface ClimbsContextValue {
  climbs: ClimbsState
  climbedIds: Set<string>
  getClimbsFor: (mountainId: string) => ClimbRecord[]
  logClimb: (mountainId: string, climb: ClimbRecord) => void
  removeClimb: (mountainId: string, index: number) => void
  // trusts its input is already validated - only caller right now is
  // DataControls, which runs it through parseImportedFile first
  replaceAll: (state: ClimbsState) => void
}

const ClimbsContext = createContext<ClimbsContextValue | null>(null)

export function ClimbsProvider({ children }: { children: ReactNode }) {
  // lazy initializer so loadClimbs() only ever runs once, not on every render
  const [climbs, setClimbs] = useState<ClimbsState>(() => loadClimbs())

  // writes through on every change rather than only on unmount - a closed
  // tab shouldn't lose the last thing logged
  useEffect(() => {
    saveClimbs(climbs)
  }, [climbs])

  const climbedIds = useMemo(() => getClimbedIds(climbs), [climbs])

  const value = useMemo<ClimbsContextValue>(
    () => ({
      climbs,
      climbedIds,
      getClimbsFor: (mountainId) => climbs[mountainId] ?? [],
      logClimb: (mountainId, climb) => setClimbs((prev) => addClimb(prev, mountainId, climb)),
      removeClimb: (mountainId, index) =>
        setClimbs((prev) => removeClimbFromState(prev, mountainId, index)),
      replaceAll: (state) => setClimbs(state),
    }),
    [climbs, climbedIds],
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