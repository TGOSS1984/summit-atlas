import { describe, expect, it } from 'vitest'
import { addClimb, removeClimb, getClimbedIds, isValidClimbsState } from './climbs'

describe('addClimb', () => {
  it('adds a climb and keeps entries sorted newest-first', () => {
    let state = addClimb({}, 'everest', { date: '2020-05-01' })
    state = addClimb(state, 'everest', { date: '2023-05-01' })
    expect(state.everest.map((c) => c.date)).toEqual(['2023-05-01', '2020-05-01'])
  })

  it("doesn't mutate the original state", () => {
    const original = {}
    addClimb(original, 'everest', { date: '2020-05-01' })
    expect(original).toEqual({})
  })
})

describe('removeClimb', () => {
  it('removes the entry at the given index', () => {
    const state = { everest: [{ date: '2020-05-01' }, { date: '2023-05-01' }] }
    const result = removeClimb(state, 'everest', 0)
    expect(result.everest).toEqual([{ date: '2023-05-01' }])
  })

  it('drops the mountain key entirely once its last climb is removed', () => {
    const state = { everest: [{ date: '2020-05-01' }] }
    const result = removeClimb(state, 'everest', 0)
    expect('everest' in result).toBe(false)
  })
})

describe('getClimbedIds', () => {
  it('returns one id per mountain with at least one climb', () => {
    const state = { everest: [{ date: '2020-05-01' }], k2: [{ date: '2021-05-01' }] }
    expect(getClimbedIds(state)).toEqual(new Set(['everest', 'k2']))
  })
})

describe('isValidClimbsState', () => {
  it('accepts a well-formed climbs object', () => {
    expect(isValidClimbsState({ everest: [{ date: '2020-05-01', note: 'great day' }] })).toBe(true)
  })

  it('accepts an empty object', () => {
    expect(isValidClimbsState({})).toBe(true)
  })

  it('rejects arrays, null, and non-objects', () => {
    expect(isValidClimbsState([])).toBe(false)
    expect(isValidClimbsState(null)).toBe(false)
    expect(isValidClimbsState('nope')).toBe(false)
  })

  it('rejects malformed climb entries', () => {
    expect(isValidClimbsState({ everest: [{ note: 'missing date' }] })).toBe(false)
    expect(isValidClimbsState({ everest: 'not an array' })).toBe(false)
  })
})