import { useState, useCallback } from 'react'
import type { SurgeryLog } from '../types'
import { getSurgeries, saveSurgeries } from '../lib/storage'

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function useSurgeries() {
  const [surgeries, setSurgeries] = useState<SurgeryLog[]>(() => getSurgeries())

  const persist = useCallback((logs: SurgeryLog[]) => {
    saveSurgeries(logs)
    setSurgeries(logs)
  }, [])

  const addSurgery = useCallback(
    (log: Omit<SurgeryLog, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString()
      const entry: SurgeryLog = { ...log, id: newId(), createdAt: now, updatedAt: now }
      setSurgeries((prev) => {
        const next = [...prev, entry]
        saveSurgeries(next)
        return next
      })
      return entry
    },
    []
  )

  const updateSurgery = useCallback(
    (id: string, updates: Partial<Omit<SurgeryLog, 'id' | 'createdAt'>>) => {
      setSurgeries((prev) => {
        const next = prev.map((s) =>
          s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
        )
        saveSurgeries(next)
        return next
      })
    },
    []
  )

  const deleteSurgery = useCallback((id: string) => {
    setSurgeries((prev) => {
      const next = prev.filter((s) => s.id !== id)
      saveSurgeries(next)
      return next
    })
  }, [])

  const getSurgeriesByDate = useCallback(
    (date: string) => surgeries.filter((s) => s.date === date),
    [surgeries]
  )

  const datesWithSurgeries = useCallback(() => {
    const set = new Set<string>()
    surgeries.forEach((s) => { if (s.type === 'surgery') set.add(s.date) })
    return set
  }, [surgeries])

  return {
    surgeries,
    addSurgery,
    updateSurgery,
    deleteSurgery,
    getSurgeriesByDate,
    datesWithSurgeries,
    setSurgeries: persist,
  }
}
