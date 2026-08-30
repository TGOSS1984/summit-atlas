import { useState } from 'react'
import { COLLECTIONS } from '../data/collections'
import { MOUNTAINS } from '../data/mountains'
import { useClimbs } from '../context/ClimbsContext'
import { getCollectionProgress } from '../utils/dashboardStats'
import { getCollectionMountains } from '../utils/collectionMountains'
import { CollectionListCard } from '../components/lists/CollectionListCard'
import { CollectionDetail } from '../components/lists/CollectionDetail'
import { Modal } from '../components/common/Modal'
import styles from './ListsPage.module.css'

export function ListsPage() {
  const { climbedIds } = useClimbs()
  const [openId, setOpenId] = useState<string | null>(null)
  const openCollection = COLLECTIONS.find((c) => c.id === openId) ?? null

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
              active={collection.id === openId}
              onSelect={() => setOpenId(collection.id)}
            />
          )
        })}
      </div>

      {openCollection && (
        <Modal onClose={() => setOpenId(null)}>
          <CollectionDetail
            collection={openCollection}
            mountains={getCollectionMountains(openCollection, MOUNTAINS)}
            climbedIds={climbedIds}
          />
        </Modal>
      )}
    </div>
  )
}