import type { Mountain } from '../types/mountain'

// one <wpt> per peak, no track/route data - we only record that a climb
// happened, not the path taken, so a waypoint file is the honest format
// here rather than pretending to have route data we don't
export function buildGpxDocument(mountains: Mountain[]): string {
  const waypoints = mountains
    .filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lng))
    .map(
      (m) => `  <wpt lat="${m.lat}" lon="${m.lng}">
    <ele>${m.elevation}</ele>
    <name>${escapeXml(m.name)}</name>
    <desc>${escapeXml(`${m.country} · ${m.range}`)}</desc>
  </wpt>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Summit Atlas" xmlns="http://www.topografix.com/GPX/1/1">
${waypoints}
</gpx>
`
}

// order matters - & has to go first, or escaping < and > would re-escape
// the ampersand just introduced by escaping them
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function exportGpxFile(mountains: Mountain[]): void {
  const gpx = buildGpxDocument(mountains)
  const blob = new Blob([gpx], { type: 'application/gpx+xml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `summit-atlas-climbed-${new Date().toISOString().slice(0, 10)}.gpx`
  link.click()
  URL.revokeObjectURL(url)
}