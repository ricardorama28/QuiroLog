import { useState, useCallback } from 'react'
import type { SurgicalCase } from '../types'
import { getCases, saveCases } from '../lib/storage'

function newId(): string {
  return `case-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function useCases() {
  const [cases, setCases] = useState<SurgicalCase[]>(() => getCases())

  const persist = useCallback((list: SurgicalCase[]) => {
    saveCases(list)
    setCases(list)
  }, [])

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
      setCases((prev) => {
        const next = [...prev, entry]
        saveCases(next)
        return next
      })
      return entry
    },
    []
  )

  const updateCase = useCallback(
    (id: string, updates: Partial<Omit<SurgicalCase, 'id' | 'createdAt'>>) => {
      setCases((prev) => {
        const next = prev.map((c) =>
          c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString(), syncState: 'local' as const } : c
        )
        saveCases(next)
        return next
      })
    },
    []
  )

  const deleteCase = useCallback((id: string) => {
    setCases((prev) => {
      const next = prev.filter((c) => c.id !== id)
      saveCases(next)
      return next
    })
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
    setCases: persist,
  }
}
