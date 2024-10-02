import { getContext, onDestroy, setContext as set } from 'svelte'
import type { Readable } from 'svelte/store'

// FIXME: Vite is incorrectly running this multiple times in development,
// once for each package that depends on it.
const key = Symbol.for('SUSPENSE_CONTEXT')

export type InternalSuspend = {
  <T>(data: Promise<T>): {
    abort: () => void
    result: Promise<T>
  }
  <T>(
    data: Readable<T>,
    error?: Readable<Error | undefined>
  ): {
    abort: () => void
    result: Readable<T>
  }
}
export type Suspend = {
  <T>(data: Promise<T>): Promise<T>
  <T>(data: Readable<T>, error?: Readable<Error | undefined>): Readable<T>
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
  onDestroy(() => subscriptions.forEach((unsub) => unsub()))

  function result<T>(data: Promise<T>): Promise<T>
  function result<T>(
    data: Readable<T>,
    error?: Readable<Error | undefined>
  ): Readable<T>
  function result<T>(
    data: Promise<T> | Readable<T>,
    error?: Readable<Error | undefined>
  ): Promise<T> | Readable<T> {
    const { abort, result } =
      'subscribe' in data ? suspend(data, error) : suspend(data)
    subscriptions.push(abort)
    return result
  }
  return result
}

export function setContext(value: InternalSuspend) {
  set(key, value)
}
