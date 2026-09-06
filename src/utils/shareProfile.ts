import { doc, setDoc } from 'firebase/firestore'
import { getFirebaseDb } from '../lib/firebase'

// raw uid in the URL for now (no custom slug) - zero extra infrastructure,
// a slug would need its own lookup collection and a uniqueness check. easy
// to add later without touching anything else, since it'd just be an
// alternate way to resolve the same uid
export function getPublicProfileUrl(uid: string): string {
  return `${window.location.origin}/u/${uid}`
}

// merge: true so this never touches climbs/custom/resume - CloudSync owns
// writing those, this only ever sets the one flag
export async function setProfileShared(uid: string, shared: boolean): Promise<void> {
  await setDoc(doc(getFirebaseDb(), 'logbooks', uid), { shared }, { merge: true })
}