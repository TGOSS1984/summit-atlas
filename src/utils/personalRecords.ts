import type { Ascent } from './dashboardStats'

export interface YearStreak {
  startYear: number
  endYear: number
  length: number
}

export interface BiggestYear {
  year: number
  count: number
}

export interface LongestGap {
  days: number
  fromDate: string
  toDate: string
}

export interface PersonalRecords {
  longestStreak: YearStreak | null
  biggestYear: BiggestYear | null
  longestGap: LongestGap | null
}

const MS_PER_DAY = 1000 * 60 * 60 * 24

// ISO date-only strings ("2024-06-12") parse as UTC midnight, so this stays
// correct regardless of the browser's own timezone as long as both sides
// parse the same way
function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / MS_PER_DAY)
}

export function getPersonalRecords(ascents: Ascent[]): PersonalRecords {
  if (ascents.length === 0) {
    return { longestStreak: null, biggestYear: null, longestGap: null }
  }

  // --- biggest single year ---
  const countsByYear = new Map<number, number>()
  for (const ascent of ascents) {
    const year = Number(ascent.date.slice(0, 4))
    countsByYear.set(year, (countsByYear.get(year) ?? 0) + 1)
  }
  let biggestYear: BiggestYear = { year: 0, count: 0 }
  for (const [year, count] of countsByYear) {
    if (count > biggestYear.count) biggestYear = { year, count }
  }

  // --- longest run of consecutive years with at least one ascent ---
  const years = [...countsByYear.keys()].sort((a, b) => a - b)
  let longestStreak: YearStreak = { startYear: years[0], endYear: years[0], length: 1 }
  let runStart = years[0]
  let runEnd = years[0]
  for (let i = 1; i < years.length; i++) {
    runEnd = years[i] === runEnd + 1 ? years[i] : (runStart = years[i])
    const length = runEnd - runStart + 1
    if (length > longestStreak.length) longestStreak = { startYear: runStart, endYear: runEnd, length }
  }

  // --- longest gap between two consecutive ascents ---
  // same-day ascents sort together and give a 0-day "gap", which is fine -
  // it just never wins against a real gap
  const sortedDates = ascents.map((a) => a.date).sort()
  let longestGap: LongestGap | null = null
  for (let i = 1; i < sortedDates.length; i++) {
    const days = daysBetween(sortedDates[i - 1], sortedDates[i])
    if (!longestGap || days > longestGap.days) {
      longestGap = { days, fromDate: sortedDates[i - 1], toDate: sortedDates[i] }
    }
  }

  return { longestStreak, biggestYear, longestGap }
}