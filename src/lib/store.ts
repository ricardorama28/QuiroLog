// Module-level reactive store backed by localStorage.
// A single source of truth per domain, shared across every hook instance, so
// any mutation re-renders all mounted consumers (via useSyncExternalStore).

export interface PersistentStore<T> {
  get: () => T
  set: (next: T) => void
  subscribe: (listener: () => void) => () => void
}

export function createPersistentStore<T>(
  read: () => T,
  write: (value: T) => void
): PersistentStore<T> {
  let state = read()
  const listeners = new Set<() => void>()

  return {
    // Stable reference between renders; only changes on set() → no render loop.
    get: () => state,
    set: (next: T) => {
      state = next
      write(next)
      listeners.forEach((l) => l())
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}
