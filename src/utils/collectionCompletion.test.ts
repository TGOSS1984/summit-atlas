import { describe, expect, it } from 'vitest'
import type { Collection } from '../types/collection'
import { getCompletedCollectionIds } from './collectionCompletion'

const COLLECTIONS: Collection[] = [
  { id: 'full', name: 'Full', tagline: '', colorToken: 'accent', peakIds: ['a', 'b'] },
  { id: 'partial', name: 'Partial', tagline: '', colorToken: 'green', peakIds: ['c', 'd'] },
  { id: 'empty', name: 'Empty', tagline: '', colorToken: 'gold', peakIds: [] },
]

describe('getCompletedCollectionIds', () => {
  it('flags a collection where every peak is climbed', () => {
    const climbed = new Set(['a', 'b', 'c'])
    expect(getCompletedCollectionIds(COLLECTIONS, climbed)).toEqual(new Set(['full']))
  })

  it('does not flag a partially-climbed collection', () => {
    const climbed = new Set(['a'])
    expect(getCompletedCollectionIds(COLLECTIONS, climbed).has('full')).toBe(false)
  })

  it('never flags a collection with no peaks, even with nothing climbed', () => {
    const climbed = new Set<string>()
    expect(getCompletedCollectionIds(COLLECTIONS, climbed).has('empty')).toBe(false)
  })

  it('returns an empty set with nothing climbed', () => {
    expect(getCompletedCollectionIds(COLLECTIONS, new Set())).toEqual(new Set())
  })
})