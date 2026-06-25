import { useCallback, useSyncExternalStore } from 'react'
import type { Procedure } from '../types'
import { getKbSeededVersion, setKbSeededVersion, addTombstone } from '../lib/storage'
import { normalize, kbBySlug, kbByAlias, knowledgeBase, KB_VERSION } from '../data/procedureKnowledgeBase'
import { proceduresStore } from '../lib/proceduresStore'
import { upsertOverride, deleteRemoteOverride, isOverride } from '../lib/sync'
import { useAuth } from '../context/AuthContext'

export function seedKnowledgeBaseIfNeeded(): void {
  const storedVersion = getKbSeededVersion()
  if (storedVersion === KB_VERSION) return
  const stored = proceduresStore.get()
  const storedIds = new Set(stored.map((p) => p.id))
  const missing = knowledgeBase.filter((p) => !storedIds.has(p.id))
  if (missing.length > 0) {
    proceduresStore.set([...missing, ...stored])
  }
  setKbSeededVersion(KB_VERSION)
}

function newId(): string {
  return `proc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

type NewProcedureData = Omit<Procedure, 'id' | 'source' | 'userEdited'>

export function useProcedures() {
  const procedures = useSyncExternalStore(proceduresStore.subscribe, proceduresStore.get)
  const { user } = useAuth()

  const addProcedure = useCallback((data: NewProcedureData) => {
    const procedure: Procedure = {
      ...data,
      id: newId(),
      source: 'user',
      userEdited: false,
    }
    proceduresStore.set([...proceduresStore.get(), procedure])
    if (user) upsertOverride(procedure, user.id)
    return procedure
  }, [user])

  const updateProcedure = useCallback(
    (id: string, updates: Partial<Omit<Procedure, 'id' | 'source'>>) => {
      const next = proceduresStore.get().map((p) => {
        if (p.id !== id) return p
        return { ...p, ...updates, userEdited: true }
      })
      proceduresStore.set(next)
      if (user) {
        const updated = proceduresStore.get().find(p => p.id === id)
        if (updated && isOverride(updated)) upsertOverride(updated, user.id)
      }
    },
    [user]
  )

  const deleteProcedure = useCallback((id: string) => {
    proceduresStore.set(proceduresStore.get().filter((p) => p.id !== id))
    if (user) {
      deleteRemoteOverride(id).then(ok => {
        if (!ok) addTombstone({ id, kind: 'procedure' })
      })
    } else {
      addTombstone({ id, kind: 'procedure' })
    }
  }, [user])

  const togglePin = useCallback((id: string) => {
    const next = proceduresStore.get().map((p) =>
      p.id === id ? { ...p, pinned: !p.pinned } : p
    )
    proceduresStore.set(next)
    if (user) {
      const toggled = proceduresStore.get().find(p => p.id === id)
      if (toggled) {
        if (isOverride(toggled)) {
          upsertOverride(toggled, user.id)
        } else {
          deleteRemoteOverride(id)
        }
      }
    }
  }, [user])

  const enrichExisting = useCallback(() => {
    let changed = false
    const next = proceduresStore.get().map((p) => {
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
    if (changed) proceduresStore.set(next)
  }, [])

  return {
    procedures,
    addProcedure,
    updateProcedure,
    deleteProcedure,
    togglePin,
    enrichExisting,
    setProcedures: proceduresStore.set,
  }
}
