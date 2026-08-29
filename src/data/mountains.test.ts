import { describe, expect, it } from 'vitest'
import { MOUNTAINS } from './mountains'

describe('MOUNTAINS dataset integrity', () => {
  it('has no duplicate ids', () => {
    const seen = new Map<string, number>()
    MOUNTAINS.forEach((m) => seen.set(m.id, (seen.get(m.id) ?? 0) + 1))
    const duplicates = [...seen.entries()].filter(([, count]) => count > 1)
    // failure message lists exactly which ids collided, rather than just
    // "expected true, got false" - this is the whole point of the test,
    // catching what happened with lords-seat/high-seat before it ships
    expect(duplicates, `Duplicate ids found: ${duplicates.map(([id]) => id).join(', ')}`).toEqual([])
  })
})