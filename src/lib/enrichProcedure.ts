import type { Procedure } from '../types'
import { findProcedureInKnowledgeBase } from '../data/procedureKnowledgeBase'

function hasProtectedReference(p: Procedure): boolean {
  return p.referenceStatus === 'manual' || p.referenceStatus === 'accepted'
}

export function enrichProcedureFromKnowledgeBase(procedure: Procedure): Procedure | null {
  const match = findProcedureInKnowledgeBase(procedure.name)
  if (!match) return null

  const updated: Procedure = { ...procedure }
  let changed = false

  if (!updated.anatomicRegion || updated.anatomicRegion === 'other') {
    updated.anatomicRegion = match.anatomicRegion
    changed = true
  }
  if (!updated.specialty || updated.specialty === 'other') {
    updated.specialty = match.specialty
    changed = true
  }
  if (!updated.approach && match.approach) {
    updated.approach = match.approach
    changed = true
  }
  if (!updated.indication && match.indication) {
    updated.indication = match.indication
    changed = true
  }
  if (!updated.technique && match.technique) {
    updated.technique = match.technique
    changed = true
  }
  if (!updated.complications && match.complications) {
    updated.complications = match.complications
    changed = true
  }
  if (!updated.typicalDuration && match.typicalDuration) {
    updated.typicalDuration = match.typicalDuration
    changed = true
  }
  if (!updated.recovery && match.recovery) {
    updated.recovery = match.recovery
    changed = true
  }
  if (!updated.implants && match.implants) {
    updated.implants = match.implants
    changed = true
  }
  if (!updated.aliases && match.aliases) {
    updated.aliases = match.aliases
    changed = true
  }
  if (!hasProtectedReference(updated) && match.referenceUrl) {
    updated.referenceUrl = match.referenceUrl
    updated.referenceType = match.referenceType
    updated.referenceSource = match.referenceSource
    updated.referenceStatus = 'found'
    changed = true
  }

  if (!changed) return null
  updated.updatedAt = new Date().toISOString()
  return updated
}
