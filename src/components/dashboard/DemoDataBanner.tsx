import { useClimbs } from '../../context/ClimbsContext'
import { MOUNTAINS } from '../../data/mountains'
import styles from './DemoDataBanner.module.css'

export function DemoDataBanner() {
  const { isDemoData, climbedIds, replaceAll, loadDemoData } = useClimbs()

  if (!isDemoData) return null

  return (
    <div className={styles.banner}>
      <p className={styles.text}>
        Showing sample data — {climbedIds.size} of {MOUNTAINS.length} peaks climbed. Your real
        data hasn't been touched, this is just for exploring the app.
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.reloadButton} onClick={loadDemoData}>
          Try a different sample
        </button>
        <button type="button" className={styles.clearButton} onClick={() => replaceAll({})}>
          Clear demo data
        </button>
      </div>
    </div>
  )
}