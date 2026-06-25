import type { SurgicalCase, SurgicalCaseStatus, Procedure, Settings, AppData } from '../types'

const KEYS = {
  cases: 'quirolog_cases',
  procedures: 'quirolog_procedures',
  settings: 'quirolog_settings',
  kbSeededVersion: 'quirolog_kb_seeded_version',
  tombstones: 'quirolog_tombstones',
}

const DEFAULT_SETTINGS: Settings = {
  weeklyGoal: 3,
  darkMode: false,
  autoEnrich: true,
  externalSearch: false,
}

function parse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full or unavailable
  }
}

export function getCases(): SurgicalCase[] {
  const raw = parse<SurgicalCase[]>(KEYS.cases, [])
  return raw.map(c => ({ ...c, status: (c.status as SurgicalCaseStatus | undefined) ?? 'done' }))
}

export function saveCases(cases: SurgicalCase[]) {
  save(KEYS.cases, cases)
}

export function getProcedures(): Procedure[] {
  return parse<Procedure[]>(KEYS.procedures, [])
}

export function saveProcedures(procedures: Procedure[]) {
  save(KEYS.procedures, procedures)
}

export function getSettings(): Settings {
  const stored = parse<Partial<Settings>>(KEYS.settings, {})
  return { ...DEFAULT_SETTINGS, ...stored }
}

export function saveSettings(settings: Settings) {
  save(KEYS.settings, settings)
}

export function getKbSeededVersion(): string {
  return localStorage.getItem(KEYS.kbSeededVersion) ?? ''
}

export function setKbSeededVersion(version: string) {
  localStorage.setItem(KEYS.kbSeededVersion, version)
}

export function hasLocalData(): boolean {
  return (
    localStorage.getItem(KEYS.cases) !== null ||
    localStorage.getItem(KEYS.procedures) !== null
  )
}

export function exportAll(): AppData {
  return {
    cases: getCases(),
    procedures: getProcedures(),
    settings: getSettings(),
    version: '2.0',
  }
}

export function importAll(data: AppData) {
  if (data.cases) saveCases(data.cases)
  if (data.procedures) saveProcedures(data.procedures)
  if (data.settings) saveSettings({ ...DEFAULT_SETTINGS, ...data.settings })
}

export interface Tombstone { id: string; kind: 'case' | 'procedure' }

export function getTombstones(): Tombstone[] {
  return parse<Tombstone[]>(KEYS.tombstones, [])
}

export function addTombstone(t: Tombstone) {
  const existing = getTombstones()
  if (!existing.some(x => x.id === t.id)) save(KEYS.tombstones, [...existing, t])
}

export function clearTombstones() {
  localStorage.removeItem(KEYS.tombstones)
}

export function clearAll() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
}
