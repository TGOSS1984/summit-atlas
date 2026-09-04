import { getCumulativeElevation, type Ascent } from '../../utils/dashboardStats'
import { formatElevation, type ElevationUnit } from '../../utils/units'
import styles from './CumulativeElevationChart.module.css'

interface CumulativeElevationChartProps {
  ascents: Ascent[]
  unit: ElevationUnit
}

const WIDTH = 400
const HEIGHT = 140
const PADDING = 8

export function CumulativeElevationChart({ ascents, unit }: CumulativeElevationChartProps) {
  const points = getCumulativeElevation(ascents)

  if (points.length === 0) {
    return <p className={styles.empty}>Nothing logged yet.</p>
  }

  const maxElevation = points[points.length - 1].cumulative

  const coords = points.map((p, i) => {
    const x =
      points.length === 1 ? WIDTH / 2 : PADDING + (i / (points.length - 1)) * (WIDTH - PADDING * 2)
    const y = HEIGHT - PADDING - (p.cumulative / maxElevation) * (HEIGHT - PADDING * 2)
    return [x, y] as const
  })

  const linePath = coords
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ')
  // closes the line back down to the baseline to make a fillable area shape,
  // purely for the soft fill under the line - the stroke path above is what
  // actually reads as "the chart"
  const areaPath = `${linePath} L ${coords[coords.length - 1][0].toFixed(1)} ${HEIGHT} L ${coords[0][0].toFixed(1)} ${HEIGHT} Z`

  return (
    <div className={styles.card}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className={styles.chart}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={areaPath} className={styles.area} />
        <path d={linePath} className={styles.line} fill="none" />
      </svg>
      <p className={styles.total}>{formatElevation(maxElevation, unit)} climbed in total</p>
    </div>
  )
}