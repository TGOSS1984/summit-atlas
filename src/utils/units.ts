export type ElevationUnit = 'm' | 'ft'

const METRES_TO_FEET = 3.28084

export function metersToFeet(metres: number): number {
  return metres * METRES_TO_FEET
}

// storage is always metres — this is the only place feet should ever get computed
export function formatElevation(metres: number, unit: ElevationUnit): string {
  if (unit === 'ft') {
    return `${Math.round(metersToFeet(metres)).toLocaleString()} ft`
  }
  return `${Math.round(metres).toLocaleString()} m`
}