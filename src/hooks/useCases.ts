import { useCallback, useSyncExternalStore } from 'react'
import type { SurgicalCase } from '../types'
import { addTombstone } from '../lib/storage'
import { casesStore } from '../lib/casesStore'
import { pushCase, deleteRemoteCase } from '../lib/sync'
import { useAuth } from '../context/AuthContext'

function newId(): string {
  return `case-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function useCases() {
  const cases = useSyncExternalStore(casesStore.subscribe, casesStore.get)
  const { user } = useAuth()

  const addCase = useCallback(
    (data: Omit<SurgicalCase, 'id' | 'createdAt' | 'updatedAt' | 'syncState'>) => {
      const now = new Date().toISOString()
      const entry: SurgicalCase = {
        ...data,
        id: newId(),
        createdAt: now,
        updatedAt: now,
        syncState: 'local',
      }
      casesStore.set([...casesStore.get(), entry])
      if (user) {
        pushCase(entry, user.id).then(ok => {
          casesStore.set(casesStore.get().map(c =>
            c.id === entry.id ? { ...c, syncState: ok ? 'synced' : 'pending' } : c
          ))
        })
      }
      return entry
    },
    [user]
  )

  const updateCase = useCallback(
    (id: string, updates: Partial<Omit<SurgicalCase, 'id' | 'createdAt'>>) => {
      const next = casesStore.get().map((c) =>
        c.id === id
          ? { ...c, ...updates, updatedAt: new Date().toISOString(), syncState: 'local' as const }
          : c
      )
      casesStore.set(next)
      if (user) {
        const updated = casesStore.get().find(c => c.id === id)
        if (updated) {
          pushCase(updated, user.id).then(ok => {
            if (!ok) {
              casesStore.set(casesStore.get().map(c =>
                c.id === id ? { ...c, syncState: 'pending' } : c
              ))
            }
          })
        }
      }
    },
    [user]
  )

  const deleteCase = useCallback((id: string) => {
    casesStore.set(casesStore.get().filter((c) => c.id !== id))
    if (user) {
      deleteRemoteCase(id).then(ok => {
        if (!ok) addTombstone({ id, kind: 'case' })
      })
    } else {
      addTombstone({ id, kind: 'case' })
    }
  }, [user])

  const getCasesByDate = useCallback(
    (date: string) => cases.filter((c) => c.date === date),
    [cases]
  )

  const datesWithCases = useCallback(() => {
    const set = new Set<string>()
    cases.forEach((c) => set.add(c.date))
    return set
  }, [cases])

  return {
    cases,
    addCase,
    updateCase,
    deleteCase,
    getCasesByDate,
    datesWithCases,
    setCases: casesStore.set,
  }
}
