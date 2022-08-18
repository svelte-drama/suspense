import { getContext, onDestroy, setContext as set } from 'svelte'
import type { Readable } from 'svelte/store'

// FIXME: Vite is incorrectly running this multiple times in development,
// once for each package that depends on it.
const key = Symbol.for('SUSPENSE_CONTEXT')

type InternalSuspend = {
  (data: Promise<unknown> | Readable<unknown>, error?: Readable<Error | undefined>): () => void
}
type Suspend = {
  <T extends Promise<unknown>>(data: T): T
  <T extends Readable<unknown>>(data: T, error?: Readable<Error | undefined>): T
}
function mock<T>(data: T) {
  return data
}

export function createSuspense(): Suspend {
  const suspend = getContext<InternalSuspend>(key)
  if (!suspend) {
    console.warn('createSuspense called outside of a Suspense boundary')
    return mock
  }

  const subscriptions: (() => void)[] = []
  onDestroy(() => subscriptions.forEach(unsub => unsub()))

  function result(data: Promise<unknown> | Readable<unknown>, error?: Readable<Error | undefined>) {
    const unsub = suspend(data, error)
    subscriptions.push(unsub)
    return data
  }
  return result
}

export function setContext(value: InternalSuspend) {
  set(key, value)
}
