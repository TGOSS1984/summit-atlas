# Summit Atlas

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&labelColor=13232B)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&labelColor=13232B)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white&labelColor=13232B)](https://vitejs.dev)
[![Leaflet](https://img.shields.io/badge/Leaflet-map-199900?logo=leaflet&logoColor=white&labelColor=13232B)](https://leafletjs.com)
[![status](https://img.shields.io/badge/status-in%20development-E64833?labelColor=13232B)]()
[![license](https://img.shields.io/badge/license-TBD-lightgrey?labelColor=13232B)]()

An atlas of the world's summits. Track what you've climbed, browse curated lists (Seven Summits, every Munro, every Colorado 14er, national high points, and a lot more), and see it all on a map and a dashboard that actually feels good to look at.

This is the global follow-up to **Summit Log UK**, which did the same thing but just for the UK. Wanted the same feel — track your climbs, see your progress, browse real curated lists — but for anywhere in the world.

<!-- NOTE TO SELF: swap these in once the new logo's bedded in everywhere and
     the dashboard has some real data in it, not the demo set. dark theme
     first, then light, then the Lists modal (it's the best-looking screen
     right now), then a mobile shot -->

## Screenshots

**Dashboard**
`[ screenshot here ]`

**Explore**
`[ screenshot here ]`

**Lists**
`[ screenshot here ]`

**Map**
`[ screenshot here ]`

---

## What's actually in here

- **Dashboard** — peaks climbed, highest climbed, combined elevation, countries/continents count, a hero stat with a stupid-but-fun "X× the height of Everest stacked end to end" line, climbs-per-year chart, altitude band breakdown, and a full ascent timeline
- **Explore** — every mountain in the dataset, searchable, filterable by continent/country/collection/climbed-status, sortable (A–Z or by elevation), paginated
- **Map** — every plotted mountain on a Leaflet world map, filterable by collection/continent/country, climbed peaks glow, unclimbed don't
- **Lists** — 27 curated collections (Seven Summits, all 14 eight-thousanders, full Wainwrights/Munros/Welsh Nuttalls, Colorado's 58 14ers, national high points for ~140 countries, all 50 US state high points, and quite a few more) — click one and it opens as a proper modal with progress stats, not a scroll-down page
- **Mountain detail** — full stats, a Wikipedia-sourced description where one exists, which collections it belongs to, and a log-a-climb form (multiple ascents supported)
- **Add your own peak** — private, client-side only, never touches the curated dataset or gets linked into a collection
- **Demo data** — randomly generated each time you load it, not a fixed static set, so it doesn't look the same (or stay looking sparse) forever
- **Export/import** your data as JSON, m/ft toggle, dark/light theme toggle, all persisted
- **Sign in with Google (optional)** — syncs your climbs and custom peaks to Firestore so they follow you across devices. Fully optional; the app's `localStorage`-only behavior is unchanged if you never sign in, and unchanged again if you never set up a Firebase project at all

## Dataset

Last time I actually counted, somewhere north of 2,700 named peaks across all 7 continents. Started at about 700, expanded a *lot* over time — full canonical Wainwrights (214), full Munros (282), Welsh Nuttalls (188), the actual complete Colorado 14ers (58, not just whichever ones happened to rank in North America's overall top 100), plus deep sweeps against peakbook's own dataset region by region to catch what was missing.

Split into `src/data/mountains/<continent>.ts` files rather than one giant file — hit a real TypeScript compiler limit ("expression produces a union type that is too complex to represent") once the single array got past ~1,350 entries in one literal. Splitting by continent fixed it and is just more navigable anyway. There's a migration script (`split-mountains.mjs`) in the repo root from when I did that split, kept around in case the same problem ever comes back.

Collections live in `src/data/collections.ts` — each one is just `{ id, name, tagline, colorToken, peakIds, wikipediaTitle? }`. Some (Wainwrights, Munros, national high points) are complete real-world lists. A couple (Alpine Classics, Welsh Mountains) are curated groupings of mine rather than one official named list — no `wikipediaTitle` on those on purpose, didn't want to guess at a topic and pull in misleading content.

## Tech stack

- **React 18 + TypeScript + Vite.** Went with React 18 over 19 to keep peer-dependency risk down against react-leaflet/react-router — wasn't worth the risk for whatever 19 offers on a solo project.
- **Plain CSS + custom properties, no Tailwind, no styled-components.** Every color and font is a `var(--token)`, never a hardcoded value in a component. Means changing the whole palette or type pairing later is a one-file edit to `tokens.css`, not a re-implementation. Three known exceptions where this breaks down, all documented inline where they happen: Leaflet paints marker colors as raw SVG attributes rather than through the DOM style cascade, so the map page has to resolve the computed token value in JS instead; favicon/app-icon files plus the `theme-color` meta tag are outside the CSS cascade entirely, so those hardcode hex values directly; and the Google sign-in button is a fixed light pill per Google's own brand guidelines regardless of app theme.
- **react-leaflet + Leaflet** for the map. Tiles are CARTO's Positron/Dark Matter basemaps.
- **react-router-dom** for routing.
- **firebase (optional)** — Google sign-in + Firestore, purely additive. With no config set the app behaves exactly as before, everything on `localStorage`. See Getting started below.
- **Vitest** for tests — mostly pure-function utilities (ridge/stat/filter logic) plus one important one: a duplicate-id guard on the whole `MOUNTAINS` dataset (see Known Issues below for why that exists).
- **tsx** as a dev dependency, used to run the two Wikipedia-fetch scripts directly without a separate compile step.

## Design

- **Themes:** Deep Vintage (dark, default) and Summit Light. Both sit in the same warm orange-red accent family on purpose, so the brand doesn't jump to a totally different hue when you toggle.
- **Type:** "Alpine Classic" pairing — Fraunces for display/headings, Inter for UI/body. Same pairing peakbook itself uses, which I kept because it genuinely suits the subject, not to copy them.
- **Logo:** illustrated mountain-and-globe mark with a summit flag. Renders as a full illustrated badge for the favicon/app icon, and a transparent-background version (background rect stripped out) everywhere it sits inline in the UI.
- **Collection icons:** each of the 27 collections gets its own small mark — a parametrized system (peak-shape + accent-glyph, e.g. a thistle for the Munros, a torii gate for Hyakumeizan) rather than 27 one-off hand-drawn SVGs. Cheaper to maintain and easy to extend when a new collection shows up. Each also has its own hex color rather than being locked to the 5 design tokens — with 27 collections, 5 colors wasn't enough variety.

## Getting started

```bash
git clone <repo-url>
cd summit-atlas
npm install
```

You'll need a free CARTO API key for the map tiles to render without a watermark (CARTO started requiring one on their basemap endpoints from 26 Aug 2026 — a genuinely recent change, not something I missed early on). Register at [carto.com/basemaps/apikey](https://carto.com/basemaps/apikey) — no card needed, just email + domain + a description, instant approval, 5,000,000 tiles/month free.

```bash
cp .env.example .env.local
# then paste your key into .env.local as VITE_CARTO_API_KEY=...
```

`.env.local` is gitignored — don't commit your key. The app still works without one, the map just shows CARTO's "API key required" watermark on the tiles.

Google sign-in and cloud sync are optional too — if you want them, add a Firebase project's config to the six `VITE_FIREBASE_*` vars in the same `.env.local` (see `.env.example` for exactly what's needed, including the Firestore security rule). Skip it and the sidebar's sign-in button just tells you it's not configured yet — everything else works the same, `localStorage`-only.

```bash
npm run dev
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | local dev server |
| `npm run build` | typecheck (`tsc --noEmit`) then production build |
| `npm test` | run the Vitest suite |
| `npm run fetch-wiki:mountains` | pulls Wikipedia summary extracts for every mountain that has one, caches to `src/data/wiki-cache/mountains/` |
| `npm run fetch-wiki:collections` | same, for collections with a real-world Wikipedia topic |

Both fetch scripts skip anything already cached, so re-running one only chases whatever's still missing rather than re-fetching everything. Worth knowing: **the wiki cache is way out of date right now** — it was built against the dataset as of commit 18 (163 mountains), and the dataset's grown by an order of magnitude since. Most peaks currently have no cached description. Re-running `fetch-wiki:mountains` is on the to-do list, just hasn't happened yet because it needs a couple of passes to get past Wikipedia's rate limiting (see below) and I haven't sat and watched it run.

## Known issues / stuff I hit and fixed along the way

Keeping this section honestly rather than pretending everything went smoothly, because some of these are worth remembering if they ever come back.

- **Duplicate mountain ids, twice.** Had two separate incidents where the same id got used for two different real mountains in two different batches (`lords-seat` used for both a Lake District fell and a Peak District one; `avalanche-peak` used for a Yukon peak in one North America batch and a New Zealand peak months later in a completely separate batch). Neither was caught until it showed up wrong on the actual Lists page. Fixed both, and — more importantly — added `src/data/mountains.test.ts`, a permanent Vitest guard that fails loudly and lists every duplicate id if it ever happens again. Should really have existed from the start.
- **TypeScript's union-type complexity limit.** Once `mountains.ts` grew past ~1,350 entries in a single array literal with an explicit `Mountain[]` type, `tsc` started throwing "expression produces a union type that is too complex to represent." Real compiler limitation, not a bug in the data. Fixed by splitting into per-continent files (see Dataset above).
- **CARTO started requiring an API key on their basemap tiles** on 26 Aug 2026, breaking the map with no code change on my end. Confirmed it was a genuine, days-old policy change via research rather than assuming I'd broken something. Went with the free-key route over switching to OSM tiles, mainly to keep the exact Positron/Dark Matter look.
- **Wikipedia's REST API rate-limits hard** on a tight request loop — most of a 163-mountain run came back `429` on the first pass. Fixed with a longer delay (800ms), retry-with-backoff respecting `Retry-After`, and having the script skip anything already cached so a re-run only chases what's missing.
- **SVG id collisions across multiple instances on one page.** Both the logo component and the collection icon system use `<defs>` with gradient/clipPath/filter ids. First version hardcoded those ids, which works fine for exactly one instance — but the sidebar logo and mobile top bar logo both exist in the DOM at once (one just hidden by CSS), and the Explore grid can have 24+ collection icons on screen simultaneously. All of them silently rendered using the *first* instance's coordinates. Fixed with `useId()`-based unique suffixes on every id. Worth remembering for any future SVG component with internal `<defs>`.
- **Two batches got described in chat but never actually landed in the data files.** The Cascade Volcanoes peaks (Adams, Baker, Glacier Peak, Jefferson, South Sister, Lassen) and three Andes & Patagonia peaks (Alpamayo, Cayambe, Torres del Paine) were referenced by their collections' `peakIds` but were just... missing from the actual mountain data, presumably lost somewhere in a big copy-paste. Only surfaced during a later full audit against peakbook's dataset. Restored both. Lesson: when a collection references a peak, that's not the same as confirming the peak actually made it into the file.
- **A slugify bug mangled accented names.** Early version of the id-generation script didn't strip diacritics before slugifying, so names like "Mönch" turned into ids like `m-nch` instead of `monch`. Caught before it shipped, but only because I happened to eyeball the generated ids — not from an automated check.
- **`<script>` tags don't execute when embedded in SVG via React/`dangerouslySetInnerHTML`.** Tried wiring in a self-contained procedurally-generated mountain SVG (had its whole generation algorithm as an inline `<script>`) directly into a card component. Browsers don't run scripts inserted via `innerHTML`, full stop — that's a security rule, not a React quirk. Had to port the entire generation algorithm into a real TS module that runs via `useMemo` and returns plain path/polygon data for JSX to render, instead of relying on the script executing itself.
- **Cloud sync has no debounce and no offline queue yet.** Every climb/custom-peak change writes straight to Firestore on its own `useEffect`, and if `setDoc` fails (offline, permissions) it just logs to the console rather than retrying or telling the person anything went wrong. Fine at this scale and this is a solo project's Firestore usage, but worth hardening if it ever needs to feel bulletproof.
- **A stray `position: relative` on a modal's hero section silently ate click events on the close button.** The hero rendered *after* the close button in the DOM and became a positioned box sitting on top of it. Looked completely fine visually — the X was right there — just didn't respond to clicks. Removed the unnecessary `position: relative` and gave the close button its own explicit `z-index` as a safety net so it can't happen again from some other future positioned element.

## Deploying

Not deployed anywhere yet — this section is "what's needed," not "here's the live URL."

**What you'll need set at the host level:**
- `VITE_CARTO_API_KEY` — same key as local dev. Without it the map still works, just with CARTO's watermark.
- `VITE_FIREBASE_*` (six vars, optional) — same Firebase config as local dev. Without them, sign-in and cloud sync just aren't offered; everything else is unaffected.

**Build command:** `npm run build` (runs `tsc --noEmit` first, so a broken build fails the deploy rather than shipping type errors).
**Output directory:** `dist/`
**Framework:** Vite — any static host that can run an npm build script works (Vercel, Netlify, Cloudflare Pages, etc.). No server-side code of my own anywhere, no API routes. Firestore is the one exception to "everything's client-side, `localStorage`-backed" — it's Google's managed backend, not something this repo runs, and it's entirely optional.

**Not done yet, worth doing before or shortly after a real deploy:**
- No `vercel.json`/`netlify.toml` or CI build check committed yet — that's still its own separate piece of work.
- No PWA manifest — favicon and apple-touch-icon are both sorted, but there's no `manifest.json`, so "Add to Home Screen" won't behave properly on Android (iOS is fine off `apple-touch-icon.png` alone).
- `theme-color` meta tag only responds to OS-level `prefers-color-scheme`, not the in-app manual toggle — minor, but means picking dark mode manually while your OS is set to light leaves the browser chrome the "wrong" color.
- Wiki cache is stale for the vast majority of the dataset (see Scripts above) — not a blocker for deploying, but worth knowing most mountain detail pages won't have a description yet.

## Credits

- **[peakbook](https://github.com/devesh-aggarwal/peakbook)** — feature and UX inspiration throughout, credited openly. Cloning the code or the copy was never the goal — this is its own React/TypeScript component architecture, its own visual system, its own written copy (mountain/collection descriptions come from Wikipedia, not from peakbook's text). Where I deliberately matched a specific technique closely (the mobile responsive breakpoint pattern, a couple of chart layouts), it's flagged at the time and reimplemented as my own code against my own files, not reused from theirs. A big chunk of the country-high-points and regional mountain data was also cross-referenced against peakbook's own dataset during a gap-filling sweep — real credit due there, they'd clearly put serious research into a lot of obscure entries.
- **Summit Log UK** — the sibling project this one extends globally.
- **[DoBIH](https://www.hills-database.co.uk/)** (Database of British and Irish Hills) — the authoritative source behind the full Wainwrights, Munros, Welsh Nuttalls, and other UK/Ireland hill data.
- **Wikipedia** — mountain and collection descriptions, used under Wikipedia's CC BY-SA terms. Full attribution and a "Read more on Wikipedia" link on every mountain/collection detail view that has one.

## License

MIT — see [LICENSE](./LICENSE).