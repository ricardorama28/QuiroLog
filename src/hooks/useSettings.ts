import { useCallback, useSyncExternalStore } from 'react'
import type { Settings } from '../types'
import { getSettings, saveSettings } from '../lib/storage'
import { createPersistentStore } from '../lib/store'

const settingsStore = createPersistentStore<Settings>(getSettings, saveSettings)

export function useSettings() {
  const settings = useSyncExternalStore(settingsStore.subscribe, settingsStore.get)

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    settingsStore.set({ ...settingsStore.get(), ...updates })
  }, [])

  return { settings, updateSettings }
}
