import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { Mountain } from '../../types/mountain'
import { getContinentBreakdown } from '../../utils/dashboardStats'
import { continentColor } from '../../utils/continentColors'
import { ChartTooltip } from './ChartTooltip'
import styles from './ContinentBreakdown.module.css'

interface ContinentBreakdownProps {
  mountains: Mountain[]
  climbedIds: Set<string>
}

export function ContinentBreakdown({ mountains, climbedIds }: ContinentBreakdownProps) {
  const breakdown = getContinentBreakdown(mountains, climbedIds)
  const total = breakdown.reduce((sum, c) => sum + c.count, 0)

  if (total === 0) {
    return <p className={styles.empty}>Nothing logged yet.</p>
  }

  return (
    <div className={styles.card}>
      {/* Recharts has no built-in centre label for a donut - .donutWrap is
          position: relative purely so .centerLabel can sit absolutely
          centred on top of the chart's own rendered SVG */}
      <div className={styles.donutWrap}>
        <ResponsiveContainer width={130} height={130}>
          <PieChart>
            <Pie
              data={breakdown}
              dataKey="count"
              nameKey="continent"
              innerRadius={44}
              outerRadius={60}
              paddingAngle={2}
              stroke="none"
            >
              {breakdown.map((entry) => (
                <Cell key={entry.continent} fill={continentColor(entry.continent)} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className={styles.centerLabel}>
          <span className={styles.centerValue}>{total}</span>
          <span className={styles.centerSub}>peaks</span>
        </div>
      </div>

      <ul className={styles.legend}>
        {breakdown.map(({ continent, count }) => (
          <li key={continent} className={styles.legendItem}>
            <span className={styles.swatch} style={{ background: continentColor(continent) }} />
            <span className={styles.legendLabel}>{continent}</span>
            <span className={styles.legendCount}>{count}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}