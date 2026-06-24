import type { SurgeryLog, Procedure, Settings, AppData } from '../types'

const KEYS = {
  surgeries: 'quirolog_surgeries',
  procedures: 'quirolog_procedures',
  settings: 'quirolog_settings',
}

const DEFAULT_SETTINGS: Settings = {
  weeklyGoal: 3,
  restDays: [],
  restDaysKeepStreak: false,
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

export function getSurgeries(): SurgeryLog[] {
  return parse<SurgeryLog[]>(KEYS.surgeries, [])
}

export function saveSurgeries(logs: SurgeryLog[]) {
  save(KEYS.surgeries, logs)
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

export function hasLocalData(): boolean {
  return (
    localStorage.getItem(KEYS.surgeries) !== null ||
    localStorage.getItem(KEYS.procedures) !== null
  )
}

export function exportAll(): AppData {
  return {
    surgeryLogs: getSurgeries(),
    procedures: getProcedures(),
    settings: getSettings(),
    version: '1.0',
  }
}

export function importAll(data: AppData) {
  if (data.surgeryLogs) saveSurgeries(data.surgeryLogs)
  if (data.procedures) saveProcedures(data.procedures)
  if (data.settings) saveSettings({ ...DEFAULT_SETTINGS, ...data.settings })
}

export function clearAll() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
}
