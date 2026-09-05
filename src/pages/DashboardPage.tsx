import { useMemo, useState } from 'react'
import { MOUNTAINS } from '../data/mountains'
import { COLLECTIONS } from '../data/collections'
import { useClimbs } from '../context/ClimbsContext'
import { useUnit } from '../context/UnitContext'
import { useCustomPeaks } from '../context/CustomPeaksContext'
import { formatElevation } from '../utils/units'
import { getCollectionMountains } from '../utils/collectionMountains'
import {
  getCollectionProgress,
  getContinentsClimbedCount,
  getCountriesClimbedCount,
  getHighestClimbed,
  getTotalElevationClimbed,
  getAllAscents,
  getEverestMultiple,
} from '../utils/dashboardStats'
import { StatCard } from '../components/dashboard/StatCard'
import { CollectionRing } from '../components/dashboard/CollectionRing'
import { ClimbsPerYearChart } from '../components/dashboard/ClimbsPerYearChart'
import { AltitudeBands } from '../components/dashboard/AltitudeBands'
import { ClimbsTimeline } from '../components/dashboard/ClimbsTimeline'
import { ContinentBreakdown } from '../components/dashboard/ContinentBreakdown'
import { CumulativeElevationChart } from '../components/dashboard/CumulativeElevationChart'
import { ActivityHeatmap } from '../components/dashboard/ActivityHeatmap'
import { DataControls } from '../components/dashboard/DataControls'
import { DemoDataBanner } from '../components/dashboard/DemoDataBanner'
import { EmptyDashboardHero } from '../components/dashboard/EmptyDashboardHero'
import { Modal } from '../components/common/Modal'
import { CollectionDetail } from '../components/lists/CollectionDetail'
import styles from './DashboardPage.module.css'

export function DashboardPage() {
  const { climbs, climbedIds } = useClimbs()
  const { unit } = useUnit()
  const { customPeaks } = useCustomPeaks()
  const [openCollectionId, setOpenCollectionId] = useState<string | null>(null)

  // collections stay curated-only (no peakIds mutation for custom peaks), but
  // every stat below should count anything the user's tracking, home-grown or not
  const allMountains = useMemo(() => [...MOUNTAINS, ...customPeaks], [customPeaks])

  // one flattened, newest-first ascent list feeds the per-year chart, the
  // all-climbs timeline, and the continent donut / cumulative elevation
  // chart / activity heatmap - built once per render, everything else just
  // re-sorts or re-buckets this same list rather than re-deriving it
  const ascents = useMemo(() => getAllAscents(allMountains, climbs), [allMountains, climbs])

  const openCollection = COLLECTIONS.find((c) => c.id === openCollectionId) ?? null

  // both hooks above have to run before this check - bailing out earlier
  // than that would break React's rules of hooks the moment someone hits
  // an empty logbook
  if (climbedIds.size === 0) {
    return (
      <div>
        <h1>Dashboard</h1>
        <EmptyDashboardHero />
      </div>
    )
  }

  const highest = getHighestClimbed(allMountains, climbedIds)
  const totalElevation = getTotalElevationClimbed(allMountains, climbedIds)
  const countries = getCountriesClimbedCount(allMountains, climbedIds)
  const continents = getContinentsClimbedCount(allMountains, climbedIds)

  const heroSublabel = `${getEverestMultiple(totalElevation).toFixed(1)}× the height of Everest, stacked end to end`

  return (
    <div>
      <h1>Dashboard</h1>

      <DemoDataBanner />

      <div className={styles.statGrid}>
        <StatCard featured label="Peaks climbed" value={climbedIds.size} sublabel={heroSublabel} />
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
          return (
            <CollectionRing
              key={collection.id}
              collection={collection}
              climbedCount={climbed}
              onSelect={() => setOpenCollectionId(collection.id)}
            />
          )
        })}
      </div>

      <div className={styles.dashColumns}>
        <div>
          <h2 className={styles.sectionTitle}>All climbs</h2>
          <ClimbsTimeline ascents={ascents} unit={unit} />
        </div>
        <div>
          <h2 className={styles.sectionTitle}>Climbs per year</h2>
          <ClimbsPerYearChart ascents={ascents} />
          <h2 className={styles.sectionTitle}>Altitude bands</h2>
          <AltitudeBands mountains={allMountains} climbedIds={climbedIds} unit={unit} />
          <h2 className={styles.sectionTitle}>Peaks by continent</h2>
          <ContinentBreakdown mountains={allMountains} climbedIds={climbedIds} />
          <h2 className={styles.sectionTitle}>Elevation climbed over time</h2>
          <CumulativeElevationChart ascents={ascents} unit={unit} />
          <h2 className={styles.sectionTitle}>Activity</h2>
          <ActivityHeatmap ascents={ascents} />
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Your data</h2>
      <DataControls />

      {openCollection && (
        <Modal onClose={() => setOpenCollectionId(null)}>
          <CollectionDetail
            collection={openCollection}
            mountains={getCollectionMountains(openCollection, allMountains)}
            climbedIds={climbedIds}
          />
        </Modal>
      )}
    </div>
  )
}