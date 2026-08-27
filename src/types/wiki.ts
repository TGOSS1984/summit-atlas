// shape of what fetch-wiki-mountains.ts writes into src/data/wiki-cache/ -
// one json file per entry, named by id
export interface WikiExtract {
  title: string
  extract: string
  thumbnail?: string
  url: string
  fetchedAt: string
}