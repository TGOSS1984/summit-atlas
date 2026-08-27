// pulls a short wikipedia summary for every mountain in the dataset and
// caches it to json so the app never has to hit wikipedia at runtime.
// run this manually (npm run fetch-wiki:mountains) whenever the mountain
// list changes, then commit the updated cache files
//
// wikipedia's rest api rate-limits fairly aggressively if you hit it in a
// tight loop - this skips anything already cached (so a re-run only fetches
// what's missing) and retries 429s with backoff rather than just giving up
import { writeFile, mkdir, access } from 'node:fs/promises'
import { join } from 'node:path'
import { MOUNTAINS } from '../src/data/mountains'
import type { WikiExtract } from '../src/types/wiki'

const OUTPUT_DIR = join(process.cwd(), 'src/data/wiki-cache/mountains')
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
    // wikipedia doesn't always send Retry-After on this endpoint, so fall
    // back to a growing wait when it's missing
    const retryAfter = res.headers.get('retry-after')
    const waitMs = retryAfter ? Number(retryAfter) * 1000 : attempt * 3000
    console.warn(
      `  rate-limited on "${title}" - waiting ${Math.round(waitMs / 1000)}s (attempt ${attempt})`,
    )
    await sleep(waitMs)
    return fetchSummary(title, attempt + 1)
  }

  if (res.status === 404) {
    console.warn(`  not found: "${title}" - needs a wikipediaTitle override in mountains.ts`)
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
  let failed = 0

  for (const mountain of MOUNTAINS) {
    const outputPath = join(OUTPUT_DIR, `${mountain.id}.json`)

    if (await fileExists(outputPath)) {
      alreadyCached++
      continue
    }

    const title = mountain.wikipediaTitle ?? mountain.name
    console.log(`fetching "${title}"...`)

    const result = await fetchSummary(title)

    if (!result || result === 'not-found') {
      failed++
      await sleep(REQUEST_DELAY_MS)
      continue
    }

    await writeFile(outputPath, JSON.stringify(result, null, 2))
    fetched++
    await sleep(REQUEST_DELAY_MS)
  }

  console.log(`\ndone - ${fetched} fetched, ${alreadyCached} already cached, ${failed} failed`)
  if (failed > 0) {
    console.log("re-run the script to retry anything that failed - it skips what's already cached")
  }
}

main()