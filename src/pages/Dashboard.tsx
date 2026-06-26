import { Link } from 'react-router-dom'
import { Calendar, Stethoscope, BookOpen, TrendingUp, Users, Clock, CheckCircle, Cross } from 'lucide-react'
import { FloatingBackground } from '../components/FloatingBackground'
import { useCases } from '../hooks/useCases'
import { useProcedures } from '../hooks/useProcedures'
import { useSettings } from '../hooks/useSettings'
import { useAuth } from '../context/AuthContext'
import { DailyContext } from '../components/dashboard/DailyContext'
import { ROLE_LABELS } from '../types'
import type { SurgeonRole } from '../types'
import type { User } from '@supabase/supabase-js'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns'

function todayLocal(): string {
  return new Date().toLocaleDateString('sv')
}

function greeting(user?: User | null): string {
  const hour = new Date().getHours()
  const saludo = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'
  const fullName: string | undefined =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split('@')[0]?.replace(/[._]/g, ' ')
  const firstName = fullName?.split(' ')[0]
  return firstName ? `${saludo}, ${firstName}` : saludo
}

export function Dashboard() {
  const { cases, updateCase } = useCases()
  const { procedures } = useProcedures()
  const { settings } = useSettings()
  const { user } = useAuth()

  const today = todayLocal()
  const doneCases = cases.filter(c => c.status !== 'planned')
  const upcomingCases = cases
    .filter(c => c.status === 'planned' && c.date.slice(0, 10) >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)

  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const thisWeek = doneCases.filter(c => {
    try { return isWithinInterval(parseISO(c.date), { start: weekStart, end: weekEnd }) } catch { return false }
  })

  const thisMonth = doneCases.filter(c => {
    try { return isWithinInterval(parseISO(c.date), { start: monthStart, end: monthEnd }) } catch { return false }
  })

  const goal = settings.weeklyGoal
  const weekPct = Math.min(100, goal > 0 ? Math.round((thisWeek.length / goal) * 100) : 0)

  const roleCounts = doneCases.reduce<Record<string, number>>((acc, c) => {
    acc[c.role] = (acc[c.role] ?? 0) + 1
    return acc
  }, {})

  const lastCase = [...doneCases].sort((a, b) => b.date.localeCompare(a.date))[0]

  return (
    <div className="relative overflow-hidden pb-20 min-h-dvh bg-gray-50 dark:bg-gray-950">
      <FloatingBackground />
      <div className="relative z-10 max-w-lg mx-auto px-4 pt-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary-600 text-white shadow-sm">
            <Cross className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {greeting(user)}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">TraumaLog</p>
          </div>
        </div>

        <DailyContext />

        {/* Upcoming surgeries */}
        {upcomingCases.length > 0 && (
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Próximas cirugías</span>
            </div>
            <div className="space-y-2">
              {upcomingCases.map(c => (
                <div key={c.id} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.procedureNameSnapshot}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{c.date} · {ROLE_LABELS[c.role]}</p>
                  </div>
                  <button
                    onClick={() => updateCase(c.id, { status: 'done' })}
                    className="flex-shrink-0 p-1.5 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    title="Marcar como realizada"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly progress */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Esta semana</span>
            <span className="ml-auto text-xs text-gray-400 dark:text-gray-600">{thisMonth.length} este mes</span>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{thisWeek.length}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">/ {goal} meta</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
            <div className="bg-primary-500 h-2 rounded-full transition-all" style={{ width: `${weekPct}%` }} />
          </div>
        </div>

        {/* Counters */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total cirugías</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{doneCases.length}</span>
          </div>
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-1">
              <Stethoscope className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Procedimientos</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{procedures.length}</span>
          </div>
        </div>

        {/* Role breakdown */}
        {doneCases.length > 0 && (
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Por rol</span>
            </div>
            <div className="space-y-2">
              {(Object.keys(ROLE_LABELS) as SurgeonRole[]).filter(r => roleCounts[r]).map(role => {
                const count = roleCounts[role] ?? 0
                const pct = Math.round((count / doneCases.length) * 100)
                return (
                  <div key={role}>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-0.5">
                      <span>{ROLE_LABELS[role]}</span>
                      <span>{count}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                      <div className="bg-primary-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Last case */}
        {lastCase ? (
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Última cirugía</h2>
            <p className="font-semibold text-gray-900 dark:text-white">{lastCase.procedureNameSnapshot}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {lastCase.date}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {ROLE_LABELS[lastCase.role]}
              </span>
            </div>
            {lastCase.institution && (
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{lastCase.institution}</p>
            )}
          </div>
        ) : (
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-sm border border-gray-100 dark:border-gray-800">
            <Stethoscope className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Sin cirugías registradas todavía</p>
          </div>
        )}

        {/* Quick access */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/cases"
            className="bg-primary-600 text-white rounded-xl p-4 flex flex-col gap-1 hover:bg-primary-700 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            <span className="font-medium text-sm">Registrar cirugía</span>
          </Link>
          <Link
            to="/procedures"
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-gray-900 dark:text-white rounded-xl p-4 flex flex-col gap-1 border border-gray-200 dark:border-gray-700 hover:bg-white/90 dark:hover:bg-gray-900/90 transition-colors shadow-sm"
          >
            <Stethoscope className="w-5 h-5" />
            <span className="font-medium text-sm">Procedimientos</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
