const REGIONAL_INDICATOR_OFFSET = 0x1f1e6 // codepoint of 🇦, "REGIONAL INDICATOR SYMBOL LETTER A"
const CHAR_A_CODE = 'A'.charCodeAt(0)

// a flag emoji is just two "regional indicator" codepoints back to back -
// this decodes them back into the plain ISO 3166-1 alpha-2 code so we can
// look up a real SVG flag instead of relying on the OS to render the emoji
// as a picture. Windows' bundled emoji font doesn't include flag glyphs, so
// Chrome/Edge on Windows was showing the raw two-letter fallback (e.g. "NP")
// instead of a flag - not a bug in the data, a platform font gap
export function emojiFlagToCountryCode(flagEmoji: string): string {
  // Array.from (not .split('')) so surrogate pairs stay intact - these
  // codepoints sit outside the basic multilingual plane
  const codePoints = Array.from(flagEmoji).map((char) => char.codePointAt(0) ?? 0)
  const letters = codePoints.map((cp) =>
    String.fromCharCode(cp - REGIONAL_INDICATOR_OFFSET + CHAR_A_CODE),
  )
  return letters.join('').toLowerCase()
}