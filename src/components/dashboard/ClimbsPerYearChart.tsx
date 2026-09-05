import { useMemo } from 'react'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getClimbsPerYearByContinent, type Ascent } from '../../utils/dashboardStats'
import { continentColor } from '../../utils/continentColors'
import { ChartTooltip } from './ChartTooltip'
import styles from './ClimbsPerYearChart.module.css'

interface ClimbsPerYearChartProps {
  ascents: Ascent[]
}

// capped to the most recent 7 years so the bars stay legible - matches
// peakbook's own cap on the same chart
const YEARS_SHOWN = 7

export function ClimbsPerYearChart({ ascents }: ClimbsPerYearChartProps) {
  const data = useMemo(() => getClimbsPerYearByContinent(ascents).slice(-YEARS_SHOWN), [ascents])

  // every continent that appears anywhere in the shown years, in first-seen
  // order - one <Bar> per continent, stacked. Order of first appearance
  // rather than alphabetical keeps stack order reasonably stable chart to
  // chart without hardcoding all 7 continents (most datasets, demo or
  // real, won't touch all of them)
  const continents = useMemo(() => {
    const seen = new Set<string>()
    for (const row of data) {
      for (const key of Object.keys(row)) {
        if (key !== 'year') seen.add(key)
      }
    }
    return [...seen]
  }, [data])

  if (data.length === 0) {
    return <p className={styles.empty}>Nothing logged yet.</p>
  }

  return (
    <div className={styles.card}>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
          <XAxis
            dataKey="year"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontWeight: 600 }}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--border)' }} />
          {continents.map((continent, i) => (
            <Bar
              key={continent}
              dataKey={continent}
              name={continent}
              stackId="year"
              fill={continentColor(continent)}
              // only the topmost segment of each stack gets rounded
              // corners - Recharts renders <Bar>s in the order given, so
              // the last one in the list sits on top of the stack
              radius={i === continents.length - 1 ? [5, 5, 0, 0] : undefined}
              maxBarSize={40}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {continents.length > 1 && (
        <div className={styles.legend}>
          {continents.map((continent) => (
            <span key={continent} className={styles.legendItem}>
              <span className={styles.legendSwatch} style={{ background: continentColor(continent) }} />
              {continent}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}