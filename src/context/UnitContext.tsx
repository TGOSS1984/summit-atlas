import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { ElevationUnit } from '../utils/units'

const STORAGE_KEY = 'summit-atlas-unit'

function getInitialUnit(): ElevationUnit {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'ft' ? 'ft' : 'm'
  } catch {
    return 'm'
  }
}

interface UnitContextValue {
  unit: ElevationUnit
  toggleUnit: () => void
  setUnit: (unit: ElevationUnit) => void
}

const UnitContext = createContext<UnitContextValue | null>(null)

export function UnitProvider({ children }: { children: ReactNode }) {
  const [unit, setUnitState] = useState<ElevationUnit>(getInitialUnit)

  // no need for theme's inline-head-script trick here - a number briefly
  // showing in the wrong unit for one frame isn't the jarring flash a whole
  // page repainting the wrong colour would be
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, unit)
    } catch {
      // not worth surfacing - worst case the preference doesn't survive a reload
    }
  }, [unit])

  function toggleUnit() {
    setUnitState((prev) => (prev === 'm' ? 'ft' : 'm'))
  }

  // segmented pill buttons each represent one fixed unit rather than
  // flipping whatever's current, so they need a direct setter, not toggle
  function setUnit(next: ElevationUnit) {
    setUnitState(next)
  }

  return (
    <UnitContext.Provider value={{ unit, toggleUnit, setUnit }}>{children}</UnitContext.Provider>
  )
}

export function useUnit(): UnitContextValue {
  const context = useContext(UnitContext)
  if (!context) {
    throw new Error('useUnit must be used inside a UnitProvider')
  }
  return context
}