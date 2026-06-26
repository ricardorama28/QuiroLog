import { useState, useMemo } from 'react'
import { Plus, BookOpen, Calendar, Users, Trash2, X, Pencil, CheckCircle } from 'lucide-react'
import { useCases } from '../hooks/useCases'
import { AddCaseModal } from '../components/AddCaseModal'
import type { SurgeonRole, SurgicalCase, SurgicalCaseStatus } from '../types'
import { ROLE_LABELS, LATERALITY_LABELS, STATUS_LABELS } from '../types'

const ROLES = Object.entries(ROLE_LABELS) as [SurgeonRole, string][]

function CaseDetailModal({
  caso,
  onClose,
  onEdit,
  onMarkDone,
  onDelete,
}: {
  caso: SurgicalCase
  onClose: () => void
  onEdit: () => void
  onMarkDone: () => void
  onDelete: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4 pb-16 sm:pb-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm max-h-[90dvh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <h2 className="font-bold text-gray-900 dark:text-white">Detalle de cirugía</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3 text-sm">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Procedimiento</p>
            <p className="font-semibold text-gray-900 dark:text-white">{caso.procedureNameSnapshot}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Fecha</p>
              <p className="text-gray-900 dark:text-white">{caso.date}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Estado</p>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                caso.status === 'planned'
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                  : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              }`}>
                {STATUS_LABELS[caso.status]}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Rol</p>
              <p className="text-gray-900 dark:text-white">{ROLE_LABELS[caso.role]}</p>
            </div>
            {caso.laterality && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Lateralidad</p>
                <p className="text-gray-900 dark:text-white">{LATERALITY_LABELS[caso.laterality]}</p>
              </div>
            )}
          </div>

          {caso.diagnosis && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Diagnóstico</p>
              <p className="text-gray-900 dark:text-white">{caso.diagnosis}</p>
            </div>
          )}
          {caso.institution && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Institución</p>
              <p className="text-gray-900 dark:text-white">{caso.institution}</p>
            </div>
          )}
          {caso.implantUsed && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Implante usado</p>
              <p className="text-gray-900 dark:text-white">{caso.implantUsed}</p>
            </div>
          )}
          {caso.actualDurationMin != null && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Duración real</p>
              <p className="text-gray-900 dark:text-white">{caso.actualDurationMin} min</p>
            </div>
          )}
          {caso.patientLabel && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Etiqueta paciente</p>
              <p className="text-gray-900 dark:text-white">{caso.patientLabel}</p>
            </div>
          )}
          {caso.intraopNotes && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Notas intraoperatorias</p>
              <p className="text-gray-900 dark:text-white">{caso.intraopNotes}</p>
            </div>
          )}
          {caso.notes && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Notas</p>
              <p className="text-gray-900 dark:text-white">{caso.notes}</p>
            </div>
          )}
        </div>

        <div className="px-5 pb-5 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2 flex-shrink-0">
          {caso.status === 'planned' && (
            <button
              onClick={onMarkDone}
              className="w-full py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" /> Marcar como realizada
            </button>
          )}
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="flex-1 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm flex items-center justify-center gap-1.5"
            >
              <Pencil className="w-4 h-4" /> Editar
            </button>
            <button
              onClick={onDelete}
              className="flex-1 py-2 rounded-xl border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CasesPage() {
  const { cases, deleteCase, updateCase } = useCases()
  const [showModal, setShowModal] = useState(false)
  const [filterRole, setFilterRole] = useState<SurgeonRole | ''>('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterStatus, setFilterStatus] = useState<SurgicalCaseStatus | ''>('')
  const [detailCase, setDetailCase] = useState<SurgicalCase | null>(null)
  const [editCase, setEditCase] = useState<SurgicalCase | null>(null)

  const filtered = useMemo(() => {
    return cases
      .filter(c => {
        if (filterRole && c.role !== filterRole) return false
        if (filterMonth && !c.date.startsWith(filterMonth)) return false
        if (filterStatus && c.status !== filterStatus) return false
        return true
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [cases, filterRole, filterMonth, filterStatus])

  const months = useMemo(() => {
    const set = new Set<string>()
    cases.forEach(c => set.add(c.date.slice(0, 7)))
    return [...set].sort((a, b) => b.localeCompare(a))
  }, [cases])

  function confirmDelete(id: string) {
    if (confirm('¿Eliminar esta cirugía?')) {
      deleteCase(id)
      setDetailCase(null)
    }
  }

  function handleMarkDone(id: string) {
    updateCase(id, { status: 'done' })
    setDetailCase(null)
  }

  return (
    <div className="pb-24 min-h-dvh bg-gray-50 dark:bg-gray-950">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mis cirugías</h1>
          <button
            onClick={() => setShowModal(true)}
            className="p-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as SurgicalCaseStatus | '')}
            className="flex-shrink-0 px-3 py-1.5 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="">Todas</option>
            <option value="done">Realizadas</option>
            <option value="planned">Agendadas</option>
          </select>
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value as SurgeonRole | '')}
            className="flex-shrink-0 px-3 py-1.5 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="">Todos los roles</option>
            {ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="flex-shrink-0 px-3 py-1.5 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="">Todos los meses</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center text-gray-400 dark:text-gray-600">
            <BookOpen className="w-10 h-10 mb-2" />
            <p className="text-sm">{cases.length === 0 ? 'Sin cirugías todavía. Registrá la primera.' : 'Sin resultados'}</p>
            {cases.length === 0 && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
              >
                Agregar cirugía
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => (
              <button
                key={c.id}
                onClick={() => setDetailCase(c)}
                className="w-full text-left bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 dark:text-white leading-tight">{c.procedureNameSnapshot}</p>
                      {c.status === 'planned' && (
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full flex-shrink-0">Agendada</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {c.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {ROLE_LABELS[c.role]}
                      </span>
                      {c.laterality && <span>{LATERALITY_LABELS[c.laterality]}</span>}
                      {c.actualDurationMin && <span>{c.actualDurationMin} min</span>}
                    </div>
                    {c.institution && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{c.institution}</p>}
                    {c.diagnosis && <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">Dx: {c.diagnosis}</p>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {showModal && <AddCaseModal onClose={() => setShowModal(false)} />}

      {detailCase && (
        <CaseDetailModal
          caso={detailCase}
          onClose={() => setDetailCase(null)}
          onEdit={() => { setEditCase(detailCase); setDetailCase(null) }}
          onMarkDone={() => handleMarkDone(detailCase.id)}
          onDelete={() => confirmDelete(detailCase.id)}
        />
      )}

      {editCase && (
        <AddCaseModal
          initial={editCase}
          onClose={() => setEditCase(null)}
        />
      )}
    </div>
  )
}
