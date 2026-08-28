import { useMemo } from 'react'
import { MOUNTAINS } from '../data/mountains'
import { COLLECTIONS } from '../data/collections'
import { useClimbs } from '../context/ClimbsContext'
import { useUnit } from '../context/UnitContext'
import { useCustomPeaks } from '../context/CustomPeaksContext'
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
import { DemoDataBanner } from '../components/dashboard/DemoDataBanner'
import styles from './DashboardPage.module.css'

export function DashboardPage() {
  const { climbedIds } = useClimbs()
  const { unit } = useUnit()
  const { customPeaks } = useCustomPeaks()

  // collections stay curated-only (no peakIds mutation for custom peaks), but
  // every stat below should count anything the user's tracking, home-grown or not
  const allMountains = useMemo(() => [...MOUNTAINS, ...customPeaks], [customPeaks])

  const highest = getHighestClimbed(allMountains, climbedIds)
  const totalElevation = getTotalElevationClimbed(allMountains, climbedIds)
  const countries = getCountriesClimbedCount(allMountains, climbedIds)
  const continents = getContinentsClimbedCount(allMountains, climbedIds)

  return (
    <div>
      <h1>Dashboard</h1>

      <DemoDataBanner />

      <div className={styles.statGrid}>
        <StatCard
          label="Peaks climbed"
          value={climbedIds.size}
          sublabel={`of ${allMountains.length} tracked`}
        />
        <StatCard
          label="Highest climbed"
          value={highest ? formatElevation(highest.elevation, unit) : '—'}
          sublabel={highest?.name ?? 'nothing logged yet'}
        />
        <StatCard label="Combined elevation" value={formatElevation(totalElevation, unit)} />
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