import { useNavigate } from 'react-router-dom'
import { useClimbs } from '../../context/ClimbsContext'
import styles from './EmptyDashboardHero.module.css'

// shown instead of the stat grid when nothing's logged yet - same idea as
// peakbook's own empty dashboard state, our own copy/layout/background.
// background image switches per theme entirely in CSS (see
// EmptyDashboardHero.module.css) - nothing here needs to know which one's showing
export function EmptyDashboardHero() {
  const navigate = useNavigate()
  const { loadDemoData } = useClimbs()

  return (
    <div className={styles.hero}>
      
      <h2 className={styles.title}>Nothing logged yet</h2>
      <p className={styles.subtitle}>
        Search for a peak you've climbed and add it to your logbook - your dashboard, map and
        collections all build from there. Or load some sample data to see how it looks first.
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={() => navigate('/explore')}>
          Find a mountain
        </button>
        {/* no confirm guard needed here unlike DataControls' demo button -
            this only ever renders when climbedIds is already empty, so
            there's nothing real for it to overwrite */}
        <button type="button" className={styles.secondary} onClick={loadDemoData}>
          Try demo data
        </button>
      </div>
    </div>
  )
}