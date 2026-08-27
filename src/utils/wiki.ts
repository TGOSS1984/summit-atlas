import type { WikiExtract } from '../types/wiki'

// eager: true pulls every cached file in at build time rather than lazily -
// there's only ~160 of these so the bundle cost is trivial
const modules = import.meta.glob('../data/wiki-cache/mountains/*.json', { eager: true })

const WIKI_EXTRACTS: Record<string, WikiExtract> = {}

for (const path in modules) {
  const id = path.split('/').pop()?.replace('.json', '')
  if (id) {
    WIKI_EXTRACTS[id] = (modules[path] as { default: WikiExtract }).default
  }
}

export function getWikiExtract(mountainId: string): WikiExtract | undefined {
  return WIKI_EXTRACTS[mountainId]
}