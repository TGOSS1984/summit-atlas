import { useEffect, useRef, useState } from 'react'
import { useClimbs } from '../../context/ClimbsContext'
import { COLLECTIONS } from '../../data/collections'
import { getCompletedCollectionIds, loadCelebratedIds, saveCelebratedIds } from '../../utils/collectionCompletion'
import { CollectionCompleteModal } from '../lists/CollectionCompleteModal'
import type { Collection } from '../../types/collection'

// sits inside ClimbsProvider (mounted in Layout, alongside CloudSync and
// PrintResume) and watches climbedIds for any collection crossing into
// 100% complete
export function CollectionCompleteWatcher() {
  const { climbedIds, isDemoData } = useClimbs()
  const celebratedRef = useRef<Set<string>>(loadCelebratedIds())
  const hasCheckedOnce = useRef(false)
  const [queue, setQueue] = useState<Collection[]>([])

  useEffect(() => {
    // demo data completing a collection isn't a real achievement - skip
    // entirely rather than celebrating (and permanently marking celebrated)
    // something sample data happened to finish
    if (isDemoData) return

    if (!hasCheckedOnce.current) {
      // first real-data check ever (or the first one after demo mode ends) -
      // nothing to compare against yet, so whatever's already complete gets
      // marked celebrated silently. Otherwise updating to this feature would
      // instantly pop a modal for every collection someone finished months
      // ago, which reads as a bug, not a celebration
      hasCheckedOnce.current = true
      const alreadyDone = getCompletedCollectionIds(COLLECTIONS, climbedIds)
      celebratedRef.current = new Set([...celebratedRef.current, ...alreadyDone])
      saveCelebratedIds(celebratedRef.current)
      return
    }

    const nowComplete = getCompletedCollectionIds(COLLECTIONS, climbedIds)
    const newlyComplete = COLLECTIONS.filter((c) => nowComplete.has(c.id) && !celebratedRef.current.has(c.id))
    if (newlyComplete.length === 0) return

    celebratedRef.current = new Set([...celebratedRef.current, ...newlyComplete.map((c) => c.id)])
    saveCelebratedIds(celebratedRef.current)
    // queued rather than shown all at once - logging one climb that happens
    // to complete two collections at once is rare, but showing two modals
    // stacked at once would be worse than showing them one after another
    setQueue((prev) => [...prev, ...newlyComplete])
  }, [climbedIds, isDemoData])

  const current = queue[0] ?? null
  if (!current) return null

  return <CollectionCompleteModal collection={current} onClose={() => setQueue((prev) => prev.slice(1))} />
}