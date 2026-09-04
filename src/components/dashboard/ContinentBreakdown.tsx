import type { Mountain } from '../../types/mountain'
import { getContinentBreakdown } from '../../utils/dashboardStats'
import styles from './ContinentBreakdown.module.css'

interface ContinentBreakdownProps {
  mountains: Mountain[]
  climbedIds: Set<string>
}

// hand-picked rather than pulled from the 5 design tokens - same call made
// for the collection icons (see collectionIcons.ts): 7 continents needs
// more variety than 5 tokens gives, and these are chosen to stay
// distinguishable on both Deep Vintage and Summit Light
const CONTINENT_COLORS: Record<string, string> = {
  Africa: '#D98A3D',
  Antarctica: '#7FB8D9',
  Asia: '#C0392B',
  Australia: '#4AAFA0',
  Europe: '#8B6BB5',
  'North America': '#4A6FA5',
  'South America': '#6FAE94',
}
const FALLBACK_COLOR = '#8B8272'

const RADIUS = 60
const STROKE = 22
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function ContinentBreakdown({ mountains, climbedIds }: ContinentBreakdownProps) {
  const breakdown = getContinentBreakdown(mountains, climbedIds)
  const total = breakdown.reduce((sum, c) => sum + c.count, 0)

  if (total === 0) {
    return <p className={styles.empty}>Nothing logged yet.</p>
  }

  // running offset walks the ring around as each continent's arc is drawn,
  // so segments sit end-to-end rather than overlapping at the start point
  let offset = 0

  return (
    <div className={styles.card}>
      <svg viewBox="0 0 160 160" className={styles.donut}>
        <circle cx="80" cy="80" r={RADIUS} fill="none" stroke="var(--border)" strokeWidth={STROKE} />
        {breakdown.map(({ continent, count }) => {
          const fraction = count / total
          const dash = fraction * CIRCUMFERENCE
          const el = (
            <circle
              key={continent}
              cx="80"
              cy="80"
              r={RADIUS}
              fill="none"
              stroke={CONTINENT_COLORS[continent] ?? FALLBACK_COLOR}
              strokeWidth={STROKE}
              strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 80 80)"
            />
          )
          offset += dash
          return el
        })}
        <text x="80" y="76" textAnchor="middle" className={styles.centerValue}>
          {total}
        </text>
        <text x="80" y="94" textAnchor="middle" className={styles.centerLabel}>
          peaks
        </text>
      </svg>
      <ul className={styles.legend}>
        {breakdown.map(({ continent, count }) => (
          <li key={continent} className={styles.legendItem}>
            <span
              className={styles.swatch}
              style={{ background: CONTINENT_COLORS[continent] ?? FALLBACK_COLOR }}
            />
            <span className={styles.legendLabel}>{continent}</span>
            <span className={styles.legendCount}>{count}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}