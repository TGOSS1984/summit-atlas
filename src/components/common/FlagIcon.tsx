import { emojiFlagToCountryCode } from '../../utils/flag'

interface FlagIconProps {
  flag: string
  className?: string
}

// renders a real SVG flag (via the flag-icons package) instead of the raw
// emoji character - see utils/flag.ts for why. square (fis) variant reads
// better than the default 4:3 rectangle at the small sizes this shows up at
export function FlagIcon({ flag, className }: FlagIconProps) {
  const code = emojiFlagToCountryCode(flag)
  return <span className={`fi fi-${code} fis ${className ?? ''}`.trim()} title={flag} />
}