import { describe, expect, it } from 'vitest'
import { buildRidgeSvg } from './ridgeSvg'
import type { Mountain } from '../types/mountain'

// only fills in what buildRidgeSvg actually reads, rest is padding to satisfy the type
function makeMountain(overrides: Partial<Mountain> = {}): Mountain {
  return {
    id: 'test-peak',
    name: 'Test Peak',
    elevation: 4000,
    country: 'Testland',
    flag: '🏔️',
    continent: 'Europe',
    range: 'Test Range',
    lat: 0,
    lng: 0,
    ...overrides,
  }
}

describe('buildRidgeSvg', () => {
  it('is deterministic for the same mountain id', () => {
    const a = buildRidgeSvg(makeMountain())
    const b = buildRidgeSvg(makeMountain())
    expect(a.path).toBe(b.path)
  })

  it('draws different ridges for different ids', () => {
    const a = buildRidgeSvg(makeMountain({ id: 'peak-a' }))
    const b = buildRidgeSvg(makeMountain({ id: 'peak-b' }))
    expect(a.path).not.toBe(b.path)
  })

  it('only shows the world reference line when this peak is not the record holder', () => {
    const everest = buildRidgeSvg(makeMountain({ id: 'everest', elevation: 8849 }))
    const kilimanjaro = buildRidgeSvg(makeMountain({ id: 'kilimanjaro', elevation: 5895 }))
    expect(everest.worldLineY).toBeNull()
    expect(kilimanjaro.worldLineY).not.toBeNull()
  })

  it('only shows the country reference line when a higher in-country peak is given', () => {
    const belowCountryMax = buildRidgeSvg(makeMountain({ elevation: 3000 }), {
      countryMaxElevation: 4500,
    })
    const isCountryHighPoint = buildRidgeSvg(makeMountain({ elevation: 4500 }), {
      countryMaxElevation: 4500,
    })
    expect(belowCountryMax.countryLineY).not.toBeNull()
    expect(isCountryHighPoint.countryLineY).toBeNull()
  })

  it('keeps the ridge path inside the viewBox bounds', () => {
    const { path } = buildRidgeSvg(makeMountain({ elevation: 8849 }))
    const numbers = path.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? []
    expect(Math.max(...numbers)).toBeLessThanOrEqual(160)
    expect(Math.min(...numbers)).toBeGreaterThanOrEqual(0)
  })
})