import type { Collection } from '../types/collection'


export const COLLECTIONS: Collection[] = [
  {
    id: 'seven-summits',
    name: 'Seven Summits',
    tagline: 'The highest peak on each continent',
    colorToken: 'accent',
    peakIds: [
      'everest',
      'aconcagua',
      'denali',
      'kilimanjaro',
      'elbrus',
      'vinson',
      'puncak-jaya',
    ],
  },
  {
    id: 'eight-thousanders',
    name: 'Eight-Thousanders',
    tagline: 'The 14 peaks above 8,000 metres',
    colorToken: 'ice',
    peakIds: ['everest', 'k2', 'kangchenjunga'],
  },
  {
    id: 'alpine-classics',
    name: 'Alpine Classics',
    tagline: 'Iconic peaks of the European Alps',
    colorToken: 'green',
    peakIds: ['mont-blanc', 'matterhorn', 'eiger'],
  },
]