import type { Mountain } from '../types/mountain'

export type Point = [number, number]
export type Season = 'winter' | 'spring' | 'summer' | 'autumn'

interface Face {
  points: Point[]
  fill: string
  opacity: number
}

interface CurvePath {
  d: string
  width?: number
  opacity: number
}

interface ScreeLine {
  x1: number
  y1: number
  x2: number
  y2: number
  opacity: number
}

export interface ProceduralMountainData {
  mainPath: string
  ridgeHighlightPath: string
  rearPath: string
  midPath: string
  foregroundPath: string
  majorFaces: Face[]
  minorFacets: Face[]
  ravines: CurvePath[]
  strata: CurvePath[]
  scree: ScreeLine[]
  snowOverlayOpacity: number
  snowNoiseSeed: number
  snowPatches: string[]
  snowTongues: CurvePath[]
  snowRockCutouts: string[]
  worldLineY: number | null
  countryLineY: number | null
}

const W = 1200
const H = 680
const BASE = 620
// where an Everest-elevation peak's summit lands, and the shared scale
// every mountain's real elevation gets mapped onto - independent of
// whichever archetype the seed happens to pick, so the world's-highest /
// country's-highest reference lines stay meaningful regardless of shape
const REF_TOP = 80
const REF_HEIGHT = BASE - REF_TOP
// fixed reference point, not derived from the dataset - same reasoning as
// the old ridgeSvg.ts: don't want the whole card system quietly rescaling
// if the dataset ever omits Everest
const WORLD_MAX_ELEVATION = 8849

function hashString(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Rng {
  value(): number
  between(min: number, max: number): number
  int(min: number, max: number): number
  bool(chance?: number): boolean
  pick<T>(items: T[]): T
}

function rngFor(namespace: string): Rng {
  const random = mulberry32(hashString(namespace))
  return {
    value: () => random(),
    between: (min, max) => min + random() * (max - min),
    int: (min, max) => Math.floor(min + random() * (max - min + 1)),
    bool: (chance = 0.5) => random() < chance,
    pick: (items) => items[Math.floor(random() * items.length)],
  }
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}
function dist(a: Point, b: Point): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1])
}

const ARCHETYPES = [
  'sharp-pyramid', 'broad-rounded-fell', 'asymmetric-massif', 'twin-summit', 'serrated-ridge',
  'long-sloping-ridge', 'rocky-crag', 'plateau-escarpment', 'central-subsidiaries', 'multi-summit',
  'steep-left', 'steep-right', 'triple-summit', 'double-ridge', 'high-col', 'broken-crown',
  'flat-top-massif', 'spire-and-shoulder', 'broad-dome', 'knife-edge', 'corrie-headwall',
  'staircase-ridge', 'sawtooth-massif', 'isolated-spire', 'wide-buttressed', 'saddle-mountain',
  'table-mountain', 'crag-and-fell', 'rolling-highland', 'complex-massif',
] as const

function anchorsFor(type: string, r: Rng): Point[] {
  switch (type) {
    case 'sharp-pyramid':
      return [[0,590],[120,550],[230,480],[330,390],[420,285],[500,175],[565,120],[600,r.between(62,98)],[640,136],[710,220],[800,300],[930,390],[1060,485],[1200,590]]
    case 'broad-rounded-fell': {
      const c = r.between(500,700); const top = r.between(150,205)
      return [[0,590],[120,552],[225,500],[325,425],[410,340],[c-150,top+62],[c-80,top+24],[c,top],[c+90,top+25],[c+175,top+68],[900,365],[1035,470],[1200,590]]
    }
    case 'asymmetric-massif':
      return [[0,590],[120,555],[220,500],[320,420],[400,320],[470,220],[530,145],[575,r.between(72,108)],[625,160],[700,220],[790,290],[900,365],[1030,470],[1200,590]]
    case 'twin-summit': {
      const a = r.between(430,535); const gap = r.between(125,185); const h = r.between(85,125)
      return [[0,590],[130,550],[250,470],[350,340],[a-55,190],[a,h],[a+gap*0.44,215],[a+gap,h+r.between(-22,22)],[a+gap+75,205],[900,360],[1040,470],[1200,590]]
    }
    case 'serrated-ridge': {
      const pts: Point[] = [[0,590],[120,540],[220,450]]
      let x = 300; let y = r.between(150,230)
      while (x < 930) { pts.push([x, y + r.between(-48,48)]); x += r.between(52,88); y = clamp(y + r.between(-26,26), 92, 260) }
      pts.push([1040,470],[1200,590]); return pts
    }
    case 'long-sloping-ridge':
      return [[0,590],[130,525],[230,430],[315,r.between(88,132)],[420,170],[540,230],[675,290],[820,350],[970,430],[1200,590]]
    case 'rocky-crag':
      return [[0,590],[130,550],[250,480],[340,380],[420,260],[470,205],[500,145],[535,176],[565,94],[600,148],[630,118],[680,220],[760,290],[900,390],[1040,480],[1200,590]]
    case 'plateau-escarpment': {
      const left = r.bool()
      return left
        ? [[0,590],[120,545],[210,470],[285,350],[330,180],[360,124],[500,120],[650,125],[800,140],[900,260],[1020,420],[1200,590]]
        : [[0,590],[160,520],[300,430],[440,315],[560,165],[690,130],[830,125],[900,130],[930,175],[960,330],[1050,460],[1200,590]]
    }
    case 'central-subsidiaries':
      return [[0,590],[120,545],[220,430],[305,305],[360,350],[430,220],[495,270],[600,r.between(72,108)],[690,260],[760,205],[820,315],[930,390],[1050,475],[1200,590]]
    case 'multi-summit': {
      const pts: Point[] = [[0,590],[100,540]]; const peaks = r.int(4,7); const spacing = 900 / peaks
      for (let i = 0; i < peaks; i++) { const c = 170 + i * spacing; pts.push([c-spacing*0.28, r.between(245,340)],[c, r.between(92,210)],[c+spacing*0.28, r.between(245,340)]) }
      pts.push([1080,500],[1200,590]); return pts
    }
    case 'steep-left':
      return [[0,590],[180,555],[280,500],[350,410],[390,270],[430,r.between(78,118)],[510,170],[650,250],[800,340],[960,430],[1200,590]]
    case 'steep-right':
      return [[0,590],[150,520],[300,450],[430,365],[540,270],[640,170],[720,r.between(78,118)],[760,240],[790,370],[900,455],[1200,590]]
    case 'triple-summit': {
      const c = r.between(560,640)
      return [[0,590],[135,545],[250,465],[360,340],[c-150,175],[c-110,r.between(100,135)],[c-45,210],[c,r.between(72,105)],[c+55,205],[c+120,r.between(95,130)],[c+175,210],[900,365],[1040,470],[1200,590]]
    }
    case 'double-ridge':
      return [[0,590],[150,540],[260,430],[360,250],[445,r.between(95,135)],[510,200],[565,260],[650,175],[740,250],[830,330],[960,430],[1200,590]]
    case 'high-col':
      return [[0,590],[130,530],[245,420],[350,270],[430,r.between(88,125)],[505,185],[575,235],[650,r.between(100,140)],[735,205],[850,340],[1010,470],[1200,590]]
    case 'broken-crown':
      return [[0,590],[130,540],[240,455],[340,340],[420,220],[485,128],[525,170],[560,105],[600,160],[640,118],[700,225],[800,315],[950,425],[1200,590]]
    case 'flat-top-massif':
      return [[0,590],[120,540],[240,460],[350,350],[440,225],[505,145],[585,135],[675,140],[760,155],[830,235],[925,350],[1040,470],[1200,590]]
    case 'spire-and-shoulder':
      return [[0,590],[160,535],[280,445],[390,335],[470,230],[530,155],[570,r.between(65,95)],[610,180],[710,225],[815,300],[940,400],[1060,495],[1200,590]]
    case 'broad-dome':
      return [[0,590],[140,548],[265,490],[375,415],[465,325],[535,245],[600,r.between(145,185)],[675,205],[755,265],[845,330],[960,420],[1080,510],[1200,590]]
    case 'knife-edge':
      return [[0,590],[130,545],[245,455],[340,330],[425,205],[500,125],[560,r.between(82,118)],[625,130],[700,175],[780,245],[900,365],[1040,480],[1200,590]]
    case 'corrie-headwall':
      return [[0,590],[150,545],[260,470],[350,360],[430,235],[485,r.between(95,135)],[545,155],[600,205],[655,155],[720,r.between(105,145)],[800,250],[900,365],[1050,480],[1200,590]]
    case 'staircase-ridge':
      return [[0,590],[140,540],[240,465],[320,410],[350,350],[420,340],[450,275],[520,265],[555,190],[625,180],[660,r.between(100,140)],[735,220],[830,315],[960,425],[1200,590]]
    case 'sawtooth-massif':
      return [[0,590],[130,535],[230,445],[315,330],[380,210],[420,145],[465,190],[505,115],[550,180],[595,100],[645,178],[700,145],[760,240],[860,345],[1010,470],[1200,590]]
    case 'isolated-spire':
      return [[0,590],[180,550],[320,470],[430,360],[500,250],[545,165],[585,r.between(58,90)],[625,170],[685,260],[780,350],[900,430],[1040,505],[1200,590]]
    case 'wide-buttressed':
      return [[0,590],[130,545],[230,470],[315,385],[390,290],[455,205],[520,135],[585,r.between(82,115)],[650,140],[725,205],[805,285],[895,365],[1015,470],[1200,590]]
    case 'saddle-mountain':
      return [[0,590],[140,540],[250,445],[350,320],[430,r.between(105,145)],[510,210],[595,250],[680,210],[770,r.between(110,150)],[860,305],[970,420],[1200,590]]
    case 'table-mountain':
      return [[0,590],[150,535],[270,455],[360,355],[430,205],[470,150],[575,145],[690,145],[775,150],[825,205],[900,330],[1030,465],[1200,590]]
    case 'crag-and-fell':
      return [[0,590],[150,545],[280,455],[390,345],[470,220],[515,125],[555,180],[600,145],[670,225],[760,280],[860,335],[980,420],[1200,590]]
    case 'rolling-highland':
      return [[0,590],[120,550],[230,500],[330,445],[430,365],[520,300],[610,r.between(185,230)],[700,245],[790,300],[890,365],[1010,450],[1200,590]]
    case 'complex-massif':
    default:
      return [[0,590],[110,550],[205,485],[290,400],[360,300],[420,235],[470,150],[515,185],[555,r.between(72,105)],[600,150],[650,120],[705,210],[760,175],[820,270],[900,350],[1020,465],[1200,590]]
  }
}

function applyModifiers(anchors: Point[], r: Rng): Point[] {
  const pts: Point[] = anchors.map((p) => [...p] as Point)
  const modifiers = ['falseSummit','brokenShoulder','deepNotch','summitTor','longSpur','cliffBand','ridgeTeeth','highSaddle','doubleShoulder','summitShelf','steppedFlank','subsidiaryPeak']
  const count = r.int(1,4); const chosen: string[] = []
  for (let i = 0; i < count; i++) { const m = r.pick(modifiers); if (!chosen.includes(m)) chosen.push(m) }
  const summitIndex = pts.reduce((best, p, i) => (p[1] < pts[best][1] ? i : best), 0)

  for (const mod of chosen) {
    if (mod === 'falseSummit') {
      const side = r.bool() ? -1 : 1; const si = clamp(summitIndex + side * 2, 1, pts.length - 2)
      pts.splice(si, 0, [pts[si][0] + r.between(-28,28), pts[summitIndex][1] + r.between(35,75)])
    }
    if (mod === 'brokenShoulder') {
      const side = r.bool() ? -1 : 1; const si = clamp(summitIndex + side * r.int(2,4), 1, pts.length - 2)
      pts[si][1] -= r.between(15,40)
    }
    if (mod === 'deepNotch') {
      const side = r.bool() ? -1 : 1; const si = clamp(summitIndex + side * r.int(1,3), 1, pts.length - 2)
      pts[si][1] += r.between(28,65)
    }
    if (mod === 'summitTor') {
      const summit = pts[summitIndex]
      pts.splice(summitIndex, 1, [summit[0]-18, summit[1]+16],[summit[0]-7, summit[1]-8],[summit[0]+8, summit[1]-6],[summit[0]+20, summit[1]+18])
    }
    if (mod === 'longSpur') {
      const side = r.bool() ? -1 : 1; const si = clamp(summitIndex + side * 3, 1, pts.length - 2)
      pts[si][0] += side * r.between(40,85); pts[si][1] += r.between(5,28)
    }
    if (mod === 'cliffBand') {
      const side = r.bool() ? -1 : 1; const si = clamp(summitIndex + side * 2, 1, pts.length - 2)
      pts[si][0] += side * r.between(4,18); pts[si][1] += r.between(35,75)
    }
    if (mod === 'ridgeTeeth') {
      for (let k = 0; k < 3; k++) { const side = r.bool() ? -1 : 1; const si = clamp(summitIndex + side * r.int(1,4), 1, pts.length - 2)
        pts.splice(si, 0, [pts[si][0] + r.between(-18,18), pts[si][1] - r.between(15,35)]) }
    }
    if (mod === 'highSaddle') { const si = clamp(summitIndex + (r.bool() ? -2 : 2), 1, pts.length - 2); pts[si][1] += r.between(22,48) }
    if (mod === 'doubleShoulder') { const side = r.bool() ? -1 : 1
      for (let k = 2; k <= 3; k++) { const si = clamp(summitIndex + side * k, 1, pts.length - 2); pts[si][1] -= r.between(8,24) } }
    if (mod === 'summitShelf') { const summit = pts[summitIndex]
      pts.splice(summitIndex, 1, [summit[0]-38, summit[1]+9],[summit[0]-15, summit[1]],[summit[0]+16, summit[1]+2],[summit[0]+42, summit[1]+13]) }
    if (mod === 'steppedFlank') { const side = r.bool() ? -1 : 1
      const indices = [clamp(summitIndex + side*2, 1, pts.length-2), clamp(summitIndex + side*3, 1, pts.length-2), clamp(summitIndex + side*4, 1, pts.length-2)]
      indices.forEach((si, idx) => { pts[si][1] += idx % 2 === 0 ? r.between(10,28) : -r.between(5,18) }) }
    if (mod === 'subsidiaryPeak') { const side = r.bool() ? -1 : 1; const si = clamp(summitIndex + side * r.int(2,4), 1, pts.length - 2)
      pts.splice(si, 0, [pts[si][0] + r.between(-20,20), pts[summitIndex][1] + r.between(45,105)]) }
  }
  return pts.sort((a,b) => a[0] - b[0])
}

function subdivide(anchors: Point[], r: Rng, roughness: number, cragChance: number): Point[] {
  const out: Point[] = []
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i], b = anchors[i+1]
    out.push(a)
    const length = dist(a,b)
    const divisions = Math.max(2, Math.floor(length / r.between(20,32)))
    for (let n = 1; n < divisions; n++) {
      const t = n / divisions
      const x = lerp(a[0],b[0],t) + r.between(-6,6)
      let y = lerp(a[1],b[1],t) + r.between(-roughness,roughness) * Math.sin(Math.PI*t)
      if (r.bool(cragChance)) y -= r.between(4,18)
      out.push([x,y])
    }
  }
  out.push(anchors[anchors.length-1])
  return out.sort((a,b) => a[0]-b[0])
}

function yAtX(ridge: Point[], x: number): number {
  for (let i = 0; i < ridge.length - 1; i++) {
    const a = ridge[i], b = ridge[i+1]
    if (x >= a[0] && x <= b[0] && b[0] !== a[0]) { const t = (x - a[0]) / (b[0] - a[0]); return lerp(a[1], b[1], t) }
  }
  return BASE
}
function findSummit(ridge: Point[]): Point {
  return ridge.reduce((best, p) => (p[1] < best[1] ? p : best), ridge[0])
}

function closedPath(points: Point[], bottom = H): string {
  let d = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`
  for (let i = 1; i < points.length; i++) d += ` L ${points[i][0].toFixed(1)} ${points[i][1].toFixed(1)}`
  return `${d} L ${W} ${bottom} L 0 ${bottom} Z`
}
function linePath(points: Point[]): string {
  let d = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`
  for (let i = 1; i < points.length; i++) d += ` L ${points[i][0].toFixed(1)} ${points[i][1].toFixed(1)}`
  return d
}
function polygonPoints(points: Point[]): string {
  return points.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
}

function createBackgroundRidge(namespace: string, base: number, minY: number, maxRise: number): Point[] {
  const r = rngFor(namespace); const pts: Point[] = [[0,base]]; let x = 0
  while (x < W) {
    x += r.between(55,110)
    const centre = Math.max(0, 1 - Math.abs(x/W - 0.5) * 1.8)
    let y = base - centre * r.between(maxRise*0.45, maxRise) + r.between(-18,18)
    y = clamp(y,minY,base)
    pts.push([Math.min(x,W), y])
  }
  return pts
}

function createMajorFaces(ridge: Point[], summit: Point, namespace: string): Face[] {
  const r = rngFor(namespace); const faces: Face[] = []
  const sx = summit[0], sy = summit[1]
  const leftSurface = yAtX(ridge, clamp(sx-150,50,W-50))
  const rightSurface = yAtX(ridge, clamp(sx+150,50,W-50))
  faces.push(
    { points: [[sx,sy],[sx-r.between(22,45), sy+r.between(55,85)],[sx-r.between(90,135), leftSurface+r.between(18,50)],[sx-r.between(170,220), clamp(leftSurface+r.between(100,170),200,560)],[sx-r.between(85,120), clamp(leftSurface+r.between(85,150),220,560)],[sx-r.between(20,45), sy+r.between(130,195)]], fill: 'url(#faceLight)', opacity: r.between(0.66,0.90) },
    { points: [[sx,sy],[sx+r.between(25,48), sy+r.between(60,95)],[sx+r.between(80,125), rightSurface+r.between(15,45)],[sx+r.between(55,95), clamp(rightSurface+r.between(90,150),220,560)],[sx+r.between(8,35), sy+r.between(140,210)]], fill: 'url(#faceShadow)', opacity: r.between(0.72,0.95) },
  )
  const extraCount = r.int(3,6)
  for (let i = 0; i < extraCount; i++) {
    const side = r.bool() ? -1 : 1
    const cx = clamp(sx + side * r.between(60,280), 80, W-80)
    const surface = yAtX(ridge,cx)
    const w = r.between(70,150), h = r.between(80,200)
    faces.push({ points: [[cx,surface+r.between(12,40)],[cx+side*w*0.6,surface+r.between(35,80)],[cx+side*w*0.25,surface+h],[cx-side*w*0.35,surface+h*0.72]], fill: r.bool(0.46) ? 'url(#faceMid)' : 'url(#faceShadow)', opacity: r.between(0.30,0.66) })
  }
  return faces
}

function createFacets(ridge: Point[], summit: Point, namespace: string): Face[] {
  const r = rngFor(namespace); const facets: Face[] = []; const count = r.int(34,58)
  for (let i = 0; i < count; i++) {
    const x = r.between(100,W-100); const surface = yAtX(ridge,x); const available = BASE - surface
    if (available < 55) continue
    const y = surface + r.between(12, available*0.60)
    const w = r.between(18,82), h = r.between(30,128)
    const left = x < summit[0]
    const pts: Point[] = left
      ? [[x,y],[x+w,y+r.between(8,32)],[x+w*r.between(0.34,0.72),y+h],[x-w*r.between(0.05,0.20),y+h*r.between(0.42,0.70)]]
      : [[x,y],[x-w,y+r.between(8,32)],[x-w*r.between(0.34,0.72),y+h],[x+w*r.between(0.05,0.20),y+h*r.between(0.42,0.70)]]
    const fillRoll = r.value()
    facets.push({ points: pts, fill: fillRoll < 0.30 ? 'url(#rockWarm)' : fillRoll < 0.61 ? 'url(#faceLight)' : 'url(#faceShadow)', opacity: r.between(0.10,0.36) })
  }
  return facets
}

function createRavines(ridge: Point[], summit: Point, namespace: string): CurvePath[] {
  const r = rngFor(namespace); const items: CurvePath[] = []; const count = r.int(10,18)
  for (let i = 0; i < count; i++) {
    const x1 = clamp(summit[0] + r.between(-300,310), 80, W-80)
    const surface = yAtX(ridge,x1); const y1 = surface + r.between(18,65)
    const x2 = clamp(x1 + r.between(-135,135), 40, W-40)
    const y2 = r.between(420,590)
    const cx = x1 + r.between(-85,85); const cy = lerp(y1,y2,r.between(0.42,0.60))
    items.push({ d: `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`, width: r.between(1.3,4.4), opacity: r.between(0.16,0.52) })
  }
  return items
}

function createStrata(ridge: Point[], summit: Point, namespace: string): CurvePath[] {
  const r = rngFor(namespace); const items: CurvePath[] = []; const count = r.int(42,72)
  for (let i = 0; i < count; i++) {
    const x = r.between(130,W-130); const surface = yAtX(ridge,x); const available = BASE - surface
    if (available < 45) continue
    const y = surface + r.between(18, available*0.74)
    const direction = x < summit[0] ? -1 : 1
    const length = r.between(18,72), drop = r.between(7,30)
    items.push({ d: `M ${x.toFixed(1)} ${y.toFixed(1)} Q ${(x+direction*length*0.45).toFixed(1)} ${(y+drop*0.25).toFixed(1)} ${(x+direction*length).toFixed(1)} ${(y+drop).toFixed(1)}`, opacity: r.between(0.06,0.24) })
  }
  return items
}

function createScree(ridge: Point[], namespace: string): ScreeLine[] {
  const r = rngFor(namespace); const items: ScreeLine[] = []; const count = r.int(36,64)
  for (let i = 0; i < count; i++) {
    const x = r.between(140,W-140); const surface = yAtX(ridge,x)
    const low = Math.max(surface+85, 420)
    if (low >= 590) continue
    const y = r.between(low,590)
    items.push({ x1:x, y1:y, x2:x+r.between(-6,6), y2:y+r.between(8,30), opacity:r.between(0.045,0.15) })
  }
  return items
}

function seasonSnowFactor(season: Season): [number, number] {
  switch (season) {
    case 'summer': return [0.00,0.10]
    case 'autumn': return [0.02,0.20]
    case 'spring': return [0.08,0.40]
    case 'winter': return [0.38,0.92]
    default: return [0.15,0.55]
  }
}

interface SnowResult {
  strength: number
  patches: Point[][]
  tongues: CurvePath[]
  rockCutouts: Point[][]
}

function createSnow(ridge: Point[], summit: Point, namespace: string, season: Season): SnowResult {
  const r = rngFor(namespace)
  const [seasonMin,seasonMax] = seasonSnowFactor(season)
  const seasonal = r.between(seasonMin, seasonMax)
  const snowline = lerp(410, 255, seasonal) + r.between(-25,25)
  const strength = clamp(0.30 + seasonal*0.72 + r.between(-0.08,0.08), 0, 0.96)
  const patches: Point[][] = [], tongues: CurvePath[] = [], rockCutouts: Point[][] = []
  const patchCount = Math.round(lerp(2,24,seasonal))
  for (let i = 0; i < patchCount; i++) {
    const x = clamp(summit[0] + r.between(-320,320), 120, W-120)
    const surface = yAtX(ridge,x)
    if (surface > snowline + r.between(-35,35)) continue
    const top = surface + r.between(4,24), width = r.between(24,118)
    const depth = r.between(18, Math.max(28, Math.min(160, snowline-surface+95)))
    const direction = x < summit[0] ? -1 : 1
    patches.push([[x-width*0.15,top],[x+direction*width*0.38,top+depth*0.18],[x+direction*width*0.57,top+depth*0.54],[x+direction*width*0.18,top+depth],[x-width*0.35,top+depth*0.69],[x-width*0.46,top+depth*0.27]])
  }
  const tongueCount = Math.round(lerp(0,11,seasonal))
  for (let i = 0; i < tongueCount; i++) {
    const x = clamp(summit[0] + r.between(-250,250), 120, W-120)
    const surface = yAtX(ridge,x)
    if (surface > snowline + 35) continue
    const y1 = surface + r.between(15,50); const y2 = Math.min(525, y1 + r.between(85,190))
    tongues.push({ d: `M ${x.toFixed(1)} ${y1.toFixed(1)} Q ${(x+r.between(-45,45)).toFixed(1)} ${lerp(y1,y2,0.52).toFixed(1)} ${(x+r.between(-38,38)).toFixed(1)} ${y2.toFixed(1)}`, width:r.between(7,19), opacity:r.between(0.30,0.62) })
  }
  const cutoutCount = Math.round(lerp(2,22,seasonal))
  for (let i = 0; i < cutoutCount; i++) {
    const x = clamp(summit[0] + r.between(-285,285), 120, W-120)
    const surface = yAtX(ridge,x)
    if (surface > snowline + 20) continue
    const y = surface + r.between(12,105); const w = r.between(10,45), h = r.between(8,32)
    rockCutouts.push([[x,y],[x+w,y+r.between(2,10)],[x+w*0.55,y+h],[x-w*0.15,y+h*0.55]])
  }
  return { strength, patches, tongues, rockCutouts }
}

function createForeground(namespace: string): Point[] {
  const r = rngFor(namespace); const points: Point[] = [[0,r.between(570,595)]]; let x = 0, y = points[0][1]
  while (x < W) { x += r.between(45,92); y = clamp(y + r.between(-20,20), 550, 625); points.push([Math.min(x,W), y]) }
  return points
}

const roughnessByType: Record<string, number> = {'broad-rounded-fell':5,'rolling-highland':5,'plateau-escarpment':6,'table-mountain':6,'long-sloping-ridge':9,'sharp-pyramid':11,'asymmetric-massif':11,'twin-summit':11,'steep-left':11,'steep-right':11,'spire-and-shoulder':12,'wide-buttressed':12,'central-subsidiaries':13,'multi-summit':14,'triple-summit':14,'complex-massif':15,'sawtooth-massif':18,'serrated-ridge':18,'rocky-crag':19,'broken-crown':19,'knife-edge':16}
const cragChanceByType: Record<string, number> = {'broad-rounded-fell':0.08,'rolling-highland':0.08,'plateau-escarpment':0.12,'table-mountain':0.12,'long-sloping-ridge':0.16,'sharp-pyramid':0.23,'asymmetric-massif':0.25,'twin-summit':0.25,'central-subsidiaries':0.31,'multi-summit':0.34,'triple-summit':0.35,'serrated-ridge':0.42,'sawtooth-massif':0.45,'broken-crown':0.46,'rocky-crag':0.48}

function heightRatio(elevation: number): number {
  return Math.pow(Math.min(1, elevation / WORLD_MAX_ELEVATION), 0.65)
}

// deterministic per mountain rather than random per render - same peak
// should always look the same season, not flicker between reloads
export function seasonForMountain(mountain: Mountain): Season {
  const seasons: Season[] = ['winter', 'spring', 'summer', 'autumn']
  return seasons[hashString(`${mountain.id}:season`) % 4]
}

export function generateProceduralMountain(
  mountain: Mountain,
  season: Season,
  countryMaxElevation?: number,
): ProceduralMountainData {
  const seed = mountain.id
  const selectionRng = rngFor(`${seed}:archetype`)
  const structureRng = rngFor(`${seed}:structure`)
  const modifierRng = rngFor(`${seed}:modifiers`)

  const archetype = selectionRng.pick(ARCHETYPES as unknown as string[])
  let anchors = anchorsFor(archetype, structureRng)
  anchors = applyModifiers(anchors, modifierRng)

  const roughness = roughnessByType[archetype] ?? 11
  const cragChance = cragChanceByType[archetype] ?? 0.24

  const rawRidge = subdivide(anchors, structureRng, roughness, cragChance)

  // elevation-scale the whole ridge toward the shared baseline so a 500m
  // hill and Everest use the same archetype-shape language but draw at
  // proportionally different heights - same intent as the old
  // ridgeSvg.ts's heightRatio scaling, just applied to a much richer
  // silhouette. every downstream feature (faces, facets, ravines, snow)
  // reads its surface height off this same scaled ridge via yAtX(), so
  // scaling once here cascades through everything else automatically
  const rawSummit = findSummit(rawRidge)
  const naturalRise = BASE - rawSummit[1]
  const heightScale = heightRatio(mountain.elevation)
  const targetRise = REF_HEIGHT * heightScale
  const scaleFactor = naturalRise > 0 ? targetRise / naturalRise : 1
  const ridge: Point[] = rawRidge.map(([x, y]) => [x, BASE - (BASE - y) * scaleFactor])

  const summit = findSummit(ridge)

  const rear = createBackgroundRidge(`${seed}:rear`, 530, 280, 210)
  const mid = createBackgroundRidge(`${seed}:mid`, 575, 230, 290)
  const foreground = createForeground(`${seed}:foreground`)

  const majorFaces = createMajorFaces(ridge, summit, `${seed}:majorFaces`)
  const minorFacets = createFacets(ridge, summit, `${seed}:facets`)
  const ravines = createRavines(ridge, summit, `${seed}:ravines`)
  const strata = createStrata(ridge, summit, `${seed}:strata`)
  const scree = createScree(ridge, `${seed}:scree`)
  const snow = createSnow(ridge, summit, `${seed}:snow`, season)

  const worldLineY = mountain.elevation < WORLD_MAX_ELEVATION ? REF_TOP : null
  const countryLineY =
    countryMaxElevation !== undefined && mountain.elevation < countryMaxElevation
      ? BASE - heightRatio(countryMaxElevation) * REF_HEIGHT
      : null

  return {
    mainPath: closedPath(ridge),
    ridgeHighlightPath: linePath(ridge),
    rearPath: closedPath(rear),
    midPath: closedPath(mid),
    foregroundPath: closedPath(foreground),
    majorFaces,
    minorFacets,
    ravines,
    strata,
    scree,
    snowOverlayOpacity: snow.strength,
    snowNoiseSeed: hashString(`${seed}:snowTexture`) % 997,
    snowPatches: snow.patches.map(polygonPoints),
    snowTongues: snow.tongues,
    snowRockCutouts: snow.rockCutouts.map(polygonPoints),
    worldLineY,
    countryLineY,
  }
}