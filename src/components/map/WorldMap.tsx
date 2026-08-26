import { useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { MOUNTAINS } from '../../data/mountains'
import { TEMP_CLIMBED_IDS } from '../../data/tempClimbedIds'
import { COLLECTIONS_BY_MOUNTAIN } from '../../data/collectionsByMountain'
import { formatElevation } from '../../utils/units'
import { useTheme } from '../../context/ThemeContext'
import { MountainDetailModal } from '../mountain/MountainDetailModal'
import type { Mountain } from '../../types/mountain'
import styles from './WorldMap.module.css'

const TILE_URLS = {
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
}

const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'

function resolveToken(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

export function WorldMap() {
  const { theme } = useTheme()
  const [selectedMountain, setSelectedMountain] = useState<Mountain | null>(null)
  const climbedColor = resolveToken('--green')
  const unclimbedColor = resolveToken('--text-tertiary')

  return (
    <div className={styles.mapWrapper}>
      <MapContainer center={[20, 10]} zoom={2} minZoom={2} className={styles.map} worldCopyJump>
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
                <br />
                {/* Leaflet's popup DOM sits outside our normal render tree - inline
                    style here rather than wiring up a CSS module class for one button */}
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

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.dotClimbed}`} /> Climbed
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.dotUnclimbed}`} /> Unclimbed
        </span>
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