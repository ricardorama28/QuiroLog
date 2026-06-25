import { useState } from 'react'
import { Moon, Sun, Download, Upload, RefreshCw, LogOut, Trash2 } from 'lucide-react'
import { useSettings } from '../hooks/useSettings'
import { useAuth } from '../context/AuthContext'
import { useCases } from '../hooks/useCases'
import { exportAll, importAll, clearAll } from '../lib/storage'
import type { AppData } from '../types'

export function SettingsPage() {
  const { settings, updateSettings } = useSettings()
  const { user, signOut, syncToCloud } = useAuth()
  const { cases } = useCases()
  const [syncMsg, setSyncMsg] = useState('')
  const [importError, setImportError] = useState('')
  const pendingCount = cases.filter(c => c.syncState === 'pending').length

  function handleExport() {
    const data = exportAll()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quirolog-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as AppData
        importAll(data)
        setImportError('')
        window.location.reload()
      } catch {
        setImportError('Archivo inválido')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  async function handleSync() {
    setSyncMsg('')
    try {
      await syncToCloud()
      setSyncMsg('Sincronizado correctamente')
    } catch {
      setSyncMsg('Error al sincronizar')
    }
  }

  function handleClear() {
    if (confirm('¿Eliminar todos los datos locales? Esta acción no se puede deshacer.')) {
      clearAll()
      window.location.reload()
    }
  }

  function toggleDark() {
    const next = !settings.darkMode
    updateSettings({ darkMode: next })
    document.documentElement.classList.toggle('dark', next)
  }

  return (
    <div className="pb-24 min-h-dvh bg-gray-50 dark:bg-gray-950">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-5">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Ajustes</h1>

        {user && (
          <Section title="Cuenta">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{user.email}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {pendingCount > 0
                ? `${pendingCount} caso${pendingCount > 1 ? 's' : ''} pendiente${pendingCount > 1 ? 's' : ''} de sincronizar`
                : 'Datos sincronizados'}
            </p>
            <div className="flex gap-2">
              <button onClick={handleSync} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">
                <RefreshCw className="w-4 h-4" /> Sincronizar
              </button>
              <button onClick={signOut} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-300 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                <LogOut className="w-4 h-4" /> Salir
              </button>
            </div>
            {syncMsg && <p className="text-sm text-gray-500 mt-1">{syncMsg}</p>}
          </Section>
        )}

        <Section title="Apariencia">
          <button onClick={toggleDark} className="flex items-center gap-3 w-full">
            {settings.darkMode ? <Moon className="w-5 h-5 text-primary-500" /> : <Sun className="w-5 h-5 text-yellow-500" />}
            <span className="text-gray-800 dark:text-gray-200 flex-1 text-left">
              {settings.darkMode ? 'Modo oscuro' : 'Modo claro'}
            </span>
            <Toggle checked={settings.darkMode} onChange={toggleDark} />
          </button>
        </Section>

        <Section title="Meta semanal">
          <div className="flex items-center gap-4">
            <input
              type="number"
              min={1}
              max={30}
              value={settings.weeklyGoal}
              onChange={e => updateSettings({ weeklyGoal: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-20 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">cirugías por semana</span>
          </div>
        </Section>

        <Section title="Enriquecimiento automático">
          <Row
            label="Autocompletar datos desde la base de conocimiento"
            checked={settings.autoEnrich}
            onChange={v => updateSettings({ autoEnrich: v })}
          />
        </Section>

        <Section title="Mis datos">
          <div className="space-y-2">
            <button
              onClick={handleExport}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm"
            >
              <Download className="w-4 h-4" /> Exportar datos (JSON)
            </button>
            <label className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm cursor-pointer">
              <Upload className="w-4 h-4" /> Importar datos (JSON)
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            {importError && <p className="text-sm text-red-500">{importError}</p>}
            <button
              onClick={handleClear}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 text-sm"
            >
              <Trash2 className="w-4 h-4" /> Borrar todos los datos
            </button>
          </div>
        </Section>

        <p className="text-xs text-center text-gray-400 dark:text-gray-600 pb-2">QuiroLog v2.0</p>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 space-y-3">
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  )
}

function Row({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className="flex items-center justify-between w-full">
      <span className="text-sm text-gray-700 dark:text-gray-300 text-left">{label}</span>
      <Toggle checked={checked} onChange={() => onChange(!checked)} />
    </button>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onChange() }}
      className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${checked ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </div>
  )
}
