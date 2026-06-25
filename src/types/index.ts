// ─── Enums ────────────────────────────────────────────────────────────────────

export type AnatomicRegion =
  | 'knee' | 'hip' | 'shoulder' | 'spine' | 'ankle' | 'wrist' | 'elbow'
  | 'pelvis' | 'femur' | 'tibia' | 'foot' | 'forearm' | 'humerus'
  | 'clavicle' | 'hand' | 'other'

export type Specialty =
  | 'trauma' | 'arthroscopy' | 'spine' | 'prosthesis' | 'soft-tissue'
  | 'oncology' | 'deformity' | 'pediatric' | 'other'

export type SurgicalApproach =
  | 'anterior' | 'posterior' | 'lateral' | 'medial' | 'anterolateral'
  | 'posterolateral' | 'posteromedial' | 'arthroscopic' | 'percutaneous'
  | 'supraclavicular' | 'transarticular' | 'other'

export type SurgeonRole = 'primary' | 'assistant' | 'instrumentation' | 'observer'

export type Laterality = 'left' | 'right' | 'bilateral' | 'na'

export type AgeGroup = 'pediatric' | 'adult' | 'both'

export type DataCompleteness = 'full' | 'partial' | 'standard'

export type ProcedureLevel = 'resident' | 'specialist'

export type ProcedureSource = 'kb' | 'user'

export type SyncState = 'local' | 'synced' | 'pending'

// ─── Procedure (catalog) ──────────────────────────────────────────────────────

export interface Procedure {
  id: string                     // stable slug (primary key)
  name: string
  aliases: string[]
  anatomicRegion: AnatomicRegion
  specialty: Specialty
  ageGroup: AgeGroup
  category: string
  approach: SurgicalApproach[]
  patientPosition?: string
  anesthesia?: string
  preopImaging?: string[]
  indications: string[]
  contraindications: string[]
  classifications: string[]
  steps: string[]                // surgical technique as ordered steps
  implants: string[]
  complications: string[]
  pearls: string[]
  durationMin: number | null
  durationMax: number | null
  recovery?: string
  references: string[]
  level: ProcedureLevel
  dataCompleteness: DataCompleteness
  tags: string[]
  videoUrl?: string
  source: ProcedureSource
  userEdited: boolean
}

// ─── SurgicalCase ─────────────────────────────────────────────────────────────

export interface SurgicalCase {
  id: string
  procedureId: string
  procedureNameSnapshot: string  // copy of name; survives catalog renames
  date: string                   // ISO yyyy-MM-dd
  role: SurgeonRole
  patientLabel?: string          // free text, NOT PII by design
  diagnosis?: string
  laterality?: Laterality
  institution?: string
  implantUsed?: string
  intraopNotes?: string
  notes?: string
  actualDurationMin?: number | null
  ownerId?: string               // Phase 1+
  collaborators?: string[]       // Phase 2+
  createdAt: string
  updatedAt: string
  syncState?: SyncState
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface Settings {
  weeklyGoal: number
  darkMode: boolean
  autoEnrich: boolean
  externalSearch: boolean
}

// ─── AppData (export/import) ──────────────────────────────────────────────────

export interface AppData {
  cases: SurgicalCase[]
  procedures: Procedure[]
  settings: Settings
  version: string
}

// ─── Display labels ───────────────────────────────────────────────────────────

export const ANATOMIC_REGION_LABELS: Record<AnatomicRegion, string> = {
  knee: 'Rodilla',
  hip: 'Cadera',
  shoulder: 'Hombro',
  spine: 'Columna',
  ankle: 'Tobillo',
  wrist: 'Muñeca',
  elbow: 'Codo',
  pelvis: 'Pelvis',
  femur: 'Fémur',
  tibia: 'Tibia',
  foot: 'Pie',
  forearm: 'Antebrazo',
  humerus: 'Húmero',
  clavicle: 'Clavícula',
  hand: 'Mano',
  other: 'Otra',
}

export const SPECIALTY_LABELS: Record<Specialty, string> = {
  trauma: 'Traumatología',
  arthroscopy: 'Artroscopía',
  spine: 'Columna',
  prosthesis: 'Prótesis',
  'soft-tissue': 'Tejidos blandos',
  oncology: 'Oncológica',
  deformity: 'Deformidades',
  pediatric: 'Pediátrica',
  other: 'Otra',
}

export const APPROACH_LABELS: Record<SurgicalApproach, string> = {
  anterior: 'Anterior',
  posterior: 'Posterior',
  lateral: 'Lateral',
  medial: 'Medial',
  anterolateral: 'Anterolateral',
  posterolateral: 'Posterolateral',
  posteromedial: 'Posteromedial',
  arthroscopic: 'Artroscópico',
  percutaneous: 'Percutáneo',
  supraclavicular: 'Supraclavicular',
  transarticular: 'Transarticular',
  other: 'Otro',
}

export const ROLE_LABELS: Record<SurgeonRole, string> = {
  primary: 'Cirujano principal',
  assistant: 'Ayudante',
  instrumentation: 'Instrumentación',
  observer: 'Observador',
}

export const LATERALITY_LABELS: Record<Laterality, string> = {
  left: 'Izquierdo',
  right: 'Derecho',
  bilateral: 'Bilateral',
  na: 'N/A',
}

export const COMPLETENESS_LABELS: Record<DataCompleteness, string> = {
  full: 'Completo',
  partial: 'Parcial',
  standard: 'Estándar',
}

export const PROCEDURE_CATEGORIES = [
  'osteosynthesis',
  'osteotomy',
  'arthroplasty',
  'arthroscopy',
  'arthrodesis',
  'soft-tissue-repair',
  'amputation',
  'tumor-resection',
  'deformity-correction',
  'nerve-release',
  'fasciotomy',
  'other',
] as const

export type ProcedureCategory = typeof PROCEDURE_CATEGORIES[number]

export const CATEGORY_LABELS: Record<ProcedureCategory, string> = {
  osteosynthesis: 'Osteosíntesis',
  osteotomy: 'Osteotomía',
  arthroplasty: 'Artroplastia',
  arthroscopy: 'Artroscopía',
  arthrodesis: 'Artrodesis',
  'soft-tissue-repair': 'Reparación tejidos blandos',
  amputation: 'Amputación',
  'tumor-resection': 'Resección tumoral',
  'deformity-correction': 'Corrección deformidad',
  'nerve-release': 'Liberación nerviosa',
  fasciotomy: 'Fasciotomía',
  other: 'Otra',
}
