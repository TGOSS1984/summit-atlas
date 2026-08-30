import { useMemo, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { MOUNTAINS } from '../../data/mountains'
import { COLLECTIONS } from '../../data/collections'
import { useClimbs } from '../../context/ClimbsContext'
import { useUnit } from '../../context/UnitContext'
import { useCustomPeaks } from '../../context/CustomPeaksContext'
import { COLLECTIONS_BY_MOUNTAIN } from '../../data/collectionsByMountain'
import { formatElevation } from '../../utils/units'
import { useTheme } from '../../context/ThemeContext'
import { MountainDetailModal } from '../mountain/MountainDetailModal'
import type { Mountain } from '../../types/mountain'
import styles from './WorldMap.module.css'

// CARTO started requiring a free API key on these raster endpoints from
// 26 Aug 2026 - see .env.example for where to get one. a missing key doesn't
// break the map, CARTO just stamps a "API key required" watermark on the
// tiles, but this console warning is a faster signal than squinting at the
// map trying to work out why it looks off
const CARTO_API_KEY = import.meta.env.VITE_CARTO_API_KEY

if (!CARTO_API_KEY) {
  console.warn(
    'VITE_CARTO_API_KEY is not set - map tiles will show a "API key required" watermark. See .env.example.',
  )
}

const TILE_URLS = {
  light: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY ?? ''}`,
  dark: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY ?? ''}`,
}

const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'

function resolveToken(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

export function WorldMap() {
  const { theme } = useTheme()
  const { climbedIds } = useClimbs()
  const { unit } = useUnit()
  const { customPeaks } = useCustomPeaks()
  const [selectedMountain, setSelectedMountain] = useState<Mountain | null>(null)
  // "map pagination" in Tom's shorthand - defaults to true (show everything)
  // to match the map's existing behaviour, unchecking narrows to climbed-only
  const [showUnclimbed, setShowUnclimbed] = useState(true)
  const [collectionFilter, setCollectionFilter] = useState<string | null>(null)
  const [continentFilter, setContinentFilter] = useState<string | null>(null)
  const [countryFilter, setCountryFilter] = useState<string | null>(null)
  const climbedColor = resolveToken('--green')
  const unclimbedColor = resolveToken('--text-tertiary')

  // custom peaks with no coordinates store NaN (see types/mountain.ts) -
  // nothing to plot for those, so they get filtered out here rather than in
  // CustomPeaksContext, which has no opinion on what each consumer does with them
  const plottableMountains = useMemo(
    () =>
      [...MOUNTAINS, ...customPeaks].filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lng)),
    [customPeaks],
  )

  const continentOptions = useMemo(
    () => Array.from(new Set(plottableMountains.map((m) => m.continent))).sort(),
    [plottableMountains],
  )

  // country list narrows to whatever continent is currently selected, so
  // picking "Asia" doesn't leave a hundred irrelevant countries in the list
  const countryOptions = useMemo(() => {
    const scoped = continentFilter
      ? plottableMountains.filter((m) => m.continent === continentFilter)
      : plottableMountains
    return Array.from(new Set(scoped.map((m) => m.country))).sort()
  }, [plottableMountains, continentFilter])

  // switching continent can strand a country selection that no longer
  // applies (e.g. "France" selected, then continent changed to "Asia") -
  // clear it rather than silently filtering to nothing with no visible cause
  function handleContinentChange(value: string) {
    setContinentFilter(value || null)
    setCountryFilter(null)
  }

  const activeCollection = collectionFilter ? COLLECTIONS.find((c) => c.id === collectionFilter) : null
  const collectionPeakIds = activeCollection ? new Set(activeCollection.peakIds) : null

  const visibleMountains = plottableMountains.filter((m) => {
    if (!showUnclimbed && !climbedIds.has(m.id)) return false
    if (collectionPeakIds && !collectionPeakIds.has(m.id)) return false
    if (continentFilter && m.continent !== continentFilter) return false
    if (countryFilter && m.country !== countryFilter) return false
    return true
  })

  return (
    <div>
      <div className={styles.mapFilters}>
        <select
          className={styles.filterSelect}
          value={collectionFilter ?? ''}
          onChange={(e) => setCollectionFilter(e.target.value || null)}
        >
          <option value="">All collections</option>
          {COLLECTIONS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={continentFilter ?? ''}
          onChange={(e) => handleContinentChange(e.target.value)}
        >
          <option value="">All continents</option>
          {continentOptions.map((continent) => (
            <option key={continent} value={continent}>
              {continent}
            </option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={countryFilter ?? ''}
          onChange={(e) => setCountryFilter(e.target.value || null)}
        >
          <option value="">All countries</option>
          {countryOptions.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.mapWrapper}>
        <MapContainer center={[20, 10]} zoom={2} minZoom={2} className={styles.map} worldCopyJump>
          <TileLayer key={theme} url={TILE_URLS[theme]} attribution={TILE_ATTRIBUTION} />

          {visibleMountains.map((mountain) => {
            const climbed = climbedIds.has(mountain.id)
            return (
              <CircleMarker
                key={mountain.id}
                center={[mountain.lat, mountain.lng]}
                radius={climbed ? 7 : 5}
                pathOptions={{
                  color: climbed ? climbedColor : unclimbedColor,
                  fillColor: climbed ? climbedColor : unclimbedColor,
                  fillOpacity: climbed ? 0.85 : 0.55,
                  weight: 1.5,
                  // glow only applies to climbed peaks - see .climbedMarker in
                  // WorldMap.module.css. className is a real Leaflet PathOptions
                  // field, gets set straight onto the marker's SVG element
                  className: climbed ? styles.climbedMarker : undefined,
                }}
              >
                <Popup>
                  <strong>
                    {mountain.flag} {mountain.name}
                  </strong>
                  <br />
                  {formatElevation(mountain.elevation, unit)} · {mountain.country}
                  <br />
                  <button
                    type="button"
                    onClick={() => setSelectedMountain(mountain)}
                    style={{
                      marginTop: 6,
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent)',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: 12,
                      padding: 0,
                    }}
                  >
                    View details
                  </button>
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>

        {/* top-right, not top-left - Leaflet's default zoom control already
            claims top-left, don't want this sitting on top of it. independent
            of the legend below - that one's staying put at bottom-left */}
        <label className={styles.showToggle}>
          <input
            type="checkbox"
            checked={showUnclimbed}
            onChange={(e) => setShowUnclimbed(e.target.checked)}
          />
          Show unclimbed peaks
        </label>

        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={`${styles.dot} ${styles.dotClimbed}`} /> Climbed
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.dot} ${styles.dotUnclimbed}`} /> Unclimbed
          </span>
        </div>
      </div>

      {selectedMountain && (
        <MountainDetailModal
          mountain={selectedMountain}
          collections={COLLECTIONS_BY_MOUNTAIN.get(selectedMountain.id) ?? []}
          onClose={() => setSelectedMountain(null)}
        />
      )}
    </div>
  )
}