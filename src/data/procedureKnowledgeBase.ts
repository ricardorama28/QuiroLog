import seed from './procedures.seed.json'
import type { Procedure } from '../types'

export const KB_VERSION: string = seed.meta.version

export const knowledgeBase: Procedure[] = seed.procedures as Procedure[]

export function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
}

export const kbBySlug = new Map<string, Procedure>(knowledgeBase.map(p => [p.id, p]))

export const kbByAlias = new Map<string, Procedure>()
knowledgeBase.forEach(p =>
  [p.name, ...p.aliases].forEach(a => kbByAlias.set(normalize(a), p))
)
