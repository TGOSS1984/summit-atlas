// hand-picked rather than pulled from the 5 design tokens - 7 continents
// needs more variety than 5 tokens give, and these are chosen to stay
// distinguishable on both Deep Vintage and Summit Light. Shared between
// ContinentBreakdown and the stacked-by-continent ClimbsPerYearChart so the
// same continent reads as the same colour everywhere on the dashboard, not
// just within one chart
export const CONTINENT_COLORS: Record<string, string> = {
  Africa: '#D98A3D',
  Antarctica: '#7FB8D9',
  Asia: '#C0392B',
  Australia: '#4AAFA0',
  Europe: '#8B6BB5',
  'North America': '#4A6FA5',
  'South America': '#6FAE94',
}

export const CONTINENT_COLOR_FALLBACK = '#8B8272'

export function continentColor(continent: string): string {
  return CONTINENT_COLORS[continent] ?? CONTINENT_COLOR_FALLBACK
}