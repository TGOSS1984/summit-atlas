import { MOUNTAINS_ASIA } from './mountains/asia'
import { MOUNTAINS_NORTH_AMERICA } from './mountains/north-america'
import { MOUNTAINS_SOUTH_AMERICA } from './mountains/south-america'
import { MOUNTAINS_AFRICA } from './mountains/africa'
import { MOUNTAINS_EUROPE } from './mountains/europe'
import { MOUNTAINS_ANTARCTICA } from './mountains/antarctica'
import { MOUNTAINS_AUSTRALIA } from './mountains/australia'
import type { Mountain } from '../types/mountain'

export const MOUNTAINS: Mountain[] = [
  ...MOUNTAINS_ASIA,
  ...MOUNTAINS_NORTH_AMERICA,
  ...MOUNTAINS_SOUTH_AMERICA,
  ...MOUNTAINS_AFRICA,
  ...MOUNTAINS_EUROPE,
  ...MOUNTAINS_ANTARCTICA,
  ...MOUNTAINS_AUSTRALIA,
]
