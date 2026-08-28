// pulls a short wikipedia summary for each collection that maps to a real
// wikipedia topic and caches it to json, same approach as
// fetch-wiki-mountains.ts. not every collection has one - alpine-classics
// and welsh-mountains are curated groupings rather than a single named
// wikipedia topic, so those are just skipped (collection.wikipediaTitle
// being unset is the signal to skip, not an error)
import { writeFile, mkdir, access } from 'node:fs/promises'
import { join } from 'node:path'
import { COLLECTIONS } from '../src/data/collections'
import type { WikiExtract } from '../src/types/wiki'

const OUTPUT_DIR = join(process.cwd(), 'src/data/wiki-cache/collections')
const REQUEST_DELAY_MS = 800
const MAX_RETRIES = 4

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function fetchSummary(
  title: string,
  attempt = 1,
): Promise<WikiExtract | 'not-found' | null> {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'summit-atlas (personal project, non-commercial)' },
  })

  if (res.status === 429) {
    if (attempt > MAX_RETRIES) {
      console.warn(`  giving up on "${title}" after ${MAX_RETRIES} retries (still rate-limited)`)
      return null
    }
    const retryAfter = res.headers.get('retry-after')
    const waitMs = retryAfter ? Number(retryAfter) * 1000 : attempt * 3000
    console.warn(
      `  rate-limited on "${title}" - waiting ${Math.round(waitMs / 1000)}s (attempt ${attempt})`,
    )
    await sleep(waitMs)
    return fetchSummary(title, attempt + 1)
  }

  if (res.status === 404) {
    console.warn(`  not found: "${title}"`)
    return 'not-found'
  }

  if (!res.ok) {
    console.warn(`  skipped "${title}" - wikipedia returned ${res.status}`)
    return null
  }

  const data = await res.json()

  return {
    title: data.title,
    extract: data.extract,
    thumbnail: data.thumbnail?.source,
    url:
      data.content_urls?.desktop?.page ??
      `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    fetchedAt: new Date().toISOString(),
  }
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true })

  let fetched = 0
  let alreadyCached = 0
  let skippedNoTopic = 0
  let failed = 0

  for (const collection of COLLECTIONS) {
    if (!collection.wikipediaTitle) {
      skippedNoTopic++
      continue
    }

    const outputPath = join(OUTPUT_DIR, `${collection.id}.json`)

    if (await fileExists(outputPath)) {
      alreadyCached++
      continue
    }

    console.log(`fetching "${collection.wikipediaTitle}"...`)

    const result = await fetchSummary(collection.wikipediaTitle)

    if (!result || result === 'not-found') {
      failed++
      await sleep(REQUEST_DELAY_MS)
      continue
    }

    await writeFile(outputPath, JSON.stringify(result, null, 2))
    fetched++
    await sleep(REQUEST_DELAY_MS)
  }

  console.log(
    `\ndone - ${fetched} fetched, ${alreadyCached} already cached, ${skippedNoTopic} skipped (no wikipediaTitle), ${failed} failed`,
  )
  if (failed > 0) {
    console.log("re-run the script to retry anything that failed - it skips what's already cached")
  }
}

main()