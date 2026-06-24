import { Scissors } from 'lucide-react'
import type { SurgeryLog, Settings } from '../../types'
import { startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns'

interface Props {
  surgeries: SurgeryLog[]
  settings: Settings
}

export function WeeklySummary({ surgeries, settings }: Props) {
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

  const thisWeek = surgeries.filter((s) => {
    try {
      return s.type === 'surgery' && isWithinInterval(parseISO(s.date), { start: weekStart, end: weekEnd })
    } catch {
      return false
    }
  })

  const count = thisWeek.length
  const goal = settings.weeklyGoal
  const pct = Math.min(100, goal > 0 ? Math.round((count / goal) * 100) : 0)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-3">
        <Scissors className="w-4 h-4 text-primary-600 dark:text-primary-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cirugías esta semana</span>
      </div>
      <div className="flex items-end gap-2 mb-2">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{count}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">/ {goal} meta</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
        <div
          className="bg-primary-500 h-2 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
