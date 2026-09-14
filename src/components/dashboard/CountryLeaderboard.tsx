import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts'
import type { Mountain } from '../../types/mountain'
import { getCountryBreakdown } from '../../utils/dashboardStats'
import { ChartTooltip } from './ChartTooltip'
import styles from './CountryLeaderboard.module.css'

interface CountryLeaderboardProps {
  mountains: Mountain[]
  climbedIds: Set<string>
}

const LIMIT = 8

export function CountryLeaderboard({ mountains, climbedIds }: CountryLeaderboardProps) {
  const breakdown = getCountryBreakdown(mountains, climbedIds, LIMIT)

  if (breakdown.length === 0) {
    return <p className={styles.empty}>Nothing logged yet.</p>
  }

  // top-N by design, not the full country list - a well-traveled logbook
  // can easily clear 30+ countries, which is exactly the "encyclopedic,
  // not personal" territory the dashboard's been avoiding elsewhere (see
  // PersonalRecords, the mobile collections curation)
  const data = breakdown.map((c) => ({ ...c, label: `${c.flag} ${c.country}` }))

  // Recharts' vertical-layout BarChart draws its first data row at the
  // bottom, same reasoning AltitudeBands reverses its own already-sorted
  // data for
  const chartData = [...data].reverse()

  return (
    <div className={styles.card}>
      <ResponsiveContainer width="100%" height={190}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 28, left: 0, bottom: 0 }}>
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
          <Bar dataKey="count" name="Peaks" fill="var(--gold)" radius={[0, 4, 4, 0]} maxBarSize={16}>
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