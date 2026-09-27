import type { Resume } from '../types/resume'

// deliberately no highlights here - generateDemoClimbs() (demoClimbs.ts)
// samples random peaks from the whole dataset on every load, so pinning
// highlight bullets to specific mountain ids would almost never line up
// with whatever actually got picked. resumeBullets() already falls back to
// each climb's own generated note when there's no saved highlight, so the
// résumé still reads fine without one.
export const DEMO_RESUME: Resume = {
  name: 'Alex Rivera',
  skills: [
    'Glacier travel & crevasse rescue',
    'Alpine rock up to AD+',
    'Winter navigation',
    'Expedition planning',
  ],
  certs: [
    { name: 'Wilderness First Responder', org: 'NOLS', year: '2022' },
    { name: 'AIARE 1 — Avalanche Rescue', org: 'AIARE', year: '2021' },
  ],
  highlights: {},
}