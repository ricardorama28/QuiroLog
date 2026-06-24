import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import { exportAll, importAll, hasLocalData } from '../lib/storage'

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
    if (!supabase || !user) return
    const data = exportAll()
    await supabase.from('user_data').upsert({ user_id: user.id, data: JSON.stringify(data) }, { onConflict: 'user_id' })
  }, [user])

  // Cloud-first: on login, pull data if cloud has more; push local if cloud is empty
  useEffect(() => {
    if (!supabase || !user) return
    ;(async () => {
      const { data: row } = await supabase!
        .from('user_data')
        .select('data')
        .eq('user_id', user.id)
        .single()
      if (row?.data) {
        try {
          const cloudData = JSON.parse(row.data)
          importAll(cloudData)
        } catch {}
      } else if (hasLocalData()) {
        await syncToCloud()
      }
    })()
  }, [user, syncToCloud])

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
