import { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameMonth,
  parseISO,
  isToday,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, X, Trash2 } from 'lucide-react'
import { useSurgeries } from '../hooks/useSurgeries'
import { useProcedures } from '../hooks/useProcedures'
import type { DayType, ComplexityType, SurgeonRole, SurgeryLog } from '../types'
import { DAY_TYPE_LABELS, COMPLEXITY_LABELS, ROLE_LABELS } from '../types'

const TYPE_COLORS: Record<DayType, string> = {
  surgery: 'bg-primary-500',
  guard: 'bg-amber-500',
  academic: 'bg-purple-500',
  free: 'bg-gray-300 dark:bg-gray-600',
}

// ─── Surgery Form ──────────────────────────────────────────────────────────────

interface SurgeryFormData {
  procedureId: string
  procedureName: string
  complexity: ComplexityType
  duration: string
  collaborators: string
  role: SurgeonRole
  complications: string
  notes: string
}

function SurgeryForm({
  date,
  existing,
  onSave,
  onDelete,
  onClose,
}: {
  date: string
  existing?: SurgeryLog
  onSave: (data: Omit<SurgeryLog, 'id' | 'createdAt' | 'updatedAt'>) => void
  onDelete?: () => void
  onClose: () => void
}) {
  const { procedures } = useProcedures()
  const [form, setForm] = useState<SurgeryFormData>({
    procedureId: existing?.procedureId ?? '',
    procedureName: existing?.procedureName ?? '',
    complexity: existing?.complexity ?? 'routine',
    duration: existing?.duration?.toString() ?? '',
    collaborators: existing?.collaborators?.join(', ') ?? '',
    role: existing?.role ?? 'primary',
    complications: existing?.complications ?? '',
    notes: existing?.notes ?? '',
  })

  function set(key: keyof SurgeryFormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleProcedureChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value
    const proc = procedures.find((p) => p.id === id)
    set('procedureId', id)
    set('procedureName', proc?.name ?? '')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const collaborators = form.collaborators
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    onSave({
      date,
      type: 'surgery',
      procedureId: form.procedureId || undefined,
      procedureName: form.procedureName || undefined,
      complexity: form.complexity,
      duration: form.duration ? parseInt(form.duration) : undefined,
      collaborators,
      role: form.role,
      complications: form.complications || undefined,
      notes: form.notes || undefined,
    })
    onClose()
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm'
  const labelCls = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className={labelCls}>Procedimiento</label>
        {procedures.length > 0 ? (
          <select value={form.procedureId} onChange={handleProcedureChange} className={inputCls}>
            <option value="">Seleccionar procedimiento…</option>
            {procedures.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        ) : (
          <input
            placeholder="Nombre del procedimiento"
            value={form.procedureName}
            onChange={(e) => set('procedureName', e.target.value)}
            className={inputCls}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Complejidad</label>
          <select value={form.complexity} onChange={(e) => set('complexity', e.target.value as ComplexityType)} className={inputCls}>
            {(Object.entries(COMPLEXITY_LABELS) as [ComplexityType, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Duración (min)</label>
          <input
            type="number"
            min={5}
            placeholder="90"
            value={form.duration}
            onChange={(e) => set('duration', e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Rol</label>
        <select value={form.role} onChange={(e) => set('role', e.target.value as SurgeonRole)} className={inputCls}>
          {(Object.entries(ROLE_LABELS) as [SurgeonRole, string][]).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelCls}>Colaboradores (separados por coma)</label>
        <input
          placeholder="Dr. Gómez, Dr. Pérez"
          value={form.collaborators}
          onChange={(e) => set('collaborators', e.target.value)}
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Complicaciones</label>
        <textarea
          rows={2}
          placeholder="Ninguna / Describir..."
          value={form.complications}
          onChange={(e) => set('complications', e.target.value)}
          className={`${inputCls} resize-none`}
        />
      </div>

      <div>
        <label className={labelCls}>Notas</label>
        <textarea
          rows={2}
          placeholder="Observaciones adicionales..."
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          className={`${inputCls} resize-none`}
        />
      </div>

      <div className="flex gap-2 pt-1">
        {onDelete && (
          <button type="button" onClick={onDelete} className="p-2.5 rounded-xl border border-red-300 dark:border-red-800 text-red-500">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm">
          Cancelar
        </button>
        <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white font-medium text-sm hover:bg-primary-700">
          {existing ? 'Guardar' : 'Agregar cirugía'}
        </button>
      </div>
    </form>
  )
}

// ─── Day Detail Modal ──────────────────────────────────────────────────────────

function DayModal({ date, onClose }: { date: string; onClose: () => void }) {
  const { getSurgeriesByDate, addSurgery, updateSurgery, deleteSurgery } = useSurgeries()
  const daySurgeries = getSurgeriesByDate(date)
  const [mode, setMode] = useState<'list' | 'add' | { edit: SurgeryLog }>('list')

  function handleSave(data: Omit<SurgeryLog, 'id' | 'createdAt' | 'updatedAt'>) {
    if (typeof mode === 'object' && 'edit' in mode) {
      updateSurgery(mode.edit.id, data)
    } else {
      addSurgery(data)
    }
    setMode('list')
  }

  function handleDelete(id: string) {
    deleteSurgery(id)
    setMode('list')
  }

  const label = format(parseISO(date), "EEEE d 'de' MMMM", { locale: es })

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm max-h-[85dvh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <h2 className="font-bold text-gray-900 dark:text-white capitalize">{label}</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {mode === 'list' && (
            <>
              {daySurgeries.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-600 text-center py-4">Sin registros para este día</p>
              ) : (
                <div className="space-y-2">
                  {daySurgeries.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setMode({ edit: s })}
                      className="w-full text-left p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {s.procedureName ?? 'Cirugía sin nombre'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {s.complexity && COMPLEXITY_LABELS[s.complexity]}
                        {s.duration ? ` · ${s.duration} min` : ''}
                        {s.role ? ` · ${ROLE_LABELS[s.role]}` : ''}
                      </p>
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => setMode('add')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-400 text-sm font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              >
                <Plus className="w-4 h-4" /> Agregar cirugía
              </button>
            </>
          )}

          {mode === 'add' && (
            <SurgeryForm
              date={date}
              onSave={handleSave}
              onClose={() => setMode('list')}
            />
          )}

          {typeof mode === 'object' && 'edit' in mode && (
            <SurgeryForm
              date={date}
              existing={mode.edit}
              onSave={handleSave}
              onDelete={() => handleDelete(mode.edit.id)}
              onClose={() => setMode('list')}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

export function CalendarPage() {
  const { surgeries } = useSurgeries()
  const [current, setCurrent] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const monthStart = startOfMonth(current)
  const monthEnd = endOfMonth(current)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = (getDay(monthStart) + 6) % 7 // Mon = 0

  // Build maps: date → { type, count }
  const dateMap = new Map<string, { type: DayType; count: number }>()
  surgeries.forEach((s) => {
    const existing = dateMap.get(s.date)
    if (!existing) {
      dateMap.set(s.date, { type: s.type, count: s.type === 'surgery' ? 1 : 0 })
    } else {
      if (s.type === 'surgery') {
        dateMap.set(s.date, { ...existing, type: 'surgery', count: existing.count + 1 })
      }
    }
  })

  function prevMonth() { setCurrent((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1)) }
  function nextMonth() { setCurrent((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1)) }

  const monthLabel = format(current, 'MMMM yyyy', { locale: es })

  return (
    <div className="pb-24 min-h-dvh bg-gray-50 dark:bg-gray-950">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white capitalize">{monthLabel}</h1>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Day of week headers */}
        <div className="grid grid-cols-7 mb-1">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 dark:text-gray-600 py-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const info = dateMap.get(dateStr)
            const today = isToday(day)
            const inMonth = isSameMonth(day, current)

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-colors ${
                  today
                    ? 'ring-2 ring-primary-500 font-bold'
                    : ''
                } ${
                  inMonth
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-300 dark:text-gray-700'
                } hover:bg-gray-100 dark:hover:bg-gray-800`}
              >
                {info && (
                  <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${TYPE_COLORS[info.type]}`} />
                )}
                {day.getDate()}
                {info?.count && info.count > 1 ? (
                  <span className="text-[9px] leading-none text-primary-600 dark:text-primary-400 font-semibold">
                    ×{info.count}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 justify-center">
          {(Object.entries(DAY_TYPE_LABELS) as [DayType, string][]).map(([type, label]) => (
            <div key={type} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <div className={`w-2.5 h-2.5 rounded-full ${TYPE_COLORS[type]}`} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {selectedDate && (
        <DayModal date={selectedDate} onClose={() => setSelectedDate(null)} />
      )}
    </div>
  )
}
