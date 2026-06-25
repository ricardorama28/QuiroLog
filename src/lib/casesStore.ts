import type { SurgicalCase } from '../types'
import { getCases, saveCases } from './storage'
import { createPersistentStore } from './store'

export const casesStore = createPersistentStore<SurgicalCase[]>(getCases, saveCases)
