import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getCumulativeElevation, type Ascent } from '../../utils/dashboardStats'
import { formatElevation, metersToFeet, type ElevationUnit } from '../../utils/units'
import { ChartTooltip } from './ChartTooltip'
import styles from './CumulativeElevationChart.module.css'

interface CumulativeElevationChartProps {
  ascents: Ascent[]
  unit: ElevationUnit
}

export function CumulativeElevationChart({ ascents, unit }: CumulativeElevationChartProps) {
  const points = getCumulativeElevation(ascents)

  if (points.length === 0) {
    return <p className={styles.empty}>Nothing logged yet.</p>
  }

  // converts once here rather than in the tooltip - the tooltip just
  // formats whatever number is already sitting in the data row, it never
  // needs to know a unit conversion happened
  const data = points.map((p) => ({
    date: p.date,
    elevation: unit === 'ft' ? Math.round(metersToFeet(p.cumulative)) : p.cumulative,
  }))

  const maxElevation = points[points.length - 1].cumulative

  return (
    <div className={styles.card}>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="cumulativeElevationFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" hide />
          <Tooltip
            content={
              <ChartTooltip valueFormatter={(v) => `${Number(v).toLocaleString()} ${unit}`} />
            }
          />
          <Area
            type="monotone"
            dataKey="elevation"
            name="Elevation"
            stroke="var(--accent)"
            strokeWidth={2}
            fill="url(#cumulativeElevationFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className={styles.total}>{formatElevation(maxElevation, unit)} climbed in total</p>
    </div>
  )
}