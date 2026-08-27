import { useState } from 'react'
import { COLLECTIONS } from '../data/collections'
import { MOUNTAINS } from '../data/mountains'
import { useClimbs } from '../context/ClimbsContext'
import { getCollectionProgress } from '../utils/dashboardStats'
import { getCollectionMountains } from '../utils/collectionMountains'
import { CollectionListCard } from '../components/lists/CollectionListCard'
import { CollectionDetail } from '../components/lists/CollectionDetail'
import styles from './ListsPage.module.css'

export function ListsPage() {
  const { climbedIds } = useClimbs()
  const [selectedId, setSelectedId] = useState(COLLECTIONS[0]?.id ?? null)
  const selected = COLLECTIONS.find((c) => c.id === selectedId) ?? COLLECTIONS[0]

  return (
    <div>
      <h1>Lists</h1>

      <div className={styles.grid}>
        {COLLECTIONS.map((collection) => {
          const { climbed, total } = getCollectionProgress(collection, climbedIds)
          return (
            <CollectionListCard
              key={collection.id}
              collection={collection}
              climbed={climbed}
              total={total}
              active={collection.id === selected?.id}
              onSelect={() => setSelectedId(collection.id)}
            />
          )
        })}
      </div>

      {selected && (
        <div className={styles.detail}>
          <CollectionDetail
            collection={selected}
            mountains={getCollectionMountains(selected, MOUNTAINS)}
            climbedIds={climbedIds}
          />
        </div>
      )}
    </div>
  )
}