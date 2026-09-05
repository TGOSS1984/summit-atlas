import type { Resume, ResumeCert } from '../types/resume'

const STORAGE_KEY = 'summit-atlas-resume'

export function emptyResume(): Resume {
  return { name: '', skills: [], certs: [], highlights: {} }
}

export function loadResume(): Resume {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyResume()
    return sanitizeResume(JSON.parse(raw))
  } catch {
    return emptyResume()
  }
}

export function saveResume(resume: Resume): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resume))
  } catch {
    // same reasoning as climbsStore/customPeaksStore - a failed save
    // shouldn't crash the UI
  }
}

// guards localStorage reads and, once CloudSync lands its remote reads too -
// either could hand back something malformed, this always returns a clean
// shape no matter what came in
export function sanitizeResume(raw: unknown): Resume {
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}

  const name = typeof r.name === 'string' ? r.name : ''

  const skills = Array.isArray(r.skills)
    ? r.skills.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    : []

  const certs: ResumeCert[] = Array.isArray(r.certs)
    ? r.certs
        .filter((c): c is Record<string, unknown> => typeof c === 'object' && c !== null)
        .map((c) => ({
          name: typeof c.name === 'string' ? c.name.trim() : '',
          org: typeof c.org === 'string' ? c.org.trim() : '',
          year: typeof c.year === 'string' ? c.year.trim() : '',
        }))
        .filter((c) => c.name.length > 0)
    : []

  const highlights: Record<string, string[]> = {}
  if (r.highlights && typeof r.highlights === 'object') {
    for (const [id, list] of Object.entries(r.highlights as Record<string, unknown>)) {
      if (!Array.isArray(list)) continue
      const bullets = list.filter((b): b is string => typeof b === 'string' && b.trim().length > 0)
      if (bullets.length) highlights[id] = bullets
    }
  }

  return { name, skills, certs, highlights }
}