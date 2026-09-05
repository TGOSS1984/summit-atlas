import type { ClimbsState } from './climbs'
import type { Mountain } from '../types/mountain'
import type { Resume, ResumeCert } from '../types/resume'

// dedupes by date+note per mountain, same rule peakbook's own merge uses -
// two devices logging the same ascent while offline shouldn't double up once
// both reconnect and merge
export function mergeClimbs(a: ClimbsState, b: ClimbsState): ClimbsState {
  const out: ClimbsState = {}
  const ids = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const id of ids) {
    const seen = new Set<string>()
    const merged = []
    for (const climb of [...(a[id] ?? []), ...(b[id] ?? [])]) {
      const key = `${climb.date}|${climb.note ?? ''}`
      if (seen.has(key)) continue
      seen.add(key)
      merged.push(climb)
    }
    if (merged.length) out[id] = merged.sort((x, y) => y.date.localeCompare(x.date))
  }
  return out
}

// custom peak ids are already timestamped (see customPeaks.ts), so no two
// devices can generate the same id for genuinely different peaks - a
// straight union by id is enough here, no de-dupe logic needed
export function mergeCustomPeaks(a: Mountain[], b: Mountain[]): Mountain[] {
  const byId = new Map<string, Mountain>()
  for (const peak of [...a, ...b]) byId.set(peak.id, peak)
  return [...byId.values()]
}

// union of two résumé blobs, local (a) first so its ordering wins where it
// matters (name). shapes are only loosely trusted here - sanitizeResume()
// cleans up whatever this hands back, so this just needs to not lose
// anyone's entries, not validate them
export function mergeResume(a: Resume, b: Resume): Resume {
  const skills: string[] = []
  const seenSkill = new Set<string>()
  for (const skill of [...a.skills, ...b.skills]) {
    const v = skill.trim()
    if (!v || seenSkill.has(v.toLowerCase())) continue
    seenSkill.add(v.toLowerCase())
    skills.push(v)
  }

  const certs: ResumeCert[] = []
  const seenCert = new Set<string>()
  for (const cert of [...a.certs, ...b.certs]) {
    if (!cert.name) continue
    const key = `${cert.name}|${cert.org ?? ''}|${cert.year ?? ''}`.toLowerCase()
    if (seenCert.has(key)) continue
    seenCert.add(key)
    certs.push(cert)
  }

  const highlights: Record<string, string[]> = {}
  for (const source of [a.highlights, b.highlights]) {
    for (const [mountainId, bullets] of Object.entries(source)) {
      const current = highlights[mountainId] ?? []
      for (const bullet of bullets) {
        if (!current.includes(bullet)) current.push(bullet)
      }
      if (current.length) highlights[mountainId] = current
    }
  }

  return { name: a.name || b.name, skills, certs, highlights }
}