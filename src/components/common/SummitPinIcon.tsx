// the Summit Pin mark from the palette lab - a peak with a flagged pin at
// the apex, echoing the "log a climb" action. same shape as the favicon,
// just currentColor here instead of a fixed badge so it inherits whatever
// this container's already using for its accent. pulled out into its own
// file since it's now used in three places (sidebar, mobile top bar,
// dashboard empty state) - one more and copy-pasting the SVG a fourth time
// would've stopped being reasonable
export function SummitPinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 22 22" fill="none" className={className}>
      <path d="M2 18 L8 7 L14 18 Z" fill="currentColor" opacity="0.9" />
      <line x1="8" y1="7" x2="8" y2="2.4" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 2.4 L13 4 L8 5.6 Z" fill="currentColor" />
    </svg>
  )
}