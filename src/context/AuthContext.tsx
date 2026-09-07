import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { firebaseConfigured, getFirebaseAuth } from '../lib/firebase'

export interface AuthUser {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
}

interface AuthContextValue {
  user: AuthUser | null
  configured: boolean
  authReady: boolean
  authError: string | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function toAuthUser(user: User): AuthUser {
  return { uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL }
}

// signInWithPopup rejects with a FirebaseError carrying a .code - mapped to
// something a non-developer can actually act on. Anything not listed here
// falls back to a generic message; the raw error is always still
// console.error'd separately for whoever's actually debugging it
function describeAuthError(error: unknown): string {
  const code = error && typeof error === 'object' && 'code' in error ? String((error as { code: unknown }).code) : ''
  switch (code) {
    case 'auth/unauthorized-domain':
      return "This domain isn't authorized yet - add it under Authentication > Settings > Authorized domains in the Firebase console."
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled for this Firebase project yet - turn it on under Authentication > Sign-in method.'
    case 'auth/popup-blocked':
      return 'Your browser blocked the sign-in popup - allow popups for this site and try again.'
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      // fires either on a genuine cancel, or on a known Chrome+Firebase
      // interaction where Google's own Cross-Origin-Opener-Policy on the
      // popup blocks Firebase's "is it still open" check and it wrongly
      // concludes the popup was closed a moment after it actually opened -
      // worth naming explicitly since "closed by user" reads as user error
      // when it usually isn't
      return "Sign-in didn't complete. If the popup flashed and closed on its own rather than you closing it, that's a known Chrome/Firebase interaction, not something wrong with your account - let me know if this keeps happening."
    default:
      return 'Sign-in failed. Check the browser console for the full error.'
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  // no Firebase config means there's nothing to wait on - starting "ready"
  // in that case keeps the account area from sitting in a loading state
  // that would never resolve
  const [authReady, setAuthReady] = useState(!firebaseConfigured)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    if (!firebaseConfigured) return
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (firebaseUser) => {
      setUser(firebaseUser ? toAuthUser(firebaseUser) : null)
      setAuthReady(true)
    })
    return unsubscribe
  }, [])

  const value: AuthContextValue = {
    user,
    configured: firebaseConfigured,
    authReady,
    authError,
    signIn: async () => {
      if (!firebaseConfigured) {
        console.warn('Add a Firebase config to .env.local to enable sign-in - see .env.example')
        return
      }
      setAuthError(null)
      try {
        await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider())
      } catch (err) {
        console.error('Summit Atlas: Google sign-in failed', err)
        setAuthError(describeAuthError(err))
      }
    },
    signOut: async () => {
      if (!firebaseConfigured) return
      await firebaseSignOut(getFirebaseAuth())
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider')
  }
  return context
}