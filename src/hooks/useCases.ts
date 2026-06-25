import { useCallback, useSyncExternalStore } from 'react'
import type { SurgicalCase } from '../types'
import { getCases, saveCases } from '../lib/storage'
import { createPersistentStore } from '../lib/store'

const casesStore = createPersistentStore<SurgicalCase[]>(getCases, saveCases)

function newId(): string {
  return `case-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function useCases() {
  const cases = useSyncExternalStore(casesStore.subscribe, casesStore.get)

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
      return entry
    },
    []
  )

  const updateCase = useCallback(
    (id: string, updates: Partial<Omit<SurgicalCase, 'id' | 'createdAt'>>) => {
      const next = casesStore.get().map((c) =>
        c.id === id
          ? { ...c, ...updates, updatedAt: new Date().toISOString(), syncState: 'local' as const }
          : c
      )
      casesStore.set(next)
    },
    []
  )

  const deleteCase = useCallback((id: string) => {
    casesStore.set(casesStore.get().filter((c) => c.id !== id))
  }, [])

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
