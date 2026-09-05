import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getElevationHistogram } from '../../utils/dashboardStats'
import type { ElevationUnit } from '../../utils/units'
import type { Mountain } from '../../types/mountain'
import { ChartTooltip } from './ChartTooltip'
import styles from './ElevationHistogram.module.css'

interface ElevationHistogramProps {
  mountains: Mountain[]
  climbedIds: Set<string>
  unit: ElevationUnit
}

export function ElevationHistogram({ mountains, climbedIds, unit }: ElevationHistogramProps) {
  const bins = getElevationHistogram(mountains, climbedIds, unit)

  if (bins.length === 0) {
    return <p className={styles.empty}>Nothing logged yet.</p>
  }

  // thins out the x-axis tick labels once there are more than ~6 bins,
  // rather than cramming a label under every single bar
  const tickInterval = Math.max(0, Math.ceil(bins.length / 6) - 1)

  return (
    <div className={styles.card}>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={bins} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            interval={tickInterval}
            tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--border)' }} />
          <Bar dataKey="count" name="Peaks" fill="var(--gold)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}