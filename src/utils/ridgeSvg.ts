import type { Mountain } from '../types/mountain'

// Everest is a fixed reference point, not derived from the dataset - don't
// want the whole card system quietly rescaling if the dataset ever omits it
const WORLD_MAX_ELEVATION = 8849

const VIEW_WIDTH = 160
const VIEW_HEIGHT = 90
const BASELINE = 82
const TOP_MARGIN = 10
const MAX_PEAK_HEIGHT = BASELINE - TOP_MARGIN

// same unsigned-int hash trick peakbook uses (base-31 multiply-add) - keeps
// our silhouette shape directly comparable to theirs
function hashString(input: string): number {
  let hash = 7
  for (const char of input) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  }
  return hash
}

// power curve so low peaks don't look flat and Everest doesn't tower off
// the card - 0.65 matches peakbook's value, and it looks right here too
function heightRatio(elevation: number): number {
  return Math.pow(Math.min(1, elevation / WORLD_MAX_ELEVATION), 0.65)
}

type Point = [number, number]

// single apex + one shoulder - same silhouette peakbook draws, reimplemented
// against our own viewBox rather than reused from their file directly
function buildRidgePoints(mountain: Mountain): Point[] {
  const hash = hashString(mountain.id)
  const apexY = BASELINE - heightRatio(mountain.elevation) * MAX_PEAK_HEIGHT

  const apexX = 44 + (hash % 80)
  const leftY = BASELINE - (hash % 5)
  const midX = apexX * 0.45
  const midY = (leftY + apexY) / 2 + 4
  const shoulderX = Math.min(VIEW_WIDTH - 18, apexX + 18 + (hash % 16))
  const shoulderY = apexY + (BASELINE - apexY) * 0.5
  const rightY = BASELINE - ((hash >> 3) % 5)

  return [
    [0, leftY],
    [midX, midY],
    [apexX, apexY],
    [shoulderX, shoulderY],
    [VIEW_WIDTH, rightY],
  ]
}

function round(n: number): number {
  return Math.round(n * 10) / 10
}

function toPolyline(points: Point[]): string {
  const [first, ...rest] = points
  const line = rest.map(([x, y]) => `L ${round(x)} ${round(y)}`).join(' ')
  return `M ${round(first[0])} ${round(first[1])} ${line}`
}

// separate fill/stroke rather than one path - lets the card fade the fill
// in behind the text and keep the stroke crisp, same layered look peakbook gets
function toFilledShape(points: Point[]): string {
  return `${toPolyline(points)} L ${VIEW_WIDTH} ${BASELINE} L 0 ${BASELINE} Z`
}

export interface RidgeSvgOptions {
  // highest peak in this mountain's own country, if known - left optional
  // since not every caller has this handy yet
  countryMaxElevation?: number
}

export interface RidgeSvgData {
  fillPath: string
  strokePath: string
  viewBox: string
  worldLineY: number | null
  countryLineY: number | null
}

export function buildRidgeSvg(mountain: Mountain, options: RidgeSvgOptions = {}): RidgeSvgData {
  const points = buildRidgePoints(mountain)

  const worldLineY = mountain.elevation < WORLD_MAX_ELEVATION ? TOP_MARGIN : null

  const countryMax = options.countryMaxElevation
  const countryLineY =
    countryMax !== undefined && mountain.elevation < countryMax
      ? BASELINE - heightRatio(countryMax) * MAX_PEAK_HEIGHT
      : null

  return {
    fillPath: toFilledShape(points),
    strokePath: toPolyline(points),
    viewBox: `0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`,
    worldLineY,
    countryLineY,
  }
}