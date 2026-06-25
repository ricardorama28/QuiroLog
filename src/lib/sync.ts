import { supabase } from './supabase'
import type { SurgicalCase, Procedure } from '../types'
import { getCases, saveCases, getProcedures, saveProcedures, getTombstones, clearTombstones } from './storage'
import { casesStore } from './casesStore'
import { proceduresStore } from './proceduresStore'

// ── Helpers ──────────────────────────────────────────────────────────────────

function caseToRow(c: SurgicalCase, ownerId: string) {
  return {
    id: c.id,
    owner_id: ownerId,
    procedure_id: c.procedureId,
    procedure_name_snapshot: c.procedureNameSnapshot,
    date: c.date,
    status: c.status,
    role: c.role,
    laterality: c.laterality ?? null,
    patient_label: c.patientLabel ?? null,
    diagnosis: c.diagnosis ?? null,
    institution: c.institution ?? null,
    implant_used: c.implantUsed ?? null,
    intraop_notes: c.intraopNotes ?? null,
    notes: c.notes ?? null,
    actual_duration_min: c.actualDurationMin ?? null,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  }
}

function rowToCase(row: Record<string, unknown>): SurgicalCase {
  return {
    id: row.id as string,
    procedureId: (row.procedure_id as string) ?? '',
    procedureNameSnapshot: (row.procedure_name_snapshot as string) ?? '',
    date: row.date as string,
    status: (row.status as 'planned' | 'done') ?? 'done',
    role: row.role as SurgicalCase['role'],
    laterality: (row.laterality as SurgicalCase['laterality']) ?? undefined,
    patientLabel: (row.patient_label as string) ?? undefined,
    diagnosis: (row.diagnosis as string) ?? undefined,
    institution: (row.institution as string) ?? undefined,
    implantUsed: (row.implant_used as string) ?? undefined,
    intraopNotes: (row.intraop_notes as string) ?? undefined,
    notes: (row.notes as string) ?? undefined,
    actualDurationMin: (row.actual_duration_min as number) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    syncState: 'synced',
    ownerId: row.owner_id as string,
  }
}

// ── Write-through helpers (called by hooks) ───────────────────────────────────

export async function pushCase(c: SurgicalCase, ownerId: string): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.from('cases').upsert(caseToRow(c, ownerId))
  return !error
}

export async function deleteRemoteCase(id: string): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.from('cases').delete().eq('id', id)
  if (!error) {
    await supabase.from('tombstones').delete().eq('id', id).eq('kind', 'case')
  }
  return !error
}

export function isOverride(p: Procedure): boolean {
  return p.source === 'user' || p.userEdited || !!p.pinned
}

export async function upsertOverride(p: Procedure, ownerId: string): Promise<boolean> {
  if (!supabase || !isOverride(p)) return false
  const { error } = await supabase.from('procedure_overrides').upsert({
    id: p.id,
    owner_id: ownerId,
    payload: p,
    source: p.source,
    user_edited: p.userEdited,
    updated_at: new Date().toISOString(),
  })
  return !error
}

export async function deleteRemoteOverride(id: string): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.from('procedure_overrides').delete().eq('id', id)
  return !error
}

// ── Flush tombstones ──────────────────────────────────────────────────────────

async function flushTombstones(): Promise<void> {
  if (!supabase) return
  const tombstones = getTombstones()
  if (tombstones.length === 0) return
  for (const t of tombstones) {
    if (t.kind === 'case') await deleteRemoteCase(t.id)
    else await deleteRemoteOverride(t.id)
  }
  clearTombstones()
}

// ── Reconcile (called once on login) ─────────────────────────────────────────

export async function reconcile(ownerId: string): Promise<void> {
  if (!supabase) return

  // 1. Flush pending deletes first so they don't re-appear from remote
  await flushTombstones()

  // 2. Pull remote cases and overrides
  const { data: remoteCases } = await supabase
    .from('cases').select('*').eq('owner_id', ownerId)
  const { data: remoteOverrides } = await supabase
    .from('procedure_overrides').select('*').eq('owner_id', ownerId)

  // 3. Merge cases: LWW by updatedAt
  const local = getCases()
  const localMap = new Map(local.map(c => [c.id, c]))
  const remoteMap = new Map(
    (remoteCases ?? []).map(r => [r.id as string, rowToCase(r as Record<string, unknown>)])
  )

  const allIds = new Set([...localMap.keys(), ...remoteMap.keys()])
  const merged: SurgicalCase[] = []
  const toPush: SurgicalCase[] = []

  for (const id of allIds) {
    const lc = localMap.get(id)
    const rc = remoteMap.get(id)
    if (lc && rc) {
      merged.push(lc.updatedAt >= rc.updatedAt ? { ...lc, syncState: 'synced' } : rc)
    } else if (lc) {
      toPush.push(lc)
      merged.push({ ...lc, syncState: 'synced' })
    } else if (rc) {
      merged.push(rc)
    }
  }

  saveCases(merged)
  casesStore.set(merged)

  // Push local-only cases to remote
  await Promise.allSettled(toPush.map(c => pushCase(c, ownerId)))

  // 4. Apply remote overrides on top of local procedures
  if (remoteOverrides && remoteOverrides.length > 0) {
    const procs = getProcedures()
    const procMap = new Map(procs.map(p => [p.id, p]))
    for (const row of remoteOverrides) {
      const override = row.payload as Procedure
      procMap.set(override.id, override)
    }
    const next = [...procMap.values()]
    saveProcedures(next)
    proceduresStore.set(next)
  }

  // 5. Push local-only overrides not yet in remote
  const remoteOverrideIds = new Set((remoteOverrides ?? []).map(r => r.id as string))
  const localOverrides = getProcedures().filter(p => isOverride(p) && !remoteOverrideIds.has(p.id))
  await Promise.allSettled(localOverrides.map(p => upsertOverride(p, ownerId)))
}

// ── Flush pending (called on online event) ────────────────────────────────────

export async function flushPending(ownerId: string): Promise<void> {
  if (!supabase) return
  const cases = getCases()
  const pending = cases.filter(c => c.syncState === 'pending')
  await Promise.allSettled(pending.map(c => pushCase(c, ownerId)))
  await flushTombstones()
}
