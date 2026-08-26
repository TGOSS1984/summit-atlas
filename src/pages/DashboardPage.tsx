import { MOUNTAINS } from '../data/mountains'
import { COLLECTIONS } from '../data/collections'
import { useClimbs } from '../context/ClimbsContext'
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
import { DataControls } from '../components/dashboard/DataControls'
import styles from './DashboardPage.module.css'

export function DashboardPage() {
  const { climbedIds } = useClimbs()

  const highest = getHighestClimbed(MOUNTAINS, climbedIds)
  const totalElevation = getTotalElevationClimbed(MOUNTAINS, climbedIds)
  const countries = getCountriesClimbedCount(MOUNTAINS, climbedIds)
  const continents = getContinentsClimbedCount(MOUNTAINS, climbedIds)

  return (
    <div>
      <h1>Dashboard</h1>

      <div className={styles.statGrid}>
        <StatCard
          label="Peaks climbed"
          value={climbedIds.size}
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
          const { climbed } = getCollectionProgress(collection, climbedIds)
          return <CollectionRing key={collection.id} collection={collection} climbedCount={climbed} />
        })}
      </div>

      <h2 className={styles.sectionTitle}>Your data</h2>
      <DataControls />
    </div>
  )
}