import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Resume } from '../types/resume'
import { loadResume, saveResume } from '../store/resumeStore'
import { DEMO_RESUME } from '../data/demoResume'
import { useClimbs } from './ClimbsContext'

interface ResumeContextValue {
  resume: Resume
  replaceAll: (resume: Resume) => void
}

const ResumeContext = createContext<ResumeContextValue | null>(null)

export function ResumeProvider({ children }: { children: ReactNode }) {
  const { isDemoData } = useClimbs()
  // this is always the *real* résumé - demo mode swaps what useResume()
  // hands back below without ever touching this state, so turning demo
  // data off always lands back on whatever was genuinely saved
  const [realResume, setRealResume] = useState<Resume>(() => loadResume())

  useEffect(() => {
    saveResume(realResume)
  }, [realResume])

  const value: ResumeContextValue = {
    resume: isDemoData ? DEMO_RESUME : realResume,
    replaceAll: (next) => {
      // saving while demo data's on screen would just get overwritten the
      // moment demo mode ends, same reasoning peakbook's own résumé demo
      // swap uses - simplest safe rule is to not persist it at all rather
      // than silently lose it later or, worse, silently turn demo mode off
      if (isDemoData) return
      setRealResume(next)
    },
  }

  return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>
}

export function useResume(): ResumeContextValue {
  const context = useContext(ResumeContext)
  if (!context) {
    throw new Error('useResume must be used inside a ResumeProvider')
  }
  return context
}