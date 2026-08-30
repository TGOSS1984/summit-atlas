import type { PeakShape, AccentGlyph } from '../components/lists/CollectionIcon'

interface CollectionIconSpec {
  peaks: PeakShape
  accent: AccentGlyph
  color: string
}

export const COLLECTION_ICONS: Record<string, CollectionIconSpec> = {
  'seven-summits': { peaks: 'single', accent: 'globe', color: '#4A6FA5' },
  'eight-thousanders': { peaks: 'single', accent: 'snow', color: '#7FB8D9' },
  'alpine-classics': { peaks: 'twin', accent: 'star', color: '#4A8B6F' },
  wainwrights: { peaks: 'single', accent: 'pen', color: '#A67C52' },
  'scottish-munros': { peaks: 'single', accent: 'thistle', color: '#8B6BB5' },
  'welsh-mountains': { peaks: 'single', accent: 'chevron', color: '#C94F3D' },
  'peak-district': { peaks: 'single', accent: 'ring', color: '#8C7B6B' },
  'yorkshire-dales': { peaks: 'triple', accent: 'none', color: '#6FA85E' },
  'ireland-highest': { peaks: 'single', accent: 'shamrock', color: '#3D9B6B' },
  'north-america-highest': { peaks: 'single', accent: 'star', color: '#3A5A8C' },
  'mainland-europe': { peaks: 'twin', accent: 'compass', color: '#4A6FA5' },
  'south-america-highest': { peaks: 'single', accent: 'chevron', color: '#C16B3E' },
  'asia-highest': { peaks: 'single', accent: 'bunting', color: '#E0A040' },
  'volcanic-seven-summits': { peaks: 'volcano', accent: 'flame', color: '#E85D3D' },
  'cascade-volcanoes': { peaks: 'volcano', accent: 'snow', color: '#5FA8A0' },
  'andes-patagonia': { peaks: 'twin', accent: 'chevron', color: '#6F91A8' },
  'country-high-points': { peaks: 'single', accent: 'flag', color: '#3D8B8B' },
  'us-high-points': { peaks: 'single', accent: 'flag', color: '#3A5A8C' },
  'nh-4000-footers': { peaks: 'single', accent: 'tick', color: '#C77B3D' },
  'adirondack-46': { peaks: 'triple', accent: 'tick', color: '#3D6B4A' },
  hyakumeizan: { peaks: 'single', accent: 'torii', color: '#C0392B' },
  'new-zealand-classics': { peaks: 'twin', accent: 'fern', color: '#5A9E4A' },
  'australia-pacific': { peaks: 'single', accent: 'wave', color: '#4AAFA0' },
  'canada-classics': { peaks: 'single', accent: 'leaf', color: '#B5453A' },
  'southeast-asia': { peaks: 'volcano', accent: 'flame', color: '#D98A3D' },
  'colorado-14ers': { peaks: 'single', accent: 'star', color: '#D4A24B' },
}