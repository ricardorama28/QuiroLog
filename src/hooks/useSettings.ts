import { useState, useCallback } from 'react'
import type { Settings } from '../types'
import { getSettings, saveSettings } from '../lib/storage'

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => getSettings())

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates }
      saveSettings(next)
      return next
    })
  }, [])

  return { settings, updateSettings }
}
