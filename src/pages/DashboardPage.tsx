import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MOUNTAINS } from '../data/mountains'
import { COLLECTIONS } from '../data/collections'
import { useClimbs } from '../context/ClimbsContext'
import { useUnit } from '../context/UnitContext'
import { useCustomPeaks } from '../context/CustomPeaksContext'
import { formatElevation } from '../utils/units'
import { getCollectionMountains } from '../utils/collectionMountains'
import {
  getCollectionProgress,
  getClosestToCompletionCollections,
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
import { ElevationHistogram } from '../components/dashboard/ElevationHistogram'
import { ActivityHeatmap } from '../components/dashboard/ActivityHeatmap'
import { DataControls } from '../components/dashboard/DataControls'
import { DemoDataBanner } from '../components/dashboard/DemoDataBanner'
import { EmptyDashboardHero } from '../components/dashboard/EmptyDashboardHero'
import { PersonalRecords } from '../components/dashboard/PersonalRecords'
import { AccountArea } from '../components/layout/AccountArea'
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

  // mobile's curated collections row - closest to finishing first. falls
  // back to the first few collections (not curated) if nothing's actually
  // in progress yet, so the section still shows something on a fresh
  // account rather than coming up empty
  const MOBILE_COLLECTIONS_LIMIT = 6
  const mobileCollections = useMemo(() => {
    const curated = getClosestToCompletionCollections(COLLECTIONS, climbedIds, MOBILE_COLLECTIONS_LIMIT)
    if (curated.length > 0) return curated
    return COLLECTIONS.slice(0, MOBILE_COLLECTIONS_LIMIT).map((collection) => {
      const { climbed, total } = getCollectionProgress(collection, climbedIds)
      return { collection, climbed, total, remaining: total - climbed }
    })
  }, [climbedIds])

  const openCollection = COLLECTIONS.find((c) => c.id === openCollectionId) ?? null

  // all hooks above have to run before this check - bailing out earlier
  // than that would break React's rules of hooks the moment someone hits
  // an empty logbook
  if (climbedIds.size === 0) {
    return (
      <div>
        {/* sidebar's sign-in button is desktop-only (no room in the mobile
            top bar) - this slot mirrors peakbook's own account-area-mobile
            placement, shown only below 760px via CSS */}
        <div className={styles.accountAreaMobile}>
          <AccountArea />
        </div>
        {/* first-run welcome moment - this is the actual first thing a new
            visitor sees, so it leads with the brand rather than the plain
            "Dashboard" heading. Reverts to normal the instant there's real
            (or demo) data, since a returning user wants function over
            branding by then */}
        <div className={styles.welcomeHeader}>
          <img src="/images/summit-atlas-logo-transparent.png" alt="" className={styles.welcomeLogo} />
          <h1 className={styles.welcomeTitle}>Summit Atlas</h1>
        </div>
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
      <div className={styles.accountAreaMobile}>
        <AccountArea />
      </div>
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

      <PersonalRecords ascents={ascents} />

      <div className={styles.desktopCollections}>
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
      </div>

      {/* mobile doesn't have room for all of these the way the desktop
          grid does - a curated "closest to finishing" subset plus a link
          into Lists for the full picture, rather than the same 27 rings
          just wrapping onto a dozen rows */}
      <div className={styles.mobileCollections}>
        <h2 className={styles.sectionTitle}>Collections</h2>
        <div className={styles.ringGrid}>
          {mobileCollections.map(({ collection, climbed }) => (
            <CollectionRing
              key={collection.id}
              collection={collection}
              climbedCount={climbed}
              onSelect={() => setOpenCollectionId(collection.id)}
            />
          ))}
        </div>
        <Link to="/lists" className={styles.viewAllLink}>
          View all {COLLECTIONS.length} collections →
        </Link>
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
          <h2 className={styles.sectionTitle}>Elevation distribution</h2>
          <ElevationHistogram mountains={allMountains} climbedIds={climbedIds} unit={unit} />
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