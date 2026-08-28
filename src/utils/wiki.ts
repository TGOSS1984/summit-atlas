import type { WikiExtract } from '../types/wiki'

// eager: true pulls every cached file in at build time rather than lazily -
// there's only a couple hundred of these combined so the bundle cost is trivial
const mountainModules = import.meta.glob('../data/wiki-cache/mountains/*.json', { eager: true })
const collectionModules = import.meta.glob('../data/wiki-cache/collections/*.json', {
  eager: true,
})

function buildExtractMap(modules: Record<string, unknown>): Record<string, WikiExtract> {
  const map: Record<string, WikiExtract> = {}
  for (const path in modules) {
    const id = path.split('/').pop()?.replace('.json', '')
    if (id) {
      map[id] = (modules[path] as { default: WikiExtract }).default
    }
  }
  return map
}

const MOUNTAIN_WIKI_EXTRACTS = buildExtractMap(mountainModules)
const COLLECTION_WIKI_EXTRACTS = buildExtractMap(collectionModules)

export function getWikiExtract(mountainId: string): WikiExtract | undefined {
  return MOUNTAIN_WIKI_EXTRACTS[mountainId]
}

export function getCollectionWikiExtract(collectionId: string): WikiExtract | undefined {
  return COLLECTION_WIKI_EXTRACTS[collectionId]
}