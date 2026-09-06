import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { useAuth } from '../../context/AuthContext'
import { getFirebaseDb } from '../../lib/firebase'
import { getPublicProfileUrl, setProfileShared } from '../../utils/shareProfile'
import styles from './ShareProfileControl.module.css'

export function ShareProfileControl() {
  const { user, configured } = useAuth()
  const [shared, setShared] = useState(false)
  const [copied, setCopied] = useState(false)

  // its own listener on the same doc CloudSync already watches - a second
  // listener on one small boolean field is cheap, and keeps "am I shared"
  // fully independent of the climbs/custom/resume sync logic in CloudSync
  useEffect(() => {
    if (!configured || !user) return
    const unsubscribe = onSnapshot(doc(getFirebaseDb(), 'logbooks', user.uid), (snap) => {
      setShared(snap.data()?.shared === true)
    })
    return unsubscribe
  }, [configured, user])

  if (!configured || !user) return null

  const url = getPublicProfileUrl(user.uid)

  async function copyLink() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.wrap}>
      <button type="button" className={styles.button} onClick={() => setProfileShared(user.uid, !shared)}>
        {shared ? 'Unshare profile' : 'Share profile'}
      </button>
      {shared && (
        <div className={styles.linkRow}>
          <span className={styles.link}>{url}</span>
          <button type="button" className={styles.copyButton} onClick={copyLink}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  )
}