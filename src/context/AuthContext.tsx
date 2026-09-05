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
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function toAuthUser(user: User): AuthUser {
  return { uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  // no Firebase config means there's nothing to wait on - starting "ready"
  // in that case keeps the account area from sitting in a loading state
  // that would never resolve
  const [authReady, setAuthReady] = useState(!firebaseConfigured)

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
    signIn: async () => {
      if (!firebaseConfigured) {
        console.warn('Add a Firebase config to .env.local to enable sign-in - see .env.example')
        return
      }
      await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider())
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