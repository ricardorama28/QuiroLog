import { useState, useMemo } from 'react'
import { Plus, Search, Stethoscope, ChevronDown, ChevronUp, Pencil, Trash2, Star } from 'lucide-react'
import { useProcedures } from '../hooks/useProcedures'
import { useCases } from '../hooks/useCases'
import { normalize } from '../data/procedureKnowledgeBase'
import type { Procedure, AnatomicRegion, Specialty, SurgicalApproach, ProcedureLevel, AgeGroup } from '../types'
import {
  ANATOMIC_REGION_LABELS,
  SPECIALTY_LABELS,
  APPROACH_LABELS,
  PROCEDURE_CATEGORIES,
  CATEGORY_LABELS,
} from '../types'

const REGIONS = Object.entries(ANATOMIC_REGION_LABELS) as [AnatomicRegion, string][]
const SPECIALTIES = Object.entries(SPECIALTY_LABELS) as [Specialty, string][]
const APPROACHES = Object.entries(APPROACH_LABELS) as [SurgicalApproach, string][]

const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm'
const labelCls = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'

const EMPTY_FORM = {
  name: '',
  aliases: '',
  anatomicRegion: 'other' as AnatomicRegion,
  specialty: 'other' as Specialty,
  ageGroup: 'adult' as AgeGroup,
  category: 'other',
  approach: [] as SurgicalApproach[],
  level: 'resident' as ProcedureLevel,
  indications: '',
  contraindications: '',
  classifications: '',
  steps: '',
  implants: '',
  complications: '',
  pearls: '',
  durationMin: '',
  durationMax: '',
  anesthesia: '',
  patientPosition: '',
  recovery: '',
  videoUrl: '',
  references: '',
  tags: '',
}

function splitLines(s: string): string[] {
  return s.split('\n').map(l => l.trim()).filter(Boolean)
}

type FormState = typeof EMPTY_FORM

function ProcedureForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: FormState
  onSave: (f: FormState) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<FormState>(initial ?? EMPTY_FORM)
  const [showDetail, setShowDetail] = useState(false)

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function toggleApproach(a: SurgicalApproach) {
    setForm(f => ({
      ...f,
      approach: f.approach.includes(a) ? f.approach.filter(x => x !== a) : [...f.approach, a],
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className={labelCls}>Nombre *</label>
        <input
          autoFocus
          value={form.name}
          onChange={e => set('name', e.target.value)}
          required
          placeholder="Nombre del procedimiento"
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Región anatómica</label>
          <select value={form.anatomicRegion} onChange={e => set('anatomicRegion', e.target.value as AnatomicRegion)} className={inputCls}>
            {REGIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Especialidad</label>
          <select value={form.specialty} onChange={e => set('specialty', e.target.value as Specialty)} className={inputCls}>
            {SPECIALTIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Categoría</label>
          <select value={form.category} onChange={e => set('category', e.target.value)} className={inputCls}>
            {PROCEDURE_CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Nivel</label>
          <select value={form.level} onChange={e => set('level', e.target.value as ProcedureLevel)} className={inputCls}>
            <option value="resident">Residente</option>
            <option value="specialist">Especialista</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Abordajes</label>
        <div className="flex flex-wrap gap-1.5">
          {APPROACHES.map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => toggleApproach(v)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                form.approach.includes(v)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Detail toggle */}
      <button
        type="button"
        onClick={() => setShowDetail(v => !v)}
        className="flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 font-medium"
      >
        {showDetail ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {showDetail ? 'Ocultar detalle técnico' : 'Agregar detalle técnico'}
      </button>

      {showDetail && (
        <div className="space-y-3 border-t border-gray-100 dark:border-gray-800 pt-3">
          {([
            ['indications', 'Indicaciones (una por línea)'],
            ['contraindications', 'Contraindicaciones (una por línea)'],
            ['steps', 'Pasos de la técnica (uno por línea)'],
            ['complications', 'Complicaciones (una por línea)'],
            ['pearls', 'Perlas / tips (una por línea)'],
            ['implants', 'Implantes (uno por línea)'],
            ['classifications', 'Clasificaciones (una por línea)'],
          ] as [keyof FormState, string][]).map(([key, placeholder]) => (
            <div key={key}>
              <label className={labelCls}>{placeholder}</label>
              <textarea
                rows={3}
                placeholder={placeholder}
                value={form[key] as string}
                onChange={e => set(key, e.target.value)}
                className={`${inputCls} resize-none`}
              />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Duración mín. (min)</label>
              <input type="number" min={0} value={form.durationMin} onChange={e => set('durationMin', e.target.value)} placeholder="60" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Duración máx. (min)</label>
              <input type="number" min={0} value={form.durationMax} onChange={e => set('durationMax', e.target.value)} placeholder="120" className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Anestesia</label>
            <input value={form.anesthesia} onChange={e => set('anesthesia', e.target.value)} placeholder="Raquídea, general…" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Posición del paciente</label>
            <input value={form.patientPosition} onChange={e => set('patientPosition', e.target.value)} placeholder="Decúbito supino, lateral…" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Recuperación</label>
            <textarea rows={2} value={form.recovery} onChange={e => set('recovery', e.target.value)} placeholder="3-6 meses…" className={`${inputCls} resize-none`} />
          </div>

          <div>
            <label className={labelCls}>Video URL</label>
            <input type="url" value={form.videoUrl} onChange={e => set('videoUrl', e.target.value)} placeholder="https://…" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Alias (uno por línea)</label>
            <textarea rows={2} value={form.aliases} onChange={e => set('aliases', e.target.value)} placeholder="ATR, prótesis de rodilla…" className={`${inputCls} resize-none`} />
          </div>

          <div>
            <label className={labelCls}>Tags (uno por línea)</label>
            <textarea rows={2} value={form.tags} onChange={e => set('tags', e.target.value)} className={`${inputCls} resize-none`} />
          </div>

          <div>
            <label className={labelCls}>Referencias (una por línea)</label>
            <textarea rows={2} value={form.references} onChange={e => set('references', e.target.value)} className={`${inputCls} resize-none`} />
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1 pb-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm">
          Cancelar
        </button>
        <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white font-medium text-sm hover:bg-primary-700">
          Guardar
        </button>
      </div>
    </form>
  )
}

function procedureToForm(p: Procedure): FormState {
  return {
    name: p.name,
    aliases: p.aliases.join('\n'),
    anatomicRegion: p.anatomicRegion,
    specialty: p.specialty,
    ageGroup: p.ageGroup,
    category: p.category,
    approach: [...p.approach],
    level: p.level,
    indications: p.indications.join('\n'),
    contraindications: p.contraindications.join('\n'),
    classifications: p.classifications.join('\n'),
    steps: p.steps.join('\n'),
    implants: p.implants.join('\n'),
    complications: p.complications.join('\n'),
    pearls: p.pearls.join('\n'),
    durationMin: p.durationMin?.toString() ?? '',
    durationMax: p.durationMax?.toString() ?? '',
    anesthesia: p.anesthesia ?? '',
    patientPosition: p.patientPosition ?? '',
    recovery: p.recovery ?? '',
    videoUrl: p.videoUrl ?? '',
    references: p.references.join('\n'),
    tags: p.tags.join('\n'),
  }
}

function formToProcedureData(f: FormState): Omit<Procedure, 'id' | 'source' | 'userEdited'> {
  return {
    name: f.name.trim(),
    aliases: splitLines(f.aliases),
    anatomicRegion: f.anatomicRegion,
    specialty: f.specialty,
    ageGroup: f.ageGroup,
    category: f.category,
    approach: f.approach,
    level: f.level,
    dataCompleteness: 'partial',
    indications: splitLines(f.indications),
    contraindications: splitLines(f.contraindications),
    classifications: splitLines(f.classifications),
    steps: splitLines(f.steps),
    implants: splitLines(f.implants),
    complications: splitLines(f.complications),
    pearls: splitLines(f.pearls),
    durationMin: f.durationMin ? parseInt(f.durationMin) : null,
    durationMax: f.durationMax ? parseInt(f.durationMax) : null,
    anesthesia: f.anesthesia.trim() || undefined,
    patientPosition: f.patientPosition.trim() || undefined,
    recovery: f.recovery.trim() || undefined,
    videoUrl: f.videoUrl.trim() || undefined,
    references: splitLines(f.references),
    tags: splitLines(f.tags),
  }
}

function ProcedureCard({
  procedure,
  usageCount,
  onEdit,
  onDelete,
  onPin,
}: {
  procedure: Procedure
  usageCount: number
  onEdit: () => void
  onDelete: (id: string) => void
  onPin: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full p-4 flex items-start gap-3 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900 dark:text-white leading-tight">{procedure.name}</p>
            {procedure.userEdited && (
              <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full flex-shrink-0">editado</span>
            )}
            {procedure.dataCompleteness === 'standard' && (
              <span className="text-[10px] bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded-full flex-shrink-0">Por revisar</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full">
              {ANATOMIC_REGION_LABELS[procedure.anatomicRegion]}
            </span>
            <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
              {SPECIALTY_LABELS[procedure.specialty]}
            </span>
            {usageCount > 0 && (
              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                {usageCount}× realizada
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onPin(procedure.id) }}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={procedure.pinned ? 'Quitar favorito' : 'Marcar favorito'}
          >
            <Star
              className={`w-4 h-4 ${procedure.pinned ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
            />
          </button>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400 mt-0.5" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400 mt-0.5" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2 text-sm border-t border-gray-100 dark:border-gray-800 pt-3">
          {procedure.approach.length > 0 && (
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">Abordaje: </span>
              {procedure.approach.map(a => APPROACH_LABELS[a]).join(', ')}
            </p>
          )}
          {procedure.indications.length > 0 && (
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-0.5">Indicaciones:</p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-0.5">
                {procedure.indications.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          {procedure.steps.length > 0 && (
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-0.5">Técnica:</p>
              <ol className="list-decimal list-inside text-gray-600 dark:text-gray-400 space-y-0.5">
                {procedure.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </div>
          )}
          {procedure.complications.length > 0 && (
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">Complicaciones: </span>
              {procedure.complications.join(', ')}
            </p>
          )}
          {(procedure.durationMin || procedure.durationMax) && (
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">Duración: </span>
              {procedure.durationMin && procedure.durationMax
                ? `${procedure.durationMin}–${procedure.durationMax} min`
                : `${procedure.durationMin ?? procedure.durationMax} min`}
            </p>
          )}
          {procedure.recovery && (
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">Recuperación: </span>
              {procedure.recovery}
            </p>
          )}
          {procedure.implants.length > 0 && (
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">Implantes: </span>
              {procedure.implants.join(', ')}
            </p>
          )}
          {procedure.pearls.length > 0 && (
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-0.5">Perlas:</p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-0.5">
                {procedure.pearls.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          {procedure.videoUrl && (
            <a
              href={procedure.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline"
            >
              Video de técnica
            </a>
          )}
          <div className="flex gap-3 mt-2">
            <button onClick={onEdit} className="flex items-center gap-1 text-primary-600 dark:text-primary-400 text-xs hover:underline">
              <Pencil className="w-3.5 h-3.5" /> Editar
            </button>
            <button onClick={() => onDelete(procedure.id)} className="flex items-center gap-1 text-red-500 hover:text-red-600 text-xs">
              <Trash2 className="w-3.5 h-3.5" /> Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ProcedureModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: Procedure
  onClose: () => void
  onSave: (f: FormState) => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4 pb-16 sm:pb-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm max-h-[90dvh] flex flex-col">
        <div className="px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <h2 className="font-bold text-gray-900 dark:text-white">
            {initial ? 'Editar procedimiento' : 'Nuevo procedimiento'}
          </h2>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4">
          <ProcedureForm
            initial={initial ? procedureToForm(initial) : undefined}
            onSave={onSave}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  )
}

export function ProceduresPage() {
  const { procedures, addProcedure, updateProcedure, deleteProcedure, togglePin } = useProcedures()
  const { cases } = useCases()
  const [search, setSearch] = useState('')
  const [filterRegion, setFilterRegion] = useState<AnatomicRegion | ''>('')
  const [filterSpecialty, setFilterSpecialty] = useState<Specialty | ''>('')
  const [modal, setModal] = useState<null | 'add' | Procedure>(null)

  const usageMap = useMemo(() => {
    const map: Record<string, number> = {}
    cases.forEach(c => { if (c.procedureId) map[c.procedureId] = (map[c.procedureId] ?? 0) + 1 })
    return map
  }, [cases])

  const filtered = useMemo(() => {
    const q = normalize(search)
    return procedures.filter(p => {
      if (q) {
        const hay = normalize([
          p.name,
          ...p.aliases,
          ...p.tags,
          ...p.classifications,
          ANATOMIC_REGION_LABELS[p.anatomicRegion],
          SPECIALTY_LABELS[p.specialty],
        ].join(' '))
        if (!hay.includes(q)) return false
      }
      if (filterRegion && p.anatomicRegion !== filterRegion) return false
      if (filterSpecialty && p.specialty !== filterSpecialty) return false
      return true
    })
  }, [procedures, search, filterRegion, filterSpecialty])

  function handleSave(f: FormState) {
    const data = formToProcedureData(f)
    if (modal === 'add' || modal === null) {
      addProcedure(data)
    } else {
      updateProcedure(modal.id, data)
    }
    setModal(null)
  }

  return (
    <div className="pb-24 min-h-dvh bg-gray-50 dark:bg-gray-950">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Procedimientos</h1>
          <button
            onClick={() => setModal('add')}
            className="p-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Buscar procedimiento…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <select
            value={filterRegion}
            onChange={e => setFilterRegion(e.target.value as AnatomicRegion | '')}
            className="flex-shrink-0 px-3 py-1.5 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="">Todas las regiones</option>
            {REGIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select
            value={filterSpecialty}
            onChange={e => setFilterSpecialty(e.target.value as Specialty | '')}
            className="flex-shrink-0 px-3 py-1.5 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="">Todas las especialidades</option>
            {SPECIALTIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center text-gray-400 dark:text-gray-600">
            <Stethoscope className="w-10 h-10 mb-2" />
            <p className="text-sm">{procedures.length === 0 ? 'Sin procedimientos todavía' : 'Sin resultados'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(p => (
              <ProcedureCard
                key={p.id}
                procedure={p}
                usageCount={usageMap[p.id] ?? 0}
                onEdit={() => setModal(p)}
                onDelete={deleteProcedure}
                onPin={togglePin}
              />
            ))}
          </div>
        )}
      </div>

      {modal !== null && (
        <ProcedureModal
          initial={modal === 'add' ? undefined : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
