import type { Procedure } from '../types'
import { getProcedures, saveProcedures } from './storage'
import { createPersistentStore } from './store'

export const proceduresStore = createPersistentStore<Procedure[]>(getProcedures, saveProcedures)
