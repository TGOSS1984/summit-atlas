
export type ColorToken = 'accent' | 'ice' | 'gold' | 'green' | 'red'

export interface Collection {
  id: string
  name: string
  tagline: string
  colorToken: ColorToken
  peakIds: string[]
  wikipediaTitle?: string
}