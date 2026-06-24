import { useState, useCallback } from 'react'
import type { Procedure, AnatomicRegion, SurgicalSpecialty } from '../types'
import { getProcedures, saveProcedures } from '../lib/storage'
import { enrichProcedureFromKnowledgeBase } from '../lib/enrichProcedure'

function newId(): string {
  return `proc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ')
}

export function useProcedures() {
  const [procedures, setProcedures] = useState<Procedure[]>(() => getProcedures())

  const persist = useCallback((list: Procedure[]) => {
    saveProcedures(list)
    setProcedures(list)
  }, [])

  const addProcedure = useCallback(
    (data: Omit<Procedure, 'id' | 'nameLower' | 'createdAt' | 'updatedAt' | 'referenceStatus'>) => {
      const now = new Date().toISOString()
      const procedure: Procedure = {
        ...data,
        id: newId(),
        nameLower: normalizeName(data.name),
        referenceStatus: 'none',
        createdAt: now,
        updatedAt: now,
      }
      setProcedures((prev) => {
        const next = [...prev, procedure]
        saveProcedures(next)
        return next
      })
      return procedure
    },
    []
  )

  const updateProcedure = useCallback(
    (id: string, updates: Partial<Omit<Procedure, 'id' | 'createdAt'>>) => {
      setProcedures((prev) => {
        const next = prev.map((p) => {
          if (p.id !== id) return p
          const updated = { ...p, ...updates, updatedAt: new Date().toISOString() }
          if (updates.name) updated.nameLower = normalizeName(updates.name)
          return updated
        })
        saveProcedures(next)
        return next
      })
    },
    []
  )

  const deleteProcedure = useCallback((id: string) => {
    setProcedures((prev) => {
      const next = prev.filter((p) => p.id !== id)
      saveProcedures(next)
      return next
    })
  }, [])

  const getOrCreate = useCallback(
    (name: string, region: AnatomicRegion = 'other', specialty: SurgicalSpecialty = 'other') => {
      const lower = normalizeName(name)
      const existing = procedures.find((p) => p.nameLower === lower)
      if (existing) return existing
      return addProcedure({ name, anatomicRegion: region, specialty })
    },
    [procedures, addProcedure]
  )

  const enrichExisting = useCallback(() => {
    let changed = false
    const next = procedures.map((p) => {
      const enriched = enrichProcedureFromKnowledgeBase(p)
      if (enriched) { changed = true; return enriched }
      return p
    })
    if (changed) persist(next)
  }, [procedures, persist])

  return {
    procedures,
    addProcedure,
    updateProcedure,
    deleteProcedure,
    getOrCreate,
    enrichExisting,
    setProcedures: persist,
  }
}
