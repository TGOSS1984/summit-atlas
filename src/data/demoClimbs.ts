import type { ClimbsState } from '../utils/climbs'
import type { ClimbRecord } from '../types/climb'
import { MOUNTAINS } from './mountains'
import { COLLECTIONS } from './collections'

// flavour text for a random subset of generated climbs - not trying to be
// exhaustive, just enough variety that the same note doesn't show up twice
// in one generated set very often
const NOTES = [
  'Clear skies the whole way up',
  'Turned back once, made it on the second attempt',
  'Guided route, small group',
  'Solo day trip',
  'Winter conditions, crampons on from the car park',
  'Long weekend trip with a couple of friends',
  'Overnight hut stop before the final push',
  'Wetter than forecast, worth it for the summit views',
  'First time back on this range in years',
  'Ticked off on the way through, hadn\'t planned to stop',
  'Slower pace than usual, took it easy',
  'Perfect visibility, could see for miles',
  'Early start to beat the crowds',
  'Route was busier than expected',
  'Navigation got interesting in the cloud near the top',
]

// shuffles without mutating the input, then takes the first n
function sampleN<T>(items: T[], n: number): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, Math.max(0, n))
}

// small collections (Seven Summits, Volcanic Seven Summits etc.) would
// round down to 0 almost every time at a low sample rate - give them a
// probabilistic shot at landing exactly 1 instead of always missing out
function sampleCountFor(total: number, rate: number): number {
  const raw = total * rate
  if (raw < 1) return Math.random() < raw ? 1 : 0
  return Math.round(raw)
}

function randomDateAcrossYears(startYear: number, endYear: number): string {
  // linear weighting toward more recent years - reads like someone whose
  // climbing picked up over time rather than a flat random spread
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)
  const weights = years.map((_, i) => 1 + (i / Math.max(1, years.length - 1)) * 1.5)
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  let roll = Math.random() * totalWeight
  let year = years[years.length - 1]
  for (let i = 0; i < years.length; i++) {
    roll -= weights[i]
    if (roll <= 0) {
      year = years[i]
      break
    }
  }
  const month = 1 + Math.floor(Math.random() * 12)
  const daysInMonth = new Date(year, month, 0).getDate()
  const day = 1 + Math.floor(Math.random() * daysInMonth)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${year}-${pad(month)}-${pad(day)}`
}

// re-rolled fresh every time "Load demo data" is clicked, so it doesn't
// stay looking the same (or stay looking sparse) as more collections and
// mountains have been added. Samples per-collection rather than uniformly
// across all 2,254 mountains, since a flat random sample would be
// dominated by the UK collections alone (Wainwrights + Munros + Nuttalls +
// Yorkshire Dales + Peak District is over 700 of the total dataset) and
// barely touch the rest of the world
export function generateDemoClimbs(): ClimbsState {
  // varies the overall "how much of a completionist is this demo climber"
  // feel run to run - sometimes a light sampler, sometimes deep into
  // several lists. This is the "arbitrary completion %" variance
  const rate = 0.03 + Math.random() * 0.1

  const picked = new Set<string>()
  for (const collection of COLLECTIONS) {
    const count = sampleCountFor(collection.peakIds.length, rate)
    if (count === 0) continue
    for (const id of sampleN(collection.peakIds, count)) picked.add(id)
  }

  // small wildcard pool from the full dataset, uniform - mostly lands on
  // the UK's own long tail given how much of the dataset it is, which is
  // fine texture rather than a problem to correct for
  for (const m of sampleN(MOUNTAINS, 6 + Math.floor(Math.random() * 6))) picked.add(m.id)

  const ids = [...picked].filter((id) => MOUNTAINS.some((m) => m.id === id))

  const climbs: ClimbsState = {}
  const currentYear = new Date().getFullYear()
  const startYear = currentYear - (8 + Math.floor(Math.random() * 6)) // 8-13 years of "history"

  for (const id of ids) {
    const record: ClimbRecord = { date: randomDateAcrossYears(startYear, currentYear) }
    if (Math.random() < 0.35) record.note = NOTES[Math.floor(Math.random() * NOTES.length)]
    climbs[id] = [record]
  }

  // a handful of repeat ascents so the timeline shows at least one -
  // matches how the old static set always gave Ben Nevis a second climb
  const repeatCandidates = sampleN(ids, 1 + Math.floor(Math.random() * 3))
  for (const id of repeatCandidates) {
    const second: ClimbRecord = { date: randomDateAcrossYears(startYear, currentYear) }
    if (Math.random() < 0.35) second.note = NOTES[Math.floor(Math.random() * NOTES.length)]
    // newest first, same convention utils/climbs.ts's addClimb uses
    climbs[id] = [...climbs[id], second].sort((a, b) => b.date.localeCompare(a.date))
  }

  return climbs
}