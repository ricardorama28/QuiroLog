import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { BottomNav } from './components/ui/BottomNav'
import { Dashboard } from './pages/Dashboard'
import { CasesPage } from './pages/CasesPage'
import { CalendarPage } from './pages/CalendarPage'
import { ProceduresPage } from './pages/ProceduresPage'
import { SettingsPage } from './pages/SettingsPage'
import { AuthPage } from './pages/AuthPage'
import { useSettings } from './hooks/useSettings'
import { useProcedures, seedKnowledgeBaseIfNeeded } from './hooks/useProcedures'

function AppInner() {
  const { user, localOnly, loading } = useAuth()
  const { settings } = useSettings()
  const { enrichExisting } = useProcedures()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode)
  }, [settings.darkMode])

  useEffect(() => {
    seedKnowledgeBaseIfNeeded()
    if (settings.autoEnrich) enrichExisting()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user && !localOnly) {
    return <AuthPage />
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-dvh">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cases" element={<CasesPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/procedures" element={<ProceduresPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </BrowserRouter>
  )
}
