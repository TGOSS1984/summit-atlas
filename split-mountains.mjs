// One-off migration script: splits src/data/mountains.ts (one giant
// MOUNTAINS array) into src/data/mountains/<continent>.ts files plus an
// index.ts that re-exports the combined array. Run once with:
//   node split-mountains.mjs
// from the repo root, then delete the old mountains.ts and update the one
// import site (src/data/mountains.ts is imported all over - see note at
// the bottom of this script's output for what changes).
//
// Why: mountains.ts hit "expression produces a union type that is too
// complex to represent" - a real TypeScript checker limit on very large
// array literals, not a bug in the data. Splitting by continent sidesteps
// it (each file's array is small enough to type-check independently) and
// is more navigable at ~1,300+ entries regardless.

import fs from 'node:fs'
import path from 'node:path'

const SRC = path.resolve('src/data/mountains.ts')
const OUT_DIR = path.resolve('src/data/mountains')

const raw = fs.readFileSync(SRC, 'utf8')

// find the array literal body between "MOUNTAINS: Mountain[] = [" and the
// matching closing "]" at the end of the file
const startMarker = raw.indexOf('MOUNTAINS')
const openBracket = raw.indexOf('[', startMarker)
const body = raw.slice(openBracket + 1, raw.lastIndexOf(']'))

// split into top-level object blocks by brace depth, not regex - handles
// nested braces/strings safely regardless of formatting quirks
function splitObjects(text) {
  const blocks = []
  let depth = 0
  let start = -1
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '{') {
      if (depth === 0) start = i
      depth++
    } else if (ch === '}') {
      depth--
      if (depth === 0 && start !== -1) {
        blocks.push(text.slice(start, i + 1))
        start = -1
      }
    }
  }
  return blocks
}

const blocks = splitObjects(body)
console.log(`Found ${blocks.length} mountain entries`)

const CONTINENT_FILE = {
  Europe: 'europe',
  Asia: 'asia',
  'North America': 'north-america',
  'South America': 'south-america',
  Africa: 'africa',
  Australia: 'australia',
  Antarctica: 'antarctica',
}

const groups = {}
for (const block of blocks) {
  const m = block.match(/continent:\s*'([^']+)'/)
  const continent = m ? m[1] : null
  if (!continent || !CONTINENT_FILE[continent]) {
    console.warn('Unrecognised or missing continent, dumping to _unsorted:', block.slice(0, 60))
  }
  const key = continent && CONTINENT_FILE[continent] ? continent : '_unsorted'
  groups[key] = groups[key] || []
  groups[key].push(block)
}

fs.mkdirSync(OUT_DIR, { recursive: true })

const exportNames = []
for (const [continent, entries] of Object.entries(groups)) {
  const fileSlug = CONTINENT_FILE[continent] ?? 'unsorted'
  const varName =
    'MOUNTAINS_' +
    fileSlug.toUpperCase().replace(/-/g, '_')
  exportNames.push(varName)

  const content =
    `import type { Mountain } from '../../types/mountain'\n\n` +
    `export const ${varName}: Mountain[] = [\n` +
    entries.map((e) => '  ' + e + ',').join('\n') +
    `\n]\n`

  const outPath = path.join(OUT_DIR, `${fileSlug}.ts`)
  fs.writeFileSync(outPath, content, 'utf8')
  console.log(`Wrote ${outPath} (${entries.length} entries)`)
}

const indexContent =
  Object.keys(groups)
    .map((continent) => {
      const fileSlug = CONTINENT_FILE[continent] ?? 'unsorted'
      const varName = 'MOUNTAINS_' + fileSlug.toUpperCase().replace(/-/g, '_')
      return `import { ${varName} } from './mountains/${fileSlug}'`
    })
    .join('\n') +
  `\nimport type { Mountain } from '../types/mountain'\n\n` +
  `export const MOUNTAINS: Mountain[] = [\n` +
  exportNames.map((n) => `  ...${n},`).join('\n') +
  `\n]\n`

fs.writeFileSync(path.resolve('src/data/mountains.new.ts'), indexContent, 'utf8')
console.log('\nWrote src/data/mountains.new.ts (the new combined index)')
console.log('\nNext steps:')
console.log('1. Check src/data/mountains/*.ts look right (spot-check a few entries)')
console.log('2. Delete the old src/data/mountains.ts')
console.log('3. Rename src/data/mountains.new.ts -> src/data/mountains.ts')
console.log('4. No import changes needed anywhere else - everything still imports')
console.log('   MOUNTAINS from \'../data/mountains\' exactly as before')
