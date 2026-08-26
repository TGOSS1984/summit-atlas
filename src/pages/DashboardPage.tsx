import { MOUNTAINS } from '../data/mountains'
import { COLLECTIONS } from '../data/collections'
import { formatElevation } from '../utils/units'
import {
  getCollectionProgress,
  getContinentsClimbedCount,
  getCountriesClimbedCount,
  getHighestClimbed,
  getTotalElevationClimbed,
} from '../utils/dashboardStats'
import { StatCard } from '../components/dashboard/StatCard'
import { CollectionRing } from '../components/dashboard/CollectionRing'
import styles from './DashboardPage.module.css'


const CLIMBED_IDS = new Set(['ben-nevis', 'kilimanjaro', 'mont-blanc'])

export function DashboardPage() {
  const highest = getHighestClimbed(MOUNTAINS, CLIMBED_IDS)
  const totalElevation = getTotalElevationClimbed(MOUNTAINS, CLIMBED_IDS)
  const countries = getCountriesClimbedCount(MOUNTAINS, CLIMBED_IDS)
  const continents = getContinentsClimbedCount(MOUNTAINS, CLIMBED_IDS)

  return (
    <div>
      <h1>Dashboard</h1>

      <div className={styles.statGrid}>
        <StatCard
          label="Peaks climbed"
          value={CLIMBED_IDS.size}
          sublabel={`of ${MOUNTAINS.length} tracked`}
        />
        <StatCard
          label="Highest climbed"
          value={highest ? formatElevation(highest.elevation, 'm') : '—'}
          sublabel={highest?.name ?? 'nothing logged yet'}
        />
        <StatCard label="Combined elevation" value={formatElevation(totalElevation, 'm')} />
        <StatCard label="Countries" value={countries} />
        <StatCard label="Continents" value={continents} sublabel="of 7" />
      </div>

      <h2 className={styles.sectionTitle}>Collections</h2>
      <div className={styles.ringGrid}>
        {COLLECTIONS.map((collection) => {
          const { climbed } = getCollectionProgress(collection, CLIMBED_IDS)
          return <CollectionRing key={collection.id} collection={collection} climbedCount={climbed} />
        })}
      </div>
    </div>
  )
}