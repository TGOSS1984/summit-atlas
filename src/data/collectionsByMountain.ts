import { COLLECTIONS } from './collections'
import { getCollectionsByMountainId } from '../utils/filterMountains'

// computed once at module load - shared between Explore and Map so both
// build the same reverse lookup instead of each rolling their own (same
// duplication mistake tempClimbedIds.ts fixed for the climbed-ids set)
export const COLLECTIONS_BY_MOUNTAIN = getCollectionsByMountainId(COLLECTIONS)