import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Mountain } from '../types/mountain'
import {
  addCustomPeak,
  createCustomPeak,
  removeCustomPeak as removeCustomPeakFromState,
  type CustomPeakInput,
  type CustomPeaksState,
} from '../utils/customPeaks'
import { loadCustomPeaks, saveCustomPeaks } from '../store/customPeaksStore'

interface CustomPeaksContextValue {
  customPeaks: Mountain[]
  addPeak: (input: CustomPeakInput) => void
  removePeak: (id: string) => void
  replaceAll: (state: CustomPeaksState) => void
}

const CustomPeaksContext = createContext<CustomPeaksContextValue | null>(null)

export function CustomPeaksProvider({ children }: { children: ReactNode }) {
  const [customPeaks, setCustomPeaks] = useState<CustomPeaksState>(() => loadCustomPeaks())

  useEffect(() => {
    saveCustomPeaks(customPeaks)
  }, [customPeaks])

  const value = useMemo<CustomPeaksContextValue>(
    () => ({
      customPeaks,
      addPeak: (input) => setCustomPeaks((prev) => addCustomPeak(prev, createCustomPeak(input))),
      removePeak: (id) => setCustomPeaks((prev) => removeCustomPeakFromState(prev, id)),
      // used by CloudSync to write a merged local+remote result back in one
      // shot after sign-in, same as ClimbsContext's replaceAll
      replaceAll: (state) => setCustomPeaks(state),
    }),
    [customPeaks],
  )

  return <CustomPeaksContext.Provider value={value}>{children}</CustomPeaksContext.Provider>
}

export function useCustomPeaks(): CustomPeaksContextValue {
  const context = useContext(CustomPeaksContext)
  if (!context) {
    throw new Error('useCustomPeaks must be used inside a CustomPeaksProvider')
  }
  return context
}