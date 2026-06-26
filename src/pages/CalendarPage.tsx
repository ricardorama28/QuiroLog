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
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { useCases } from '../hooks/useCases'
import { AddCaseModal } from '../components/AddCaseModal'
import { ROLE_LABELS, STATUS_LABELS } from '../types'
import type { SurgicalCase } from '../types'

function DayModal({ date, onClose }: { date: string; onClose: () => void }) {
  const { getCasesByDate } = useCases()
  const dayCases = getCasesByDate(date)
  const [showAddModal, setShowAddModal] = useState(false)

  const label = format(parseISO(date), "EEEE d 'de' MMMM", { locale: es })

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4 pb-16 sm:pb-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm max-h-[80dvh] flex flex-col">
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
            <h2 className="font-bold text-gray-900 dark:text-white capitalize">{label}</h2>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
            {dayCases.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-600 text-center py-4">Sin cirugías para este día</p>
            ) : (
              <div className="space-y-2">
                {dayCases.map((c: SurgicalCase) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{c.procedureNameSnapshot}</p>
                      {c.status === 'planned' && (
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full flex-shrink-0">
                          {STATUS_LABELS.planned}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {ROLE_LABELS[c.role]}
                      {c.actualDurationMin ? ` · ${c.actualDurationMin} min` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-400 text-sm font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            >
              <Plus className="w-4 h-4" /> Agregar cirugía
            </button>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddCaseModal
          initialDate={date}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </>
  )
}

export function CalendarPage() {
  const { cases } = useCases()
  const [current, setCurrent] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const monthStart = startOfMonth(current)
  const monthEnd = endOfMonth(current)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = (getDay(monthStart) + 6) % 7

  const doneDateSet = new Set<string>()
  const plannedDateSet = new Set<string>()
  const caseCountByDate = new Map<string, number>()
  cases.forEach(c => {
    caseCountByDate.set(c.date, (caseCountByDate.get(c.date) ?? 0) + 1)
    if (c.status === 'planned') plannedDateSet.add(c.date)
    else doneDateSet.add(c.date)
  })

  function prevMonth() { setCurrent(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)) }
  function nextMonth() { setCurrent(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)) }

  const monthLabel = format(current, 'MMMM yyyy', { locale: es })

  return (
    <div className="pb-24 min-h-dvh bg-gray-50 dark:bg-gray-950">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white capitalize">{monthLabel}</h1>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 dark:text-gray-600 py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const count = caseCountByDate.get(dateStr) ?? 0
            const todayDay = isToday(day)
            const inMonth = isSameMonth(day, current)
            const hasDone = doneDateSet.has(dateStr)
            const hasPlanned = plannedDateSet.has(dateStr)

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-colors ${
                  todayDay ? 'ring-2 ring-primary-500 font-bold' : ''
                } ${
                  inMonth ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-700'
                } hover:bg-gray-100 dark:hover:bg-gray-800`}
              >
                {hasDone && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary-500" />
                )}
                {!hasDone && hasPlanned && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full border-2 border-amber-400 bg-transparent" />
                )}
                {hasDone && hasPlanned && (
                  <div className="absolute top-1 left-1 w-2 h-2 rounded-full border-2 border-amber-400 bg-transparent" />
                )}
                {day.getDate()}
                {count > 1 && (
                  <span className="text-[9px] leading-none text-primary-600 dark:text-primary-400 font-semibold">
                    ×{count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {selectedDate && (
        <DayModal date={selectedDate} onClose={() => setSelectedDate(null)} />
      )}
    </div>
  )
}
