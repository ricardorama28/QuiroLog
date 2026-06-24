import { useState, useMemo } from 'react'
import { Plus, Search, Stethoscope, ChevronDown, ChevronUp, ExternalLink, Trash2 } from 'lucide-react'
import { useProcedures } from '../hooks/useProcedures'
import { useSurgeries } from '../hooks/useSurgeries'
import type { Procedure, AnatomicRegion, SurgicalSpecialty, SurgicalApproach } from '../types'
import {
  ANATOMIC_REGION_LABELS,
  SPECIALTY_LABELS,
  APPROACH_LABELS,
} from '../types'

const REGIONS = Object.entries(ANATOMIC_REGION_LABELS) as [AnatomicRegion, string][]
const SPECIALTIES = Object.entries(SPECIALTY_LABELS) as [SurgicalSpecialty, string][]
const APPROACHES = Object.entries(APPROACH_LABELS) as [SurgicalApproach, string][]

function ProcedureCard({
  procedure,
  usageCount,
  onDelete,
}: {
  procedure: Procedure
  usageCount: number
  onDelete: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full p-4 flex items-start gap-3 text-left"
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white leading-tight">{procedure.name}</p>
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
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2 text-sm border-t border-gray-100 dark:border-gray-800 pt-3">
          {procedure.approach && (
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">Abordaje: </span>
              {APPROACH_LABELS[procedure.approach]}
            </p>
          )}
          {procedure.indication && (
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">Indicación: </span>
              {procedure.indication}
            </p>
          )}
          {procedure.technique && (
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">Técnica: </span>
              {procedure.technique}
            </p>
          )}
          {procedure.complications && (
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">Complicaciones: </span>
              {procedure.complications}
            </p>
          )}
          {procedure.typicalDuration && (
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">Duración típica: </span>
              {procedure.typicalDuration} min
            </p>
          )}
          {procedure.recovery && (
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">Recuperación: </span>
              {procedure.recovery}
            </p>
          )}
          {procedure.implants && (
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">Implantes: </span>
              {procedure.implants}
            </p>
          )}
          {procedure.videoUrl && (
            <a
              href={procedure.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Video de técnica
            </a>
          )}
          <button
            onClick={() => onDelete(procedure.id)}
            className="flex items-center gap-1 text-red-500 hover:text-red-600 mt-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Eliminar
          </button>
        </div>
      )}
    </div>
  )
}

function AddProcedureModal({ onClose, onAdd }: { onClose: () => void; onAdd: (p: Omit<Procedure, 'id' | 'nameLower' | 'createdAt' | 'updatedAt' | 'referenceStatus'>) => void }) {
  const [name, setName] = useState('')
  const [region, setRegion] = useState<AnatomicRegion>('other')
  const [specialty, setSpecialty] = useState<SurgicalSpecialty>('other')
  const [approach, setApproach] = useState<SurgicalApproach | ''>('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ name: name.trim(), anatomicRegion: region, specialty, ...(approach ? { approach } : {}) })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm p-5 space-y-4">
        <h2 className="font-bold text-gray-900 dark:text-white">Nuevo procedimiento</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            autoFocus
            placeholder="Nombre del procedimiento"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value as AnatomicRegion)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {REGIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value as SurgicalSpecialty)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {SPECIALTIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select
            value={approach}
            onChange={(e) => setApproach(e.target.value as SurgicalApproach | '')}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Abordaje (opcional)</option>
            {APPROACHES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
              Cancelar
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700">
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function ProceduresPage() {
  const { procedures, addProcedure, deleteProcedure } = useProcedures()
  const { surgeries } = useSurgeries()
  const [search, setSearch] = useState('')
  const [filterRegion, setFilterRegion] = useState<AnatomicRegion | ''>('')
  const [filterSpecialty, setFilterSpecialty] = useState<SurgicalSpecialty | ''>('')
  const [showModal, setShowModal] = useState(false)

  const usageMap = useMemo(() => {
    const map: Record<string, number> = {}
    surgeries.forEach((s) => { if (s.procedureId) map[s.procedureId] = (map[s.procedureId] ?? 0) + 1 })
    return map
  }, [surgeries])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return procedures.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false
      if (filterRegion && p.anatomicRegion !== filterRegion) return false
      if (filterSpecialty && p.specialty !== filterSpecialty) return false
      return true
    })
  }, [procedures, search, filterRegion, filterSpecialty])

  return (
    <div className="pb-24 min-h-dvh bg-gray-50 dark:bg-gray-950">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Procedimientos</h1>
          <button
            onClick={() => setShowModal(true)}
            className="p-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Buscar procedimiento…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value as AnatomicRegion | '')}
            className="flex-shrink-0 px-3 py-1.5 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="">Todas las regiones</option>
            {REGIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select
            value={filterSpecialty}
            onChange={(e) => setFilterSpecialty(e.target.value as SurgicalSpecialty | '')}
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
            {filtered.map((p) => (
              <ProcedureCard
                key={p.id}
                procedure={p}
                usageCount={usageMap[p.id] ?? 0}
                onDelete={deleteProcedure}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <AddProcedureModal
          onClose={() => setShowModal(false)}
          onAdd={(data) => addProcedure(data)}
        />
      )}
    </div>
  )
}
