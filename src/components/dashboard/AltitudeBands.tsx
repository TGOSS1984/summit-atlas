import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts'
import { getAltitudeBands } from '../../utils/dashboardStats'
import type { ElevationUnit } from '../../utils/units'
import type { Mountain } from '../../types/mountain'
import { ChartTooltip } from './ChartTooltip'
import styles from './AltitudeBands.module.css'

interface AltitudeBandsProps {
  mountains: Mountain[]
  climbedIds: Set<string>
  unit: ElevationUnit
}

export function AltitudeBands({ mountains, climbedIds, unit }: AltitudeBandsProps) {
  const bands = getAltitudeBands(mountains, climbedIds, unit)

  if (bands.every((b) => b.count === 0)) {
    return <p className={styles.empty}>Nothing logged yet.</p>
  }

  // getAltitudeBands returns highest-band-first (matches the old hand-rolled
  // version's row order, top to bottom) - reversed here since Recharts'
  // vertical-layout BarChart draws its first data row at the bottom
  const data = [...bands].reverse()

  return (
    <div className={styles.card}>
      <ResponsiveContainer width="100%" height={190}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 28, left: 0, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="label"
            axisLine={false}
            tickLine={false}
            width={110}
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--border)' }} />
          <Bar dataKey="count" name="Peaks" fill="var(--ice)" radius={[0, 4, 4, 0]} maxBarSize={16}>
            {/* replicates the old .count label sitting right of each bar */}
            <LabelList
              dataKey="count"
              position="right"
              style={{ fill: 'var(--text)', fontSize: 12.5, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}