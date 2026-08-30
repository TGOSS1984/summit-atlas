import { useId, useMemo } from 'react'
import type { Mountain } from '../../types/mountain'
import { generateProceduralMountain, seasonForMountain } from '../../utils/proceduralMountain'
import styles from './ProceduralMountainSvg.module.css'

interface ProceduralMountainSvgProps {
  mountain: Mountain
  countryMaxElevation?: number
  climbed?: boolean
}

// generator returns bare 'url(#faceLight)' etc, since it has no idea what
// this particular card instance's id suffix is - this patches the suffix
// in at render time rather than threading a uid parameter all the way
// through every generator function
function withUid(fill: string, uid: string): string {
  return fill.replace(/#([\w-]+)\)/, `#$1-${uid})`)
}

function pointsAttr(points: [number, number][]): string {
  return points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
}

export function ProceduralMountainSvg({
  mountain,
  countryMaxElevation,
  climbed = false,
}: ProceduralMountainSvgProps) {
  const uid = useId()
  const season = useMemo(() => seasonForMountain(mountain), [mountain])
  const data = useMemo(
    () => generateProceduralMountain(mountain, season, countryMaxElevation),
    [mountain, season, countryMaxElevation],
  )

  return (
        <svg
        viewBox="0 0 1200 680"
        preserveAspectRatio="none"
        className={climbed ? `${styles.svg} ${styles.svgClimbed}` : styles.svg}
        aria-hidden="true"
        >
      <defs>
        <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0A2027" />
          <stop offset="0.55" stopColor="#173840" />
          <stop offset="1" stopColor="#365861" />
        </linearGradient>
        <linearGradient id={`far-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#70868B" />
          <stop offset="1" stopColor="#3D5960" />
        </linearGradient>
        <linearGradient id={`mid-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4D6870" />
          <stop offset="1" stopColor="#243F47" />
        </linearGradient>
        <linearGradient id={`mountain-${uid}`} x1="0.14" y1="0.05" x2="0.84" y2="0.96">
          <stop offset="0" stopColor="#4D7078" />
          <stop offset="0.34" stopColor="#345861" />
          <stop offset="0.72" stopColor="#1B3C45" />
          <stop offset="1" stopColor="#0D2830" />
        </linearGradient>
        <linearGradient id={`faceLight-${uid}`} x1="0.12" y1="0.05" x2="0.88" y2="0.95">
          <stop offset="0" stopColor="#A5B6B9" stopOpacity="0.78" />
          <stop offset="0.46" stopColor="#708B91" stopOpacity="0.48" />
          <stop offset="1" stopColor="#35545C" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id={`faceMid-${uid}`} x1="0.15" y1="0.06" x2="0.85" y2="0.94">
          <stop offset="0" stopColor="#748D92" stopOpacity="0.58" />
          <stop offset="1" stopColor="#203F48" stopOpacity="0.14" />
        </linearGradient>
        <linearGradient id={`faceShadow-${uid}`} x1="0.86" y1="0.05" x2="0.12" y2="0.96">
          <stop offset="0" stopColor="#04161C" stopOpacity="0.90" />
          <stop offset="0.55" stopColor="#102B33" stopOpacity="0.64" />
          <stop offset="1" stopColor="#284851" stopOpacity="0.10" />
        </linearGradient>
        <linearGradient id={`rockWarm-${uid}`} x1="0.15" y1="0.10" x2="0.85" y2="0.90">
          <stop offset="0" stopColor="#7C8C8D" stopOpacity="0.62" />
          <stop offset="1" stopColor="#2C494F" stopOpacity="0.10" />
        </linearGradient>
        <linearGradient id={`snow-${uid}`} x1="0.20" y1="0.03" x2="0.82" y2="0.97">
          <stop offset="0" stopColor="#F7FAF8" stopOpacity="0.98" />
          <stop offset="0.40" stopColor="#E1E9E8" stopOpacity="0.93" />
          <stop offset="1" stopColor="#9FB3B7" stopOpacity="0.63" />
        </linearGradient>
        <linearGradient id={`foreground-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#173740" />
          <stop offset="1" stopColor="#061B22" />
        </linearGradient>
        <radialGradient id={`haze-${uid}`} cx="0.5" cy="1" r="0.82">
          <stop offset="0" stopColor="#BAC8CA" stopOpacity="0.13" />
          <stop offset="1" stopColor="#BAC8CA" stopOpacity="0" />
        </radialGradient>

        <filter id={`snowTexture-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.018 0.035"
            numOctaves={2}
            seed={data.snowNoiseSeed}
            result="noise"
          />
          <feColorMatrix in="noise" type="saturate" values="0" result="gray" />
          <feComponentTransfer in="gray" result="contrast">
            <feFuncR type="gamma" amplitude={1.15} exponent={1.55} offset={-0.07} />
            <feFuncG type="gamma" amplitude={1.15} exponent={1.55} offset={-0.07} />
            <feFuncB type="gamma" amplitude={1.15} exponent={1.55} offset={-0.07} />
            <feFuncA type="table" tableValues="0.32 0.78" />
          </feComponentTransfer>
          <feBlend in="SourceGraphic" in2="contrast" mode="soft-light" />
        </filter>

        <clipPath id={`mountainClip-${uid}`}>
          <path d={data.mainPath} />
        </clipPath>

        <mask id={`snowMask-${uid}`}>
          <rect width="1200" height="680" fill="black" />
          {data.snowPatches.map((points, i) => (
            <polygon key={`patch-${i}`} points={points} fill="white" opacity="0.82" />
          ))}
          {data.snowTongues.map((t, i) => (
            <path
              key={`tongue-mask-${i}`}
              d={t.d}
              fill="none"
              stroke="white"
              strokeWidth={t.width}
              strokeLinecap="round"
              opacity={t.opacity}
            />
          ))}
          {data.snowRockCutouts.map((points, i) => (
            <polygon key={`cutout-${i}`} points={points} fill="black" opacity="0.90" />
          ))}
        </mask>
      </defs>


      <path d={data.rearPath} fill={`url(#far-${uid})`} opacity="0.26" />
      <path d={data.midPath} fill={`url(#mid-${uid})`} opacity="0.48" />
      <path d={data.mainPath} fill={`url(#mountain-${uid})`} />

      <g clipPath={`url(#mountainClip-${uid})`}>
        {data.majorFaces.map((face, i) => (
          <polygon
            key={`major-${i}`}
            points={pointsAttr(face.points)}
            fill={withUid(face.fill, uid)}
            opacity={face.opacity}
          />
        ))}
        {data.minorFacets.map((face, i) => (
          <polygon
            key={`minor-${i}`}
            points={pointsAttr(face.points)}
            fill={withUid(face.fill, uid)}
            opacity={face.opacity}
          />
        ))}
        <g fill="none" stroke="#051A21" strokeLinecap="round">
          {data.ravines.map((item, i) => (
            <path key={`ravine-${i}`} d={item.d} strokeWidth={item.width} opacity={item.opacity} />
          ))}
        </g>
        <g fill="none" stroke="#A7B7BA" strokeWidth="1.1" strokeLinecap="round">
          {data.strata.map((item, i) => (
            <path key={`strata-${i}`} d={item.d} opacity={item.opacity} />
          ))}
        </g>
        <g stroke="#C5D0D2" strokeWidth="0.9" strokeLinecap="round">
          {data.scree.map((item, i) => (
            <line key={`scree-${i}`} x1={item.x1} y1={item.y1} x2={item.x2} y2={item.y2} opacity={item.opacity} />
          ))}
        </g>

        <rect
          x="0"
          y="0"
          width="1200"
          height="680"
          fill={`url(#snow-${uid})`}
          mask={`url(#snowMask-${uid})`}
          filter={`url(#snowTexture-${uid})`}
          opacity={data.snowOverlayOpacity}
        />

        <g fill="none" stroke="#78939A" strokeLinecap="round">
          {data.snowTongues.slice(0, 6).map((item, i) => (
            <path
              key={`snowshadow-${i}`}
              d={item.d}
              strokeWidth={Math.max(2, (item.width ?? 4) * 0.35)}
              opacity="0.14"
              transform="translate(4 5)"
            />
          ))}
        </g>
      </g>

      <path
        d={data.ridgeHighlightPath}
        fill="none"
        stroke="#A8B8BB"
        strokeWidth="1.25"
        strokeOpacity="0.34"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      <rect y="420" width="1200" height="260" fill={`url(#haze-${uid})`} opacity="0.42" />
      <path d={data.foregroundPath} fill={`url(#foreground-${uid})`} />

      {data.worldLineY !== null && (
        <line x1={0} y1={data.worldLineY} x2={1200} y2={data.worldLineY} className={styles.referenceLine} />
      )}
      {data.countryLineY !== null && (
        <line x1={0} y1={data.countryLineY} x2={1200} y2={data.countryLineY} className={styles.referenceLineCountry} />
      )}
    </svg>
  )
}