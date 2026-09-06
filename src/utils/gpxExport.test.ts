import { describe, expect, it } from 'vitest'
import type { Mountain } from '../types/mountain'
import { buildGpxDocument } from './gpxExport'

const EVEREST: Mountain = {
  id: 'everest',
  name: 'Everest',
  elevation: 8849,
  country: 'Nepal',
  flag: '🇳🇵',
  continent: 'Asia',
  range: 'Himalaya',
  lat: 27.9881,
  lng: 86.925,
}

describe('buildGpxDocument', () => {
  it('includes one wpt per mountain with valid coordinates', () => {
    const gpx = buildGpxDocument([EVEREST])
    expect(gpx).toContain('<wpt lat="27.9881" lon="86.925">')
    expect(gpx).toContain('<name>Everest</name>')
    expect(gpx).toContain('<ele>8849</ele>')
  })

  it('skips peaks with NaN coordinates (unset custom peaks)', () => {
    const noCoords: Mountain = { ...EVEREST, id: 'custom-1', lat: NaN, lng: NaN }
    const gpx = buildGpxDocument([EVEREST, noCoords])
    expect(gpx.match(/<wpt/g)?.length).toBe(1)
  })

  it('escapes XML-sensitive characters in name and description', () => {
    const tricky: Mountain = { ...EVEREST, name: 'A & B <Peak>' }
    const gpx = buildGpxDocument([tricky])
    expect(gpx).toContain('A &amp; B &lt;Peak&gt;')
  })

  it('produces a valid-looking empty document for an empty list', () => {
    const gpx = buildGpxDocument([])
    expect(gpx).toContain('<gpx')
    expect(gpx).not.toContain('<wpt')
  })
})