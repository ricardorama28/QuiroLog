export type DayType = 'surgery' | 'free' | 'guard' | 'academic'

export type ComplexityType = 'routine' | 'moderate' | 'complex' | 'emergency'

export type AnatomicRegion =
  | 'spine'
  | 'knee'
  | 'hip'
  | 'shoulder'
  | 'elbow'
  | 'ankle'
  | 'wrist'
  | 'pelvis'
  | 'other'

export type SurgicalSpecialty =
  | 'trauma'
  | 'arthroscopy'
  | 'spine'
  | 'prosthesis'
  | 'soft-tissue'
  | 'pediatric'
  | 'other'

export type SurgicalApproach =
  | 'anterior'
  | 'posterior'
  | 'lateral'
  | 'arthroscopic'
  | 'percutaneous'
  | 'other'

export type SurgeonRole = 'primary' | 'assistant' | 'observer'

export type ReferenceStatus = 'none' | 'pending' | 'found' | 'manual' | 'accepted' | 'failed'
export type ReferenceType = 'youtube' | 'vimeo' | 'other'

export interface Procedure {
  id: string
  name: string
  nameLower: string
  anatomicRegion: AnatomicRegion
  specialty: SurgicalSpecialty
  approach?: SurgicalApproach
  indication?: string
  technique?: string
  complications?: string
  typicalDuration?: number
  recovery?: string
  implants?: string
  referenceUrl?: string
  referenceType?: ReferenceType
  referenceSource?: string
  referenceStatus: ReferenceStatus
  videoUrl?: string
  aliases?: string[]
  createdAt: string
  updatedAt: string
}

export interface SurgeryLog {
  id: string
  date: string
  type: DayType
  procedureId?: string
  procedureName?: string
  complexity?: ComplexityType
  duration?: number
  collaborators?: string[]
  complications?: string
  role?: SurgeonRole
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Settings {
  weeklyGoal: number
  restDays: number[]
  restDaysKeepStreak: boolean
  darkMode: boolean
  autoEnrich: boolean
  externalSearch: boolean
}

export interface AppData {
  surgeryLogs: SurgeryLog[]
  procedures: Procedure[]
  settings: Settings
  version: string
}

export const ANATOMIC_REGION_LABELS: Record<AnatomicRegion, string> = {
  spine: 'Columna',
  knee: 'Rodilla',
  hip: 'Cadera',
  shoulder: 'Hombro',
  elbow: 'Codo',
  ankle: 'Tobillo',
  wrist: 'Muñeca',
  pelvis: 'Pelvis',
  other: 'Otra',
}

export const SPECIALTY_LABELS: Record<SurgicalSpecialty, string> = {
  trauma: 'Traumatología',
  arthroscopy: 'Artroscopía',
  spine: 'Columna',
  prosthesis: 'Prótesis',
  'soft-tissue': 'Tejidos blandos',
  pediatric: 'Pediátrica',
  other: 'Otra',
}

export const APPROACH_LABELS: Record<SurgicalApproach, string> = {
  anterior: 'Anterior',
  posterior: 'Posterior',
  lateral: 'Lateral',
  arthroscopic: 'Artroscópico',
  percutaneous: 'Percutáneo',
  other: 'Otro',
}

export const COMPLEXITY_LABELS: Record<ComplexityType, string> = {
  routine: 'Rutinaria',
  moderate: 'Moderada',
  complex: 'Compleja',
  emergency: 'Urgencia',
}

export const ROLE_LABELS: Record<SurgeonRole, string> = {
  primary: 'Cirujano principal',
  assistant: 'Ayudante',
  observer: 'Observador',
}

export const DAY_TYPE_LABELS: Record<DayType, string> = {
  surgery: 'Pabellón',
  free: 'Libre',
  guard: 'Guardia',
  academic: 'Académico',
}
