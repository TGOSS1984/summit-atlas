import type { Collection } from '../types/collection'

// only fleshing out enough peakIds to prove the shape works - the 8000ers
// list is now complete since commit 14 added the other 11. alpine-classics
// stays a curated pick rather than a fixed real-world list. not touching a
// UK collection here, that's its own commit once ben-nevis has company
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
    peakIds: [
      'everest',
      'k2',
      'kangchenjunga',
      'lhotse',
      'makalu',
      'cho-oyu',
      'dhaulagiri',
      'manaslu',
      'nanga-parbat',
      'annapurna-i',
      'gasherbrum-i',
      'broad-peak',
      'gasherbrum-ii',
      'shishapangma',
    ],
  },
  {
    id: 'alpine-classics',
    name: 'Alpine Classics',
    tagline: 'Iconic peaks of the European Alps',
    colorToken: 'green',
    peakIds: ['mont-blanc', 'matterhorn', 'eiger'],
  },
]