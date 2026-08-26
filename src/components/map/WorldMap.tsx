import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { MOUNTAINS } from '../../data/mountains'
import { TEMP_CLIMBED_IDS } from '../../data/tempClimbedIds'
import { formatElevation } from '../../utils/units'
import { useTheme } from '../../context/ThemeContext'
import styles from './WorldMap.module.css'

// CARTO basemaps - free with attribution, and they ship matching light/dark
// variants which is the whole reason they're here over stock OSM tiles
const TILE_URLS = {
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
}

const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'

// Leaflet sets marker colours as SVG presentation attributes, not through the
// DOM style cascade - var(--token) doesn't reliably resolve there, so read
// the actual computed value off :root instead. Cheap enough at this marker
// count, and it picks up theme changes for free since the component re-renders.
function resolveToken(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

export function WorldMap() {
  const { theme } = useTheme()
  const climbedColor = resolveToken('--green')
  const unclimbedColor = resolveToken('--text-tertiary')

  return (
    <div className={styles.mapWrapper}>
      <MapContainer center={[20, 10]} zoom={2} minZoom={2} className={styles.map} worldCopyJump>
        {/* key={theme} forces a clean remount on toggle instead of fighting
            Leaflet's own tile caching by swapping the url prop in place */}
        <TileLayer key={theme} url={TILE_URLS[theme]} attribution={TILE_ATTRIBUTION} />

        {MOUNTAINS.map((mountain) => {
          const climbed = TEMP_CLIMBED_IDS.has(mountain.id)
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
              }}
            >
              <Popup>
                <strong>
                  {mountain.flag} {mountain.name}
                </strong>
                <br />
                {formatElevation(mountain.elevation, 'm')} · {mountain.country}
                {/* TODO: link into the mountain detail */}
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.dotClimbed}`} /> Climbed
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.dotUnclimbed}`} /> Unclimbed
        </span>
      </div>
    </div>
  )
}