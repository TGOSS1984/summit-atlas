import { useState, type FormEvent } from 'react'
import type { Continent } from '../../types/mountain'
import { COUNTRIES, countryFlag } from '../../data/countries'
import { useCustomPeaks } from '../../context/CustomPeaksContext'
import { Modal } from '../common/Modal'
import styles from './AddPeakModal.module.css'

interface AddPeakModalProps {
  onClose: () => void
}

// mirrors the Continent union in types/mountain.ts - that union barely
// changes, so a plain runtime list here is simpler than deriving one
const CONTINENTS: Continent[] = [
  'Africa',
  'Antarctica',
  'Asia',
  'Australia',
  'Europe',
  'North America',
  'South America',
]

export function AddPeakModal({ onClose }: AddPeakModalProps) {
  const { addPeak } = useCustomPeaks()
  const [name, setName] = useState('')
  const [elevation, setElevation] = useState('')
  const [continent, setContinent] = useState<Continent>('Europe')
  const [countryCode, setCountryCode] = useState('')
  const [range, setRange] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Give it a name first.')
      return
    }

    const country = COUNTRIES.find((c) => c.code === countryCode)
    if (!country) {
      setError('Pick a country.')
      return
    }

    const elevationValue = Number(elevation)
    if (!elevation.trim() || Number.isNaN(elevationValue) || elevationValue <= 0) {
      setError('Elevation needs to be a real number, in metres.')
      return
    }

    const parsedLat = lat.trim() ? Number(lat) : undefined
    const parsedLng = lng.trim() ? Number(lng) : undefined
    if (
      (parsedLat !== undefined && Number.isNaN(parsedLat)) ||
      (parsedLng !== undefined && Number.isNaN(parsedLng))
    ) {
      setError('Coordinates need to be numbers, or just leave them blank.')
      return
    }

    addPeak({
      name: trimmedName,
      elevation: elevationValue,
      continent,
      country: country.name,
      flag: countryFlag(country.code),
      range,
      lat: parsedLat,
      lng: parsedLng,
    })

    onClose()
  }

  return (
    <Modal onClose={onClose}>
      <h2 className={styles.title}>Add your own peak</h2>
      <p className={styles.subtitle}>
        {
          "Climbed something that's not in the curated set? Add it here and it'll show up in Explore, the map and your dashboard right alongside everything else — saved to this device only."
        }
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.field}>
          <span className={styles.label}>Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            placeholder="e.g. Sgurr Dubh Mor"
          />
        </label>

        <div className={styles.row}>
          <label className={styles.field}>
            <span className={styles.label}>Elevation (m)</span>
            <input
              type="number"
              value={elevation}
              onChange={(e) => setElevation(e.target.value)}
              className={styles.input}
              placeholder="944"
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Continent</span>
            <select
              value={continent}
              onChange={(e) => setContinent(e.target.value as Continent)}
              className={styles.input}
            >
              {CONTINENTS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className={styles.field}>
          <span className={styles.label}>Country</span>
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className={styles.input}
          >
            <option value="">Select a country...</option>
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {countryFlag(country.code)} {country.name}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Range (optional)</span>
          <input
            type="text"
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className={styles.input}
            placeholder="e.g. Black Cuillin"
          />
        </label>

        <div className={styles.row}>
          <label className={styles.field}>
            <span className={styles.label}>Latitude (optional)</span>
            <input
              type="text"
              inputMode="decimal"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className={styles.input}
              placeholder="57.1927"
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Longitude (optional)</span>
            <input
              type="text"
              inputMode="decimal"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className={styles.input}
              placeholder="-6.2419"
            />
          </label>
        </div>

        <p className={styles.coordTip}>
          Tip: right-click a spot on Google Maps and the coordinates it copies paste straight into
          those two fields.
        </p>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.submitButton}>
          Add peak
        </button>
      </form>
    </Modal>
  )
}