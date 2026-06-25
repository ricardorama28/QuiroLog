import { useState, useCallback } from 'react'
import type { Procedure } from '../types'
import { getProcedures, saveProcedures, getKbSeededVersion, setKbSeededVersion } from '../lib/storage'
import { normalize, kbBySlug, kbByAlias, knowledgeBase, KB_VERSION } from '../data/procedureKnowledgeBase'

export function seedKnowledgeBaseIfNeeded(): void {
  const storedVersion = getKbSeededVersion()
  if (storedVersion === KB_VERSION) return
  const stored = getProcedures()
  const storedIds = new Set(stored.map((p) => p.id))
  const missing = knowledgeBase.filter((p) => !storedIds.has(p.id))
  if (missing.length > 0) {
    saveProcedures([...missing, ...stored])
  }
  setKbSeededVersion(KB_VERSION)
}

function newId(): string {
  return `proc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

type NewProcedureData = Omit<Procedure, 'id' | 'source' | 'userEdited'>

export function useProcedures() {
  const [procedures, setProcedures] = useState<Procedure[]>(() => getProcedures())

  const persist = useCallback((list: Procedure[]) => {
    saveProcedures(list)
    setProcedures(list)
  }, [])

  const addProcedure = useCallback((data: NewProcedureData) => {
    const procedure: Procedure = {
      ...data,
      id: newId(),
      source: 'user',
      userEdited: false,
    }
    setProcedures((prev) => {
      const next = [...prev, procedure]
      saveProcedures(next)
      return next
    })
    return procedure
  }, [])

  const updateProcedure = useCallback(
    (id: string, updates: Partial<Omit<Procedure, 'id' | 'source'>>) => {
      setProcedures((prev) => {
        const next = prev.map((p) => {
          if (p.id !== id) return p
          return { ...p, ...updates, userEdited: true }
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

  const enrichExisting = useCallback(() => {
    let changed = false
    const next = procedures.map((p) => {
      if (p.userEdited) return p

      const kbMatch = kbBySlug.get(p.id) ?? kbByAlias.get(normalize(p.name))
      if (!kbMatch) return p

      let updated = { ...p }
      let dirty = false

      function fill<K extends keyof Procedure>(key: K, val: Procedure[K]) {
        const cur = updated[key]
        const isEmpty = cur === undefined || cur === null || cur === '' ||
          (Array.isArray(cur) && cur.length === 0)
        if (isEmpty) { (updated as Record<string, unknown>)[key] = val; dirty = true }
      }

      fill('anatomicRegion', kbMatch.anatomicRegion)
      fill('specialty', kbMatch.specialty)
      fill('ageGroup', kbMatch.ageGroup)
      fill('category', kbMatch.category)
      fill('approach', kbMatch.approach)
      fill('indications', kbMatch.indications)
      fill('contraindications', kbMatch.contraindications)
      fill('classifications', kbMatch.classifications)
      fill('steps', kbMatch.steps)
      fill('implants', kbMatch.implants)
      fill('complications', kbMatch.complications)
      fill('pearls', kbMatch.pearls)
      fill('durationMin', kbMatch.durationMin)
      fill('durationMax', kbMatch.durationMax)
      fill('aliases', kbMatch.aliases)
      fill('tags', kbMatch.tags)
      fill('level', kbMatch.level)
      if (kbMatch.recovery) fill('recovery', kbMatch.recovery)
      if (kbMatch.anesthesia) fill('anesthesia', kbMatch.anesthesia)
      if (kbMatch.patientPosition) fill('patientPosition', kbMatch.patientPosition)

      if (dirty) { changed = true; return updated }
      return p
    })
    if (changed) persist(next)
  }, [procedures, persist])

  return {
    procedures,
    addProcedure,
    updateProcedure,
    deleteProcedure,
    enrichExisting,
    setProcedures: persist,
  }
}
