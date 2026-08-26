import { describe, expect, it } from 'vitest'
import type { Mountain } from '../types/mountain'
import type { Collection } from '../types/collection'
import { getCollectionMountains } from './collectionMountains'

const MOUNTAINS: Mountain[] = [
  { id: 'a', name: 'A', elevation: 1000, country: 'X', flag: '', continent: 'Europe', range: '', lat: 0, lng: 0 },
  { id: 'b', name: 'B', elevation: 3000, country: 'Y', flag: '', continent: 'Asia', range: '', lat: 0, lng: 0 },
]

describe('getCollectionMountains', () => {
  it('resolves peakIds to full Mountain objects, tallest first', () => {
    const collection: Collection = {
      id: 'test',
      name: 'Test',
      tagline: '',
      colorToken: 'accent',
      peakIds: ['a', 'b'],
    }
    const result = getCollectionMountains(collection, MOUNTAINS)
    expect(result.map((m) => m.id)).toEqual(['b', 'a'])
  })

  it('drops peakIds that are not in the dataset yet', () => {
    const collection: Collection = {
      id: 'test',
      name: 'Test',
      tagline: '',
      colorToken: 'accent',
      peakIds: ['a', 'missing-peak'],
    }
    const result = getCollectionMountains(collection, MOUNTAINS)
    expect(result.map((m) => m.id)).toEqual(['a'])
  })
})