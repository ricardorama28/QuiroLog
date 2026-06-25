import { useState, useMemo } from 'react'
import { Plus, BookOpen, Calendar, Users, Trash2 } from 'lucide-react'
import { useCases } from '../hooks/useCases'
import { AddCaseModal } from '../components/AddCaseModal'
import type { SurgeonRole } from '../types'
import { ROLE_LABELS, LATERALITY_LABELS } from '../types'

const ROLES = Object.entries(ROLE_LABELS) as [SurgeonRole, string][]

export function CasesPage() {
  const { cases, deleteCase } = useCases()
  const [showModal, setShowModal] = useState(false)
  const [filterRole, setFilterRole] = useState<SurgeonRole | ''>('')
  const [filterMonth, setFilterMonth] = useState('')

  const filtered = useMemo(() => {
    return cases
      .filter(c => {
        if (filterRole && c.role !== filterRole) return false
        if (filterMonth && !c.date.startsWith(filterMonth)) return false
        return true
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [cases, filterRole, filterMonth])

  const months = useMemo(() => {
    const set = new Set<string>()
    cases.forEach(c => set.add(c.date.slice(0, 7)))
    return [...set].sort((a, b) => b.localeCompare(a))
  }, [cases])

  function confirmDelete(id: string) {
    if (confirm('¿Eliminar este caso?')) deleteCase(id)
  }

  return (
    <div className="pb-24 min-h-dvh bg-gray-50 dark:bg-gray-950">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mis casos</h1>
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
            <p className="text-sm">{cases.length === 0 ? 'Sin casos todavía. Registra tu primera cirugía.' : 'Sin resultados'}</p>
            {cases.length === 0 && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
              >
                Agregar caso
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => (
              <div
                key={c.id}
                className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white leading-tight">{c.procedureNameSnapshot}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {c.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {ROLE_LABELS[c.role]}
                      </span>
                      {c.laterality && (
                        <span>{LATERALITY_LABELS[c.laterality]}</span>
                      )}
                      {c.actualDurationMin && (
                        <span>{c.actualDurationMin} min</span>
                      )}
                    </div>
                    {c.institution && (
                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{c.institution}</p>
                    )}
                    {c.diagnosis && (
                      <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">Dx: {c.diagnosis}</p>
                    )}
                  </div>
                  <button
                    onClick={() => confirmDelete(c.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <AddCaseModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
