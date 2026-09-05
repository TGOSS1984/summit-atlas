import type { TooltipProps } from 'recharts'
import styles from './ChartTooltip.module.css'

interface ChartTooltipProps extends TooltipProps<number, string> {
  // most charts just show the raw number - this lets a chart with its own
  // unit (elevation in m/ft, say) format the value without the tooltip
  // itself needing to know about units
  valueFormatter?: (value: number | string) => string
}

// one tooltip styled with app tokens, reused across every converted chart -
// Recharts clones whatever element you pass to `content`, injecting
// active/payload/label as extra props, so this works as
// content={<ChartTooltip />} or content={<ChartTooltip valueFormatter={...} />}
export function ChartTooltip({ active, payload, label, valueFormatter }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className={styles.tooltip}>
      {label !== undefined && <div className={styles.label}>{label}</div>}
      {payload.map((entry, i) => (
        <div key={i} className={styles.row}>
          <span className={styles.swatch} style={{ background: entry.color }} />
          {entry.name && <span className={styles.name}>{entry.name}</span>}
          <span className={styles.value}>
            {valueFormatter && entry.value !== undefined ? valueFormatter(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}