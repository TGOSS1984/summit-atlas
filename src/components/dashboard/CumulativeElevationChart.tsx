import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getCumulativeElevation, type Ascent } from '../../utils/dashboardStats'
import { formatElevation, type ElevationUnit } from '../../utils/units'
import styles from './CumulativeElevationChart.module.css'

interface CumulativeElevationChartProps {
  ascents: Ascent[]
  unit: ElevationUnit
}

// only shows dots on every point up to this many ascents - past that it'd
// just be a wall of overlapping circles, so it falls back to just the one
// highlighted "current total" dot at the end
const MAX_DOTS_SHOWN = 30

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${d} ${MONTHS[m - 1]} ${y}`
}

export function CumulativeElevationChart({ ascents, unit }: CumulativeElevationChartProps) {
  const data = getCumulativeElevation(ascents)

  if (data.length === 0) {
    return <p className={styles.empty}>Nothing logged yet.</p>
  }

  const maxElevation = data[data.length - 1].cumulative

  // sparse year-only ticks rather than a label per ascent (dates are
  // irregularly spaced, a label per point would overlap into mush) - only
  // ticks the first point of each new year, so a chart spanning many years
  // gets one label per year rather than one per climb
  const yearTicks = data
    .filter((p, i) => i === 0 || p.date.slice(0, 4) !== data[i - 1].date.slice(0, 4))
    .map((p) => p.date)

  function renderDot(props: { cx?: number; cy?: number; index?: number }) {
    const { cx, cy, index } = props
    if (cx === undefined || cy === undefined || index === undefined) return <g />
    const isLast = index === data.length - 1
    if (!isLast && data.length > MAX_DOTS_SHOWN) return <g />
    return (
      <circle
        key={index}
        cx={cx}
        cy={cy}
        r={isLast ? 4 : 2.5}
        fill={isLast ? 'var(--accent)' : 'var(--card)'}
        stroke="var(--accent)"
        strokeWidth={isLast ? 0 : 1.5}
      />
    )
  }

  function CumulativeTooltip({
    active,
    payload,
  }: {
    active?: boolean
    payload?: { payload: (typeof data)[number] }[]
  }) {
    if (!active || !payload || payload.length === 0) return null
    const point = payload[0].payload
    return (
      <div className={styles.tooltip}>
        <div className={styles.tooltipMountain}>{point.mountainName}</div>
        <div className={styles.tooltipDate}>{formatDate(point.date)}</div>
        <div className={styles.tooltipValue}>{formatElevation(point.cumulative, unit)} total</div>
      </div>
    )
  }

  return (
    <div className={styles.card}>
      <ResponsiveContainer width="100%" height={150}>
        <AreaChart data={data} margin={{ top: 6, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="cumulativeElevationFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            ticks={yearTicks}
            tickFormatter={(d: string) => d.slice(0, 4)}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
          />
          <Tooltip content={<CumulativeTooltip />} />
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke="var(--accent)"
            strokeWidth={2}
            fill="url(#cumulativeElevationFill)"
            dot={renderDot}
            activeDot={{ r: 5, fill: 'var(--accent)', stroke: 'var(--card)', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className={styles.total}>{formatElevation(maxElevation, unit)} climbed in total</p>
    </div>
  )
}