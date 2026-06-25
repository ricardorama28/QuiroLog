import { useState, useMemo, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useCases } from '../hooks/useCases'
import { useProcedures } from '../hooks/useProcedures'
import { knowledgeBase } from '../data/procedureKnowledgeBase'
import type { SurgeonRole, Laterality, SurgicalCase, SurgicalCaseStatus } from '../types'
import { ROLE_LABELS, LATERALITY_LABELS, STATUS_LABELS } from '../types'

interface Props {
  initialDate?: string
  initial?: SurgicalCase
  onClose: () => void
}

function todayLocal(): string {
  return new Date().toLocaleDateString('sv') // YYYY-MM-DD in local time
}

const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm'
const labelCls = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'

export function AddCaseModal({ initialDate, initial, onClose }: Props) {
  const { addCase, updateCase, cases } = useCases()
  const { procedures } = useProcedures()

  const usageMap = useMemo(() => {
    const map: Record<string, number> = {}
    cases.forEach(c => { if (c.procedureId) map[c.procedureId] = (map[c.procedureId] ?? 0) + 1 })
    return map
  }, [cases])

  const allProcedures = useMemo(() => {
    const userIds = new Set(procedures.map(p => p.id))
    const kbOnly = knowledgeBase.filter(p => !userIds.has(p.id))
    const all = [...procedures, ...kbOnly]
    return all.sort((a, b) => {
      if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1
      const diff = (usageMap[b.id] ?? 0) - (usageMap[a.id] ?? 0)
      if (diff !== 0) return diff
      return a.name.localeCompare(b.name)
    })
  }, [procedures, usageMap])

  const today = todayLocal()
  const defaultDate = initial?.date ?? initialDate ?? today

  function defaultStatus(d: string): SurgicalCaseStatus {
    return d.slice(0, 10) > today ? 'planned' : 'done'
  }

  const [procedureId, setProcedureId] = useState(initial?.procedureId ?? '')
  const [procedureNameSnapshot, setProcedureNameSnapshot] = useState(initial?.procedureNameSnapshot ?? '')
  const [date, setDate] = useState(defaultDate)
  const [role, setRole] = useState<SurgeonRole>(initial?.role ?? 'primary')
  const [status, setStatus] = useState<SurgicalCaseStatus>(
    initial ? (initial.status ?? 'done') : defaultStatus(defaultDate)
  )
  const [patientLabel, setPatientLabel] = useState(initial?.patientLabel ?? '')
  const [diagnosis, setDiagnosis] = useState(initial?.diagnosis ?? '')
  const [laterality, setLaterality] = useState<Laterality | ''>(initial?.laterality ?? '')
  const [institution, setInstitution] = useState(initial?.institution ?? '')
  const [implantUsed, setImplantUsed] = useState(initial?.implantUsed ?? '')
  const [actualDurationMin, setActualDurationMin] = useState(
    initial?.actualDurationMin != null ? String(initial.actualDurationMin) : ''
  )
  const [intraopNotes, setIntraopNotes] = useState(initial?.intraopNotes ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const statusTouched = useRef(false)

  // Auto-update status when date changes, unless user manually picked a status or we're in edit mode
  useEffect(() => {
    if (statusTouched.current || initial) return
    setStatus(defaultStatus(date))
  }, [date]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleStatusChange(s: SurgicalCaseStatus) {
    statusTouched.current = true
    setStatus(s)
  }

  function handleProcedureChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value
    const proc = allProcedures.find(p => p.id === id)
    setProcedureId(id)
    setProcedureNameSnapshot(proc?.name ?? '')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!procedureNameSnapshot.trim()) return
    const payload = {
      procedureId,
      procedureNameSnapshot: procedureNameSnapshot.trim(),
      date,
      role,
      status,
      patientLabel: patientLabel.trim() || undefined,
      diagnosis: diagnosis.trim() || undefined,
      laterality: (laterality as Laterality) || undefined,
      institution: institution.trim() || undefined,
      implantUsed: implantUsed.trim() || undefined,
      actualDurationMin: actualDurationMin ? parseInt(actualDurationMin) : undefined,
      intraopNotes: intraopNotes.trim() || undefined,
      notes: notes.trim() || undefined,
    }
    if (initial) {
      updateCase(initial.id, payload)
    } else {
      addCase(payload)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm max-h-[90dvh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <h2 className="font-bold text-gray-900 dark:text-white">
            {initial ? 'Editar caso' : 'Nuevo caso quirúrgico'}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
          <div>
            <label className={labelCls}>Procedimiento *</label>
            {allProcedures.length > 0 ? (
              <select value={procedureId} onChange={handleProcedureChange} className={inputCls} required>
                <option value="">Seleccionar procedimiento…</option>
                {procedures.length > 0 && (
                  <optgroup label="Mis procedimientos">
                    {procedures.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </optgroup>
                )}
                {knowledgeBase.filter(p => !new Set(procedures.map(x => x.id)).has(p.id)).length > 0 && (
                  <optgroup label="Base de conocimiento">
                    {allProcedures
                      .filter(p => !new Set(procedures.map(x => x.id)).has(p.id))
                      .map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                  </optgroup>
                )}
              </select>
            ) : (
              <input
                placeholder="Nombre del procedimiento"
                value={procedureNameSnapshot}
                onChange={e => setProcedureNameSnapshot(e.target.value)}
                required
                className={inputCls}
              />
            )}
          </div>

          {/* Status toggle */}
          <div>
            <label className={labelCls}>Estado</label>
            <div className="flex rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700">
              {(Object.entries(STATUS_LABELS) as [SurgicalCaseStatus, string][]).map(([v, l]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => handleStatusChange(v)}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    status === v
                      ? v === 'done'
                        ? 'bg-primary-600 text-white'
                        : 'bg-amber-500 text-white'
                      : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Fecha *</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Rol *</label>
              <select value={role} onChange={e => setRole(e.target.value as SurgeonRole)} className={inputCls}>
                {(Object.entries(ROLE_LABELS) as [SurgeonRole, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Etiqueta de paciente</label>
            <input
              placeholder="Ej: Paciente 1, hombre 65 años — no ingreses nombre ni RUT"
              value={patientLabel}
              onChange={e => setPatientLabel(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Diagnóstico</label>
              <input
                placeholder="Ej: Gonartrosis"
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Lateralidad</label>
              <select value={laterality} onChange={e => setLaterality(e.target.value as Laterality | '')} className={inputCls}>
                <option value="">–</option>
                {(Object.entries(LATERALITY_LABELS) as [Laterality, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Institución</label>
            <input
              placeholder="Hospital / Clínica"
              value={institution}
              onChange={e => setInstitution(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Implante usado</label>
              <input
                placeholder="Ej: ATR Stryker"
                value={implantUsed}
                onChange={e => setImplantUsed(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Duración real (min)</label>
              <input
                type="number"
                min={5}
                placeholder="90"
                value={actualDurationMin}
                onChange={e => setActualDurationMin(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Notas intraoperatorias</label>
            <textarea
              rows={2}
              placeholder="Hallazgos, variantes anatómicas, decisiones intraop…"
              value={intraopNotes}
              onChange={e => setIntraopNotes(e.target.value)}
              className={`${inputCls} resize-none`}
            />
          </div>

          <div>
            <label className={labelCls}>Notas</label>
            <textarea
              rows={2}
              placeholder="Observaciones adicionales…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="flex gap-2 pt-1 pb-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm">
              Cancelar
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white font-medium text-sm hover:bg-primary-700">
              {initial ? 'Guardar cambios' : 'Agregar caso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
