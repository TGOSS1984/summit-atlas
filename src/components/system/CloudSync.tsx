import { useEffect, useRef } from 'react'
import { doc, onSnapshot, setDoc, type DocumentReference } from 'firebase/firestore'
import { useAuth } from '../../context/AuthContext'
import { useClimbs } from '../../context/ClimbsContext'
import { useCustomPeaks } from '../../context/CustomPeaksContext'
import { useResume } from '../../context/ResumeContext'
import { getFirebaseDb } from '../../lib/firebase'
import { mergeClimbs, mergeCustomPeaks, mergeResume } from '../../utils/cloudMerge'
import { sanitizeResume } from '../../store/resumeStore'
import type { ClimbsState } from '../../utils/climbs'
import type { Mountain } from '../../types/mountain'
import type { Resume } from '../../types/resume'

interface CloudDoc {
  climbs?: ClimbsState
  custom?: Mountain[]
  resume?: Resume
}

// renders nothing - sits inside AuthProvider/ClimbsProvider/CustomPeaksProvider/
// ResumeProvider and keeps Firestore + localStorage converged. kept as its
// own component rather than folded into AuthContext so Climbs/CustomPeaks/
// Resume stay independent of Firebase entirely when signed out or unconfigured
export function CloudSync() {
  const { user, configured } = useAuth()
  const { climbs, replaceAll: replaceClimbs } = useClimbs()
  const { customPeaks, replaceAll: replaceCustomPeaks } = useCustomPeaks()
  const { resume, replaceAll: replaceResume } = useResume()

  // always-current local state without re-subscribing to onSnapshot on every
  // keystroke - the subscribe effect below only depends on [configured, user]
  const localRef = useRef({ climbs, customPeaks, resume })
  useEffect(() => {
    localRef.current = { climbs, customPeaks, resume }
  }, [climbs, customPeaks, resume])

  // last payload this tab itself wrote, so the snapshot listener can tell
  // "a change I just pushed echoing back" apart from "a real remote change"
  // and skip re-merging its own write
  const lastPushed = useRef<string | null>(null)
  const hasMergedOnSignIn = useRef(false)

  useEffect(() => {
    if (!configured || !user) {
      hasMergedOnSignIn.current = false
      lastPushed.current = null
      return
    }

    const ref = doc(getFirebaseDb(), 'logbooks', user.uid)

    const unsubscribe = onSnapshot(ref, (snap) => {
      const remote = (snap.data() as CloudDoc | undefined) ?? {}

      if (!hasMergedOnSignIn.current) {
        // first snapshot after sign-in: union this device's data with
        // whatever's already in the cloud, write the merged result back so
        // every device converges on the same thing
        hasMergedOnSignIn.current = true
        const mergedClimbs = mergeClimbs(localRef.current.climbs, remote.climbs ?? {})
        const mergedCustom = mergeCustomPeaks(localRef.current.customPeaks, remote.custom ?? [])
        const mergedResume = mergeResume(localRef.current.resume, sanitizeResume(remote.resume))
        replaceClimbs(mergedClimbs)
        replaceCustomPeaks(mergedCustom)
        replaceResume(mergedResume)
        push(ref, mergedClimbs, mergedCustom, mergedResume)
        return
      }

      const payload = JSON.stringify(remote)
      if (payload === lastPushed.current) return // our own write echoing back, not a real remote change
      if (remote.climbs) replaceClimbs(remote.climbs)
      if (remote.custom) replaceCustomPeaks(remote.custom)
      if (remote.resume) replaceResume(sanitizeResume(remote.resume))
    })

    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured, user])

  // push local edits up once signed in and the initial merge has happened -
  // TODO: fires on every climbs/customPeaks/resume change with no debounce,
  // fine at this data size but worth revisiting if logging climbs starts
  // feeling laggy on a slow connection
  useEffect(() => {
    if (!configured || !user || !hasMergedOnSignIn.current) return
    push(doc(getFirebaseDb(), 'logbooks', user.uid), climbs, customPeaks, resume)
  }, [configured, user, climbs, customPeaks, resume])

  function push(
    ref: DocumentReference,
    climbsToPush: ClimbsState,
    customToPush: Mountain[],
    resumeToPush: Resume,
  ) {
    const payload: CloudDoc = { climbs: climbsToPush, custom: customToPush, resume: resumeToPush }
    lastPushed.current = JSON.stringify(payload)
    setDoc(ref, payload).catch((err) => console.error('Summit Atlas: cloud sync write failed', err))
  }

  return null
}