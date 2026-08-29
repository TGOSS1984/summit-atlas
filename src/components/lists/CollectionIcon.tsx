import styles from './CollectionIcon.module.css'

export type PeakShape = 'single' | 'twin' | 'triple' | 'volcano'
export type AccentGlyph =
  | 'flag' | 'flame' | 'star' | 'thistle' | 'shamrock' | 'fern'
  | 'leaf' | 'chevron' | 'bunting' | 'compass' | 'ring' | 'wave'
  | 'torii' | 'tick' | 'snow' | 'globe' | 'pen' | 'none'

const PEAK_PATHS: Record<PeakShape, string> = {
  single: 'M6 25 L16 8 L26 25 Z',
  twin: 'M3 25 L12 11 L19 25 Z M13 25 L21 14 L29 25 Z',
  triple: 'M2 25 L8 15 L14 25 Z M11 25 L18 9 L25 25 Z M19 25 L24 17 L29 25 Z',
  volcano: 'M6 25 L13 10 L15 12 L17 10 L24 25 Z',
}

// second (background) peak in the twin shape reads at lower opacity so the
// silhouette still reads as "one mark", not two competing shapes
const PEAK_BACK_OPACITY: Partial<Record<PeakShape, number>> = { twin: 0.45, triple: 0.55 }

function AccentMark({ glyph }: { glyph: AccentGlyph }) {
  switch (glyph) {
    case 'flag':
      return (
        <g>
          <line x1="16" y1="8" x2="16" y2="3" stroke="currentColor" strokeWidth="1.3" />
          <path d="M16 3 L21 4.6 L16 6.2 Z" fill="currentColor" />
        </g>
      )
    case 'flame':
      return <path d="M16 3.5c1.6 1.8 2.6 3.3 2.6 4.9a2.6 2.6 0 1 1-5.2 0c0-.8.3-1.5.8-2.2.2.7.6 1 1 1-.2-1.4.2-2.6.8-3.7Z" fill="currentColor" />
    case 'star':
      return <path d="M16 2.5l1.4 3 3.3.4-2.4 2.3.6 3.3-2.9-1.6-2.9 1.6.6-3.3-2.4-2.3 3.3-.4z" fill="currentColor" />
    case 'thistle':
      return (
        <g fill="currentColor">
          <ellipse cx="16" cy="5.5" rx="2.6" ry="3.2" />
          <line x1="16" y1="8.5" x2="16" y2="11" stroke="currentColor" strokeWidth="1.2" />
        </g>
      )
    case 'shamrock':
      return (
        <g fill="currentColor">
          <circle cx="14.3" cy="5" r="1.9" />
          <circle cx="17.7" cy="5" r="1.9" />
          <circle cx="16" cy="7.6" r="1.9" />
          <line x1="16" y1="9.2" x2="16" y2="11.5" stroke="currentColor" strokeWidth="1.1" />
        </g>
      )
    case 'fern':
      return <path d="M16 11V3.5c2.4.3 3.6 1.8 3.6 3.4 0 1.7-1.3 3-3.6 4.1Zm0 0c-2.4.3-3.6-1.1-3.6-2.7 0-1.4 1-2.6 2.4-3" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    case 'leaf':
      return <path d="M16 3c2.6 1.5 4 3.5 4 5.6a4 4 0 0 1-8 0c0-2.1 1.4-4.1 4-5.6Zm0 8.6V8" fill="currentColor" stroke="none" />
    case 'chevron':
      return (
        <g stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round">
          <path d="M11 9 L16 5 L21 9" />
          <path d="M12 12 L16 8.5 L20 12" />
        </g>
      )
    case 'bunting':
      return (
        <g fill="currentColor">
          <line x1="8" y1="5" x2="24" y2="5" stroke="currentColor" strokeWidth="1" />
          <path d="M10 5 L12.5 5 L11.25 9 Z" />
          <path d="M15 5 L17.5 5 L16.25 9 Z" />
          <path d="M20 5 L22.5 5 L21.25 9 Z" />
        </g>
      )
    case 'compass':
      return (
        <g stroke="currentColor" strokeWidth="1.1" fill="none">
          <circle cx="16" cy="6" r="3.4" />
          <line x1="16" y1="1.6" x2="16" y2="3.2" />
          <line x1="16" y1="8.8" x2="16" y2="10.4" />
          <line x1="11.6" y1="6" x2="13.2" y2="6" />
          <line x1="18.8" y1="6" x2="20.4" y2="6" />
        </g>
      )
    case 'ring':
      return <circle cx="16" cy="6" r="3" fill="none" stroke="currentColor" strokeWidth="1.4" />
    case 'wave':
      return <path d="M9 6c1.4-1.6 2.8-1.6 4.2 0s2.8 1.6 4.2 0 2.8-1.6 4.2 0" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    case 'torii':
      return (
        <g stroke="currentColor" strokeWidth="1.3" fill="none">
          <line x1="9" y1="7.5" x2="23" y2="7.5" />
          <line x1="10.5" y1="4.5" x2="21.5" y2="4.5" />
          <line x1="12" y1="4.5" x2="12" y2="9.5" />
          <line x1="20" y1="4.5" x2="20" y2="9.5" />
        </g>
      )
    case 'tick':
      return (
        <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <line x1="12" y1="4" x2="12" y2="9" />
          <line x1="16" y1="2.5" x2="16" y2="9" />
          <line x1="20" y1="4" x2="20" y2="9" />
        </g>
      )
    case 'snow':
      return (
        <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
          <line x1="16" y1="2.5" x2="16" y2="9.5" />
          <line x1="12.5" y1="4.25" x2="19.5" y2="7.75" />
          <line x1="19.5" y1="4.25" x2="12.5" y2="7.75" />
        </g>
      )
    case 'globe':
      return (
        <g stroke="currentColor" strokeWidth="1" fill="none">
          <circle cx="16" cy="6" r="3.6" />
          <ellipse cx="16" cy="6" rx="1.5" ry="3.6" />
          <line x1="12.4" y1="6" x2="19.6" y2="6" />
        </g>
      )
    case 'pen':
      return <path d="M11 10.5 L18.5 3 L20.5 5 L13 12.5 L10.5 13 Z" fill="currentColor" />
    case 'none':
    default:
      return null
  }
}

interface CollectionIconProps {
  peaks: PeakShape
  accent: AccentGlyph
  className?: string
}

// Small mark for each collection - riffs on the Summit Pin favicon's
// geometry (currentColor, simple line/shape forms) rather than a literal
// reuse, so the Lists page reads as a family without every card looking
// identical.
export function CollectionIcon({ peaks, accent, className }: CollectionIconProps) {
  const backOpacity = PEAK_BACK_OPACITY[peaks]
  return (
    <svg viewBox="0 0 32 32" className={className ?? styles.icon} aria-hidden="true">
      {backOpacity ? (
        <>
          <path d={PEAK_PATHS[peaks].split('Z')[0] + 'Z'} fill="currentColor" opacity={backOpacity} />
          <path d={'M' + PEAK_PATHS[peaks].split('Z')[1].trim().slice(1) + 'Z'} fill="currentColor" />
        </>
      ) : (
        <path d={PEAK_PATHS[peaks]} fill="currentColor" />
      )}
      <AccentMark glyph={accent} />
    </svg>
  )
}