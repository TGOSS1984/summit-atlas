export type Continent =
  | 'Africa'
  | 'Antarctica'
  | 'Asia'
  | 'Australia'
  | 'Europe'
  | 'North America'
  | 'South America'


export interface Mountain {
  id: string
  name: string
  elevation: number
  prominence?: number
  country: string
  flag: string
  continent: Continent
  range: string
  lat: number
  lng: number
  firstAscent?: number
  wikipediaTitle?: string
}