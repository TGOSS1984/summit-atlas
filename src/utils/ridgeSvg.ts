import type { Mountain } from '../types/mountain'

// Everest is a fixed reference point, not derived from the dataset - don't
// want the whole card system quietly rescaling if the dataset ever omits it
const WORLD_MAX_ELEVATION = 8849

const VIEW_WIDTH = 160
const VIEW_HEIGHT = 90
const BASELINE = 82
const TOP_MARGIN = 10
const MAX_PEAK_HEIGHT = BASELINE - TOP_MARGIN

// deterministic hash from a string - same peak always draws the same ridge,
// no point re-randomising it on every render/reload
function hashString(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

// power curve so low peaks don't look flat and Everest doesn't tower off
// the card - 0.65 eyeballed against the sample dataset, revisit once the
// full dataset's elevation spread is known
function heightRatio(elevation: number): number {
  return Math.pow(elevation / WORLD_MAX_ELEVATION, 0.65)
}

interface RidgePoint {
  x: number
  y: number
}

// walks left to right building a jagged ridge - seeded off the mountain id
// so it's stable across renders but still varies card to card
function buildRidgePoints(mountain: Mountain, pointCount = 7): RidgePoint[] {
  const seed = hashString(mountain.id)
  const peakHeight = heightRatio(mountain.elevation) * MAX_PEAK_HEIGHT
  const points: RidgePoint[] = []

  for (let i = 0; i <= pointCount; i++) {
    const x = (VIEW_WIDTH / pointCount) * i
    // shoulders taper toward both edges, apex sits near the middle point
    const distanceFromCenter = Math.abs(i - pointCount / 2) / (pointCount / 2)
    const shoulderFactor = Math.max(1 - Math.pow(distanceFromCenter, 1.4), 0)
    const jitter = ((seed >> (i * 3)) % 11) - 5 // cheap pseudo-noise, -5..5
    const y = Math.min(BASELINE - shoulderFactor * peakHeight + jitter, BASELINE)
    points.push({ x, y })
  }

  return points
}

function pointsToPath(points: RidgePoint[]): string {
  const [first, ...rest] = points
  const line = rest.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  return `M ${first.x.toFixed(1)} ${first.y.toFixed(1)} ${line} L ${VIEW_WIDTH} ${BASELINE} L 0 ${BASELINE} Z`
}

export interface RidgeSvgOptions {
  // highest peak in this mountain's own country, if known - draws a second
  // dashed line alongside the world one. left optional since not every
  // caller has this handy yet
  countryMaxElevation?: number
}

// everything the card needs to draw itself - kept the maths out of the
// component so this is testable without touching the DOM
export interface RidgeSvgData {
  path: string
  viewBox: string
  worldLineY: number | null
  countryLineY: number | null
}

export function buildRidgeSvg(mountain: Mountain, options: RidgeSvgOptions = {}): RidgeSvgData {
  const path = pointsToPath(buildRidgePoints(mountain))

  // no point drawing a reference line exactly on top of the ridge it's
  // referencing - only show it when this peak isn't already the record holder
  const worldLineY = mountain.elevation < WORLD_MAX_ELEVATION ? TOP_MARGIN : null

  const countryMax = options.countryMaxElevation
  const countryLineY =
    countryMax !== undefined && mountain.elevation < countryMax
      ? BASELINE - heightRatio(countryMax) * MAX_PEAK_HEIGHT
      : null

  return {
    path,
    viewBox: `0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`,
    worldLineY,
    countryLineY,
  }
}