import { Link } from 'react-router-dom'
import { Calendar, Stethoscope, Clock, Users, Zap } from 'lucide-react'
import { useSurgeries } from '../hooks/useSurgeries'
import { useSettings } from '../hooks/useSettings'
import { useAuth } from '../context/AuthContext'
import { StreakCard } from '../components/dashboard/StreakCard'
import { WeeklySummary } from '../components/dashboard/WeeklySummary'
import { DailyContext } from '../components/dashboard/DailyContext'
import { COMPLEXITY_LABELS, ROLE_LABELS } from '../types'

function greeting(name?: string | null): string {
  const hour = new Date().getHours()
  const saludo = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'
  return name ? `${saludo}, ${name.split(' ')[0]}` : saludo
}

export function Dashboard() {
  const { surgeries } = useSurgeries()
  const { settings } = useSettings()
  const { user } = useAuth()

  const lastSurgery = [...surgeries]
    .filter((s) => s.type === 'surgery')
    .sort((a, b) => b.date.localeCompare(a.date))[0]

  return (
    <div className="pb-20 min-h-dvh bg-gray-50 dark:bg-gray-950">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {greeting(user?.email)}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">QuiroLog</p>
        </div>

        <DailyContext />

        <StreakCard surgeries={surgeries} settings={settings} />
        <WeeklySummary surgeries={surgeries} settings={settings} />

        {/* Last surgery */}
        {lastSurgery ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Última cirugía</h2>
            <p className="font-semibold text-gray-900 dark:text-white">
              {lastSurgery.procedureName ?? 'Sin procedimiento'}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {lastSurgery.date}
              </span>
              {lastSurgery.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {lastSurgery.duration} min
                </span>
              )}
              {lastSurgery.complexity && (
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  {COMPLEXITY_LABELS[lastSurgery.complexity]}
                </span>
              )}
              {lastSurgery.role && (
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {ROLE_LABELS[lastSurgery.role]}
                </span>
              )}
            </div>
            {lastSurgery.collaborators && lastSurgery.collaborators.length > 0 && (
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Con: {lastSurgery.collaborators.join(', ')}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 text-center shadow-sm border border-gray-100 dark:border-gray-800">
            <Stethoscope className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Sin cirugías registradas todavía</p>
          </div>
        )}

        {/* Quick access */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/calendar"
            className="bg-primary-600 text-white rounded-xl p-4 flex flex-col gap-1 hover:bg-primary-700 transition-colors"
          >
            <Calendar className="w-5 h-5" />
            <span className="font-medium text-sm">Registrar cirugía</span>
          </Link>
          <Link
            to="/procedures"
            className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl p-4 flex flex-col gap-1 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Stethoscope className="w-5 h-5" />
            <span className="font-medium text-sm">Procedimientos</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
