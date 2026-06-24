import { Flame } from 'lucide-react'
import type { SurgeryLog, Settings } from '../../types'
import { subDays, format } from 'date-fns'

function computeStreak(surgeries: SurgeryLog[], settings: Settings): number {
  const surgeryDates = new Set(
    surgeries.filter((s) => s.type === 'surgery').map((s) => s.date)
  )
  const guardDates = settings.restDaysKeepStreak
    ? new Set(surgeries.filter((s) => s.type === 'guard').map((s) => s.date))
    : new Set<string>()

  let streak = 0
  let day = new Date()

  for (let i = 0; i < 365; i++) {
    const dateStr = format(subDays(day, i), 'yyyy-MM-dd')
    if (surgeryDates.has(dateStr) || guardDates.has(dateStr)) {
      streak++
    } else if (i === 0) {
      // today with no surgery yet — don't break streak, check yesterday
      continue
    } else {
      break
    }
  }

  return streak
}

interface Props {
  surgeries: SurgeryLog[]
  settings: Settings
}

export function StreakCard({ surgeries, settings }: Props) {
  const streak = computeStreak(surgeries, settings)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
        <Flame className="w-6 h-6 text-orange-500" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {streak} {streak === 1 ? 'día' : 'días'}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Racha en pabellón</div>
      </div>
    </div>
  )
}
