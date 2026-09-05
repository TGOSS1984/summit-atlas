import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Resume } from '../types/resume'
import { loadResume, saveResume } from '../store/resumeStore'

interface ResumeContextValue {
  resume: Resume
  replaceAll: (resume: Resume) => void
}

const ResumeContext = createContext<ResumeContextValue | null>(null)

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resume, setResume] = useState<Resume>(() => loadResume())

  useEffect(() => {
    saveResume(resume)
  }, [resume])

  const value: ResumeContextValue = {
    resume,
    // the builder form always submits the whole résumé at once rather than
    // a partial patch, so one replace does both "save" and "cloud merge
    // result" duty - no separate update/patch method needed
    replaceAll: (next) => setResume(next),
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