import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import { reconcile, flushPending } from '../lib/sync'

const LOCAL_ONLY_KEY = 'quirolog_local_only'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  localOnly: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  continueLocally: () => void
  syncToCloud: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [localOnly, setLocalOnly] = useState(() => localStorage.getItem(LOCAL_ONLY_KEY) === 'true')

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
  }, [])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase no configurado')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase no configurado')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setLocalOnly(false)
    localStorage.removeItem(LOCAL_ONLY_KEY)
  }, [])

  const continueLocally = useCallback(() => {
    localStorage.setItem(LOCAL_ONLY_KEY, 'true')
    setLocalOnly(true)
  }, [])

  const syncToCloud = useCallback(async () => {
    if (!user) return
    await reconcile(user.id)
  }, [user])

  // On login: reconcile local and remote data (LWW merge)
  useEffect(() => {
    if (!supabase || !user) return
    reconcile(user.id).catch(console.error)
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  // On reconnect: flush any pending writes
  useEffect(() => {
    if (!user) return
    const handle = () => flushPending(user.id).catch(console.error)
    window.addEventListener('online', handle)
    return () => window.removeEventListener('online', handle)
  }, [user])

  return (
    <AuthContext.Provider value={{ user, session, loading, localOnly, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, continueLocally, syncToCloud }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
